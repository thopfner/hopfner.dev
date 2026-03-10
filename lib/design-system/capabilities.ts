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
  | "subtitleSize"

export type SectionCapability = {
  supported: SemanticControl[]
  notes?: Partial<Record<SemanticControl, string>>
}

const COMMON: SemanticControl[] = ["sectionRhythm", "sectionSurface"]

export const SECTION_CAPABILITIES: Record<string, SectionCapability> = {
  hero_cta: {
    supported: ["sectionSurface", "contentDensity", "headingTreatment", "labelStyle", "subtitleSize", "cardFamily", "cardChrome", "accentRule"],
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
      "subtitleSize",
    ],
  },
  steps_list: {
    supported: [
      ...COMMON,
      "contentDensity",
      "gridGap",
      "headingTreatment",
      "cardFamily",
      "cardChrome",
      "accentRule",
      "labelStyle",
      "subtitleSize",
      "dividerMode",
    ],
  },
  title_body_list: {
    supported: [...COMMON, "contentDensity", "gridGap", "dividerMode", "headingTreatment", "labelStyle", "subtitleSize", "cardFamily", "cardChrome", "accentRule"],
  },
  rich_text_block: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "labelStyle", "cardFamily", "cardChrome", "accentRule"],
  },
  label_value_list: {
    supported: [...COMMON, "contentDensity", "gridGap", "headingTreatment", "labelStyle", "subtitleSize", "cardFamily", "cardChrome", "accentRule"],
    notes: { cardFamily: "Only applies to default and metrics_grid layouts" },
  },
  faq_list: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "labelStyle", "subtitleSize", "dividerMode", "cardFamily", "cardChrome", "accentRule"],
  },
  cta_block: {
    supported: [...COMMON, "contentDensity", "headingTreatment", "labelStyle", "cardFamily", "cardChrome", "accentRule"],
  },
  footer_grid: {
    supported: [],
    notes: { sectionRhythm: "Footer renderer has no design-system integration" },
  },
  nav_links: {
    supported: [],
  },
  social_proof_strip: {
    supported: [...COMMON, "contentDensity", "gridGap", "headingTreatment", "labelStyle", "subtitleSize"],
  },
  proof_cluster: {
    supported: [
      ...COMMON,
      "contentDensity",
      "gridGap",
      "headingTreatment",
      "labelStyle",
      "subtitleSize",
      "dividerMode",
      "cardFamily",
      "cardChrome",
      "accentRule",
    ],
  },
  case_study_split: {
    supported: [
      ...COMMON,
      "contentDensity",
      "gridGap",
      "headingTreatment",
      "labelStyle",
      "subtitleSize",
      "cardFamily",
      "cardChrome",
      "accentRule",
    ],
  },
  composed: {
    supported: [
      ...COMMON,
      "contentDensity",
      "gridGap",
      "headingTreatment",
      "labelStyle",
      "subtitleSize",
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
