export type CmsSectionType =
  | "nav_links"
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"

export type CmsSectionTypeDefault = {
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

export type CmsSectionTypeDefaultsMap = Record<CmsSectionType, CmsSectionTypeDefault>

export function normalizeSectionType(raw: string): CmsSectionType | null {
  switch (raw) {
    case "nav_links":
    case "hero_cta":
    case "card_grid":
    case "steps_list":
    case "title_body_list":
    case "rich_text_block":
    case "label_value_list":
    case "faq_list":
    case "cta_block":
      return raw
    case "header_nav":
      return "nav_links"
    case "hero":
      return "hero_cta"
    case "what_i_deliver":
      return "card_grid"
    case "how_it_works":
      return "steps_list"
    case "workflows":
      return "title_body_list"
    case "why_this_approach":
      return "rich_text_block"
    case "tech_stack":
      return "label_value_list"
    case "faq":
      return "faq_list"
    case "final_cta":
      return "cta_block"
    default:
      return null
  }
}

export type CmsPage = {
  id: string
  slug: string
  title: string
  formatting_override?: Record<string, unknown>
}

export type CmsSectionRow = {
  id: string
  page_id: string
  section_type: CmsSectionType
  key: string | null
  enabled: boolean
  position: number
  global_section_id?: string | null
  formatting_override?: Record<string, unknown>
}

export type CmsSectionVersionRow = {
  id: string
  section_id: string
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

export type CmsPublishedSection = CmsSectionRow & {
  published: CmsSectionVersionRow
  source: "page" | "global"
}

export type SiteFormattingSettings = {
  fontFamily?: string
  fontScale?: number
  tokens?: {
    fontFamily?: string
    fontScale?: number
    spaceScale?: number
    radiusScale?: number
    shadowScale?: number
    innerShadowScale?: number
    shadowColor?: string
    textColor?: string
    accentColor?: string
    backgroundColor?: string
    cardBackgroundColor?: string
  }
  backgroundType?: "none" | "color" | "gradient" | "image"
  backgroundColor?: string
  gradientFrom?: string
  gradientTo?: string
  gradientDirection?: "to bottom" | "to right" | "135deg"
  backgroundImageUrl?: string
  backgroundSize?: "cover" | "contain" | "auto"
  backgroundPosition?: "center" | "top" | "bottom"
  backgroundFocalX?: number
  backgroundFocalY?: number
  overlayColor?: string
  overlayOpacity?: number
  widthMode?: "content" | "full"
  alignment?: "left" | "center" | "right"
  spacingTop?: string
  spacingBottom?: string
  outerSpacing?: string
}

export type TailwindWhitelist = Set<string>

export type SafeFormatting = {
  containerClass: string
  sectionClass: string
  paddingY: string
  maxWidth: string
  textAlignClass: string
}
