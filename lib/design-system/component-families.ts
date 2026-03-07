// Shared class maps for component family tokens.
// One authoritative definition of each family's visual identity.

import type { CardFamily, CardChrome, AccentRule } from "./tokens"
import { cn } from "@/lib/utils"

/** Base styling per card family — the family's visual identity. */
export const FAMILY_CLASSES: Record<CardFamily, string> = {
  quiet: "border border-border/30 bg-card/15 rounded-xl",
  service:
    "border border-accent/20 bg-gradient-to-b from-accent/[0.06] via-card/20 to-card/5 shadow-sm ring-1 ring-accent/[0.07] rounded-xl",
  metric: "border border-border/40 bg-card/25 text-center rounded-xl",
  process:
    "border-l-[3px] border-l-accent/50 border border-border/30 bg-card/15 rounded-lg rounded-l-none",
  proof: "border border-border/40 bg-gradient-to-b from-card/15 to-card/5 rounded-xl",
  logo_tile:
    "border border-border/20 bg-card/10 flex items-center justify-center rounded-lg",
  cta: "border border-accent/30 bg-accent/[0.06] rounded-xl shadow-sm",
}

/** Chrome modifiers layer on top of a family — never used standalone. */
export const CHROME_MODIFIERS: Record<CardChrome, string> = {
  flat: "border-transparent shadow-none",
  outlined: "ring-1 ring-border/20",
  elevated: "shadow-md shadow-black/20",
  inset: "shadow-[inset_0_1px_4px_rgba(0,0,0,0.25)] bg-card/10",
}

/** Full chrome replacements for legacy mode (no family set). */
export const CHROME_STANDALONE: Record<CardChrome, string> = {
  flat: "border-transparent bg-card/20",
  outlined: "border border-border/50 bg-card/20 ring-1 ring-border/15",
  elevated: "border border-border/40 bg-card/30 shadow-md shadow-black/20",
  inset: "border border-border/30 bg-card/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.25)]",
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
  headerClass: "relative pb-3 mb-1 border-b border-accent/10",
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
