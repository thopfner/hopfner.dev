import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  AgentJobValidationError,
  AgentProviderUnavailableError,
} from "@/lib/agent/jobs/errors"

const { runAgentWorkerJobHandlerMock, writeAgentWorkerLivenessMock } = vi.hoisted(() => ({
  runAgentWorkerJobHandlerMock: vi.fn(),
  writeAgentWorkerLivenessMock: vi.fn(),
}))

vi.mock("@/lib/agent/jobs/handlers", () => ({
  runAgentWorkerJobHandler: (...args: unknown[]) => runAgentWorkerJobHandlerMock(...args),
  executeSiteBuildNoopJob: async (job: { kind: string; payload: Record<string, unknown> }) => {
    if (job.kind !== "site_build_noop") {
      throw new Error(`Unsupported synthetic job kind: ${job.kind}`)
    }
    if (job.payload.should_fail) {
      throw new Error("Synthetic site_build_noop failure requested.")
    }
  },
}))

vi.mock("@/lib/agent/jobs/worker-service", () => ({
  writeAgentWorkerLiveness: (...args: unknown[]) => writeAgentWorkerLivenessMock(...args),
}))

import {
  executeSiteBuildNoopJob,
  runAgentWorkerIteration,
  runAgentWorkerLoop,
} from "@/lib/agent/jobs/worker-runtime"
import type { AgentJobExecutionResult, AgentJobRecoveryResult } from "@/lib/agent/jobs/types"
import type { AgentWorkerService } from "@/lib/agent/jobs/worker-service"

function createExecutionResult(
  transition: "claimed" | "running" | "completed" | "failed" | "canceled",
  overrides?: Partial<AgentJobExecutionResult>
): AgentJobExecutionResult {
  const status =
    transition === "claimed"
      ? "claimed"
      : transition === "running"
        ? "running"
        : transition === "failed"
          ? "failed"
          : transition === "canceled"
            ? "canceled"
            : "completed"

  return {
    transition,
    job: {
      id: "job-1",
      kind: "site_build_noop",
      status,
      requested_by: "user-1",
      payload: {},
      result: {},
      worker_id: "worker-1",
      claimed_at: "2026-03-27T00:00:00.000Z",
      started_at: transition === "claimed" ? null : "2026-03-27T00:00:05.000Z",
      finished_at:
        transition === "completed" || transition === "failed" || transition === "canceled"
          ? "2026-03-27T00:00:10.000Z"
          : null,
      cancel_requested_at: transition === "canceled" ? "2026-03-27T00:00:06.000Z" : null,
      cancel_requested_by: transition === "canceled" ? "user-1" : null,
      canceled_at: transition === "canceled" ? "2026-03-27T00:00:10.000Z" : null,
      canceled_by: transition === "canceled" ? "user-1" : null,
      failed_at: transition === "failed" ? "2026-03-27T00:00:10.000Z" : null,
      failure_code: transition === "failed" ? "worker_handler_error" : null,
      failure_message: transition === "failed" ? "boom" : null,
      created_at: "2026-03-27T00:00:00.000Z",
      updated_at: "2026-03-27T00:00:10.000Z",
    },
    run: {
      id: "run-1",
      job_id: "job-1",
      run_number: 1,
      status,
      worker_id: "worker-1",
      claimed_at: "2026-03-27T00:00:00.000Z",
      started_at: transition === "claimed" ? null : "2026-03-27T00:00:05.000Z",
      finished_at:
        transition === "completed" || transition === "failed" || transition === "canceled"
          ? "2026-03-27T00:00:10.000Z"
          : null,
      heartbeat_at: "2026-03-27T00:00:05.000Z",
      canceled_at: transition === "canceled" ? "2026-03-27T00:00:10.000Z" : null,
      failure_code: transition === "failed" ? "worker_handler_error" : null,
      failure_message: transition === "failed" ? "boom" : null,
      created_at: "2026-03-27T00:00:00.000Z",
      updated_at: "2026-03-27T00:00:10.000Z",
    },
    ...overrides,
  }
}

