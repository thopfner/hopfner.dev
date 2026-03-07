// Shared class maps for section presentation tokens.
// Imported by SectionShell and section renderers — never duplicated.

import type { Rhythm, Surface, ContentDensity, GridGap, DividerMode } from "./tokens"

export const RHYTHM_CLASSES: Record<Rhythm, string> = {
  hero: "py-10 sm:py-16",
  statement: "py-8 sm:py-12",
  compact: "py-3 sm:py-4",
  standard: "py-6 sm:py-10",
  proof: "py-6 sm:py-8",
  cta: "py-8 sm:py-14",
  footer: "py-6 sm:py-8",
}

export const SURFACE_CLASSES: Record<Surface, string> = {
  none: "",
  panel: "surface-panel",
  soft_band: "bg-card/[0.03] border-y border-border/20",
  contrast_band: "bg-card/10 border-y border-border/40",
  spotlight_stage: "relative",
  grid_stage: "relative",
}

export const DENSITY_PADDING: Record<ContentDensity, string> = {
  tight: "py-3",
  standard: "py-4",
  airy: "py-6",
}

export const GRID_GAP_CLASSES: Record<GridGap, string> = {
  tight: "gap-2",
  standard: "gap-4",
  wide: "gap-6",
}

export const DIVIDER_CLASSES: Record<DividerMode, string> = {
  none: "",
  subtle: "divide-y divide-border/30",
  strong: "divide-y divide-border/70",
}

/** Default rhythm when unset per section type. */
export const DEFAULT_RHYTHM: Record<string, Rhythm> = {
  hero_cta: "hero",
  cta_block: "cta",
  footer_grid: "footer",
}
