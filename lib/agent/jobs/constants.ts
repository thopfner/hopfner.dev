import type { AgentJobKind, AgentJobRunStatus, AgentJobStatus } from "./types"

export const AGENT_JOB_KINDS = [
  "site_build_noop",
  "site_build_draft",
] as const satisfies readonly AgentJobKind[]

export const AGENT_JOB_RUN_STATUSES = [
  "claimed",
  "running",
  "completed",
  "failed",
  "canceled",
] as const satisfies readonly AgentJobRunStatus[]

export const TERMINAL_AGENT_JOB_STATUSES = [
  "completed",
  "failed",
  "canceled",
] as const satisfies readonly AgentJobStatus[]

export const AGENT_WORKER_SYSTEMD_SERVICE_NAME = "hopfner-agent-worker.service"
export const AGENT_WORKER_LIVENESS_FILE_PATH = "/var/tmp/hopfner-agent-worker-status.json"
