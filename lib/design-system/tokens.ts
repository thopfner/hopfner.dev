// Canonical design-system token vocabularies.
// Single source of truth for all allowed formatting values.

export const RHYTHMS = ["hero", "statement", "compact", "standard", "proof", "cta", "footer"] as const
export type Rhythm = (typeof RHYTHMS)[number]

export const SURFACES = ["none", "panel", "soft_band", "contrast_band", "spotlight_stage", "grid_stage", "gradient_mesh", "accent_glow", "dark_elevated", "dot_grid"] as const
export type Surface = (typeof SURFACES)[number]

export const DENSITIES = ["tight", "standard", "airy"] as const
export type ContentDensity = (typeof DENSITIES)[number]

export const GRID_GAPS = ["tight", "standard", "wide"] as const
export type GridGap = (typeof GRID_GAPS)[number]

export const HEADING_TREATMENTS = ["default", "display", "mono", "gradient", "gradient_accent", "display_xl", "display_lg", "display_md"] as const
export type HeadingTreatment = (typeof HEADING_TREATMENTS)[number]

export const LABEL_STYLES = ["default", "mono", "pill", "micro"] as const
export type LabelStyle = (typeof LABEL_STYLES)[number]

export const DIVIDER_MODES = ["none", "subtle", "strong"] as const
export type DividerMode = (typeof DIVIDER_MODES)[number]

export const CARD_FAMILIES = ["quiet", "service", "metric", "process", "proof", "logo_tile", "cta"] as const
export type CardFamily = (typeof CARD_FAMILIES)[number]

export const CARD_CHROMES = ["flat", "outlined", "elevated", "inset", "glow"] as const
export type CardChrome = (typeof CARD_CHROMES)[number]

export const ACCENT_RULES = ["none", "top", "left", "inline"] as const
export type AccentRule = (typeof ACCENT_RULES)[number]

/** The single resolved design-system object that all section renderers accept. */
export type ResolvedSectionUi = {
  rhythm: Rhythm
  surface: Surface
  density: ContentDensity
  gridGap: GridGap
  headingTreatment: HeadingTreatment
  labelStyle: LabelStyle
  dividerMode: DividerMode
  componentFamily?: CardFamily
  componentChrome?: CardChrome
  accentRule?: AccentRule
}

/** Validates a string against a const array, returning the default if invalid. */
export function validateToken<T extends string>(
  value: string | undefined | null,
  allowed: readonly T[],
  fallback: T
): T {
  if (!value) return fallback
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}
