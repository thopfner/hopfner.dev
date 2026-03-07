// Shared class maps for section presentation tokens.
// Imported by SectionShell and section renderers — never duplicated.

import type { Rhythm, Surface, ContentDensity, GridGap, DividerMode, HeadingTreatment, LabelStyle } from "./tokens"

export const RHYTHM_CLASSES: Record<Rhythm, string> = {
  hero: "py-12 sm:py-20",
  statement: "py-10 sm:py-14",
  compact: "py-3 sm:py-5",
  standard: "py-8 sm:py-12",
  proof: "py-6 sm:py-9",
  cta: "py-10 sm:py-16",
  footer: "py-6 sm:py-8",
}

export const SURFACE_CLASSES: Record<Surface, string> = {
  none: "",
  panel: "surface-panel",
  soft_band: "bg-card/[0.05] border-y border-border/25",
  contrast_band: "bg-card/[0.12] border-y border-border/50",
  spotlight_stage: "relative bg-gradient-to-b from-accent/[0.04] to-transparent border-y border-accent/[0.10]",
  grid_stage: "relative bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--accent)/0.06),transparent_70%)]",
}

/** Card internal padding per density level. */
export const DENSITY_PADDING: Record<ContentDensity, string> = {
  tight: "py-2.5",
  standard: "py-4",
  airy: "py-6",
}

/** Card internal spacing gaps per density level — for header/body/content gaps. */
export const DENSITY_GAP: Record<ContentDensity, string> = {
  tight: "gap-1.5",
  standard: "gap-3",
  airy: "gap-5",
}

/** Card header padding per density level. */
export const DENSITY_HEADER_PADDING: Record<ContentDensity, string> = {
  tight: "px-3 pt-3 pb-0",
  standard: "px-4 pt-4 pb-0",
  airy: "px-5 pt-5 pb-0",
}

/** Card body padding per density level. */
export const DENSITY_BODY_PADDING: Record<ContentDensity, string> = {
  tight: "px-3 pb-3",
  standard: "px-4 pb-4",
  airy: "px-5 pb-5",
}

/** Section content gap per density level — between heading block and content grid. */
export const DENSITY_SECTION_GAP: Record<ContentDensity, string> = {
  tight: "space-y-3",
  standard: "space-y-5 sm:space-y-6",
  airy: "space-y-6 sm:space-y-8",
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

/** Heading treatment classes — applied to section headings and card headings. */
export const HEADING_TREATMENT_CLASSES: Record<HeadingTreatment, string> = {
  default: "",
  display: "text-display",
  mono: "text-label-mono uppercase tracking-widest",
}

/** Label style classes — applied to tags, badges, eyebrows, micro-labels. */
export const LABEL_STYLE_CLASSES: Record<LabelStyle, string> = {
  default: "text-label-mono w-fit rounded-full border border-border/50 px-2 py-0.5 text-muted-foreground",
  mono: "text-label-mono text-muted-foreground",
  pill: "rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent/80",
  micro: "text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60",
}

/** Default rhythm when unset per section type. */
export const DEFAULT_RHYTHM: Record<string, Rhythm> = {
  hero_cta: "hero",
  cta_block: "cta",
  footer_grid: "footer",
}
