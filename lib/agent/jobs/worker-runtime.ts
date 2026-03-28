import { runAgentWorkerJobHandler, executeSiteBuildNoopJob } from "./handlers"
import {
  AgentJobRefusalError,
  AgentJobTransitionError,
  AgentJobValidationError,
  AgentProviderExecutionError,
  AgentProviderUnavailableError,
} from "./errors"
import { writeAgentWorkerLiveness } from "./worker-service"
import type {
  AgentJobExecutionResult,
  AgentJobRecoveryResult,
  AgentJobRow,
  AgentJobRunRow,
} from "./types"
import type { AgentWorkerConfig } from "./worker-config"
import type { AgentWorkerService } from "./worker-service"

export type AgentWorkerLogger = {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

type AgentWorkerRuntimeDependencies = {
  service: AgentWorkerService
  logger: AgentWorkerLogger
  sleep?: (ms: number) => Promise<void>
  now?: () => number
}

export type AgentWorkerIterationResult = {
  outcome: "idle" | "completed" | "failed" | "canceled"
  processedJobId: string | null
  recoveryCount: number
}

export const AGENT_WORKER_RETRY_POLICY = {
  staleRecovery: "requeue-unless-cancel-requested",
  draftApplyProtection: "idempotency-result-and-rollback-snapshot",
} as const

export const AGENT_WORKER_V1_SCOPE = {
  autoPublish: false,
  customSectionSchemaCreation: false,
  publicWorkerIngress: false,
  publishRequiresHumanReview: true,
} as const

type AgentWorkerTerminalResult = {
  job: AgentJobRow
  run: AgentJobRunRow
  outcome: "completed" | "failed" | "canceled"
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatWorkerError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown worker error."
}

function classifyWorkerFailure(error: unknown): { code: string; message: string } {
  const message = formatWorkerError(error)

  if (error instanceof AgentProviderUnavailableError) {
    return { code: "provider_unavailable", message }
  }

  if (error instanceof AgentProviderExecutionError) {
    return { code: "provider_error", message }
  }

  if (error instanceof AgentJobRefusalError) {
    return { code: "plan_refused", message }
  }

  if (error instanceof AgentJobValidationError) {
    return { code: "validation_error", message }
  }

  return { code: "worker_handler_error", message }
}

export function createConsoleAgentWorkerLogger(
  consoleLike: Pick<Console, "info" | "warn" | "error"> = console
): AgentWorkerLogger {
  return {
    info: (message) => consoleLike.info(message),
    warn: (message) => consoleLike.warn(message),
    error: (message) => consoleLike.error(message),
  }
}

export { executeSiteBuildNoopJob }

function formatRecoveryLog(recovery: AgentJobRecoveryResult): string {
  if (recovery.action === "canceled") {
    return `Recovered stale agent job ${recovery.job.id}: run ${recovery.run.run_number} canceled because a cancel request was already pending.`
  }

  return `Recovered stale agent job ${recovery.job.id}: run ${recovery.run.run_number} requeued for a safe retry.`
}

function getActiveHeartbeatIntervalMs(config: AgentWorkerConfig): number {
  return Math.max(1_000, Math.min(config.pollIntervalMs, Math.floor(config.staleAfterMs / 2)))
}

function startActiveWorkerHeartbeat(
  config: AgentWorkerConfig,
  now: () => number
): () => Promise<void> {
  const intervalMs = getActiveHeartbeatIntervalMs(config)
  let writeInFlight: Promise<unknown> | null = null

  const writeHeartbeat = () => {
    if (writeInFlight) return
    writeInFlight = writeAgentWorkerLiveness({
      workerId: config.workerId,
      heartbeatAt: new Date(now()).toISOString(),
    }).finally(() => {
      writeInFlight = null
    })
  }

  const timer = setInterval(writeHeartbeat, intervalMs)
  timer.unref?.()

  return async () => {
    clearInterval(timer)
    await writeInFlight
  }
}

async function completeAgentWorkerJob(
  config: AgentWorkerConfig,
  deps: Required<AgentWorkerRuntimeDependencies>,
  claim: AgentJobExecutionResult
): Promise<AgentWorkerTerminalResult> {
  const started = await deps.service.startJobRun({
    jobId: claim.job.id,
    runId: claim.run.id,
    workerId: config.workerId,
  })

  if (started.transition === "canceled") {
    deps.logger.warn(`Agent worker canceled job ${claim.job.id} before execution.`)
    return {
      job: started.job,
      run: started.run,
      outcome: "canceled",
    }
  }

  if (started.transition !== "running") {
    throw new AgentJobTransitionError(
      `Expected agent job ${claim.job.id} to enter running state, received ${started.transition}.`
    )
  }

  const stopHeartbeat = startActiveWorkerHeartbeat(config, deps.now)

  try {
    await runAgentWorkerJobHandler(started.job, deps.service)
    await stopHeartbeat()

    const completed = await deps.service.completeJobRun({
      jobId: started.job.id,
      runId: started.run.id,
      workerId: config.workerId,
    })

    if (completed.transition === "canceled") {
      deps.logger.warn(`Agent worker observed cancel request for job ${claim.job.id}.`)
      return {
        job: completed.job,
        run: completed.run,
        outcome: "canceled",
      }
    }

    if (completed.transition !== "completed") {
      throw new AgentJobTransitionError(
        `Expected agent job ${claim.job.id} to complete, received ${completed.transition}.`
      )
    }

    deps.logger.info(`Agent worker completed job ${claim.job.id}.`)
    return {
      job: completed.job,
      run: completed.run,
      outcome: "completed",
    }
  } catch (error) {
    await stopHeartbeat()

    const failure = classifyWorkerFailure(error)
    const failed = await deps.service.failJobRun({
      jobId: started.job.id,
      runId: started.run.id,
      workerId: config.workerId,
      failureCode: failure.code,
      failureMessage: failure.message,
    })

    if (failed.transition === "canceled") {
      deps.logger.warn(`Agent worker canceled job ${claim.job.id} while handling failure.`)
      return {
        job: failed.job,
        run: failed.run,
        outcome: "canceled",
      }
    }

    if (failed.transition !== "failed") {
      throw new AgentJobTransitionError(
        `Expected agent job ${claim.job.id} to fail, received ${failed.transition}.`
      )
    }

    deps.logger.error(
      `Agent worker failed job ${claim.job.id}: ${failed.job.failure_message ?? formatWorkerError(error)}`
    )
    return {
      job: failed.job,
      run: failed.run,
      outcome: "failed",
    }
  }
}

export async function runAgentWorkerIteration(
  config: AgentWorkerConfig,
  runtimeDeps: AgentWorkerRuntimeDependencies
): Promise<AgentWorkerIterationResult> {
  const deps: Required<AgentWorkerRuntimeDependencies> = {
    sleep: runtimeDeps.sleep ?? defaultSleep,
    now: runtimeDeps.now ?? (() => Date.now()),
    service: runtimeDeps.service,
    logger: runtimeDeps.logger,
  }

  await writeAgentWorkerLiveness({
    workerId: config.workerId,
    heartbeatAt: new Date(deps.now()).toISOString(),
  })

  const staleBefore = new Date(deps.now() - config.staleAfterMs).toISOString()
  const recoveries = await deps.service.recoverStaleJobs({
    workerId: config.workerId,
    staleBefore,
  })

  for (const recovery of recoveries) {
    deps.logger.warn(formatRecoveryLog(recovery))
  }

  const claim = await deps.service.claimNextJob({ workerId: config.workerId })
  if (!claim) {
    deps.logger.info("No queued agent jobs found.")
    return {
      outcome: "idle",
      processedJobId: null,
      recoveryCount: recoveries.length,
    }
  }

  deps.logger.info(`Claimed agent job ${claim.job.id} (${claim.job.kind}).`)
  const terminal = await completeAgentWorkerJob(config, deps, claim)

  return {
    outcome: terminal.outcome,
    processedJobId: terminal.job.id,
    recoveryCount: recoveries.length,
  }
}

export async function runAgentWorkerLoop(
  config: AgentWorkerConfig,
  runtimeDeps: AgentWorkerRuntimeDependencies
): Promise<void> {
  const deps: Required<AgentWorkerRuntimeDependencies> = {
    sleep: runtimeDeps.sleep ?? defaultSleep,
    now: runtimeDeps.now ?? (() => Date.now()),
    service: runtimeDeps.service,
    logger: runtimeDeps.logger,
  }

  await writeAgentWorkerLiveness({
    workerId: config.workerId,
    heartbeatAt: new Date(deps.now()).toISOString(),
    startedAt: new Date(deps.now()).toISOString(),
  })

  while (true) {
    try {
      const result = await runAgentWorkerIteration(config, deps)
      if (config.once) return
      if (result.outcome === "idle") {
        await deps.sleep(config.pollIntervalMs)
      }
    } catch (error) {
      deps.logger.error(`Agent worker iteration failed: ${formatWorkerError(error)}`)
      if (config.once) {
        throw error
      }
      await deps.sleep(config.pollIntervalMs)
    }
  }
}
