import {
  assertAgentDraftPromptText,
  buildAgentDraftPlanFromDocument,
  resolveAgentDraftPromptPlan,
} from "../planning/build-draft-plan"
import { applyAgentDraftPlan } from "../execution/apply-draft-plan"
import { createGeminiDraftPlannerProvider } from "../planning/providers/gemini"
import {
  buildAgentDraftPlanOnlyResult,
  isAgentDraftApplyResultCurrent,
  isAgentDraftPlanResultCurrent,
} from "../execution/idempotency"
import { AgentJobValidationError } from "./errors"
import type { AgentJobRow } from "./types"
import type { AgentWorkerService } from "./worker-service"
import type {
  AgentDraftPlan,
  AgentDraftPlannerProvider,
  AgentDraftPlannerRunMetadata,
} from "../planning/types"

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeReviewedPlannerMetadata(value: unknown): AgentDraftPlannerRunMetadata {
  if (!isRecord(value)) {
    throw new AgentJobValidationError("Reviewed-plan payload requires reviewedPlanner metadata.")
  }

  const inputMode = value.inputMode === "natural-language" ? "natural-language" : value.inputMode === "json" ? "json" : null
  if (!inputMode) {
    throw new AgentJobValidationError("Reviewed-plan payload has an invalid reviewedPlanner.inputMode.")
  }

  const provider =
    value.provider === null || value.provider === undefined
      ? null
      : value.provider === "gemini"
        ? "gemini"
        : null
  if (value.provider !== null && value.provider !== undefined && provider === null) {
    throw new AgentJobValidationError("Reviewed-plan payload has an invalid reviewedPlanner.provider.")
  }

  const model =
    value.model === null || value.model === undefined
      ? null
      : typeof value.model === "string"
        ? value.model
        : null
  if (value.model !== null && value.model !== undefined && model === null) {
    throw new AgentJobValidationError("Reviewed-plan payload has an invalid reviewedPlanner.model.")
  }

  return {
    inputMode,
    provider,
    model,
    assumptions: normalizeStringList(value.assumptions),
    warnings: normalizeStringList(value.warnings),
    downgradedRequests: normalizeStringList(value.downgradedRequests),
  }
}

function parseReviewedApplyPayload(
  payload: Record<string, unknown>,
  applyRequested: boolean
): {
  sourceJobId: string
  plan: AgentDraftPlan
  planner: AgentDraftPlannerRunMetadata
} | null {
  const hasReviewedSource =
    "reviewedSourceJobId" in payload ||
    "reviewedPlan" in payload ||
    "reviewedPlanner" in payload

  if (!hasReviewedSource) return null
  if (!applyRequested) {
    throw new AgentJobValidationError("Reviewed-plan payloads may only be used for apply jobs.")
  }

  const sourceJobId =
    typeof payload.reviewedSourceJobId === "string" ? payload.reviewedSourceJobId.trim() : ""
  if (!sourceJobId) {
    throw new AgentJobValidationError("Reviewed-plan payload requires reviewedSourceJobId.")
  }

  if (!isRecord(payload.reviewedPlan)) {
    throw new AgentJobValidationError("Reviewed-plan payload requires reviewedPlan.")
  }

  return {
    sourceJobId,
    plan: buildAgentDraftPlanFromDocument(payload.reviewedPlan),
    planner: normalizeReviewedPlannerMetadata(payload.reviewedPlanner),
  }
}

function parseSiteBuildDraftPayload(payload: Record<string, unknown>) {
  const rawPrompt = typeof payload.prompt === "string" ? payload.prompt : ""
  if (!rawPrompt.trim()) {
    throw new AgentJobValidationError("site_build_draft payload requires prompt text.")
  }

  const prompt = assertAgentDraftPromptText(rawPrompt)

  const applyRequested = payload.dryRun === false || payload.apply === true
  const reviewed = parseReviewedApplyPayload(payload, applyRequested)

  return {
    prompt,
    applyRequested,
    reviewed,
  }
}

type AgentDraftHandlerOptions = {
  plannerProvider?: AgentDraftPlannerProvider
}

export async function executeSiteBuildNoopJob(
  job: Pick<AgentJobRow, "kind" | "payload">
): Promise<void> {
  if (job.kind !== "site_build_noop") {
    throw new AgentJobValidationError(`Unsupported worker job kind: ${job.kind}`)
  }

  if (job.payload.should_fail === true || job.payload.shouldFail === true) {
    throw new Error("Synthetic site_build_noop failure requested.")
  }
}

export async function executeSiteBuildDraftPlanOnlyJob(
  job: Pick<AgentJobRow, "id" | "kind" | "payload" | "result">,
  service: Pick<AgentWorkerService, "updateJobResult">,
  options?: AgentDraftHandlerOptions
): Promise<void> {
  await executeSiteBuildDraftJob(job, {
    ...service,
    getSupabaseClient() {
      throw new AgentJobValidationError(
        "Supabase client access is unavailable for plan-only draft execution."
      )
    },
  }, options)
}

export async function executeSiteBuildDraftJob(
  job: Pick<AgentJobRow, "id" | "kind" | "payload" | "result">,
  service: Pick<AgentWorkerService, "getSupabaseClient" | "updateJobResult">,
  options?: AgentDraftHandlerOptions
): Promise<void> {
  if (job.kind !== "site_build_draft") {
    throw new AgentJobValidationError(`Unsupported worker job kind: ${job.kind}`)
  }

  const payload = parseSiteBuildDraftPayload(job.payload)
  const resolved = payload.reviewed
    ? {
        plan: payload.reviewed.plan,
        planner: payload.reviewed.planner,
        reviewedSourceJobId: payload.reviewed.sourceJobId,
      }
    : {
        ...(await resolveAgentDraftPromptPlan({
          prompt: payload.prompt,
          plannerProvider: options?.plannerProvider ?? createGeminiDraftPlannerProvider(),
        })),
        reviewedSourceJobId: null,
      }
  const plan = resolved.plan

  if (payload.applyRequested) {
    if (isAgentDraftApplyResultCurrent(job.result, payload.prompt, plan)) {
      return
    }

    await applyAgentDraftPlan({
      supabase: service.getSupabaseClient(),
      jobId: job.id,
      prompt: payload.prompt,
      plan,
      planner: resolved.planner,
      reviewedSourceJobId: resolved.reviewedSourceJobId,
      updateJobResult: service.updateJobResult,
    })
    return
  }

  if (isAgentDraftPlanResultCurrent(job.result, payload.prompt, plan)) {
    return
  }

  const phase3Result = buildAgentDraftPlanOnlyResult({
    prompt: payload.prompt,
    plan,
    applyRequested: payload.applyRequested,
    planner: resolved.planner,
    reviewedSourceJobId: resolved.reviewedSourceJobId,
  })

  await service.updateJobResult({
    jobId: job.id,
    result: { phase3: phase3Result },
    merge: true,
  })
}

export async function runAgentWorkerJobHandler(
  job: Pick<AgentJobRow, "id" | "kind" | "payload" | "result">,
  service: Pick<AgentWorkerService, "getSupabaseClient" | "updateJobResult">,
  options?: AgentDraftHandlerOptions
): Promise<void> {
  switch (job.kind) {
    case "site_build_noop":
      await executeSiteBuildNoopJob(job)
      return
    case "site_build_draft":
      await executeSiteBuildDraftJob(job, service, options)
      return
    default:
      throw new AgentJobValidationError(`Unsupported worker job kind: ${job.kind}`)
  }
}
