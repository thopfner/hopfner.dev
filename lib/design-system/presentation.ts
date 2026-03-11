// Shared class maps for section presentation tokens.
// Imported by SectionShell and section renderers — never duplicated.

import type { Rhythm, Surface, ContentDensity, GridGap, DividerMode, HeadingTreatment, LabelStyle, SubtitleSize } from "./tokens"

export const RHYTHM_CLASSES: Record<Rhythm, string> = {
  hero: "py-16 sm:py-24 lg:py-28",
  statement: "py-12 sm:py-16",
  compact: "py-6 sm:py-8",
  standard: "py-10 sm:py-14 lg:py-16",
  proof: "py-8 sm:py-12 lg:py-14",
  cta: "py-14 sm:py-20 lg:py-24",
  footer: "py-8 sm:py-10",
}

export const SURFACE_CLASSES: Record<Surface, string> = {
  none: "",
  panel: "surface-panel",
  soft_band: "bg-[color-mix(in_oklch,var(--foreground)_6%,var(--background))]",
  contrast_band: "bg-[color-mix(in_oklch,var(--foreground)_12%,var(--background))]",
  spotlight_stage: "relative bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--accent-glow)_16%,transparent),transparent_65%)]",
  grid_stage: "relative bg-[radial-gradient(ellipse_100%_60%_at_50%_-5%,color-mix(in_oklch,var(--accent-glow)_35%,transparent),transparent_75%)]",
  gradient_mesh: "surface-gradient-mesh",
  accent_glow: "surface-accent-glow",
  dark_elevated: "surface-dark-elevated",
  dot_grid: "surface-dot-grid",
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
  airy: "px-6 pt-6 pb-0",
}

/** Card body padding per density level. */
export const DENSITY_BODY_PADDING: Record<ContentDensity, string> = {
  tight: "px-3 pb-3",
  standard: "px-4 pb-4",
  airy: "px-6 pb-6",
}

/** Section content gap per density level — between heading block and content grid. */
export const DENSITY_SECTION_GAP: Record<ContentDensity, string> = {
  tight: "space-y-4 sm:space-y-5",
  standard: "space-y-6 sm:space-y-7",
  airy: "space-y-8 sm:space-y-10",
}

/** Compact panel padding per density — for simple items without header/body split. */
export const DENSITY_COMPACT_PADDING: Record<ContentDensity, string> = {
  tight: "px-3 py-2.5",
  standard: "px-4 py-3.5",
  airy: "px-6 py-5",
}

/** Spacing between stacked items per density level. */
export const DENSITY_ITEM_SPACING: Record<ContentDensity, string> = {
  tight: "space-y-2",
  standard: "space-y-3 sm:space-y-4",
  airy: "space-y-5 sm:space-y-6",
}

export const GRID_GAP_CLASSES: Record<GridGap, string> = {
  tight: "gap-3",
  standard: "gap-5",
  wide: "gap-8",
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
  gradient: "text-gradient",
  gradient_accent: "text-gradient-accent",
  display_xl: "text-display-xl",
  display_lg: "text-display-lg",
  display_md: "text-display-md",
}

/** Label style classes — applied to tags, badges, eyebrows, micro-labels. */
export const LABEL_STYLE_CLASSES: Record<LabelStyle, string> = {
  default: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",
  mono: "text-label-mono text-muted-foreground",
  pill: "rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent",
  micro: "text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
}

/** Subtitle size classes — responsive text scale for section subtitles. */
export const SUBTITLE_SIZE_CLASSES: Record<SubtitleSize, string> = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
}

/** Default rhythm when unset per section type. */
export const DEFAULT_RHYTHM: Record<string, Rhythm> = {
  hero_cta: "hero",
  cta_block: "cta",
  footer_grid: "footer",
  social_proof_strip: "compact",
  label_value_list: "compact",
}
