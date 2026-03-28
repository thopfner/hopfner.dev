import os from "node:os"

import { AgentWorkerConfigError } from "./errors"

const DEFAULT_POLL_INTERVAL_MS = 5_000
const DEFAULT_STALE_AFTER_MS = 60_000
const MIN_POLL_INTERVAL_MS = 250
const MIN_STALE_AFTER_MS = 5_000

export type AgentWorkerConfig = {
  once: boolean
  validateOnly: boolean
  workerId: string
  pollIntervalMs: number
  staleAfterMs: number
}

type ParsedAgentWorkerArgs = {
  once: boolean
  validateOnly: boolean
  workerId?: string
}

function parseIntegerEnv(
  envName: string,
  rawValue: string | undefined,
  fallback: number,
  minValue: number
): number {
  if (!rawValue) return fallback

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed < minValue) {
    throw new AgentWorkerConfigError(
      `${envName} must be an integer greater than or equal to ${minValue}.`
    )
  }

  return Math.trunc(parsed)
}

function sanitizeWorkerId(value: string): string {
  return value.trim().replace(/\s+/g, "-")
}

export function buildDefaultAgentWorkerId(): string {
  const rawHost = process.env.HOSTNAME || os.hostname() || "local"
  const host = sanitizeWorkerId(rawHost) || "local"
  return `agent-worker-${host}-${process.pid}`
}

export function parseAgentWorkerArgs(argv: string[]): ParsedAgentWorkerArgs {
  let once = false
  let validateOnly = false
  let workerId: string | undefined

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "--once") {
      once = true
      continue
    }

    if (arg === "--check") {
      validateOnly = true
      continue
    }

    if (arg === "--worker-id") {
      const next = argv[index + 1]
      if (!next) {
        throw new AgentWorkerConfigError("Missing value for --worker-id.")
      }
      workerId = next
      index += 1
      continue
    }

    if (arg.startsWith("--worker-id=")) {
      workerId = arg.slice("--worker-id=".length)
      continue
    }

    throw new AgentWorkerConfigError(`Unsupported worker argument: ${arg}`)
  }

  return { once, validateOnly, workerId }
}

export function parseAgentWorkerConfig(
  env: NodeJS.ProcessEnv,
  argv: string[] = []
): AgentWorkerConfig {
  const args = parseAgentWorkerArgs(argv)
  const pollIntervalMs = parseIntegerEnv(
    "AGENT_WORKER_POLL_INTERVAL_MS",
    env.AGENT_WORKER_POLL_INTERVAL_MS,
    DEFAULT_POLL_INTERVAL_MS,
    MIN_POLL_INTERVAL_MS
  )
  const staleAfterMs = parseIntegerEnv(
    "AGENT_WORKER_STALE_AFTER_MS",
    env.AGENT_WORKER_STALE_AFTER_MS,
    DEFAULT_STALE_AFTER_MS,
    MIN_STALE_AFTER_MS
  )

  if (staleAfterMs <= pollIntervalMs) {
    throw new AgentWorkerConfigError(
      "AGENT_WORKER_STALE_AFTER_MS must be greater than AGENT_WORKER_POLL_INTERVAL_MS."
    )
  }

  const workerId = sanitizeWorkerId(args.workerId ?? env.AGENT_WORKER_ID ?? buildDefaultAgentWorkerId())
  if (!workerId) {
    throw new AgentWorkerConfigError("Worker id is required.")
  }

  return {
    once: args.once,
    validateOnly: args.validateOnly,
    workerId,
    pollIntervalMs,
    staleAfterMs,
  }
}
