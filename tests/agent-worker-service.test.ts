import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { describe, expect, it, vi } from "vitest"

import {
  claimNextAgentJob,
  completeAgentJobRun,
  readAgentWorkerLivenessStatus,
  readAgentWorkerProviderStatus,
  recoverStaleAgentJobs,
  startAgentJobRun,
  writeAgentWorkerLiveness,
} from "@/lib/agent/jobs/worker-service"
import { AgentJobTransitionError } from "@/lib/agent/jobs/errors"

function createExecutionResult(transition: "claimed" | "running" | "completed" | "failed" | "canceled") {
  return {
    transition,
    job: {
      id: "job-1",
      kind: "site_build_noop",
      status:
        transition === "claimed"
          ? "claimed"
          : transition === "running"
            ? "running"
            : transition === "failed"
              ? "failed"
              : transition === "canceled"
                ? "canceled"
                : "completed",
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
      cancel_requested_at: null,
      cancel_requested_by: null,
      canceled_at: transition === "canceled" ? "2026-03-27T00:00:10.000Z" : null,
      canceled_by: null,
      failed_at: transition === "failed" ? "2026-03-27T00:00:10.000Z" : null,
      failure_code: transition === "failed" ? "worker_error" : null,
      failure_message: transition === "failed" ? "boom" : null,
      created_at: "2026-03-27T00:00:00.000Z",
      updated_at: "2026-03-27T00:00:10.000Z",
    },
    run: {
      id: "run-1",
      job_id: "job-1",
      run_number: 1,
      status:
        transition === "claimed"
          ? "claimed"
          : transition === "running"
            ? "running"
            : transition === "failed"
              ? "failed"
              : transition === "canceled"
                ? "canceled"
                : "completed",
      worker_id: "worker-1",
      claimed_at: "2026-03-27T00:00:00.000Z",
      started_at: transition === "claimed" ? null : "2026-03-27T00:00:05.000Z",
      finished_at:
        transition === "completed" || transition === "failed" || transition === "canceled"
          ? "2026-03-27T00:00:10.000Z"
          : null,
      heartbeat_at: "2026-03-27T00:00:05.000Z",
      canceled_at: transition === "canceled" ? "2026-03-27T00:00:10.000Z" : null,
      failure_code: transition === "failed" ? "worker_error" : null,
      failure_message: transition === "failed" ? "boom" : null,
      created_at: "2026-03-27T00:00:00.000Z",
      updated_at: "2026-03-27T00:00:10.000Z",
    },
  }
}

