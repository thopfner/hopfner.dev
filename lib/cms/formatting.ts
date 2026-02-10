import type { SafeFormatting, TailwindWhitelist } from "@/lib/cms/types"

function asString(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function filterWhitelistedTokens(raw: string, whitelist: TailwindWhitelist): string[] {
  return raw
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => whitelist.has(t))
}

function uniq(tokens: string[]) {
  return Array.from(new Set(tokens))
}

function smPrefix(token: string) {
  return token.includes(":") ? token : `sm:${token}`
}

export function getSafeFormatting(
  raw: unknown,
  whitelist: TailwindWhitelist
): SafeFormatting {
  const f = asRecord(raw)
  const mobile = asRecord(f.mobile)

  const baseContainer = filterWhitelistedTokens(asString(f.containerClass), whitelist)
  const baseSection = filterWhitelistedTokens(asString(f.sectionClass), whitelist)

  const mobileContainer = filterWhitelistedTokens(
    asString(mobile.containerClass),
    whitelist
  )
  const mobileSection = filterWhitelistedTokens(asString(mobile.sectionClass), whitelist)

  const basePadding = asString(f.paddingY)
  const mobilePadding = asString(mobile.paddingY)

  const baseMaxWidth = asString(f.maxWidth)

  const align = asString(f.textAlign)
  const textAlignClass =
    align === "center" ? "text-center" : align === "left" ? "text-left" : ""

  const paddingAllowed = new Set(["", "py-4", "py-6", "py-8", "py-10", "py-12"])
  const maxWidthAllowed = new Set([
    "",
    "max-w-3xl",
    "max-w-4xl",
    "max-w-5xl",
    "max-w-6xl",
  ])

  const safeBasePadding = paddingAllowed.has(basePadding) ? basePadding : ""
  const safeMobilePadding = paddingAllowed.has(mobilePadding) ? mobilePadding : ""

  const safeMaxWidth = maxWidthAllowed.has(baseMaxWidth) ? baseMaxWidth : ""

  const hasMobileOverride =
    mobileContainer.length > 0 ||
    mobileSection.length > 0 ||
    safeMobilePadding !== ""

  const containerClass = hasMobileOverride
    ? uniq([
        ...mobileContainer,
        ...baseContainer.map(smPrefix).filter((t) => whitelist.has(t)),
      ]).join(" ")
    : baseContainer.join(" ")

  const sectionClass = hasMobileOverride
    ? uniq([
        ...mobileSection,
        ...baseSection.map(smPrefix).filter((t) => whitelist.has(t)),
      ]).join(" ")
    : baseSection.join(" ")

  const paddingY = hasMobileOverride
    ? uniq(
        [
          safeMobilePadding,
          safeBasePadding ? smPrefix(safeBasePadding) : "",
        ].filter(Boolean)
      ).join(" ")
    : safeBasePadding

  return {
    containerClass,
    sectionClass,
    paddingY,
    maxWidth: safeMaxWidth,
    textAlignClass: whitelist.has(textAlignClass) ? textAlignClass : "",
  }
}

