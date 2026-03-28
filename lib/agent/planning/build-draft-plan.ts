import {
  AgentJobRefusalError,
  AgentJobValidationError,
  AgentProviderUnavailableError,
} from "../jobs/errors"
import { normalizeCmsPageSlug, validateCmsPageSlug } from "../../cms/commands/pages"
import type {
  AgentDraftSectionBackgroundImagePlan,
  AgentDraftPlanInputDocument,
  AgentDraftPlannerProvider,
  AgentDraftPlannerNormalizedResult,
  AgentDraftResolvedPromptPlan,
  AgentDraftPlannerStructuredOutput,
  AgentDraftPagePlan,
  AgentDraftPlan,
  AgentDraftPlanSummary,
  AgentDraftSectionDraft,
  AgentDraftSectionMediaPlan,
  AgentDraftSectionMeta,
  AgentDraftSectionPlan,
  AgentDraftSectionType,
  AgentDraftThemePlan,
} from "./types"

type JsonRecord = Record<string, unknown>

export const AGENT_DRAFT_PROMPT_MAX_CHARS = 12_000
export const AGENT_DRAFT_MAX_PAGES = 5
export const AGENT_DRAFT_MAX_SECTIONS = 24
export const AGENT_DRAFT_MAX_GENERATED_IMAGES = 6

const AGENT_DRAFT_SECTION_TYPES = new Set<AgentDraftSectionType>([
  "nav_links",
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
  "footer_grid",
  "social_proof_strip",
  "proof_cluster",
  "case_study_split",
  "booking_scheduler",
])

const SECTION_TYPE_ALIASES: Record<string, AgentDraftSectionType> = {
  trust_strip: "social_proof_strip",
  split_story: "case_study_split",
  header_nav: "nav_links",
  nav: "nav_links",
  navlinks: "nav_links",
  hero: "hero_cta",
  hero_banner: "hero_cta",
  what_i_deliver: "card_grid",
  services: "card_grid",
  service_cards: "card_grid",
  how_it_works: "steps_list",
  process: "steps_list",
  process_steps: "steps_list",
  workflows: "title_body_list",
  why_this_approach: "rich_text_block",
  rich_text: "rich_text_block",
  richtext: "rich_text_block",
  tech_stack: "label_value_list",
  faq: "faq_list",
  call_to_action: "cta_block",
  cta: "cta_block",
  final_cta: "cta_block",
  footer: "footer_grid",
}

const ROOT_FORBIDDEN_KEYS = new Set([
  "customSectionSchemas",
  "customSectionTypes",
  "createSectionSchema",
  "sectionTypeRegistry",
])

const SECTION_FORBIDDEN_KEYS = new Set([
  "schema",
  "customSchema",
  "createSchema",
  "renderer",
  "composerSchema",
])

const REFUSED_UNSUPPORTED_REQUESTS = new Set([
  "auto_publish",
  "custom_section_schema",
  "custom_section_schemas",
  "custom_section_type",
  "custom_section_types",
  "multi_tenant_orchestration",
  "public_worker_endpoint",
  "public_worker_endpoints",
  "public_worker_ingress",
  "section_registry_mutation",
])

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown, message: string): JsonRecord {
  if (!isRecord(value)) {
    throw new AgentJobValidationError(message)
  }
  return value
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asNullableString(value: unknown): string | null {
  const normalized = asString(value).trim()
  return normalized || null
}

function ensureNoForbiddenKeys(record: JsonRecord, forbiddenKeys: Set<string>, scope: string) {
  for (const key of Object.keys(record)) {
    if (forbiddenKeys.has(key)) {
      throw new AgentJobValidationError(`${scope} may not define ${key}.`)
    }
  }
}

export function assertAgentDraftPromptText(prompt: string): string {
  const normalized = prompt.trim()
  if (!normalized) {
    throw new AgentJobValidationError("Prompt text is required.")
  }

  if (normalized.length > AGENT_DRAFT_PROMPT_MAX_CHARS) {
    throw new AgentJobValidationError(
      `Prompt text exceeds the ${AGENT_DRAFT_PROMPT_MAX_CHARS.toLocaleString()} character limit for v1 draft jobs.`
    )
  }

  return normalized
}

function extractPromptJson(prompt: string): JsonRecord {
  const trimmed = assertAgentDraftPromptText(prompt)

  const fencedMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/i) ??
    trimmed.match(/```\s*([\s\S]*?)```/i)
  const rawJson =
    fencedMatch?.[1] ??
    (trimmed.startsWith("{") && trimmed.endsWith("}") ? trimmed : null) ??
    (() => {
      const start = trimmed.indexOf("{")
      const end = trimmed.lastIndexOf("}")
      return start >= 0 && end > start ? trimmed.slice(start, end + 1) : null
    })()

  if (!rawJson) {
    throw new AgentJobValidationError(
      "Prompt must include a JSON object describing draft pages, sections, and optional theme changes."
    )
  }

  try {
    return asRecord(JSON.parse(rawJson), "Prompt JSON must be an object.")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON."
    throw new AgentJobValidationError(`Prompt JSON could not be parsed: ${message}`)
  }
}