describe("agent worker service", () => {
  it("claims the next job through the atomic claim RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: createExecutionResult("claimed"),
      error: null,
    })
    const supabase = { rpc } as never

    const result = await claimNextAgentJob(supabase, { workerId: "worker-1" })

    expect(rpc).toHaveBeenCalledWith("agent_claim_next_job", {
      p_worker_id: "worker-1",
    })
    expect(result?.transition).toBe("claimed")
    expect(result?.job.kind).toBe("site_build_noop")
  })

  it("starts and completes runs through the worker transition RPCs", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: createExecutionResult("running"),
        error: null,
      })
      .mockResolvedValueOnce({
        data: createExecutionResult("completed"),
        error: null,
      })
    const supabase = { rpc } as never

    const started = await startAgentJobRun(supabase, {
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
    })
    const completed = await completeAgentJobRun(supabase, {
      jobId: "job-1",
      runId: "run-1",
      workerId: "worker-1",
    })

    expect(started.transition).toBe("running")
    expect(completed.transition).toBe("completed")
    expect(rpc).toHaveBeenNthCalledWith(1, "agent_start_job_run", {
      p_job_id: "job-1",
      p_run_id: "run-1",
      p_worker_id: "worker-1",
    })
    expect(rpc).toHaveBeenNthCalledWith(2, "agent_complete_job_run", {
      p_job_id: "job-1",
      p_run_id: "run-1",
      p_worker_id: "worker-1",
    })
  })

  it("recovers stale jobs through the recovery RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          action: "requeued",
          ...createExecutionResult("failed"),
        },
      ],
      error: null,
    })
    const supabase = { rpc } as never

    const recoveries = await recoverStaleAgentJobs(supabase, {
      workerId: "worker-1",
      staleBefore: "2026-03-27T00:10:00.000Z",
    })

    expect(rpc).toHaveBeenCalledWith("agent_recover_stale_jobs", {
      p_worker_id: "worker-1",
      p_stale_before: "2026-03-27T00:10:00.000Z",
    })
    expect(recoveries).toHaveLength(1)
    expect(recoveries[0]?.action).toBe("requeued")
    expect(recoveries[0]?.run.status).toBe("failed")
  })

  it("surfaces worker transition RPC errors", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "broken" },
      }),
    } as never

    await expect(
      startAgentJobRun(supabase, {
        jobId: "job-1",
        runId: "run-1",
        workerId: "worker-1",
      })
    ).rejects.toThrow(AgentJobTransitionError)
  })

  it("exposes non-secret generated-image provider status for operators", () => {
    expect(readAgentWorkerProviderStatus({})).toEqual({
      imageGeneration: {
        provider: "gemini",
        configured: false,
        model: null,
        configError: "Generated background images are unavailable until GEMINI_API_KEY is configured.",
      },
      planner: {
        provider: "gemini",
        configured: false,
        model: null,
        structuredOutput: true,
        configError: "Natural-language planning is unavailable until GEMINI_API_KEY is configured.",
      },
    })

    expect(
      readAgentWorkerProviderStatus({
        GEMINI_API_KEY: "test-key",
        GEMINI_PLANNER_MODEL: "gemini-custom-planner",
        GEMINI_IMAGE_MODEL: "gemini-custom-image",
      })
    ).toEqual({
      imageGeneration: {
        provider: "gemini",
        configured: true,
        model: "gemini-custom-image",
        configError: null,
      },
      planner: {
        provider: "gemini",
        configured: true,
        model: "gemini-custom-planner",
        structuredOutput: true,
        configError: null,
      },
    })
  })

  it("writes and reads a fresh worker liveness record", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "agent-worker-liveness-"))
    const filePath = join(tempDir, "worker-status.json")
    const serviceName = "hopfner-agent-worker.service"
    const serviceUnitPath = join(tempDir, serviceName)

    try {
      await mkdir(join(tempDir, "systemd"), { recursive: true })
      await writeFile(serviceUnitPath, "[Unit]\nDescription=Worker\n", "utf8")

      await writeAgentWorkerLiveness({
        workerId: "worker-1",
        heartbeatAt: "2026-03-27T00:00:20.000Z",
        startedAt: "2026-03-27T00:00:10.000Z",
        filePath,
        serviceName,
      })

      await expect(
        readAgentWorkerLivenessStatus({
          filePath,
          serviceName,
          serviceUnitPath,
          staleAfterMs: 60_000,
          now: () => Date.parse("2026-03-27T00:00:40.000Z"),
        })
      ).resolves.toEqual({
        serviceName,
        serviceInstalled: true,
        online: true,
        stale: false,
        lastHeartbeatAt: "2026-03-27T00:00:20.000Z",
        workerId: "worker-1",
        startedAt: "2026-03-27T00:00:10.000Z",
      })
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it("marks worker liveness stale when the heartbeat ages past the configured threshold", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "agent-worker-liveness-"))
    const filePath = join(tempDir, "worker-status.json")

    try {
      await writeAgentWorkerLiveness({
        workerId: "worker-1",
        heartbeatAt: "2026-03-27T00:00:20.000Z",
        startedAt: "2026-03-27T00:00:10.000Z",
        filePath,
      })

      await expect(
        readAgentWorkerLivenessStatus({
          filePath,
          serviceUnitPath: join(tempDir, "missing.service"),
          staleAfterMs: 1_000,
          now: () => Date.parse("2026-03-27T00:00:30.000Z"),
        })
      ).resolves.toEqual({
        serviceName: "hopfner-agent-worker.service",
        serviceInstalled: false,
        online: false,
        stale: true,
        lastHeartbeatAt: "2026-03-27T00:00:20.000Z",
        workerId: "worker-1",
        startedAt: "2026-03-27T00:00:10.000Z",
      })
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it("preserves startedAt across repeated heartbeat writes", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "agent-worker-liveness-"))
    const filePath = join(tempDir, "worker-status.json")

    try {
      await writeAgentWorkerLiveness({
        workerId: "worker-1",
        heartbeatAt: "2026-03-27T00:00:10.000Z",
        startedAt: "2026-03-27T00:00:05.000Z",
        filePath,
      })

      await writeAgentWorkerLiveness({
        workerId: "worker-1",
        heartbeatAt: "2026-03-27T00:00:20.000Z",
        filePath,
      })

      await expect(
        readAgentWorkerLivenessStatus({
          filePath,
          serviceUnitPath: join(tempDir, "missing.service"),
          staleAfterMs: 60_000,
          now: () => Date.parse("2026-03-27T00:00:30.000Z"),
        })
      ).resolves.toEqual({
        serviceName: "hopfner-agent-worker.service",
        serviceInstalled: false,
        online: true,
        stale: false,
        lastHeartbeatAt: "2026-03-27T00:00:20.000Z",
        workerId: "worker-1",
        startedAt: "2026-03-27T00:00:05.000Z",
      })
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })
})
