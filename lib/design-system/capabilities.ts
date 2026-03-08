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
    supported: ["headingTreatment"],
    notes: { sectionRhythm: "Hero uses bespoke layout; rhythm/surface not applicable" },
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
      "contentDensity",
      "headingTreatment",
      "cardFamily",
      "cardChrome",
      "accentRule",
      "labelStyle",
      "dividerMode",
    ],
  },
  title_body_list: {
    supported: [...COMMON, "contentDensity", "dividerMode", "headingTreatment", "cardFamily", "cardChrome", "accentRule"],
  },
  rich_text_block: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "cardFamily", "cardChrome", "accentRule"],
  },
  label_value_list: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "labelStyle", "cardFamily", "cardChrome", "accentRule"],
    notes: { cardFamily: "Only applies to default and metrics_grid layouts" },
  },
  faq_list: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "dividerMode", "cardFamily", "cardChrome", "accentRule"],
  },
  cta_block: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "cardFamily", "cardChrome", "accentRule"],
  },
  footer_grid: {
    supported: [],
    notes: { sectionRhythm: "Footer renderer has no design-system integration" },
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
      "cardFamily",
      "cardChrome",
      "accentRule",
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
