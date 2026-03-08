// Shared class maps for component family tokens.
// One authoritative definition of each family's visual identity.

import type { CardFamily, CardChrome, AccentRule, ContentDensity, ResolvedSectionUi } from "./tokens"
import {
  DENSITY_PADDING,
  DENSITY_GAP,
  DENSITY_HEADER_PADDING,
  DENSITY_BODY_PADDING,
  DENSITY_COMPACT_PADDING,
} from "./presentation"
import { cn } from "@/lib/utils"

/** Base styling per card family — the family's visual identity.
 *
 * Each family is intentionally distinct in border, bg, shadow, radius, and emphasis strategy:
 * - quiet: minimal, matte, restrained
 * - service: premium, accent-tinted, elevated, ring
 * - proof: editorial, matte gradient, no ring/glow
 * - process: structural, directional left rail, flat
 * - metric: data-forward, centered, crisp border
 * - logo_tile: utility, minimal, centered
 * - cta: action-oriented, strongest accent
 */
export const FAMILY_CLASSES: Record<CardFamily, string> = {
  quiet:
    "border border-border/20 bg-card/[0.06] rounded-xl",
  service:
    "border border-accent/25 bg-gradient-to-b from-accent/[0.10] via-card/[0.14] to-card/[0.03] shadow-lg ring-1 ring-accent/[0.12] rounded-2xl",
  metric:
    "border-2 border-border/40 bg-card/[0.08] text-center rounded-lg shadow-sm",
  process:
    "border-l-[3px] border-l-accent/60 border border-border/25 bg-card/[0.05] rounded-lg rounded-l-none",
  proof:
    "border border-border/35 bg-gradient-to-b from-card/[0.14] to-card/[0.04] rounded-xl",
  logo_tile:
    "border border-border/15 bg-card/[0.04] flex items-center justify-center rounded-lg",
  cta:
    "border-2 border-accent/35 bg-gradient-to-br from-accent/[0.10] to-accent/[0.03] rounded-2xl shadow-lg ring-1 ring-accent/[0.10]",
}

/** Chrome modifiers layer on top of a family — never used standalone.
 *
 * Each chrome is designed for clear visual distinction:
 * - flat: Stripped-back, borderless, no depth — "print" aesthetic (Linear-inspired)
 * - outlined: Crisp border ring — structured, architectural (Stripe-inspired)
 * - elevated: Strong shadow + highlight ring — floating, lifted (Material Design)
 * - inset: Recessed, sunken — pressed/embedded feel (neumorphism-lite)
 * - glow: Ambient accent glow at rest + enhanced on hover (premium/gaming UIs)
 */
export const CHROME_MODIFIERS: Record<CardChrome, string> = {
  flat: "border-transparent shadow-none ring-0 bg-card/[0.03]",
  outlined: "ring-1 ring-border/50 shadow-none border-border/40",
  elevated: "shadow-xl shadow-black/30 ring-1 ring-white/[0.06] border-transparent",
  inset: "shadow-[inset_0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(0,0,0,0.3)] bg-card/[0.04] ring-0 border-border/15",
  glow: "card-chrome-glow shadow-lg",
}

/** Full chrome replacements for legacy mode (no family set). */
export const CHROME_STANDALONE: Record<CardChrome, string> = {
  flat: "border-transparent bg-card/[0.06] rounded-xl",
  outlined: "border border-border/40 bg-card/[0.08] ring-1 ring-border/30 rounded-xl",
  elevated: "border-transparent bg-card/[0.12] shadow-xl shadow-black/30 ring-1 ring-white/[0.06] rounded-xl",
  inset: "border border-border/15 bg-card/[0.04] shadow-[inset_0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(0,0,0,0.3)] rounded-xl",
  glow: "border border-border/30 bg-card/[0.08] card-chrome-glow shadow-lg rounded-xl",
}

/** Accent rule classes applied to cards. */
export const ACCENT_CLASSES: Record<AccentRule, string> = {
  none: "",
  left: "border-l-[3px] border-l-accent/50",
  top: "border-t-[3px] border-t-accent/50",
  inline: "", // inline accent is rendered inside the card, not via border class
}

/** Default card class when no family is set. */
export const DEFAULT_CARD_CLASS = "surface-panel interactive-lift"

/** Service-family internal structure classes — applied inside the card for enhanced hierarchy. */
export const SERVICE_CARD_INNER = {
  headerClass: "relative pb-3 mb-2 border-b border-accent/15",
  titleClass: "text-base font-semibold tracking-tight",
  bodyClass: "text-sm text-muted-foreground leading-relaxed",
  tagClass: "text-[10px] font-semibold uppercase tracking-widest text-accent/70",
} as const

