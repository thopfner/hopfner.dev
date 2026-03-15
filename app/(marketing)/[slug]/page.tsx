import { BookingSchedulerSection } from "@/components/landing/booking-scheduler-section"
import { CaseStudySplitSection } from "@/components/landing/case-study-split-section"
import { ComposedSection } from "@/components/landing/composed-section"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { FooterGridSection } from "@/components/landing/footer-grid-section"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ProofClusterSection } from "@/components/landing/proof-cluster-section"
import { SiteHeader, type HeaderNavLink } from "@/components/landing/site-header"
import { SocialProofStripSection } from "@/components/landing/social-proof-strip-section"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { TopBackdrop } from "@/components/landing/top-backdrop"
import { WhatIDeliverSection } from "@/components/landing/what-i-deliver-section"
import { WhyThisApproachSection } from "@/components/landing/why-this-approach-section"
import { WorkflowsSection } from "@/components/landing/workflows-section"
import { getSafeFormatting } from "@/lib/cms/formatting"
import { resolveSectionContainerProps } from "@/lib/cms/section-container-props"
import { getPublishedPageBySlug } from "@/lib/cms/get-published-page"
import { tiptapJsonToSanitizedHtml } from "@/lib/cms/rich-text"
import type {
  CmsPublishedSection,
  CmsSectionTypeDefault,
  CmsSectionTypeDefaultsMap,
} from "@/lib/cms/types"
import { resolveSectionUi } from "@/lib/design-system/resolve"
import { loadSectionPresetsFromClient } from "@/lib/design-system/loaders"
import { createClient as createServerSupabase } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"
import type { CSSProperties } from "react"

export const dynamic = "force-dynamic"

function asString(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).filter((x) => typeof x === "string") as string[] : []
}

function asRecordArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v)
    ? (v as unknown[]).filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[]
    : []
}

type CardDisplayState = {
  showTitle: boolean
  showText: boolean
  showImage: boolean
  showYouGet: boolean
  showBestFor: boolean
  youGetMode: "block" | "list"
  bestForMode: "block" | "list"
}

const DEFAULT_CARD_DISPLAY: CardDisplayState = {
  showTitle: true,
  showText: true,
  showImage: false,
  showYouGet: false,
  showBestFor: false,
  youGetMode: "block",
  bestForMode: "block",
}

function toCardDisplay(value: unknown, fallback?: Partial<CardDisplayState>): CardDisplayState {
  const raw = asRecord(value)
  const base = {
    ...DEFAULT_CARD_DISPLAY,
    ...(fallback ?? {}),
  }
  return {
    showTitle: typeof raw.showTitle === "boolean" ? raw.showTitle : base.showTitle,
    showText: typeof raw.showText === "boolean" ? raw.showText : base.showText,
    showImage: typeof raw.showImage === "boolean" ? raw.showImage : base.showImage,
    showYouGet: typeof raw.showYouGet === "boolean" ? raw.showYouGet : base.showYouGet,
    showBestFor: typeof raw.showBestFor === "boolean" ? raw.showBestFor : base.showBestFor,
    youGetMode: raw.youGetMode === "list" ? "list" : base.youGetMode,
    bestForMode: raw.bestForMode === "list" ? "list" : base.bestForMode,
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...base }
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      out[key] = value
      return
    }
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value)
      return
    }
    out[key] = value
  })
  return out
}

