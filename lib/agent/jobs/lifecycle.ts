import { AGENT_JOB_KINDS, TERMINAL_AGENT_JOB_STATUSES } from "./constants"
import { AgentJobValidationError } from "./errors"
import type {
  AgentJobKind,
  AgentJobRecoveryAction,
  AgentJobRow,
  AgentJobStatus,
} from "./types"

export type AgentJobCancelTransition =
  | "canceled"
  | "cancel_requested"
  | "already_requested"
  | "already_finished"

export type AgentJobCancellationState =
  | "not_requested"
  | "cancel_requested"
  | "canceled"
  | "not_cancellable"

const SERIAL_AGENT_JOB_KINDS = ["site_build_draft"] as const satisfies readonly AgentJobKind[]
const ACTIVE_AGENT_JOB_STATUSES = ["queued", "claimed", "running"] as const satisfies readonly AgentJobStatus[]

export function isAgentJobKind(value: string): value is AgentJobKind {
  return (AGENT_JOB_KINDS as readonly string[]).includes(value)
}

export function assertAgentJobKind(value: string): AgentJobKind {
  const kind = value.trim()
  if (!kind) {
    throw new AgentJobValidationError("Job kind is required.")
  }
  if (!isAgentJobKind(kind)) {
    throw new AgentJobValidationError(`Unsupported agent job kind: ${kind}`)
  }
  return kind
}

export function assertExecutableAgentJobKind(value: string): AgentJobKind {
  return assertAgentJobKind(value)
}

export function normalizeAgentJobPayload(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) return {}
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new AgentJobValidationError("Job payload must be a JSON object.")
  }
  return value as Record<string, unknown>
}

export function isTerminalAgentJobStatus(status: AgentJobStatus): boolean {
  return (TERMINAL_AGENT_JOB_STATUSES as readonly string[]).includes(status)
}

export function isActiveAgentJobStatus(status: AgentJobStatus): boolean {
  return (ACTIVE_AGENT_JOB_STATUSES as readonly string[]).includes(status)
}

export function isSerializedAgentJobKind(kind: AgentJobKind): boolean {
  return (SERIAL_AGENT_JOB_KINDS as readonly string[]).includes(kind)
}

export function resolveAgentJobCancelTransition(
  job: Pick<AgentJobRow, "status" | "cancel_requested_at">
): AgentJobCancelTransition {
  if (job.status === "queued") return "canceled"
  if (job.status === "claimed" || job.status === "running") {
    return job.cancel_requested_at ? "already_requested" : "cancel_requested"
  }
  if (isTerminalAgentJobStatus(job.status)) return "already_finished"
  return "already_finished"
}

export function resolveAgentJobRecoveryAction(
  job: Pick<AgentJobRow, "cancel_requested_at">
): AgentJobRecoveryAction {
  return job.cancel_requested_at ? "canceled" : "requeued"
}

export function resolveAgentJobCancellationState(
  job: Pick<AgentJobRow, "status" | "cancel_requested_at">
): AgentJobCancellationState {
  if (job.status === "canceled") return "canceled"
  if (job.cancel_requested_at) return "cancel_requested"
  if (isActiveAgentJobStatus(job.status)) return "not_requested"
  return "not_cancellable"
}
