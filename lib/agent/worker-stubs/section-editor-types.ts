import type { FormattingState } from "./formatting-controls"

export type BuiltinCmsSectionType =
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

export type CmsSectionType = BuiltinCmsSectionType | string

export type SectionTypeDefault = {
  section_type: CmsSectionType
  label: string
  description: string | null
  default_title: string | null
  default_subtitle: string | null
  default_cta_primary_label: string | null
  default_cta_primary_href: string | null
  default_cta_secondary_label: string | null
  default_cta_secondary_href: string | null
  default_background_media_url: string | null
  default_formatting: Record<string, unknown>
  default_content: Record<string, unknown>
  capabilities: Record<string, unknown>
}

export type SectionVersionRow = {
  id: string
  owner_id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  subtitle: string | null
  cta_primary_label: string | null
  cta_primary_href: string | null
  cta_secondary_label: string | null
  cta_secondary_href: string | null
  background_media_url: string | null
  formatting: Record<string, unknown>
  content: Record<string, unknown>
  created_at: string
  published_at: string | null
}

export type VersionPayload = {
  title: string | null
  subtitle: string | null
  cta_primary_label: string | null
  cta_primary_href: string | null
  cta_secondary_label: string | null
  cta_secondary_href: string | null
  background_media_url: string | null
  formatting: Record<string, unknown>
  content: Record<string, unknown>
}

export type EditorDraftMeta = {
  title: string
  subtitle: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  backgroundMediaUrl: string
}

export type EditorDraft = {
  meta: EditorDraftMeta
  formatting: FormattingState
  content: Record<string, unknown>
}

export type CardDisplayState = {
  showTitle: boolean
  showText: boolean
  showImage: boolean
  showYouGet: boolean
  showBestFor: boolean
  youGetMode: "block" | "list"
  bestForMode: "block" | "list"
}

export type ComposerBlockType =
  | "heading"
  | "subtitle"
  | "rich_text"
  | "cards"
  | "faq"
  | "image"
  | "list"
  | "cta"
  | "logo_strip"
  | "metrics_row"
  | "badge_group"
  | "proof_card"
  | "testimonial"
  | "media_panel"
  | "workflow_diagram"
  | "comparison"
  | "stat_chip_row"

export type ComposerBlock = {
  id: string
  type: ComposerBlockType
  title?: string
  body?: string
  imageUrl?: string
  listStyle?: "basic" | "steps"
  items?: string[]
  steps?: Array<{ title?: string; body?: string }>
  logos?: Array<{ label: string; imageUrl?: string }>
  metrics?: Array<{ value: string; label: string; icon?: string }>
  badges?: Array<{ text: string; icon?: string }>
  stats?: Array<{ value: string; label: string }>
  quote?: string
  author?: string
  role?: string
  beforeLabel?: string
  afterLabel?: string
  beforeItems?: string[]
  afterItems?: string[]
  flowSteps?: Array<{ label: string; description?: string }>
  cards?: Array<{ title: string; body: string }>
  faqs?: Array<{ q: string; a: string }>
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaPrimaryEnabled?: boolean
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  ctaSecondaryEnabled?: boolean
}

export type ComposerColumn = { id: string; blocks: ComposerBlock[] }
export type ComposerRow = { id: string; columns: ComposerColumn[] }
export type ComposerSchema = { rows?: ComposerRow[] }

export type FlattenedComposerBlock = {
  rowId: string
  columnId: string
  rowIndex: number
  columnIndex: number
  block: ComposerBlock
}

export type CmsPageRow = { id: string; slug: string; title: string }

export type ParsedLinkTarget =
  | { kind: "this_page_anchor"; anchor: string }
  | { kind: "page"; pageSlug: string }
  | { kind: "page_anchor"; pageSlug: string; anchor: string }
  | { kind: "custom"; href: string }
