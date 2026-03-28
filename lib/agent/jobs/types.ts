import type { AgentDraftPlan, AgentDraftPlannerRunMetadata } from "../planning/types"

export type AgentJobKind = "site_build_noop" | "site_build_draft"

export type AgentJobStatus =
  | "queued"
  | "claimed"
  | "running"
  | "completed"
  | "failed"
  | "canceled"

export type AgentJobRunStatus =
  | "claimed"
  | "running"
  | "completed"
  | "failed"
  | "canceled"

export type AgentJobLogLevel = "info" | "warn" | "error"

export type AgentJobWorkerTransition =
  | "claimed"
  | "running"
  | "completed"
  | "failed"
  | "canceled"

export type AgentJobRow = {
  id: string
  kind: AgentJobKind
  status: AgentJobStatus
  requested_by: string
  payload: Record<string, unknown>
  result: Record<string, unknown>
  worker_id: string | null
  claimed_at: string | null
  started_at: string | null
  finished_at: string | null
  cancel_requested_at: string | null
  cancel_requested_by: string | null
  canceled_at: string | null
  canceled_by: string | null
  failed_at: string | null
  failure_code: string | null
  failure_message: string | null
  created_at: string
  updated_at: string
}

export type AgentJobRunRow = {
  id: string
  job_id: string
  run_number: number
  status: AgentJobRunStatus
  worker_id: string | null
  claimed_at: string | null
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  canceled_at: string | null
  failure_code: string | null
  failure_message: string | null
  created_at: string
  updated_at: string
}

export type AgentJobLogRow = {
  id: number
  job_id: string
  run_id: string | null
  level: AgentJobLogLevel
  message: string
  created_at: string
}

export type AgentJobListItem = AgentJobRow & {
  latestRun: AgentJobRunRow | null
}

export type AgentJobDetail = {
  job: AgentJobRow
  runs: AgentJobRunRow[]
  logs: AgentJobLogRow[]
}

export type AgentJobExecutionResult = {
  transition: AgentJobWorkerTransition
  job: AgentJobRow
  run: AgentJobRunRow
}

export type AgentJobRecoveryAction = "requeued" | "canceled"

export type AgentJobRecoveryResult = {
  action: AgentJobRecoveryAction
  job: AgentJobRow
  run: AgentJobRunRow
}

export type AgentWorkerLivenessRecord = {
  serviceName: string
  workerId: string
  heartbeatAt: string
  startedAt: string
  pid: number | null
}

export type AgentWorkerLivenessStatus = {
  serviceName: string
  serviceInstalled: boolean
  online: boolean
  stale: boolean
  lastHeartbeatAt: string | null
  workerId: string | null
  startedAt: string | null
}

export type AgentDraftReviewedApplyPayload = {
  prompt: string
  apply: true
  reviewedSourceJobId: string
  reviewedSourcePromptHash: string
  reviewedSourceIdempotencyKey: string
  reviewedPlan: AgentDraftPlan
  reviewedPlanner: AgentDraftPlannerRunMetadata
}
