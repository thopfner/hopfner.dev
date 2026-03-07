// Section preset compositions — best-practice token bundles for common use cases.
// These are also seeded into the database for admin selection.

import type {
  Rhythm,
  Surface,
  ContentDensity,
  GridGap,
  HeadingTreatment,
  LabelStyle,
  DividerMode,
  CardFamily,
  CardChrome,
  AccentRule,
} from "./tokens"

export type SectionPreset = {
  key: string
  name: string
  description: string
  sectionType: string
  presentation: {
    rhythm: Rhythm
    surface: Surface
    density: ContentDensity
    gridGap: GridGap
    headingTreatment: HeadingTreatment
    labelStyle: LabelStyle
    dividerMode: DividerMode
  }
  component?: {
    family: CardFamily
    chrome: CardChrome
    accentRule?: AccentRule
  }
}

export const SECTION_PRESETS: Record<string, SectionPreset> = {
  services_snapshot: {
    key: "services_snapshot",
    name: "Services Snapshot",
    description: "Premium service offering cards with elevated presence",
    sectionType: "card_grid",
    presentation: {
      rhythm: "standard",
      surface: "spotlight_stage",
      density: "airy",
      gridGap: "wide",
      headingTreatment: "default",
      labelStyle: "pill",
      dividerMode: "strong",
    },
    component: {
      family: "service",
      chrome: "elevated",
      accentRule: "left",
    },
  },
  proof_grid: {
    key: "proof_grid",
    name: "Proof Grid",
    description: "Evidence and metrics display",
    sectionType: "card_grid",
    presentation: {
      rhythm: "proof",
      surface: "soft_band",
      density: "standard",
      gridGap: "standard",
      headingTreatment: "default",
      labelStyle: "default",
      dividerMode: "subtle",
    },
    component: {
      family: "proof",
      chrome: "outlined",
    },
  },
  hero_stage: {
    key: "hero_stage",
    name: "Hero Stage",
    description: "Primary hero section with full impact",
    sectionType: "hero_cta",
    presentation: {
      rhythm: "hero",
      surface: "spotlight_stage",
      density: "standard",
      gridGap: "standard",
      headingTreatment: "display",
      labelStyle: "default",
      dividerMode: "none",
    },
  },
  process_flow: {
    key: "process_flow",
    name: "Process Flow",
    description: "Step-by-step engagement process",
    sectionType: "steps_list",
    presentation: {
      rhythm: "standard",
      surface: "none",
      density: "standard",
      gridGap: "standard",
      headingTreatment: "default",
      labelStyle: "mono",
      dividerMode: "none",
    },
    component: {
      family: "process",
      chrome: "outlined",
      accentRule: "left",
    },
  },
  trust_strip: {
    key: "trust_strip",
    name: "Trust Strip",
    description: "Compact trust indicators and logos",
    sectionType: "label_value_list",
    presentation: {
      rhythm: "compact",
      surface: "soft_band",
      density: "tight",
      gridGap: "tight",
      headingTreatment: "default",
      labelStyle: "mono",
      dividerMode: "none",
    },
    component: {
      family: "logo_tile",
      chrome: "flat",
    },
  },
  cta_close: {
    key: "cta_close",
    name: "CTA Close",
    description: "Final call-to-action section",
    sectionType: "cta_block",
    presentation: {
      rhythm: "cta",
      surface: "contrast_band",
      density: "standard",
      gridGap: "standard",
      headingTreatment: "display",
      labelStyle: "default",
      dividerMode: "none",
    },
  },
}

export function lookupSectionPreset(key: string): SectionPreset | undefined {
  return SECTION_PRESETS[key]
}

/** Component family preset tokens — default chrome/accent for each family. */
export const COMPONENT_FAMILY_DEFAULTS: Record<
  string,
  { chrome: CardChrome; accentRule?: AccentRule }
> = {
  service: { chrome: "elevated", accentRule: "left" },
  proof: { chrome: "outlined" },
  metric: { chrome: "flat" },
  process: { chrome: "outlined", accentRule: "left" },
  logo_tile: { chrome: "flat" },
  cta: { chrome: "outlined" },
}
