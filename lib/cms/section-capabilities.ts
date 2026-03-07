// Section capability matrix: declares which semantic formatting controls
// each section type (and variant) actually supports in the renderer.
// Used by the admin drawer to hide controls that would have no effect.

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
    supported: [...COMMON, "cardFamily", "cardChrome", "contentDensity", "gridGap", "dividerMode"],
    notes: {
      cardChrome: "Modifies the card family base style",
    },
  },
  steps_list: {
    supported: [...COMMON, "cardFamily", "accentRule", "labelStyle", "dividerMode"],
    notes: {
      cardFamily: "process family recommended",
    },
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
  // Composed/custom sections
  composed: {
    supported: [...COMMON, "contentDensity", "gridGap", "headingTreatment", "labelStyle", "dividerMode"],
  },
}

export function getSupportedControls(sectionType: string): SemanticControl[] {
  return SECTION_CAPABILITIES[sectionType]?.supported ?? SECTION_CAPABILITIES["composed"]?.supported ?? COMMON
}

export function isControlSupported(sectionType: string, control: SemanticControl): boolean {
  return getSupportedControls(sectionType).includes(control)
}
