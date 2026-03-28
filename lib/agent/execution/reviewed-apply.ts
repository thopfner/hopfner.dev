import { AgentJobValidationError } from "../jobs/errors"
import type { AgentDraftReviewedApplyPayload, AgentJobRow } from "../jobs/types"
import { readAgentDraftPlanOnlyResult } from "./idempotency"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isReviewedPlanApplyPayload(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    "reviewedSourceJobId" in value || "reviewedPlan" in value || "reviewedPlanner" in value
  )
}

export function assertNoReviewedPlanApplyPayload(value: unknown): void {
  if (isReviewedPlanApplyPayload(value)) {
    throw new AgentJobValidationError(
      "Reviewed-plan apply jobs must be created through /admin/api/agent/jobs/[jobId]/apply-reviewed."
    )
  }
}

export function buildReviewedPlanApplyPayload(
  sourceJob: Pick<AgentJobRow, "id" | "kind" | "status" | "payload" | "result">
): AgentDraftReviewedApplyPayload {
  if (sourceJob.kind !== "site_build_draft" || sourceJob.status !== "completed") {
    throw new AgentJobValidationError(
      "Reviewed-plan apply is only available for completed draft jobs."
    )
  }

  const sourcePhase3 = readAgentDraftPlanOnlyResult(sourceJob.result)
  if (!sourcePhase3) {
    throw new AgentJobValidationError(
      "Reviewed-plan apply is only available for completed plan-only draft jobs."
    )
  }

  const prompt =
    typeof sourceJob.payload.prompt === "string" ? sourceJob.payload.prompt.trim() : ""
  if (!prompt) {
    throw new AgentJobValidationError("Source draft job is missing prompt text.")
  }

  return {
    prompt,
    apply: true,
    reviewedSourceJobId: sourceJob.id,
    reviewedSourcePromptHash: sourcePhase3.promptHash,
    reviewedSourceIdempotencyKey: sourcePhase3.idempotencyKey,
    reviewedPlan: sourcePhase3.plan,
    reviewedPlanner: sourcePhase3.planner,
  }
}