/**
 * Resolves the full card className from family + chrome + accent tokens.
 * Returns the composed class string and whether inline accent should be rendered.
 */
export function resolveCardClasses(
  family?: CardFamily,
  chrome?: CardChrome,
  accentRule?: AccentRule
): { cardClass: string; isInlineAccent: boolean } {
  const base = family ? FAMILY_CLASSES[family] : DEFAULT_CARD_CLASS
  const chromeModifier = chrome
    ? family
      ? CHROME_MODIFIERS[chrome]
      : CHROME_STANDALONE[chrome]
    : ""
  const accent =
    accentRule && accentRule !== "inline"
      ? ACCENT_CLASSES[accentRule]
      : ""

  return {
    cardClass: cn(base, chromeModifier, accent),
    isInlineAccent: accentRule === "inline",
  }
}

// ---------------------------------------------------------------------------
// Structural spacing helpers — centralized so renderers don't re-derive
// ---------------------------------------------------------------------------

export type CardStructuralMode = "standard" | "compact" | "accordion" | "cta"

export type CardSpacing = {
  /** Root-level padding class for the card container. */
  rootPadding: string
  /** Header area padding (for cards with distinct header/body). */
  headerPadding: string
  /** Body area padding. */
  bodyPadding: string
  /** Internal gap between children. */
  gap: string
}

/** Accordion-specific padding recipes per density level. */
const ACCORDION_ROOT_PADDING: Record<ContentDensity, string> = {
  tight: "px-3",
  standard: "px-4",
  airy: "px-6",
}
const ACCORDION_TRIGGER_PADDING: Record<ContentDensity, string> = {
  tight: "py-2.5",
  standard: "py-3.5",
  airy: "py-5",
}
const ACCORDION_CONTENT_PADDING: Record<ContentDensity, string> = {
  tight: "pb-3",
  standard: "pb-4",
  airy: "pb-6",
}

/** CTA card padding recipes per density level. */
const CTA_ROOT_PADDING: Record<ContentDensity, string> = {
  tight: "px-4 py-4",
  standard: "px-6 py-6",
  airy: "px-8 py-8 sm:px-10 sm:py-10",
}

/**
 * Resolves card-internal spacing from density + structural mode.
 * Centralizes the padding/gap recipes so renderers don't invent their own.
 */
export function resolveCardSpacing(density: ContentDensity = "standard", mode: CardStructuralMode = "standard"): CardSpacing {
  switch (mode) {
    case "compact":
      return {
        rootPadding: DENSITY_COMPACT_PADDING[density],
        headerPadding: DENSITY_COMPACT_PADDING[density],
        bodyPadding: DENSITY_COMPACT_PADDING[density],
        gap: DENSITY_GAP[density],
      }
    case "accordion":
      return {
        rootPadding: ACCORDION_ROOT_PADDING[density],
        headerPadding: ACCORDION_TRIGGER_PADDING[density],
        bodyPadding: ACCORDION_CONTENT_PADDING[density],
        gap: DENSITY_GAP[density],
      }
    case "cta":
      return {
        rootPadding: CTA_ROOT_PADDING[density],
        headerPadding: "",
        bodyPadding: "",
        gap: DENSITY_GAP[density],
      }
    default: // "standard"
      return {
        rootPadding: DENSITY_PADDING[density],
        headerPadding: DENSITY_HEADER_PADDING[density],
        bodyPadding: DENSITY_BODY_PADDING[density],
        gap: DENSITY_GAP[density],
      }
  }
}

/**
 * Convenience: resolves both card classes and spacing from the full UI object.
 * This is the recommended entry point for section renderers.
 */
export function resolveCardPresentation(
  ui: ResolvedSectionUi | undefined,
  options?: { mode?: CardStructuralMode }
): {
  cardClass: string
  isInlineAccent: boolean
  spacing: CardSpacing
} {
  const { cardClass, isInlineAccent } = ui?.componentFamily
    ? resolveCardClasses(ui.componentFamily, ui.componentChrome, ui.accentRule)
    : { cardClass: DEFAULT_CARD_CLASS, isInlineAccent: false }

  const spacing = resolveCardSpacing(ui?.density ?? "standard", options?.mode ?? "standard")

  return { cardClass, isInlineAccent, spacing }
}