function tryExtractPromptJson(prompt: string): JsonRecord | null {
  try {
    return extractPromptJson(prompt)
  } catch {
    return null
  }
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeUnsupportedRequest(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_")
}

function normalizeSectionType(raw: string): AgentDraftSectionType | null {
  const value = raw
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
  if (!value) return null
  const aliased = SECTION_TYPE_ALIASES[value] ?? value
  return AGENT_DRAFT_SECTION_TYPES.has(aliased as AgentDraftSectionType)
    ? (aliased as AgentDraftSectionType)
    : null
}

function normalizeDraftMeta(raw: unknown): AgentDraftSectionMeta {
  const meta = isRecord(raw) ? raw : {}
  return {
    title: asString(meta.title).trim(),
    subtitle: asString(meta.subtitle).trim(),
    ctaPrimaryLabel: asString(meta.ctaPrimaryLabel).trim(),
    ctaPrimaryHref: asString(meta.ctaPrimaryHref).trim(),
    ctaSecondaryLabel: asString(meta.ctaSecondaryLabel).trim(),
    ctaSecondaryHref: asString(meta.ctaSecondaryHref).trim(),
    backgroundMediaUrl: asString(meta.backgroundMediaUrl).trim(),
  }
}

function normalizeDraft(raw: JsonRecord): AgentDraftSectionDraft {
  return {
    meta: normalizeDraftMeta(raw.meta),
    formatting: isRecord(raw.formatting) ? raw.formatting : {},
    content: isRecord(raw.content) ? raw.content : {},
  }
}

function normalizeBackgroundImagePlan(
  raw: unknown,
  scope: string
): AgentDraftSectionBackgroundImagePlan | null {
  if (raw === null || raw === undefined) return null
  if (!isRecord(raw)) {
    throw new AgentJobValidationError(`${scope} backgroundImage must be an object.`)
  }

  const prompt = asString(raw.prompt).trim()
  const alt = asNullableString(raw.alt)

  if ("prompt" in raw && typeof raw.prompt !== "string") {
    throw new AgentJobValidationError(`${scope} backgroundImage.prompt must be a string.`)
  }

  if ("alt" in raw && raw.alt !== null && typeof raw.alt !== "string") {
    throw new AgentJobValidationError(`${scope} backgroundImage.alt must be a string.`)
  }

  if (!prompt) return null

  return { prompt, alt }
}

function normalizeSectionMediaPlan(raw: unknown, scope: string): AgentDraftSectionMediaPlan | null {
  if (raw === null || raw === undefined) return null
  if (!isRecord(raw)) {
    throw new AgentJobValidationError(`${scope} media must be an object.`)
  }

  const allowedKeys = new Set(["backgroundImage"])
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.has(key)) {
      throw new AgentJobValidationError(`${scope} media may not define ${key}.`)
    }
  }

  const backgroundImage = normalizeBackgroundImagePlan(raw.backgroundImage, `${scope} media`)
  if (!backgroundImage) return null

  return { backgroundImage }
}

