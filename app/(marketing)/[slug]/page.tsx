import { FaqSection } from "@/components/landing/faq-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { FooterGridSection } from "@/components/landing/footer-grid-section"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { SiteHeader, type HeaderNavLink } from "@/components/landing/site-header"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { WhatIDeliverSection } from "@/components/landing/what-i-deliver-section"
import { WhyThisApproachSection } from "@/components/landing/why-this-approach-section"
import { WorkflowsSection } from "@/components/landing/workflows-section"
import { getSafeFormatting } from "@/lib/cms/formatting"
import { getPublishedPageBySlug } from "@/lib/cms/get-published-page"
import { tiptapJsonToSanitizedHtml } from "@/lib/cms/rich-text"
import type {
  CmsPublishedSection,
  CmsSectionTypeDefault,
  CmsSectionTypeDefaultsMap,
} from "@/lib/cms/types"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"
import type { CSSProperties } from "react"

export const dynamic = "force-dynamic"

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
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

function spacingTokenToMarginStyle(
  spacingTop?: string,
  spacingBottom?: string,
  outerSpacing?: string
): CSSProperties {
  const style: CSSProperties = {}
  const applyToken = (tokenRaw: string) => {
    const token = tokenRaw.trim()
    if (!token) return
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

function sectionContainerProps(
  formatting: Record<string, unknown>,
  whitelist: Set<string>,
  sectionKey?: string | null
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
  const accentColor = asString(formatting.accentColor)
  const backgroundColor = asString(formatting.backgroundColorToken)
  const shadowMode = asString(formatting.shadowMode)
  const innerShadowMode = asString(formatting.innerShadowMode)
  const innerShadowStrength = clampNumber(formatting.innerShadowStrength, 0, 1.8, 0)
  if (textColor) {
    containerStyle.color = textColor
    cssVars["--foreground"] = textColor
    cssVars["--card-foreground"] = textColor
    cssVars["--muted-foreground"] = `color-mix(in srgb, ${textColor} 72%, transparent)`
  }
  Object.assign(cssVars, accentDerivedVars(accentColor))
  if (backgroundColor) cssVars["--background"] = backgroundColor
  const outerShadowOn = shadowMode !== "off"
  const innerShadowOn =
    innerShadowMode === "on"
      ? innerShadowStrength > 0
      : innerShadowMode === "off"
        ? false
        : true

  if (!outerShadowOn) {
    cssVars["--section-shadow-ambient"] = "none"
    cssVars["--section-shadow-lift"] = "none"
    cssVars["--shadow-sm"] = "none"
    cssVars["--shadow"] = "none"
    cssVars["--shadow-lg"] = "none"
  }

  if (innerShadowMode === "on") {
    cssVars["--section-inner-shadow"] = buildInnerShadow(innerShadowStrength)
  } else if (innerShadowMode === "off") {
    cssVars["--section-inner-shadow"] = "none"
  }

  ;(panelStyle as CSSProperties & Record<string, string>)["--section-shadow-color"] =
    asString(formatting.shadowColorToken) || "var(--section-shadow-color)"

  const boxShadowLayers: string[] = []
  if (outerShadowOn) boxShadowLayers.push("var(--section-shadow-ambient)", "var(--section-shadow-lift)")
  if (innerShadowOn) boxShadowLayers.push("var(--section-inner-shadow)")
  panelStyle.boxShadow = boxShadowLayers.length ? boxShadowLayers.join(", ") : "none"

  const widthMode = asString(formatting.widthMode)
  const align = asString(formatting.alignment)
  const spacingTop = asString(formatting.spacingTop)
  const spacingBottom = asString(formatting.spacingBottom)
  const outerSpacing = asString(formatting.outerSpacing)

  Object.assign(sectionStyle, spacingTokenToMarginStyle(spacingTop, spacingBottom, outerSpacing))

  return {
    sectionId: sectionKey ?? undefined,
    sectionClassName: cn(f.paddingY || "py-6", f.sectionClass),
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

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: rawSlug } = await params
  const slug = (rawSlug ?? "").trim()
  if (!slug) notFound()

  let sections: CmsPublishedSection[]
  let tailwindWhitelist: Set<string>
  let sectionTypeDefaults: CmsSectionTypeDefaultsMap
  let siteFormattingSettings: Record<string, unknown>
  let pageFormattingOverride: Record<string, unknown>

  try {
    const res = await getPublishedPageBySlug(slug)
    sections = res.sections
    tailwindWhitelist = res.tailwindWhitelist
    sectionTypeDefaults = res.sectionTypeDefaults
    siteFormattingSettings = asRecord(res.siteFormattingSettings)
    pageFormattingOverride = asRecord(res.page.formatting_override)
  } catch {
    notFound()
  }

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

  const siteTokens = asRecord(siteFormattingSettings.tokens)
  const pageTokens = asRecord(pageFormattingOverride.tokens)
  const mergedTokens = deepMerge(siteTokens, pageTokens)
  const rootFontFamily = asString(mergedTokens.fontFamily) || asString(siteFormattingSettings.fontFamily)
  const rootFontScale = clampNumber(mergedTokens.fontScale ?? siteFormattingSettings.fontScale ?? 1, 0.8, 1.4, 1)
  const rootRadiusScale = clampNumber(mergedTokens.radiusScale ?? 1, 0, 1.8, 1)
  const rootSpacingScale = clampNumber(mergedTokens.spaceScale ?? mergedTokens.spacingScale ?? 1, 0.75, 1.8, 1)
  const rootShadowScale = clampNumber(mergedTokens.shadowScale ?? 1, 0, 1.8, 1)
  const rootInnerShadowScale = clampNumber(mergedTokens.innerShadowScale ?? 0, 0, 1.8, 0)
  const rootTextColor = asString(mergedTokens.textColor)
  const rootAccentColor = asString(mergedTokens.accentColor)
  const rootBackgroundColor = asString(mergedTokens.backgroundColor)
  const rootCardBackgroundColor = asString(mergedTokens.cardBackgroundColor)
  const rootShadowColor = asString(mergedTokens.shadowColor) || (rootAccentColor ? `color-mix(in srgb, ${rootAccentColor} 28%, black)` : "")

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
  }
  if (rootTextColor) {
    ;(rootStyle as Record<string, string>)["--foreground"] = rootTextColor
    ;(rootStyle as Record<string, string>)["--card-foreground"] = rootTextColor
    ;(rootStyle as Record<string, string>)["--muted-foreground"] = `color-mix(in srgb, ${rootTextColor} 72%, transparent)`
  }
  if (rootBackgroundColor) (rootStyle as Record<string, string>)["--background"] = rootBackgroundColor
  if (rootCardBackgroundColor) (rootStyle as Record<string, string>)["--card"] = rootCardBackgroundColor

  return (
    <div className="relative min-h-dvh bg-background" style={rootStyle}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_55%),radial-gradient(700px_circle_at_50%_100%,hsl(var(--foreground)/0.06),transparent_50%)]"
      />
      {header ? (
        <SiteHeader
          links={headerLinks}
          logo={headerLogo}
          cta={headerCta}
          containerClassName={cn(
            sectionContainerProps(
              deepMerge(
                deepMerge(
                  deepMerge(siteFormattingSettings, pageFormattingOverride),
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
        {orderedBodySections.map((section) => {
          const v = section.published
          const defaults = defaultsFor(section.section_type)
          const content = deepMerge(
            asRecord(defaults?.default_content),
            asRecord(v.content)
          )
          const formatting = deepMerge(
            deepMerge(
              deepMerge(siteFormattingSettings, pageFormattingOverride),
              asRecord(defaults?.default_formatting)
            ),
            deepMerge(asRecord(section.formatting_override), asRecord(v.formatting))
          )
          const props = sectionContainerProps(formatting, tailwindWhitelist, section.key)

          switch (section.section_type) {
            case "hero_cta": {
              return (
                <HeroSection
                  key={section.id}
                  {...props}
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
              }))
              return (
                <WhatIDeliverSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  cards={cards}
                />
              )
            }
            case "steps_list": {
              const steps = asRecordArray(content.steps).map((s) => ({
                title: asString(s.title),
                body: asString(s.body),
                bodyHtml: tiptapJsonToSanitizedHtml(s.bodyRichText),
              }))
              return (
                <HowItWorksSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  steps={steps}
                />
              )
            }
            case "title_body_list": {
              const items = asRecordArray(content.items).map((i) => ({
                title: asString(i.title),
                body: asString(i.body),
                bodyHtml: tiptapJsonToSanitizedHtml(i.bodyRichText),
              }))
              return (
                <WorkflowsSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  items={items}
                />
              )
            }
            case "rich_text_block": {
              const bodyHtml = tiptapJsonToSanitizedHtml(content.bodyRichText)
              return (
                <WhyThisApproachSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  heading={pickText(v.subtitle, defaults?.default_subtitle)}
                  bodyHtml={bodyHtml}
                />
              )
            }
            case "label_value_list": {
              const items = asRecordArray(content.items).map((i) => ({
                label: asString(i.label),
                value: asString(i.value),
              }))
              return (
                <TechStackSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  items={items}
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
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  items={items}
                />
              )
            }
            case "cta_block": {
              const bodyHtml = tiptapJsonToSanitizedHtml(content.bodyRichText)
              return (
                <FinalCtaSection
                  key={section.id}
                  {...props}
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

              return (
                <FooterGridSection
                  key={section.id}
                  {...props}
                  cards={cards}
                  brandText={asString(content.brandText)}
                  legal={{
                    copyright: asString(legal.copyright),
                    links: legalLinks,
                  }}
                />
              )
            }
            default:
              return null
          }
        })}
      </main>
    </div>
  )
}
