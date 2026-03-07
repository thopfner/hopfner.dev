// Shared class maps for component family tokens.
// One authoritative definition of each family's visual identity.

import type { CardFamily, CardChrome, AccentRule } from "./tokens"
import { cn } from "@/lib/utils"

/** Base styling per card family — the family's visual identity. */
export const FAMILY_CLASSES: Record<CardFamily, string> = {
  quiet: "border border-border/30 bg-card/15",
  service:
    "border border-accent/15 bg-gradient-to-b from-card/30 to-card/10 shadow-sm",
  metric: "border border-border/40 bg-card/20 text-center",
  process:
    "border-l-2 border-l-accent/50 border border-border/30 bg-card/15",
  proof: "border border-border/50 bg-card/25",
  logo_tile:
    "border border-border/20 bg-card/10 flex items-center justify-center",
  cta: "border border-accent/30 bg-accent/[0.04]",
}

/** Chrome modifiers layer on top of a family — never used standalone. */
export const CHROME_MODIFIERS: Record<CardChrome, string> = {
  flat: "border-transparent shadow-none",
  outlined: "",
  elevated: "shadow-md",
  inset: "shadow-inner bg-card/10",
}

/** Full chrome replacements for legacy mode (no family set). */
export const CHROME_STANDALONE: Record<CardChrome, string> = {
  flat: "border-transparent bg-card/20",
  outlined: "border border-border/50 bg-card/20",
  elevated: "border border-border/40 bg-card/30 shadow-md",
  inset: "border border-border/30 bg-card/10 shadow-inner",
}

/** Accent rule classes applied to cards. */
export const ACCENT_CLASSES: Record<AccentRule, string> = {
  none: "",
  left: "border-l-2 border-l-accent/50",
  top: "border-t-2 border-t-accent/50",
  inline: "", // inline accent is rendered inside the card, not via border class
}

/** Default card class when no family is set. */
export const DEFAULT_CARD_CLASS = "surface-panel interactive-lift"

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