function pickText(primary: string | null | undefined, fallback: string | null | undefined) {
  const p = (primary ?? "").trim()
  if (p) return p
  const f = (fallback ?? "").trim()
  return f
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function buildInnerShadow(strength: number): string {
  if (strength <= 0) return "none"
  const topPx = Math.max(1, Math.round(2 * strength))
  const spreadY = Math.max(2, Math.round(12 * strength))
  const blur = Math.max(6, Math.round(20 * strength))
  const spread = Math.max(2, Math.round(10 * strength))
  return `inset 0 1px ${topPx}px color-mix(in srgb, white 24%, transparent), inset 0 ${spreadY}px ${blur}px -${spread}px color-mix(in srgb, var(--section-shadow-color) 34%, transparent)`
}

function fontScaleVars(scale: number): Record<string, string> {
  const base = {
    "--text-xs": 0.75,
    "--text-sm": 0.875,
    "--text-base": 1,
    "--text-lg": 1.125,
    "--text-xl": 1.25,
    "--text-2xl": 1.5,
    "--text-3xl": 1.875,
    "--text-4xl": 2.25,
  }
  return Object.fromEntries(
    Object.entries(base).map(([k, rem]) => [k, `${(rem * scale).toFixed(3)}rem`])
  )
}

function accentDerivedVars(accentColor: string): Record<string, string> {
  if (!accentColor) return {}
  return {
    "--accent": accentColor,
    "--accent-glow": accentColor,
    "--accent-light": `color-mix(in oklch, ${accentColor} 70%, white)`,
    "--border": `color-mix(in srgb, ${accentColor} 45%, transparent)`,
    "--input": `color-mix(in srgb, ${accentColor} 38%, transparent)`,
    "--ring": `color-mix(in srgb, ${accentColor} 72%, white 8%)`,
  }
}

function tailwindSpacingToCssValue(spacingToken: string): string | undefined {
  const token = spacingToken.trim()
  const arbitrary = token.match(/^\[(.+)\]$/)
  if (arbitrary) return arbitrary[1]
  if (token === "px") return "1px"
  if (token === "0") return "0px"
  if (/^\d+(?:\.\d+)?$/.test(token)) return `calc(var(--spacing) * ${token})`
  return undefined
}

function spacingTokenToStyle(
  spacingTop?: string,
  spacingBottom?: string,
  outerSpacing?: string
): CSSProperties {
  const style: CSSProperties = {}
  const applyToken = (tokenRaw: string) => {
    const token = tokenRaw.trim()
    if (!token) return
    const pt = token.match(/^pt-(.+)$/)
    if (pt) {
      const value = tailwindSpacingToCssValue(pt[1])
      if (value) style.paddingTop = value
      return
    }
    const pb = token.match(/^pb-(.+)$/)
    if (pb) {
      const value = tailwindSpacingToCssValue(pb[1])
      if (value) style.paddingBottom = value
      return
    }
    const mt = token.match(/^mt-(.+)$/)
    if (mt) {
      const value = tailwindSpacingToCssValue(mt[1])
      if (value) style.marginTop = value
      return
    }
    const mb = token.match(/^mb-(.+)$/)
    if (mb) {
      const value = tailwindSpacingToCssValue(mb[1])
      if (value) style.marginBottom = value
      return
    }
    const my = token.match(/^my-(.+)$/)
    if (my) {
      const value = tailwindSpacingToCssValue(my[1])
      if (value) style.marginBlock = value
    }
  }

  ;[spacingTop, spacingBottom, outerSpacing].forEach((raw) => {
    if (!raw) return
    raw.split(/\s+/).forEach(applyToken)
  })

  return style
}

/** @deprecated Use resolveSectionContainerProps from lib/cms/section-container-props */
function sectionContainerProps(
  formatting: Record<string, unknown>,
  whitelist: Set<string>,
  sectionKey?: string | null,
  sectionType?: string
) {
  return resolveSectionContainerProps(formatting, whitelist, sectionKey, sectionType)
}

// Legacy inline helper kept for reference during transition — all logic is now in resolveSectionContainerProps
function _legacySectionContainerProps(
  formatting: Record<string, unknown>,
  whitelist: Set<string>,
  sectionKey?: string | null,
  _sectionType?: string
) {
  const f = getSafeFormatting(formatting, whitelist)
  const backgroundType = asString(formatting.backgroundType)
  const sectionStyle: CSSProperties = {}
  const overlayColor = asString(formatting.overlayColor)
  const overlayOpacityRaw = Number(formatting.overlayOpacity)
  const overlayOpacity = Number.isFinite(overlayOpacityRaw)
    ? Math.min(1, Math.max(0, overlayOpacityRaw))
    : 0

  if (backgroundType === "color") {
    sectionStyle.background = asString(formatting.backgroundColor)
  } else if (backgroundType === "gradient") {
    const from = asString(formatting.gradientFrom)
    const to = asString(formatting.gradientTo)
    const dir = asString(formatting.gradientDirection) || "to bottom"
    if (from && to) sectionStyle.backgroundImage = `linear-gradient(${dir}, ${from}, ${to})`
  } else if (backgroundType === "image") {
    const imageUrl = asString(formatting.backgroundImageUrl)
    const focalX = Number(formatting.backgroundFocalX)
    const focalY = Number(formatting.backgroundFocalY)
    const x = Number.isFinite(focalX) ? Math.min(100, Math.max(0, focalX)) : 50
    const y = Number.isFinite(focalY) ? Math.min(100, Math.max(0, focalY)) : 50
    if (imageUrl) {
      const gradientOverlay = overlayColor && overlayOpacity > 0
        ? `linear-gradient(color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent), color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent)), `
        : ""
      sectionStyle.backgroundImage = `${gradientOverlay}url(${imageUrl})`
      sectionStyle.backgroundSize = asString(formatting.backgroundSize) || "cover"
      sectionStyle.backgroundPosition = `${x}% ${y}%`
    }
  }

  const containerStyle: CSSProperties = {}
  const panelStyle: CSSProperties = {}
  const cssVars = containerStyle as CSSProperties & Record<string, string>
  const fontFamily = asString(formatting.fontFamily)
  if (fontFamily) containerStyle.fontFamily = fontFamily
  const textColor = asString(formatting.textColor)
  const mutedTextColor = asString(formatting.mutedTextColor)
  const accentColor = asString(formatting.accentColor)
  const backgroundColor = asString(formatting.backgroundColorToken)
  const shadowMode = asString(formatting.shadowMode)
  const innerShadowMode = asString(formatting.innerShadowMode)
  const innerShadowStrength = clampNumber(formatting.innerShadowStrength, 0, 1.8, 0)
  const effectiveShadowScale = clampNumber(formatting.shadowScale, 0, 1.8, 1)
  const effectiveInnerShadowScale = clampNumber(formatting.innerShadowScale, 0, 1.8, innerShadowStrength)
  if (textColor) {
    containerStyle.color = textColor
    cssVars["--foreground"] = textColor
    cssVars["--card-foreground"] = textColor
    cssVars["--muted-foreground"] = mutedTextColor || `color-mix(in srgb, ${textColor} 72%, transparent)`
  } else if (mutedTextColor) {
    cssVars["--muted-foreground"] = mutedTextColor
  }
  Object.assign(cssVars, accentDerivedVars(accentColor))
  if (backgroundColor) cssVars["--background"] = backgroundColor
  const outerShadowOn = shadowMode === "off" ? false : effectiveShadowScale > 0.01
  const innerShadowOn =
    innerShadowMode === "on"
      ? effectiveInnerShadowScale > 0.01
      : innerShadowMode === "off"
        ? false
        : effectiveInnerShadowScale > 0.01

  if (!outerShadowOn) {
    cssVars["--section-shadow-ambient"] = "none"
    cssVars["--section-shadow-lift"] = "none"
    cssVars["--shadow-sm"] = "none"
    cssVars["--shadow"] = "none"
    cssVars["--shadow-lg"] = "none"
  }

  if (innerShadowMode === "on") {
    cssVars["--section-inner-shadow"] = buildInnerShadow(effectiveInnerShadowScale)
  } else if (innerShadowMode === "off") {
    cssVars["--section-inner-shadow"] = "none"
  }

  ;(panelStyle as CSSProperties & Record<string, string>)["--section-shadow-color"] =
    asString(formatting.shadowColorToken) || "var(--section-shadow-color)"

  const panelOpacity = clampNumber(formatting.pagePanelOpacity, 0, 1, 1)
  const panelVars = panelStyle as CSSProperties & Record<string, string>
  panelVars["--page-panel-opacity"] = String(panelOpacity)
  // Pass bg and shadow as CSS custom properties — never as direct inline styles.
  // This lets class-based card family/chrome styles control the visual result,
  // while surface-panel and other defaults can read these vars as fallback.
  panelVars["--panel-bg"] = `color-mix(in srgb, var(--card) ${Math.round(panelOpacity * 100)}%, transparent)`

  const boxShadowLayers: string[] = []
  if (outerShadowOn) boxShadowLayers.push("var(--section-shadow-ambient)", "var(--section-shadow-lift)")
  if (innerShadowOn) boxShadowLayers.push("var(--section-inner-shadow)")
  panelVars["--panel-shadow"] = boxShadowLayers.length ? boxShadowLayers.join(", ") : "var(--shadow-sm)"

  const widthMode = asString(formatting.widthMode)
  const align = asString(formatting.alignment)
  const spacingTop = asString(formatting.spacingTop)
  const spacingBottom = asString(formatting.spacingBottom)
  const outerSpacing = asString(formatting.outerSpacing)

  Object.assign(sectionStyle, spacingTokenToStyle(spacingTop, spacingBottom, outerSpacing))

  return {
    sectionId: sectionKey ?? undefined,
    sectionClassName: cn(f.paddingY, f.sectionClass),
    containerClassName: cn(
      widthMode === "full" ? "max-w-none" : f.maxWidth || "max-w-5xl",
      align === "left" ? "ml-0 mr-auto" : align === "right" ? "ml-auto mr-0" : "mx-auto",
      f.containerClass,
      f.textAlignClass
    ),
    sectionStyle,
    containerStyle,
    panelStyle,
  }
}

function resolveSectionBackgroundColor(
  formatting: Record<string, unknown>,
  fallback: string
): string {
  const backgroundType = asString(formatting.backgroundType)
  if (backgroundType === "color") {
    const direct = asString(formatting.backgroundColor).trim()
    if (direct) return direct
  }

  const token = asString(formatting.backgroundColorToken).trim()
  if (token) return token

  return fallback
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: rawSlug } = await params
  const slug = (rawSlug ?? "").trim()
  if (!slug) notFound()

  let page: { bg_image_url?: string | null }
  let sections: CmsPublishedSection[]
  let tailwindWhitelist: Set<string>
  let sectionTypeDefaults: CmsSectionTypeDefaultsMap
  let siteFormattingSettings: Record<string, unknown>
  let pageFormattingOverride: Record<string, unknown>
  let customSectionSchemas: Record<string, Record<string, unknown>>

  try {
    const res = await getPublishedPageBySlug(slug)
    page = res.page
    sections = res.sections
    tailwindWhitelist = res.tailwindWhitelist
    sectionTypeDefaults = res.sectionTypeDefaults
    siteFormattingSettings = asRecord(res.siteFormattingSettings)
    pageFormattingOverride = asRecord(res.page.formatting_override)
    customSectionSchemas = res.customSectionSchemas
  } catch {
    notFound()
  }

  // Load DB-backed design-system presets (falls back to code constants on failure)
  const serverSupabase = await createServerSupabase()
  const dbPresets = await loadSectionPresetsFromClient(serverSupabase)

  const header = sections.find((s) => s.section_type === "nav_links") ?? null
  const bodySections = sections.filter((s) => s.section_type !== "nav_links")
  const orderedBodySections = [
    ...bodySections.filter((s) => s.section_type !== "footer_grid"),
    ...bodySections.filter((s) => s.section_type === "footer_grid"),
  ]
  const firstBodyIsHero = orderedBodySections[0]?.section_type === "hero_cta"

  function defaultsFor(type: string): CmsSectionTypeDefault | undefined {
    return sectionTypeDefaults[type as keyof typeof sectionTypeDefaults]
  }

  const headerDefaults = defaultsFor("nav_links")
  const headerContent = deepMerge(
    asRecord(headerDefaults?.default_content),
    asRecord(header?.published.content)
  )

  const headerLinks = asRecordArray(headerContent.links).map(
    (l): HeaderNavLink => ({
      label: asString(l.label),
      href: asString(l.href),
      anchorId: asString(l.anchorId) || undefined,
    })
  )
  const headerLogoRaw = asRecord(headerContent.logo)
  const headerLogoUrl = asString(headerLogoRaw.url).trim()
  const headerLogoAlt = asString(headerLogoRaw.alt).trim() || "Site logo"
  const headerLogoWidthRaw = Number(headerLogoRaw.widthPx)
  const headerLogoWidth = Number.isFinite(headerLogoWidthRaw)
    ? Math.min(320, Math.max(60, Math.round(headerLogoWidthRaw)))
    : 140
  const headerLogo = headerLogoUrl
    ? { url: headerLogoUrl, alt: headerLogoAlt, widthPx: headerLogoWidth }
    : undefined

  const headerCta = {
    label: pickText(header?.published.cta_primary_label, headerDefaults?.default_cta_primary_label) || "Book a 15-min call",
    href: pickText(header?.published.cta_primary_href, headerDefaults?.default_cta_primary_href) || "#contact",
  }

  const baseFormatting = deepMerge(siteFormattingSettings, pageFormattingOverride)

  const siteTokens = asRecord(siteFormattingSettings.tokens)
  const pageTokens = asRecord(pageFormattingOverride.tokens)
  const mergedTokens = deepMerge(siteTokens, pageTokens)
  const colorMode = asString(mergedTokens.colorMode) || "dark"
  const isLightMode = colorMode === "light"
  const rootFontFamily = asString(mergedTokens.fontFamily) || asString(siteFormattingSettings.fontFamily)
  const rootFontScale = clampNumber(mergedTokens.fontScale ?? siteFormattingSettings.fontScale ?? 1, 0.8, 1.4, 1)
  const rootRadiusScale = clampNumber(mergedTokens.radiusScale ?? 1, 0, 1.8, 1)
  const rootSpacingScale = clampNumber(mergedTokens.spaceScale ?? mergedTokens.spacingScale ?? 1, 0.75, 1.8, 1)
  const rootShadowScale = clampNumber(mergedTokens.shadowScale ?? 1, 0, 1.8, 1)
  const rootInnerShadowScale = clampNumber(mergedTokens.innerShadowScale ?? 0, 0, 1.8, 0)
  const rootTextColor = asString(mergedTokens.textColor)
  const rootMutedTextColor = asString(mergedTokens.mutedTextColor)
  const rootAccentColor = asString(mergedTokens.accentColor)
  const rootBackgroundColor = asString(mergedTokens.backgroundColor)
  const rootCardBackgroundColor = asString(mergedTokens.cardBackgroundColor)
  const rootShadowColor = asString(mergedTokens.shadowColor) || (rootAccentColor ? `color-mix(in srgb, ${rootAccentColor} 28%, black)` : "")

  // Role-based typography tokens
  const displayFontFamily = asString(mergedTokens.displayFontFamily)
  const bodyFontFamily = asString(mergedTokens.bodyFontFamily)
  const monoFontFamily = asString(mergedTokens.monoFontFamily)
  const displayWeight = clampNumber(mergedTokens.displayWeight, 300, 900, 700)
  const headingWeight = clampNumber(mergedTokens.headingWeight, 300, 900, 600)
  const bodyWeight = clampNumber(mergedTokens.bodyWeight, 300, 700, 400)
  const displayTracking = asString(mergedTokens.displayTracking) || "-0.035em"
  const eyebrowTracking = asString(mergedTokens.eyebrowTracking) || "0.12em"
  const metricTracking = asString(mergedTokens.metricTracking) || "-0.02em"
  const displayScale = clampNumber(mergedTokens.displayScale, 0.8, 1.6, 1)
  const headingScale = clampNumber(mergedTokens.headingScale, 0.8, 1.4, 1)
  const bodyScale = clampNumber(mergedTokens.bodyScale, 0.8, 1.4, 1)
  const eyebrowScale = clampNumber(mergedTokens.eyebrowScale, 0.6, 1.4, 0.8)
  const metricScale = clampNumber(mergedTokens.metricScale, 0.8, 1.6, 1)
  // Brand signature tokens
  const signatureStyle = asString(mergedTokens.signatureStyle) || "off"
  const signatureIntensity = clampNumber(mergedTokens.signatureIntensity, 0, 1, 0.5)
  const signatureColor = asString(mergedTokens.signatureColor) || "rgba(120,140,255,0.08)"
  const signatureGridOpacity = clampNumber(mergedTokens.signatureGridOpacity, 0, 0.5, 0.06)
  const signatureGlowOpacity = clampNumber(mergedTokens.signatureGlowOpacity, 0, 0.5, 0.08)
  const signatureNoiseOpacity = clampNumber(mergedTokens.signatureNoiseOpacity, 0, 0.3, 0)

  const rootStyle: CSSProperties = {
    fontFamily: rootFontFamily || undefined,
    fontSize: `${rootFontScale}rem`,
    ...fontScaleVars(rootFontScale),
    ["--radius" as string]: `${(0.625 * rootRadiusScale).toFixed(3)}rem`,
    ["--spacing" as string]: `${(0.25 * rootSpacingScale).toFixed(4)}rem`,
    ["--section-shadow-color" as string]: rootShadowColor || "#000",
    ["--section-shadow-ambient" as string]: rootShadowScale <= 0
      ? "none"
      : `0 0 ${Math.round(14 * rootShadowScale)}px color-mix(in srgb, var(--section-shadow-color) 20%, transparent)`,
    ["--section-shadow-lift" as string]: rootShadowScale <= 0
      ? "none"
      : `0 ${Math.round(10 * rootShadowScale)}px ${Math.round(26 * rootShadowScale)}px -${Math.round(8 * rootShadowScale)}px color-mix(in srgb, var(--section-shadow-color) 42%, transparent)`,
    ["--section-inner-shadow" as string]: buildInnerShadow(rootInnerShadowScale),
    ["--shadow-sm" as string]: rootShadowScale <= 0
      ? "none"
      : `0 ${Math.round(1 * rootShadowScale)}px ${Math.round(3 * rootShadowScale)}px color-mix(in srgb, var(--section-shadow-color) 32%, transparent)`,
    ["--shadow" as string]: rootShadowScale <= 0
      ? "none"
      : `0 ${Math.round(6 * rootShadowScale)}px ${Math.round(18 * rootShadowScale)}px -${Math.round(6 * rootShadowScale)}px color-mix(in srgb, var(--section-shadow-color) 36%, transparent)`,
    ["--shadow-lg" as string]: rootShadowScale <= 0
      ? "none"
      : `0 ${Math.round(14 * rootShadowScale)}px ${Math.round(32 * rootShadowScale)}px -${Math.round(10 * rootShadowScale)}px color-mix(in srgb, var(--section-shadow-color) 40%, transparent)`,
    ...accentDerivedVars(rootAccentColor),
    // Role-based typography CSS variables
    ["--font-display" as string]: displayFontFamily || rootFontFamily || "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    ["--font-body" as string]: bodyFontFamily || rootFontFamily || "var(--font-ibm-plex-sans), var(--font-inter), system-ui, sans-serif",
    ["--font-mono" as string]: monoFontFamily || "var(--font-ibm-plex-mono), var(--font-jetbrains-mono), monospace",
    ["--display-weight" as string]: String(displayWeight),
    ["--heading-weight" as string]: String(headingWeight),
    ["--body-weight" as string]: String(bodyWeight),
    ["--display-tracking" as string]: displayTracking,
    ["--eyebrow-tracking" as string]: eyebrowTracking,
    ["--metric-tracking" as string]: metricTracking,
    ["--display-scale" as string]: String(displayScale),
    ["--heading-scale" as string]: String(headingScale),
    ["--body-scale" as string]: String(bodyScale),
    ["--eyebrow-scale" as string]: String(eyebrowScale),
    ["--metric-scale" as string]: String(metricScale),
    // Brand signature
    ["--sig-style" as string]: signatureStyle,
    ["--sig-intensity" as string]: String(signatureIntensity),
    ["--sig-color" as string]: signatureColor,
    ["--sig-grid-opacity" as string]: String(signatureGridOpacity),
    ["--sig-glow-opacity" as string]: String(signatureGlowOpacity),
    ["--sig-noise-opacity" as string]: String(signatureNoiseOpacity),
  }
  if (rootTextColor) {
    ;(rootStyle as Record<string, string>)["--foreground"] = rootTextColor
    ;(rootStyle as Record<string, string>)["--card-foreground"] = rootTextColor
    ;(rootStyle as Record<string, string>)["--muted-foreground"] = rootMutedTextColor || `color-mix(in srgb, ${rootTextColor} 72%, transparent)`
  } else if (rootMutedTextColor) {
    ;(rootStyle as Record<string, string>)["--muted-foreground"] = rootMutedTextColor
  }
  if (rootBackgroundColor) (rootStyle as Record<string, string>)["--background"] = rootBackgroundColor
  if (rootCardBackgroundColor) (rootStyle as Record<string, string>)["--card"] = rootCardBackgroundColor

  const pageBgImageUrl = asString(page.bg_image_url).trim() || null
  const pageBackdropEnabled = Boolean(pageBgImageUrl)

  const topBackdropScopeRaw = asString(pageFormattingOverride.topBackdropScope)
  const topBackdropScope = topBackdropScopeRaw === "full-page" ? "full-page" : "hero-only"
  const topNavOverlayOpacity = clampNumber(pageFormattingOverride.topNavOverlayOpacity, 0, 0.6, 0.18)
  const topBgImageOpacity = clampNumber(pageFormattingOverride.topBackdropImageOpacity, 0, 1, 1)

  return (
    <div className={cn(
      "relative min-h-dvh bg-background",
      isLightMode ? "light" : "dark",
      signatureStyle === "obsidian_signal" && "sig-obsidian-signal",
      signatureStyle === "grid_rays" && "sig-grid-rays",
      signatureStyle === "topographic_dark" && "sig-topographic-dark"
    )} style={{
      colorScheme: isLightMode ? "light" : "dark",
      ...rootStyle,
    }}>
      {signatureNoiseOpacity > 0 ? <div aria-hidden className="sig-noise-layer" /> : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent_55%),radial-gradient(700px_circle_at_50%_100%,color-mix(in_oklch,var(--foreground)_6%,transparent),transparent_50%)]"
      />
      <TopBackdrop imageUrl={pageBackdropEnabled ? pageBgImageUrl : null} imageOpacity={topBgImageOpacity} navOverlayOpacity={topNavOverlayOpacity} scope={topBackdropScope}>
        {header ? (
          <SiteHeader
            links={headerLinks}
            logo={headerLogo}
            cta={headerCta}
            topBackdropEnabled={pageBackdropEnabled}
            navOverlayOpacity={topNavOverlayOpacity}
            containerClassName={cn(
              sectionContainerProps(
                deepMerge(
                  deepMerge(
                    baseFormatting,
                    asRecord(headerDefaults?.default_formatting)
                  ),
                  deepMerge(asRecord(header.formatting_override), asRecord(header.published.formatting))
                ),
                tailwindWhitelist,
                header.key
              ).containerClassName
            )}
          />
        ) : null}

        <main className={cn("pb-10", firstBodyIsHero ? "pt-0" : "pt-4")}>
          {orderedBodySections.map((section, index) => {
          const v = section.published
          const defaults = defaultsFor(section.section_type)
          const content = deepMerge(
            asRecord(defaults?.default_content),
            asRecord(v.content)
          )
          const formatting = deepMerge(
            deepMerge(
              baseFormatting,
              asRecord(defaults?.default_formatting)
            ),
            deepMerge(asRecord(section.formatting_override), asRecord(v.formatting))
          )
          const props = sectionContainerProps(formatting, tailwindWhitelist, section.key, section.section_type)
          const ui = resolveSectionUi(formatting, section.section_type, { presets: dbPresets })
          const fullPageBackdropMode = pageBackdropEnabled && topBackdropScope === "full-page"
          const propsWithFullPageBackdrop =
            fullPageBackdropMode && section.section_type !== "hero_cta"
              ? {
                  ...props,
                  sectionStyle: {
                    ...(props.sectionStyle ?? {}),
                    background: "transparent",
                    backgroundColor: "transparent",
                    backgroundImage: "none",
                  } as CSSProperties,
                }
              : props

          const previousSection = index > 0 ? orderedBodySections[index - 1] : null
          const isImmediatelyAfterHero = previousSection?.section_type === "hero_cta"
          const sectionBgColor = resolveSectionBackgroundColor(formatting, rootBackgroundColor || "var(--background)")
          const shouldForceAfterHeroBg = isImmediatelyAfterHero && !fullPageBackdropMode
          const adjustedProps = shouldForceAfterHeroBg
            ? {
                ...propsWithFullPageBackdrop,
                sectionStyle: {
                  ...(propsWithFullPageBackdrop.sectionStyle ?? {}),
                  backgroundColor: sectionBgColor,
                } as CSSProperties,
              }
            : propsWithFullPageBackdrop

          switch (section.section_type) {
            case "hero_cta": {
              const nextSection = index < orderedBodySections.length - 1 ? orderedBodySections[index + 1] : null
              let nextSectionBgColor = rootBackgroundColor || "var(--background)"
              if (nextSection) {
                const nextDefaults = defaultsFor(nextSection.section_type)
                const nextFormatting = deepMerge(
                  deepMerge(
                    baseFormatting,
                    asRecord(nextDefaults?.default_formatting)
                  ),
                  deepMerge(
                    asRecord(nextSection.formatting_override),
                    asRecord(nextSection.published.formatting)
                  )
                )
                nextSectionBgColor = resolveSectionBackgroundColor(
                  nextFormatting,
                  rootBackgroundColor || "var(--background)"
                )
              }

              const heroLayoutVariant = asString(content.layoutVariant)
              const heroProofPanelRaw = asRecord(content.proofPanel)
              const heroProofPanel = heroProofPanelRaw.type ? {
                type: asString(heroProofPanelRaw.type) as "stats" | "mockup" | "image",
                headline: asString(heroProofPanelRaw.headline),
                items: asRecordArray(heroProofPanelRaw.items).map((it) => ({
                  label: asString(it.label),
                  value: asString(it.value),
                })),
                imageUrl: asString(heroProofPanelRaw.imageUrl),
                mockupVariant: asString(heroProofPanelRaw.mockupVariant) as "dashboard" | "workflow" | "terminal" | undefined,
              } : undefined
              const heroTrustItems = asRecordArray(content.trustItems).map((it) => ({
                text: asString(it.text),
                icon: asString(it.icon),
              }))
              const heroStatsArr = asRecordArray(content.heroStats).map((it) => ({
                value: asString(it.value),
                label: asString(it.label),
              }))
              const heroContentOrder = asStringArray(content.heroContentOrder)
              const heroContentSides = asRecord(content.heroContentSides)

              return (
                <HeroSection
                  key={section.id}
                  {...adjustedProps}
                  fullBleed={asString(formatting.widthMode) === "full"}
                  minHeight={
                    asString(formatting.heroMinHeight) === "70svh" || asString(formatting.heroMinHeight) === "100svh"
                      ? (asString(formatting.heroMinHeight) as "70svh" | "100svh")
                      : "auto"
                  }
                  headline={pickText(v.title, defaults?.default_title)}
                  subheadline={pickText(v.subtitle, defaults?.default_subtitle)}
                  bullets={asStringArray(content.bullets)}
                  primaryCta={{
                    label: pickText(v.cta_primary_label, defaults?.default_cta_primary_label),
                    href: pickText(v.cta_primary_href, defaults?.default_cta_primary_href) || "#contact",
                  }}
                  secondaryCta={{
                    label: pickText(v.cta_secondary_label, defaults?.default_cta_secondary_label),
                    href: pickText(v.cta_secondary_href, defaults?.default_cta_secondary_href) || "#services",
                  }}
                  trustLine={asString(content.trustLine)}
                  backgroundImageUrl={pickText(v.background_media_url, defaults?.default_background_media_url)}
                  imageOverlayColor={asString(formatting.heroImageOverlayColor)}
                  imageOverlayOpacity={clampNumber(formatting.heroImageOverlayOpacity, 0, 1, 0)}
                  transitionToNext={topBackdropScope === "full-page" && pageBackdropEnabled ? false : index < orderedBodySections.length - 1}
                  nextSectionBgColor={nextSectionBgColor}
                  trustLineFontSizePx={clampNumber(formatting.trustLineFontSizePx, 10, 28, 12)}
                  trustLineColor={asString(formatting.trustLineColor)}
                  heroBlendStrength={clampNumber(formatting.heroBlendStrength, 0, 1, 0.72)}
                  useSharedTopBackdrop={pageBackdropEnabled && (topBackdropScope === "full-page" || (topBackdropScope === "hero-only" && index === 0))}
                  layoutVariant={
                    heroLayoutVariant === "split" || heroLayoutVariant === "split_reversed"
                      ? heroLayoutVariant
                      : "centered"
                  }
                  eyebrow={asString(content.eyebrow)}
                  proofPanel={heroProofPanel}
                  trustItems={heroTrustItems.length > 0 ? heroTrustItems : undefined}
                  heroStats={heroStatsArr.length > 0 ? heroStatsArr : undefined}
                  heroContentOrder={heroContentOrder.length > 0 ? heroContentOrder : undefined}
                  heroContentSides={Object.keys(heroContentSides).length > 0 ? heroContentSides as Record<string, "left" | "right"> : undefined}
                  textAlign={
                    asString(formatting.textAlign) === "center" ? "center"
                    : asString(formatting.textAlign) === "left" ? "left"
                    : undefined
                  }
                  rightColumnAlign={
                    asString(formatting.heroRightAlign) === "center" ? "center"
                    : asString(formatting.heroRightAlign) === "left" ? "left"
                    : undefined
                  }
                  ui={ui}
                />
              )
            }
            case "card_grid": {
              const globalCardDisplay = toCardDisplay(content.cardDisplay)
              const cards = asRecordArray(content.cards).map((c) => ({
                display: toCardDisplay(c.display, globalCardDisplay),
                title: asString(c.title),
                text: asString(c.text),
                textHtml: tiptapJsonToSanitizedHtml(c.textRichText),
                imageUrl: asString(asRecord(c.image).url).trim(),
                imageAlt: asString(asRecord(c.image).alt).trim() || asString(c.title),
                imageWidthPx: (() => {
                  const widthRaw = Number(asRecord(c.image).widthPx)
                  return Number.isFinite(widthRaw) ? Math.min(420, Math.max(80, Math.round(widthRaw))) : 240
                })(),
                youGet: asStringArray(c.youGet),
                bestFor: asString(c.bestFor),
                bestForList: (() => {
                  const list = asStringArray(c.bestForList).filter((item) => item.trim().length > 0)
                  if (list.length) return list
                  const fallback = asString(c.bestFor).trim()
                  return fallback ? [fallback] : []
                })(),
                icon: asString(c.icon),
                stat: asString(c.stat),
                tag: asString(c.tag),
              }))
              const columnsRaw = Number(content.columns)
              const cardGridColumns = columnsRaw === 2 || columnsRaw === 3 || columnsRaw === 4 ? columnsRaw : undefined
              return (
                <WhatIDeliverSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  cards={cards}
                  columns={cardGridColumns}
                />
              )
            }
            case "steps_list": {
              const steps = asRecordArray(content.steps).map((s) => ({
                title: asString(s.title),
                body: asString(s.body),
                bodyHtml: tiptapJsonToSanitizedHtml(s.bodyRichText),
                icon: asString(s.icon),
                stat: asString(s.stat),
              }))
              const stepsLayoutRaw = asString(content.layoutVariant)
              const validStepsLayouts = ["grid", "timeline", "connected_flow", "workflow_visual"]
              const stepsLayout = validStepsLayouts.includes(stepsLayoutRaw) ? stepsLayoutRaw as "grid" | "timeline" | "connected_flow" | "workflow_visual" : "grid"
              return (
                <HowItWorksSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  steps={steps}
                  layoutVariant={stepsLayout}
                />
              )
            }
            case "title_body_list": {
              const items = asRecordArray(content.items).map((i) => ({
                title: asString(i.title),
                body: asString(i.body),
                bodyHtml: tiptapJsonToSanitizedHtml(i.bodyRichText),
              }))
              const tbLayoutRaw = asString(content.layoutVariant)
              const validTbLayouts = ["accordion", "stacked", "two_column", "cards"]
              const tbLayout = validTbLayouts.includes(tbLayoutRaw) ? tbLayoutRaw as "accordion" | "stacked" | "two_column" | "cards" : "accordion"
              return (
                <WorkflowsSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  items={items}
                  layoutVariant={tbLayout}
                />
              )
            }
            case "rich_text_block": {
              const bodyHtml = tiptapJsonToSanitizedHtml(content.bodyRichText)
              return (
                <WhyThisApproachSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  heading={pickText(v.subtitle, defaults?.default_subtitle)}
                  bodyHtml={bodyHtml}
                  eyebrow={asString(content.eyebrow)}
                />
              )
            }
            case "label_value_list": {
              const items = asRecordArray(content.items).map((i) => ({
                label: asString(i.label),
                value: asString(i.value),
                icon: asString(i.icon),
                imageUrl: asString(i.imageUrl),
              }))
              const lvLayoutRaw = asString(content.layoutVariant)
              const validLvLayouts = ["default", "metrics_grid", "trust_strip", "tool_badges", "logo_row"]
              const lvLayout = validLvLayouts.includes(lvLayoutRaw) ? lvLayoutRaw as "default" | "metrics_grid" | "trust_strip" | "tool_badges" | "logo_row" : "default"
              return (
                <TechStackSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  items={items}
                  layoutVariant={lvLayout}
                  compact={content.compact === true}
                />
              )
            }
            case "faq_list": {
              const items = asRecordArray(content.items).map((i) => ({
                question: asString(i.question),
                answerHtml: tiptapJsonToSanitizedHtml(i.answerRichText),
                answer: asString(i.answer),
              }))
              return (
                <FaqSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  items={items}
                />
              )
            }
            case "cta_block": {
              const bodyHtml = tiptapJsonToSanitizedHtml(content.bodyRichText)
              const ctaLayoutRaw = asString(content.layoutVariant)
              const validCtaLayouts = ["centered", "split", "compact", "high_contrast"]
              const ctaLayout = validCtaLayouts.includes(ctaLayoutRaw) ? ctaLayoutRaw as "centered" | "split" | "compact" | "high_contrast" : "centered"
              return (
                <FinalCtaSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  headline={pickText(v.title, defaults?.default_title)}
                  body={asString(content.body)}
                  bodyHtml={bodyHtml}
                  primaryCta={{
                    label: pickText(v.cta_primary_label, defaults?.default_cta_primary_label),
                    href: pickText(v.cta_primary_href, defaults?.default_cta_primary_href) || "#contact",
                  }}
                  secondaryCta={{
                    label: pickText(v.cta_secondary_label, defaults?.default_cta_secondary_label),
                    href: pickText(v.cta_secondary_href, defaults?.default_cta_secondary_href) || "#services",
                  }}
                  layoutVariant={ctaLayout}
                  eyebrow={asString(content.eyebrow)}
                />
              )
            }
            case "footer_grid": {
              const cards = asRecordArray(content.cards)
                .slice(0, 2)
                .map((card) => {
                  const cardRec = asRecord(card)
                  return {
                    title: asString(cardRec.title),
                    body: asString(cardRec.body),
                    linksMode: (asString(cardRec.linksMode) === "grouped" ? "grouped" : "flat") as "flat" | "grouped",
                    links: asRecordArray(cardRec.links).map((lnk) => {
                      const linkRec = asRecord(lnk)
                      return { label: asString(linkRec.label), href: asString(linkRec.href) }
                    }),
                    groups: asRecordArray(cardRec.groups).map((grp) => {
                      const grpRec = asRecord(grp)
                      return {
                        title: asString(grpRec.title),
                        links: asRecordArray(grpRec.links).map((lnk) => {
                          const linkRec = asRecord(lnk)
                          return { label: asString(linkRec.label), href: asString(linkRec.href) }
                        }),
                      }
                    }),
                    subscribe: (() => {
                      const sub = asRecord(cardRec.subscribe)
                      return {
                        enabled: sub.enabled === true,
                        placeholder: asString(sub.placeholder),
                        buttonLabel: asString(sub.buttonLabel),
                      }
                    })(),
                    ctaPrimary: (() => {
                      const cta = asRecord(cardRec.ctaPrimary)
                      return { label: asString(cta.label), href: asString(cta.href) }
                    })(),
                    ctaSecondary: (() => {
                      const cta = asRecord(cardRec.ctaSecondary)
                      return { label: asString(cta.label), href: asString(cta.href) }
                    })(),
                  }
                })

              const legal = asRecord(content.legal)
              const legalLinks = asRecordArray(legal.links).map((lnk) => {
                const linkRec = asRecord(lnk)
                return { label: asString(linkRec.label), href: asString(linkRec.href) }
              })

              const footerFullBleed = asString(formatting.widthMode) === "full"
              const footerContainerClassName = footerFullBleed
                ? (props.containerClassName ?? "")
                    .split(/\s+/)
                    .filter((token) => token && !/^max-w-/.test(token))
                    .join(" ")
                : props.containerClassName

              return (
                <FooterGridSection
                  key={section.id}
                  {...adjustedProps}
                  containerClassName={footerContainerClassName}
                  fullBleed={footerFullBleed}
                  cards={cards}
                  brandText={asString(content.brandText)}
                  legal={{
                    copyright: asString(legal.copyright),
                    links: legalLinks,
                  }}
                />
              )
            }
            case "social_proof_strip": {
              const logos = asRecordArray(content.logos).map((l) => ({
                label: asString(l.label),
                imageUrl: asString(l.imageUrl),
                alt: asString(l.alt),
                href: asString(l.href),
              }))
              const badges = asRecordArray(content.badges).map((b) => ({
                text: asString(b.text),
                icon: asString(b.icon),
              }))
              const spLayoutRaw = asString(content.layoutVariant)
              const validSpLayouts = ["inline", "marquee", "grid"]
              const spLayout = validSpLayouts.includes(spLayoutRaw) ? spLayoutRaw as "inline" | "marquee" | "grid" : "inline"
              return (
                <SocialProofStripSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  logos={logos}
                  badges={badges}
                  trustNote={asString(content.trustNote)}
                  layoutVariant={spLayout}
                />
              )
            }
            case "proof_cluster": {
              const metrics = asRecordArray(content.metrics).map((m) => ({
                value: asString(m.value),
                label: asString(m.label),
                icon: asString(m.icon),
              }))
              const proofCardRaw = asRecord(content.proofCard)
              const proofCard = proofCardRaw.title ? {
                title: asString(proofCardRaw.title),
                body: asString(proofCardRaw.body),
                stats: asRecordArray(proofCardRaw.stats).map((s) => ({
                  value: asString(s.value),
                  label: asString(s.label),
                })),
              } : undefined
              const testimonialRaw = asRecord(content.testimonial)
              const testimonial = testimonialRaw.quote ? {
                quote: asString(testimonialRaw.quote),
                author: asString(testimonialRaw.author),
                role: asString(testimonialRaw.role),
                imageUrl: asString(testimonialRaw.imageUrl),
              } : undefined
              return (
                <ProofClusterSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  metrics={metrics}
                  proofCard={proofCard}
                  testimonial={testimonial}
                  ctaLabel={pickText(v.cta_primary_label, defaults?.default_cta_primary_label)}
                  ctaHref={pickText(v.cta_primary_href, defaults?.default_cta_primary_href)}
                />
              )
            }
            case "booking_scheduler": {
              const intakeFields = asRecord(content.intakeFields)
              const intakeFieldsTyped: Record<string, { label: string; helpText?: string }> = {}
              for (const [k, val] of Object.entries(intakeFields)) {
                const f = asRecord(val)
                intakeFieldsTyped[k] = { label: asString(f.label), helpText: asString(f.helpText) }
              }
              return (
                <BookingSchedulerSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  ctaLabel={pickText(v.cta_primary_label, defaults?.default_cta_primary_label)}
                  ctaHref={pickText(v.cta_primary_href, defaults?.default_cta_primary_href)}
                  calLink={asString(content.calLink)}
                  formHeading={asString(content.formHeading)}
                  submitLabel={asString(content.submitLabel)}
                  intakeFields={intakeFieldsTyped}
                />
              )
            }
            case "case_study_split": {
              const narrativeHtml = tiptapJsonToSanitizedHtml(content.narrativeRichText)
              const beforeItems = asStringArray(content.beforeItems)
              const afterItems = asStringArray(content.afterItems)
              const stats = asRecordArray(content.stats).map((s) => ({
                value: asString(s.value),
                label: asString(s.label),
              }))
              return (
                <CaseStudySplitSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  title={pickText(v.title, defaults?.default_title)}
                  subtitle={pickText(v.subtitle, defaults?.default_subtitle)}
                  eyebrow={asString(content.eyebrow)}
                  narrativeHtml={narrativeHtml || asString(content.narrative)}
                  beforeLabel={asString(content.beforeLabel)}
                  afterLabel={asString(content.afterLabel)}
                  beforeItems={beforeItems}
                  afterItems={afterItems}
                  mediaTitle={asString(content.mediaTitle)}
                  mediaImageUrl={asString(content.mediaImageUrl)}
                  stats={stats}
                  ctaLabel={pickText(v.cta_primary_label, defaults?.default_cta_primary_label)}
                  ctaHref={pickText(v.cta_primary_href, defaults?.default_cta_primary_href)}
                />
              )
            }
            default: {
              const schema = customSectionSchemas?.[section.section_type]
              if (!schema) return null
              return (
                <ComposedSection
                  key={section.id}
                  {...adjustedProps}
                  ui={ui}
                  schema={schema}
                  content={asRecord(v.content)}
                  title={asString(v.title)}
                  subtitle={asString(v.subtitle)}
                />
              )
            }
          }
          })}
        </main>
      </TopBackdrop>
    </div>
  )
}