function buildSectionPlan(raw: unknown, order: number): AgentDraftSectionPlan {
  const section = asRecord(raw, `Page section ${order + 1} must be an object.`)
  ensureNoForbiddenKeys(section, SECTION_FORBIDDEN_KEYS, `Section ${order + 1}`)

  const sectionType = normalizeSectionType(asString(section.sectionType))
  if (!sectionType) {
    throw new AgentJobValidationError(
      `Section ${order + 1} uses an unknown or unsupported section type.`
    )
  }

  const draft = normalizeDraft(section)
  const media = normalizeSectionMediaPlan(section.media, `Section ${order + 1}`)

  if (media?.backgroundImage?.prompt && draft.meta.backgroundMediaUrl) {
    throw new AgentJobValidationError(
      `Section ${order + 1} may not define media.backgroundImage.prompt when meta.backgroundMediaUrl is already set.`
    )
  }

  return {
    order,
    sectionType,
    key: asNullableString(section.key),
    enabled: section.enabled === false ? false : true,
    draft,
    media,
  }
}

function buildPagePlan(raw: unknown, index: number): AgentDraftPagePlan {
  const page = asRecord(raw, `Page ${index + 1} must be an object.`)
  const slug = normalizeCmsPageSlug(asString(page.slug))
  const slugError = validateCmsPageSlug(slug)
  if (slugError) {
    throw new AgentJobValidationError(`Page ${index + 1}: ${slugError}`)
  }

  const title = asString(page.title).trim()
  if (!title) {
    throw new AgentJobValidationError(`Page ${index + 1}: title is required.`)
  }

  const rawSections = page.sections
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    throw new AgentJobValidationError(`Page ${index + 1}: at least one section is required.`)
  }

  return {
    slug,
    title,
    sections: rawSections.map((section, sectionIndex) => buildSectionPlan(section, sectionIndex)),
  }
}

function buildThemePlan(raw: unknown): AgentDraftThemePlan | null {
  if (raw === null || raw === undefined) return null

  const theme = asRecord(raw, "Theme instructions must be an object.")
  const allowedKeys = new Set(["presetId", "settings"])
  for (const key of Object.keys(theme)) {
    if (!allowedKeys.has(key)) {
      throw new AgentJobValidationError(`Theme instructions may not define ${key}.`)
    }
  }

  const presetId = asNullableString(theme.presetId)
  const settings = isRecord(theme.settings) ? theme.settings : null

  if (!presetId && !settings) return null

  return {
    presetId,
    settings,
  }
}

function countPlanSections(pages: AgentDraftPagePlan[]): number {
  return pages.reduce((count, page) => count + page.sections.length, 0)
}

function countGeneratedImageRequests(pages: AgentDraftPagePlan[]): number {
  return pages.reduce(
    (count, page) =>
      count +
      page.sections.filter((section) => Boolean(section.media?.backgroundImage?.prompt)).length,
    0
  )
}

export function buildAgentDraftPlanFromDocument(document: AgentDraftPlanInputDocument | JsonRecord): AgentDraftPlan {
  ensureNoForbiddenKeys(document, ROOT_FORBIDDEN_KEYS, "Prompt plan")

  if (document.autoPublish === true) {
    throw new AgentJobValidationError("Phase 3 draft plans may not enable auto-publish.")
  }

  const rawPages = document.pages
  if (!Array.isArray(rawPages) || rawPages.length === 0) {
    throw new AgentJobValidationError("Prompt plan must include at least one page.")
  }

  if (rawPages.length > AGENT_DRAFT_MAX_PAGES) {
    throw new AgentJobValidationError(
      `Prompt plan exceeds the v1 limit of ${AGENT_DRAFT_MAX_PAGES} pages.`
    )
  }

  const pages = rawPages.map((page, index) => buildPagePlan(page, index))
  const seenSlugs = new Set<string>()
  for (const page of pages) {
    if (seenSlugs.has(page.slug)) {
      throw new AgentJobValidationError(`Duplicate page slug in plan: ${page.slug}`)
    }
    seenSlugs.add(page.slug)
  }

  const sectionCount = countPlanSections(pages)
  if (sectionCount > AGENT_DRAFT_MAX_SECTIONS) {
    throw new AgentJobValidationError(
      `Prompt plan exceeds the v1 limit of ${AGENT_DRAFT_MAX_SECTIONS} total sections.`
    )
  }

  const generatedImageCount = countGeneratedImageRequests(pages)
  if (generatedImageCount > AGENT_DRAFT_MAX_GENERATED_IMAGES) {
    throw new AgentJobValidationError(
      `Prompt plan exceeds the v1 limit of ${AGENT_DRAFT_MAX_GENERATED_IMAGES} generated background images per run.`
    )
  }

  return {
    version: "phase3.v1",
    autoPublish: false,
    pages,
    theme: buildThemePlan(document.theme),
  }
}