function createRecoveryResult(action: "requeued" | "canceled"): AgentJobRecoveryResult {
  const failed = createExecutionResult("failed")
  return {
    action,
    job: {
      ...failed.job,
      status: action === "canceled" ? "canceled" : "queued",
      canceled_at: action === "canceled" ? "2026-03-27T00:00:10.000Z" : null,
      cancel_requested_at: action === "canceled" ? "2026-03-27T00:00:06.000Z" : null,
      cancel_requested_by: action === "canceled" ? "user-1" : null,
      failure_code: null,
      failure_message: null,
      failed_at: null,
      finished_at: action === "canceled" ? "2026-03-27T00:00:10.000Z" : null,
      worker_id: action === "canceled" ? "worker-old" : null,
      claimed_at: action === "requeued" ? null : failed.job.claimed_at,
      started_at: action === "requeued" ? null : failed.job.started_at,
    },
    run: failed.run,
  }
}

describe("agent worker runtime", () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  const claimNextJob = vi.fn()
  const startJobRun = vi.fn()
  const completeJobRun = vi.fn()
  const failJobRun = vi.fn()
  const recoverStaleJobs = vi.fn()
  const updateJobResult = vi.fn()
  const getSupabaseClient = vi.fn()

  const service = {
    getSupabaseClient,
    claimNextJob,
    startJobRun,
    completeJobRun,
    failJobRun,
    recoverStaleJobs,
    updateJobResult,
  } satisfies AgentWorkerService

  const config = {
    once: false,
    workerId: "worker-1",
    pollIntervalMs: 1000,
    staleAfterMs: 10000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    writeAgentWorkerLivenessMock.mockResolvedValue(undefined)
    recoverStaleJobs.mockResolvedValue([])
    claimNextJob.mockResolvedValue(null)
    startJobRun.mockResolvedValue(createExecutionResult("running"))
    completeJobRun.mockResolvedValue(createExecutionResult("completed"))
    failJobRun.mockResolvedValue(createExecutionResult("failed"))
    updateJobResult.mockResolvedValue(createExecutionResult("completed").job)
    runAgentWorkerJobHandlerMock.mockResolvedValue(undefined)
  })

  it("runs recovery before claiming and exits idle when no job exists", async () => {
    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
      now: () => Date.parse("2026-03-27T00:00:20.000Z"),
    })

    expect(recoverStaleJobs).toHaveBeenCalledWith({
      workerId: "worker-1",
      staleBefore: "2026-03-27T00:00:10.000Z",
    })
    expect(writeAgentWorkerLivenessMock).toHaveBeenCalledWith({
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:20.000Z",
    })
    expect(claimNextJob).toHaveBeenCalledWith({ workerId: "worker-1" })
    expect(result).toEqual({
      outcome: "idle",
      processedJobId: null,
      recoveryCount: 0,
    })
  })

  it("claims, starts, and completes a synthetic no-op job", async () => {
    claimNextJob.mockResolvedValue(createExecutionResult("claimed"))

    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
      now: () => Date.parse("2026-03-27T00:00:20.000Z"),
    })

    expect(startJobRun).toHaveBeenCalledWith({
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
    })
    expect(completeJobRun).toHaveBeenCalledWith({
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
    })
    expect(result).toEqual({
      outcome: "completed",
      processedJobId: "job-1",
      recoveryCount: 0,
    })
  })

  it("honors cancel requests before a claimed job starts", async () => {
    claimNextJob.mockResolvedValue(createExecutionResult("claimed"))
    startJobRun.mockResolvedValue(createExecutionResult("canceled"))

    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
    })

    expect(completeJobRun).not.toHaveBeenCalled()
    expect(result.outcome).toBe("canceled")
  })

  it("honors cancel requests observed at completion time", async () => {
    claimNextJob.mockResolvedValue(createExecutionResult("claimed"))
    completeJobRun.mockResolvedValue(createExecutionResult("canceled"))

    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
    })

    expect(result.outcome).toBe("canceled")
  })

  it("fails jobs when the synthetic no-op handler throws", async () => {
    claimNextJob.mockResolvedValue(
      createExecutionResult("claimed", {
        job: {
          ...createExecutionResult("claimed").job,
          payload: { should_fail: true },
        },
      })
    )
    startJobRun.mockResolvedValue(
      createExecutionResult("running", {
        job: {
          ...createExecutionResult("running").job,
          payload: { should_fail: true },
        },
      })
    )
    runAgentWorkerJobHandlerMock.mockRejectedValue(
      new Error("Synthetic site_build_noop failure requested.")
    )

    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
    })

    expect(failJobRun).toHaveBeenCalledWith({
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
      failureCode: "worker_handler_error",
      failureMessage: "Synthetic site_build_noop failure requested.",
    })
    expect(result.outcome).toBe("failed")
  })


  it("classifies validation failures separately from generic worker failures", async () => {
    claimNextJob.mockResolvedValue(createExecutionResult("claimed"))
    runAgentWorkerJobHandlerMock.mockRejectedValue(
      new AgentJobValidationError("Prompt plan exceeds the v1 limit of 5 pages.")
    )

    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
    })

    expect(failJobRun).toHaveBeenCalledWith({
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
      failureCode: "validation_error",
      failureMessage: "Prompt plan exceeds the v1 limit of 5 pages.",
    })
    expect(result.outcome).toBe("failed")
  })

  it("classifies provider-unavailable failures explicitly", async () => {
    claimNextJob.mockResolvedValue(createExecutionResult("claimed"))
    runAgentWorkerJobHandlerMock.mockRejectedValue(
      new AgentProviderUnavailableError(
        "Natural-language planning is unavailable because GEMINI_API_KEY is not configured."
      )
    )

    const result = await runAgentWorkerIteration(config, {
      service,
      logger,
    })

    expect(failJobRun).toHaveBeenCalledWith({
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
      failureCode: "provider_unavailable",
      failureMessage: "Natural-language planning is unavailable because GEMINI_API_KEY is not configured.",
    })
    expect(result.outcome).toBe("failed")
  })

  it("logs stale recovery actions and exits cleanly in one-shot mode", async () => {
    recoverStaleJobs.mockResolvedValue([createRecoveryResult("requeued")])

    await runAgentWorkerLoop(
      {
        ...config,
        once: true,
      },
      {
        service,
        logger,
        sleep: vi.fn(),
        now: () => Date.parse("2026-03-27T00:00:20.000Z"),
      }
    )

    expect(writeAgentWorkerLivenessMock).toHaveBeenNthCalledWith(1, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:20.000Z",
      startedAt: "2026-03-27T00:00:20.000Z",
    })
    expect(writeAgentWorkerLivenessMock).toHaveBeenNthCalledWith(2, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:20.000Z",
    })
    expect(writeAgentWorkerLivenessMock).not.toHaveBeenNthCalledWith(2, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:20.000Z",
      startedAt: "2026-03-27T00:00:20.000Z",
    })
    expect(logger.warn).toHaveBeenCalledWith(
      "Recovered stale agent job job-1: run 1 requeued for a safe retry."
    )
  })

  it("refreshes worker liveness while a long-running job handler is still active", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-27T00:00:20.000Z"))

    let resolveHandler!: () => void
    const handlerPromise = new Promise<void>((resolve) => {
      resolveHandler = resolve
    })

    claimNextJob.mockResolvedValue(createExecutionResult("claimed"))
    startJobRun.mockResolvedValue(createExecutionResult("running"))
    runAgentWorkerJobHandlerMock.mockReturnValue(handlerPromise)

    const resultPromise = runAgentWorkerIteration(config, {
      service,
      logger,
      now: () => Date.now(),
    })

    await Promise.resolve()
    await Promise.resolve()
    expect(writeAgentWorkerLivenessMock).toHaveBeenNthCalledWith(1, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:20.000Z",
    })

    await vi.advanceTimersByTimeAsync(3_000)

    expect(writeAgentWorkerLivenessMock).toHaveBeenNthCalledWith(2, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:21.000Z",
    })
    expect(writeAgentWorkerLivenessMock).toHaveBeenNthCalledWith(3, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:22.000Z",
    })
    expect(writeAgentWorkerLivenessMock).toHaveBeenNthCalledWith(4, {
      workerId: "worker-1",
      heartbeatAt: "2026-03-27T00:00:23.000Z",
    })

    resolveHandler()
    await resultPromise
  })

  it("logs explicit cancellation when stale work is recovered after a cancel request", async () => {
    recoverStaleJobs.mockResolvedValue([createRecoveryResult("canceled")])

    await runAgentWorkerLoop(
      {
        ...config,
        once: true,
      },
      {
        service,
        logger,
        sleep: vi.fn(),
      }
    )

    expect(logger.warn).toHaveBeenCalledWith(
      "Recovered stale agent job job-1: run 1 canceled because a cancel request was already pending."
    )
  })

  it("executes only the synthetic site_build_noop kind", async () => {
    await expect(
      executeSiteBuildNoopJob({
        kind: "not_real" as never,
        payload: {},
      })
    ).rejects.toThrow()
  })
})
