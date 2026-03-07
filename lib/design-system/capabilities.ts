// Section control capability matrix.
// Single source of truth shared by admin UI and renderer validation.
// Code constants serve as fallback — DB table is the primary source.

export type SemanticControl =
  | "sectionRhythm"
  | "sectionSurface"
  | "contentDensity"
  | "gridGap"
  | "cardFamily"
  | "cardChrome"
  | "accentRule"
  | "dividerMode"
  | "headingTreatment"
  | "labelStyle"

export type SectionCapability = {
  supported: SemanticControl[]
  notes?: Partial<Record<SemanticControl, string>>
}

const COMMON: SemanticControl[] = ["sectionRhythm", "sectionSurface"]

export const SECTION_CAPABILITIES: Record<string, SectionCapability> = {
  hero_cta: {
    supported: [...COMMON, "headingTreatment"],
  },
  card_grid: {
    supported: [
      ...COMMON,
      "cardFamily",
      "cardChrome",
      "contentDensity",
      "gridGap",
      "accentRule",
      "dividerMode",
      "labelStyle",
    ],
  },
  steps_list: {
    supported: [
      ...COMMON,
      "cardFamily",
      "accentRule",
      "labelStyle",
      "dividerMode",
    ],
  },
  title_body_list: {
    supported: [...COMMON, "contentDensity", "dividerMode", "headingTreatment"],
  },
  rich_text_block: {
    supported: [...COMMON, "headingTreatment"],
  },
  label_value_list: {
    supported: [...COMMON, "contentDensity", "labelStyle"],
  },
  faq_list: {
    supported: [...COMMON, "dividerMode"],
  },
  cta_block: {
    supported: [...COMMON, "headingTreatment"],
  },
  footer_grid: {
    supported: ["sectionRhythm"],
  },
  nav_links: {
    supported: [],
  },
  composed: {
    supported: [
      ...COMMON,
      "contentDensity",
      "gridGap",
      "headingTreatment",
      "labelStyle",
      "dividerMode",
    ],
  },
}

export function getSupportedControls(
  sectionType: string
): SemanticControl[] {
  return (
    SECTION_CAPABILITIES[sectionType]?.supported ??
    SECTION_CAPABILITIES["composed"]?.supported ??
    COMMON
  )
}

export function isControlSupported(
  sectionType: string,
  control: SemanticControl
): boolean {
  return getSupportedControls(sectionType).includes(control)
}
