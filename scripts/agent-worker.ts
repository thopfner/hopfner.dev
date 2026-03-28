import { parseAgentWorkerConfig } from "../lib/agent/jobs/worker-config"
import {
  createConsoleAgentWorkerLogger,
  runAgentWorkerLoop,
} from "../lib/agent/jobs/worker-runtime"
import {
  createAgentWorkerService,
  readAgentWorkerProviderStatus,
  createAgentWorkerSupabaseClient,
} from "../lib/agent/jobs/worker-service"

function formatWorkerError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown worker error."
}

async function main(): Promise<void> {
  const config = parseAgentWorkerConfig(process.env, process.argv.slice(2))
  const logger = createConsoleAgentWorkerLogger()

  if (config.validateOnly) {
    createAgentWorkerSupabaseClient(process.env)
    const providerStatus = readAgentWorkerProviderStatus(process.env)

    logger.info(
      `Agent worker config check passed: ${config.workerId} poll=${config.pollIntervalMs}ms stale=${config.staleAfterMs}ms.`
    )
    logger.info(
      providerStatus.imageGeneration.configured
        ? `Generated image provider ready: ${providerStatus.imageGeneration.provider} (${providerStatus.imageGeneration.model}).`
        : `Generated image provider optional warning: ${providerStatus.imageGeneration.configError}`
    )
    return
  }

  const mode = config.once ? "one-shot" : "polling"

  logger.info(`Starting agent worker ${config.workerId} in ${mode} mode.`)

  const supabase = createAgentWorkerSupabaseClient(process.env)
  const service = createAgentWorkerService(supabase)

  await runAgentWorkerLoop(config, {
    service,
    logger,
  })

  if (config.once) {
    logger.info(`Agent worker ${config.workerId} finished one-shot execution.`)
  }
}

void main().catch((error) => {
  console.error(`Agent worker failed: ${formatWorkerError(error)}`)
  process.exitCode = 1
})
