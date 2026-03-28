import { createHash } from "node:crypto"

import type { AgentDraftPlan, AgentDraftPlannerRunMetadata } from "../planning/types"
import { getAgentDraftTouchedPageSlugs, summarizeAgentDraftPlan } from "../planning/build-draft-plan"
import type {
  AgentDraftApplyResult,
  AgentDraftPhase3Result,
  AgentDraftPlanOnlyResult,
} from "./types"

type JsonRecord = Record<string, unknown>

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (!value || typeof value !== "object") return value
  const record = value as JsonRecord
  const out: JsonRecord = {}
  for (const key of Object.keys(record).sort()) {
    out[key] = sortDeep(record[key])
  }
  return out
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortDeep(value))
}

export function normalizeAgentDraftPromptText(prompt: string): string {
  return prompt.replace(/\r\n/g, "\n").trim()
}

export function buildAgentDraftPromptHash(prompt: string): string {
  return createHash("sha256").update(normalizeAgentDraftPromptText(prompt)).digest("hex")
}

export function buildAgentDraftIdempotencyKey(prompt: string, plan: AgentDraftPlan): string {
  return createHash("sha256")
    .update(
      stableStringify({
        prompt: normalizeAgentDraftPromptText(prompt),
        plan,
      })
    )
    .digest("hex")
}

export function buildAgentDraftPlanOnlyResult(input: {
  prompt: string
  plan: AgentDraftPlan
  applyRequested: boolean
  planner: AgentDraftPlannerRunMetadata
  reviewedSourceJobId?: string | null
}): AgentDraftPlanOnlyResult {
  return {
    mode: "plan-only",
    applyRequested: input.applyRequested,
    applyState: "not_applied",
    idempotencyKey: buildAgentDraftIdempotencyKey(input.prompt, input.plan),
    promptHash: buildAgentDraftPromptHash(input.prompt),
    touchedPageSlugs: getAgentDraftTouchedPageSlugs(input.plan),
    rollbackSnapshotId: null,
    snapshotStatus: "not_captured",
    planSummary: summarizeAgentDraftPlan(input.plan),
    plan: input.plan,
    planner: input.planner,
    reviewedSourceJobId: input.reviewedSourceJobId ?? null,
  }
}

export function buildAgentDraftApplyPendingResult(input: {
  prompt: string
  plan: AgentDraftPlan
  rollbackSnapshotId: string
  planner: AgentDraftPlannerRunMetadata
  reviewedSourceJobId?: string | null
}): AgentDraftApplyResult {
  return {
    mode: "apply",
    applyRequested: true,
    applyState: "applying",
    idempotencyKey: buildAgentDraftIdempotencyKey(input.prompt, input.plan),
    promptHash: buildAgentDraftPromptHash(input.prompt),
    touchedPageSlugs: getAgentDraftTouchedPageSlugs(input.plan),
    rollbackSnapshotId: input.rollbackSnapshotId,
    snapshotStatus: "captured",
    planSummary: summarizeAgentDraftPlan(input.plan),
    plan: input.plan,
    planner: input.planner,
    reviewedSourceJobId: input.reviewedSourceJobId ?? null,
    appliedAt: null,
    createdPageSlugs: [],
    updatedPageSlugs: [],
    deletedSectionIds: [],
    themeApplied: null,
  }
}

export function buildAgentDraftAppliedResult(input: {
  prompt: string
  plan: AgentDraftPlan
  rollbackSnapshotId: string
  planner: AgentDraftPlannerRunMetadata
  reviewedSourceJobId?: string | null
  appliedAt: string
  createdPageSlugs: string[]
  updatedPageSlugs: string[]
  deletedSectionIds: string[]
  themeApplied: AgentDraftApplyResult["themeApplied"]
}): AgentDraftApplyResult {
  return {
    ...buildAgentDraftApplyPendingResult(input),
    applyState: "applied",
    appliedAt: input.appliedAt,
    createdPageSlugs: input.createdPageSlugs,
    updatedPageSlugs: input.updatedPageSlugs,
    deletedSectionIds: input.deletedSectionIds,
    themeApplied: input.themeApplied,
  }
}

export function readAgentDraftPhase3Result(
  result: Record<string, unknown>
): AgentDraftPhase3Result | null {
  const phase3 = result.phase3
  if (!phase3 || typeof phase3 !== "object" || Array.isArray(phase3)) return null

  const candidate = phase3 as Record<string, unknown>
  const mode = candidate.mode
  if (mode === "plan-only" || mode === "apply") {
    return candidate as AgentDraftPhase3Result
  }

  return null
}

export function readAgentDraftPlanOnlyResult(
  result: Record<string, unknown>
): AgentDraftPlanOnlyResult | null {
  const phase3 = readAgentDraftPhase3Result(result)
  return phase3?.mode === "plan-only" ? phase3 : null
}

export function readAgentDraftApplyResult(
  result: Record<string, unknown>
): AgentDraftApplyResult | null {
  const phase3 = readAgentDraftPhase3Result(result)
  return phase3?.mode === "apply" ? phase3 : null
}

export function isAgentDraftPlanResultCurrent(
  result: Record<string, unknown>,
  prompt: string,
  plan: AgentDraftPlan
): boolean {
  const existing = readAgentDraftPhase3Result(result)
  if (!existing) return false
  return existing.idempotencyKey === buildAgentDraftIdempotencyKey(prompt, plan)
}

export function isAgentDraftApplyResultCurrent(
  result: Record<string, unknown>,
  prompt: string,
  plan: AgentDraftPlan
): boolean {
  const existing = readAgentDraftApplyResult(result)
  if (!existing || existing.applyState !== "applied") return false
  return existing.idempotencyKey === buildAgentDraftIdempotencyKey(prompt, plan)
}
