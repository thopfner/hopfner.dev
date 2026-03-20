/**
 * CTA visibility helpers.
 *
 * All visibility flags live in additive JSON content paths
 * (no SQL migration needed). Missing flags default to enabled.
 */

export type CtaKey = "ctaPrimary" | "ctaSecondary"

const CONTENT_KEY: Record<CtaKey, string> = {
  ctaPrimary: "ctaPrimaryEnabled",
  ctaSecondary: "ctaSecondaryEnabled",
}

// Section types that must NOT show CTA hide toggles
const EXCLUDED_FROM_TOGGLE = new Set(["booking_scheduler"])

export function isSharedCtaToggleSupported(sectionType: string, _key: CtaKey): boolean {
  if (EXCLUDED_FROM_TOGGLE.has(sectionType)) return false
  return true
}

export function getSharedCtaEnabled(content: Record<string, unknown>, key: CtaKey): boolean {
  const flag = content[CONTENT_KEY[key]]
  if (typeof flag === "boolean") return flag
  return true
}

export function setSharedCtaEnabled(
  content: Record<string, unknown>,
  key: CtaKey,
  enabled: boolean
): Record<string, unknown> {
  return { ...content, [CONTENT_KEY[key]]: enabled }
}

// Footer card CTA helpers
export function getFooterCardCtaEnabled(card: Record<string, unknown>, key: CtaKey): boolean {
  const ctaField = key === "ctaPrimary" ? "ctaPrimary" : "ctaSecondary"
  const ctaObj = card[ctaField]
  if (ctaObj && typeof ctaObj === "object" && !Array.isArray(ctaObj)) {
    const flag = (ctaObj as Record<string, unknown>).enabled
    if (typeof flag === "boolean") return flag
  }
  return true
}

export function setFooterCardCtaEnabled(
  card: Record<string, unknown>,
  key: CtaKey,
  enabled: boolean
): Record<string, unknown> {
  const ctaField = key === "ctaPrimary" ? "ctaPrimary" : "ctaSecondary"
  const existing =
    card[ctaField] && typeof card[ctaField] === "object" && !Array.isArray(card[ctaField])
      ? (card[ctaField] as Record<string, unknown>)
      : {}
  return { ...card, [ctaField]: { ...existing, enabled } }
}

// Composed/custom block CTA helpers
export function getComposerBlockCtaEnabled(block: Record<string, unknown>, key: CtaKey): boolean {
  const flag = block[CONTENT_KEY[key]]
  if (typeof flag === "boolean") return flag
  return true
}

export function setComposerBlockCtaEnabled(
  block: Record<string, unknown>,
  key: CtaKey,
  enabled: boolean
): Record<string, unknown> {
  return { ...block, [CONTENT_KEY[key]]: enabled }
}
