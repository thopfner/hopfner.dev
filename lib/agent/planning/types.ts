export type AgentDraftSectionType =
  | "nav_links"
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"
  | "footer_grid"
  | "social_proof_strip"
  | "proof_cluster"
  | "case_study_split"
  | "booking_scheduler"

export type AgentDraftSectionMeta = {
  title: string
  subtitle: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  backgroundMediaUrl: string
}

export type AgentDraftSectionBackgroundImagePlan = {
  prompt: string
  alt: string | null
}

export type AgentDraftSectionMediaPlan = {
  backgroundImage: AgentDraftSectionBackgroundImagePlan | null
}

export type AgentDraftSectionDraft = {
  meta: AgentDraftSectionMeta
  formatting: Record<string, unknown>
  content: Record<string, unknown>
}

export type AgentDraftSectionPlan = {
  order: number
  sectionType: AgentDraftSectionType
  key: string | null
  enabled: boolean
  draft: AgentDraftSectionDraft
  media: AgentDraftSectionMediaPlan | null
}

export type AgentDraftPagePlan = {
  slug: string
  title: string
  sections: AgentDraftSectionPlan[]
}

export type AgentDraftThemePlan = {
  presetId: string | null
  settings: Record<string, unknown> | null
}

export type AgentDraftSectionInput = {
  sectionType?: string
  key?: string | null
  enabled?: boolean
  meta?: Record<string, unknown>
  formatting?: Record<string, unknown>
  content?: Record<string, unknown>
  media?: {
    backgroundImage?: {
      prompt?: string
      alt?: string | null
    } | null
  } | null
}

export type AgentDraftPageInput = {
  slug?: string
  title?: string
  sections?: AgentDraftSectionInput[]
}

export type AgentDraftThemeInput = {
  presetId?: string | null
  settings?: Record<string, unknown> | null
}

export type AgentDraftPlanInputDocument = {
  autoPublish?: boolean
  pages?: AgentDraftPageInput[]
  theme?: AgentDraftThemeInput | null
}

export type AgentDraftPlannerStructuredOutput = {
  pages?: AgentDraftPageInput[]
  theme?: AgentDraftThemeInput | null
  assumptions?: string[]
  warnings?: string[]
  unsupportedRequests?: string[]
  publishIntent?: "draft_only" | "publish_now"
}

export type AgentDraftPlannerNormalizedResult = {
  plan: AgentDraftPlan
  assumptions: string[]
  warnings: string[]
  downgradedRequests: string[]
}

export type AgentDraftPromptMode = "json" | "natural-language"

export type AgentDraftPlannerRunMetadata = {
  inputMode: AgentDraftPromptMode
  provider: "gemini" | null
  model: string | null
  assumptions: string[]
  warnings: string[]
  downgradedRequests: string[]
}

export type AgentDraftResolvedPromptPlan = {
  plan: AgentDraftPlan
  planner: AgentDraftPlannerRunMetadata
}

export type AgentDraftPlannerRequest = {
  prompt: string
}

export type AgentDraftPlannerProviderResult = {
  provider: "gemini"
  model: string
  structuredPlan: AgentDraftPlannerStructuredOutput
}

export type AgentDraftPlannerProvider = {
  name: "gemini"
  model: string
  planDraftSite(
    input: AgentDraftPlannerRequest
  ): Promise<AgentDraftPlannerProviderResult>
}

export type AgentDraftPlan = {
  version: "phase3.v1"
  autoPublish: false
  pages: AgentDraftPagePlan[]
  theme: AgentDraftThemePlan | null
}

export type AgentDraftPlanSummary = {
  pageCount: number
  sectionCount: number
  touchedPageSlugs: string[]
  themePresetId: string | null
  hasThemeSettings: boolean
  sectionsByPage: Array<{
    slug: string
    title: string
    sectionCount: number
    sectionTypes: AgentDraftSectionType[]
  }>
}