export function buildAgentDraftPlanFromPrompt(prompt: string): AgentDraftPlan {
  return buildAgentDraftPlanFromDocument(extractPromptJson(prompt))
}

export function detectAgentDraftPromptMode(prompt: string): "json" | "natural-language" {
  return tryExtractPromptJson(prompt) ? "json" : "natural-language"
}

export function normalizeAgentDraftPlannerStructuredOutput(
  structuredPlan: AgentDraftPlannerStructuredOutput
): AgentDraftPlannerNormalizedResult {
  const warnings = [...normalizeStringList(structuredPlan.warnings)]
  const assumptions = normalizeStringList(structuredPlan.assumptions)
  const unsupportedRequests = normalizeStringList(structuredPlan.unsupportedRequests).map(
    normalizeUnsupportedRequest
  )
  const downgradedRequests = [...unsupportedRequests]

  if (structuredPlan.publishIntent === "publish_now") {
    downgradedRequests.push("publish_now")
    warnings.push("Publish-now requests are downgraded to draft-only in v1.")
  }

  const refusedRequests = Array.from(
    new Set(downgradedRequests.filter((request) => REFUSED_UNSUPPORTED_REQUESTS.has(request)))
  )
  if (refusedRequests.length) {
    throw new AgentJobRefusalError(
      `This brief requests unsupported v1 capabilities: ${refusedRequests.join(", " )}. Use only existing section types, existing theme controls, and the draft-only review workflow.`
    )
  }

  for (const request of downgradedRequests) {
    warnings.push(`Unsupported request ignored: ${request}.`)
  }

  return {
    plan: buildAgentDraftPlanFromDocument({
      autoPublish: false,
      pages: structuredPlan.pages,
      theme: structuredPlan.theme ?? null,
    }),
    assumptions,
    warnings: Array.from(new Set(warnings)),
    downgradedRequests: Array.from(new Set(downgradedRequests)),
  }
}

export async function resolveAgentDraftPromptPlan(input: {
  prompt: string
  plannerProvider?: AgentDraftPlannerProvider
}): Promise<AgentDraftResolvedPromptPlan> {
  const prompt = assertAgentDraftPromptText(input.prompt)
  const promptDocument = tryExtractPromptJson(prompt)
  if (promptDocument) {
    return {
      plan: buildAgentDraftPlanFromDocument(promptDocument),
      planner: {
        inputMode: "json",
        provider: null,
        model: null,
        assumptions: [],
        warnings: [],
        downgradedRequests: [],
      },
    }
  }

  if (!input.plannerProvider) {
    throw new AgentProviderUnavailableError(
      "Natural-language planning is unavailable because GEMINI_API_KEY is not configured. Paste JSON instead or configure the planner provider."
    )
  }

  const plannerResult = await input.plannerProvider.planDraftSite({
    prompt,
  })
  const normalized = normalizeAgentDraftPlannerStructuredOutput(plannerResult.structuredPlan)

  return {
    plan: normalized.plan,
    planner: {
      inputMode: "natural-language",
      provider: plannerResult.provider,
      model: plannerResult.model,
      assumptions: normalized.assumptions,
      warnings: normalized.warnings,
      downgradedRequests: normalized.downgradedRequests,
    },
  }
}

export function getAgentDraftTouchedPageSlugs(plan: AgentDraftPlan): string[] {
  return plan.pages.map((page) => page.slug)
}

export function summarizeAgentDraftPlan(plan: AgentDraftPlan): AgentDraftPlanSummary {
  return {
    pageCount: plan.pages.length,
    sectionCount: plan.pages.reduce((count, page) => count + page.sections.length, 0),
    touchedPageSlugs: getAgentDraftTouchedPageSlugs(plan),
    themePresetId: plan.theme?.presetId ?? null,
    hasThemeSettings: Boolean(plan.theme?.settings && Object.keys(plan.theme.settings).length > 0),
    sectionsByPage: plan.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      sectionCount: page.sections.length,
      sectionTypes: page.sections.map((section) => section.sectionType),
    })),
  }
}
