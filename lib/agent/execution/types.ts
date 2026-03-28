import type {
  AgentDraftPlan,
  AgentDraftPlanSummary,
  AgentDraftPlannerRunMetadata,
} from "../planning/types"

export type AgentDraftApplyState = "not_applied" | "applying" | "applied"
export type AgentDraftSnapshotStatus = "not_captured" | "captured"

export type AgentDraftPlanOnlyResult = {
  mode: "plan-only"
  applyRequested: boolean
  applyState: "not_applied"
  idempotencyKey: string
  promptHash: string
  touchedPageSlugs: string[]
  rollbackSnapshotId: string | null
  snapshotStatus: "not_captured"
  planSummary: AgentDraftPlanSummary
  plan: AgentDraftPlan
  planner: AgentDraftPlannerRunMetadata
  reviewedSourceJobId: string | null
}

export type AgentDraftApplyResult = {
  mode: "apply"
  applyRequested: true
  applyState: "applying" | "applied"
  idempotencyKey: string
  promptHash: string
  touchedPageSlugs: string[]
  rollbackSnapshotId: string
  snapshotStatus: "captured"
  planSummary: AgentDraftPlanSummary
  plan: AgentDraftPlan
  planner: AgentDraftPlannerRunMetadata
  reviewedSourceJobId: string | null
  appliedAt: string | null
  createdPageSlugs: string[]
  updatedPageSlugs: string[]
  deletedSectionIds: string[]
  themeApplied: {
    presetId: string | null
    hasSettings: boolean
  } | null
}

export type AgentDraftPhase3Result = AgentDraftPlanOnlyResult | AgentDraftApplyResult

export type AgentDraftJobResultEnvelope = {
  phase3?: AgentDraftPhase3Result
}
