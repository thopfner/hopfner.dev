"use client"

import React, { Suspense, useMemo, useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { resolveSectionUi } from "@/lib/design-system/resolve"
import { SkipAnimationProvider } from "@/components/landing/motion-primitives"
import { VisualEditingProvider, type FieldPath } from "@/components/landing/visual-editing-context"
import { tiptapJsonToSanitizedHtml } from "@/lib/cms/rich-text"

// ---------------------------------------------------------------------------
// Safe accessors
// ---------------------------------------------------------------------------
const s = (v: unknown): string => (typeof v === "string" ? v : "")

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v)
    ? (v as unknown[]).filter((x) => typeof x === "string") as string[]
    : []
}

function asRecordArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v)
    ? (v as unknown[]).filter(
        (x) => x && typeof x === "object" && !Array.isArray(x)
      ) as Record<string, unknown>[]
    : []
}

// ---------------------------------------------------------------------------
// Lazily-loaded section renderers (SSR disabled — admin only)
// ---------------------------------------------------------------------------
const HeroSection = dynamic(
  () =>
    import("@/components/landing/hero-section").then((m) => ({
      default: m.HeroSection,
    })),
  { ssr: false }
)

const WhatIDeliverSection = dynamic(
  () =>
    import("@/components/landing/what-i-deliver-section").then((m) => ({
      default: m.WhatIDeliverSection,
    })),
  { ssr: false }
)

const HowItWorksSection = dynamic(
  () =>
    import("@/components/landing/how-it-works-section").then((m) => ({
      default: m.HowItWorksSection,
    })),
  { ssr: false }
)

const WorkflowsSection = dynamic(
  () =>
    import("@/components/landing/workflows-section").then((m) => ({
      default: m.WorkflowsSection,
    })),
  { ssr: false }
)

const WhyThisApproachSection = dynamic(
  () =>
    import("@/components/landing/why-this-approach-section").then((m) => ({
      default: m.WhyThisApproachSection,
    })),
  { ssr: false }
)

const TechStackSection = dynamic(
  () =>
    import("@/components/landing/tech-stack-section").then((m) => ({
      default: m.TechStackSection,
    })),
  { ssr: false }
)

const FaqSection = dynamic(
  () =>
    import("@/components/landing/faq-section").then((m) => ({
      default: m.FaqSection,
    })),
  { ssr: false }
)

const FinalCtaSection = dynamic(
  () =>
    import("@/components/landing/final-cta-section").then((m) => ({
      default: m.FinalCtaSection,
    })),
  { ssr: false }
)

const SocialProofStripSection = dynamic(
  () =>
    import("@/components/landing/social-proof-strip-section").then((m) => ({
      default: m.SocialProofStripSection,
    })),
  { ssr: false }
)

const ProofClusterSection = dynamic(
  () =>
    import("@/components/landing/proof-cluster-section").then((m) => ({
      default: m.ProofClusterSection,
    })),
  { ssr: false }
)

const CaseStudySplitSection = dynamic(
  () =>
    import("@/components/landing/case-study-split-section").then((m) => ({
      default: m.CaseStudySplitSection,
    })),
  { ssr: false }
)

const BookingSchedulerSection = dynamic(
  () =>
    import("@/components/landing/booking-scheduler-section").then((m) => ({
      default: m.BookingSchedulerSection,
    })),
  { ssr: false }
)

const FooterGridSection = dynamic(
  () =>
    import("@/components/landing/footer-grid-section").then((m) => ({
      default: m.FooterGridSection,
    })),
  { ssr: false }
)

const SiteHeader = dynamic(
  () =>
    import("@/components/landing/site-header").then((m) => ({
      default: m.SiteHeader,
    })),
  { ssr: false }
)

/** Convert TipTap JSON → HTML if present, falling back to plain HTML string. */
function richHtml(richText: unknown, fallbackHtml: unknown): string {
  if (richText && typeof richText === "object") {
    const html = tiptapJsonToSanitizedHtml(richText)
    if (html) return html
  }
  return typeof fallbackHtml === "string" ? fallbackHtml : ""
}

// ---------------------------------------------------------------------------
// Site token → CSS custom property computation (mirrors page.tsx rootStyle)
// ---------------------------------------------------------------------------
function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function fontScaleVars(scale: number): Record<string, string> {
  const base: Record<string, number> = {
    "--text-xs": 0.75, "--text-sm": 0.875, "--text-base": 1, "--text-lg": 1.125,
    "--text-xl": 1.25, "--text-2xl": 1.5, "--text-3xl": 1.875, "--text-4xl": 2.25,
  }
  return Object.fromEntries(Object.entries(base).map(([k, rem]) => [k, `${(rem * scale).toFixed(3)}rem`]))
}

function accentDerivedVars(accentColor: string): Record<string, string> {
  if (!accentColor) return {}
  return {
    "--accent": accentColor, "--accent-glow": accentColor,
    "--accent-light": `color-mix(in oklch, ${accentColor} 70%, white)`,
    "--border": `color-mix(in srgb, ${accentColor} 45%, transparent)`,
    "--input": `color-mix(in srgb, ${accentColor} 38%, transparent)`,
    "--ring": `color-mix(in srgb, ${accentColor} 72%, white 8%)`,
  }
}

function buildInnerShadow(strength: number): string {
  if (strength <= 0) return "none"
  const topPx = Math.max(1, Math.round(2 * strength))
  const spreadY = Math.max(2, Math.round(12 * strength))
  const blur = Math.max(6, Math.round(20 * strength))
  const spread = Math.max(2, Math.round(10 * strength))
  return `inset 0 1px ${topPx}px color-mix(in srgb, white 24%, transparent), inset 0 ${spreadY}px ${blur}px -${spread}px color-mix(in srgb, var(--section-shadow-color) 34%, transparent)`
}

function siteTokensToCssVars(tokens: Record<string, unknown>): React.CSSProperties {
  if (!tokens || Object.keys(tokens).length === 0) return {}
  const t = tokens

  const fontScale = clampNumber(t.fontScale, 0.8, 1.4, 1)
  const radiusScale = clampNumber(t.radiusScale, 0, 1.8, 1)
  const spacingScale = clampNumber(t.spaceScale ?? t.spacingScale, 0.75, 1.8, 1)
  const shadowScale = clampNumber(t.shadowScale, 0, 1.8, 1)
  const innerShadowScale = clampNumber(t.innerShadowScale, 0, 1.8, 0)
  const accentColor = s(t.accentColor)
  const shadowColor = s(t.shadowColor) || (accentColor ? `color-mix(in srgb, ${accentColor} 28%, black)` : "#000")
  const textColor = s(t.textColor)
  const mutedTextColor = s(t.mutedTextColor)
  const bgColor = s(t.backgroundColor)
  const cardBgColor = s(t.cardBackgroundColor)

  const displayFontFamily = s(t.displayFontFamily)
  const bodyFontFamily = s(t.bodyFontFamily)
  const rootFontFamily = s(t.fontFamily)
  const monoFontFamily = s(t.monoFontFamily)

  const vars: Record<string, string> = {
    ...fontScaleVars(fontScale),
    "--radius": `${(0.625 * radiusScale).toFixed(3)}rem`,
    "--spacing": `${(0.25 * spacingScale).toFixed(4)}rem`,
    "--section-shadow-color": shadowColor,
    "--section-shadow-ambient": shadowScale <= 0 ? "none" : `0 0 ${Math.round(14 * shadowScale)}px color-mix(in srgb, var(--section-shadow-color) 20%, transparent)`,
    "--section-shadow-lift": shadowScale <= 0 ? "none" : `0 ${Math.round(10 * shadowScale)}px ${Math.round(26 * shadowScale)}px -${Math.round(8 * shadowScale)}px color-mix(in srgb, var(--section-shadow-color) 42%, transparent)`,
    "--section-inner-shadow": buildInnerShadow(innerShadowScale),
    "--shadow-sm": shadowScale <= 0 ? "none" : `0 ${Math.round(1 * shadowScale)}px ${Math.round(3 * shadowScale)}px color-mix(in srgb, var(--section-shadow-color) 32%, transparent)`,
    "--shadow": shadowScale <= 0 ? "none" : `0 ${Math.round(6 * shadowScale)}px ${Math.round(18 * shadowScale)}px -${Math.round(6 * shadowScale)}px color-mix(in srgb, var(--section-shadow-color) 36%, transparent)`,
    "--shadow-lg": shadowScale <= 0 ? "none" : `0 ${Math.round(14 * shadowScale)}px ${Math.round(32 * shadowScale)}px -${Math.round(10 * shadowScale)}px color-mix(in srgb, var(--section-shadow-color) 40%, transparent)`,
    ...accentDerivedVars(accentColor),
    "--font-display": displayFontFamily || rootFontFamily || "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--font-body": bodyFontFamily || rootFontFamily || "var(--font-ibm-plex-sans), var(--font-inter), system-ui, sans-serif",
    "--font-mono": monoFontFamily || "var(--font-ibm-plex-mono), var(--font-jetbrains-mono), monospace",
    "--display-weight": String(clampNumber(t.displayWeight, 300, 900, 700)),
    "--heading-weight": String(clampNumber(t.headingWeight, 300, 900, 600)),
    "--body-weight": String(clampNumber(t.bodyWeight, 300, 700, 400)),
    "--display-tracking": s(t.displayTracking) || "-0.035em",
    "--eyebrow-tracking": s(t.eyebrowTracking) || "0.12em",
    "--metric-tracking": s(t.metricTracking) || "-0.02em",
    "--display-scale": String(clampNumber(t.displayScale, 0.8, 1.6, 1)),
    "--heading-scale": String(clampNumber(t.headingScale, 0.8, 1.4, 1)),
    "--body-scale": String(clampNumber(t.bodyScale, 0.8, 1.4, 1)),
    "--eyebrow-scale": String(clampNumber(t.eyebrowScale, 0.6, 1.4, 0.8)),
    "--metric-scale": String(clampNumber(t.metricScale, 0.8, 1.6, 1)),
    "--sig-style": s(t.signatureStyle) || "off",
    "--sig-intensity": String(clampNumber(t.signatureIntensity, 0, 1, 0.5)),
    "--sig-color": s(t.signatureColor) || "rgba(120,140,255,0.08)",
    "--sig-grid-opacity": String(clampNumber(t.signatureGridOpacity, 0, 0.5, 0.06)),
    "--sig-glow-opacity": String(clampNumber(t.signatureGlowOpacity, 0, 0.5, 0.08)),
    "--sig-noise-opacity": String(clampNumber(t.signatureNoiseOpacity, 0, 0.3, 0)),
  }

  if (textColor) {
    vars["--foreground"] = textColor
    vars["--card-foreground"] = textColor
    vars["--muted-foreground"] = mutedTextColor || `color-mix(in srgb, ${textColor} 72%, transparent)`
  } else if (mutedTextColor) {
    vars["--muted-foreground"] = mutedTextColor
  }
  if (bgColor) vars["--background"] = bgColor
  if (cardBgColor) vars["--card"] = cardBgColor

  const style: React.CSSProperties = {
    fontFamily: rootFontFamily || undefined,
    fontSize: `${fontScale}rem`,
  }
  Object.entries(vars).forEach(([k, v]) => {
    ;(style as Record<string, string>)[k] = v
  })
  return style
}

// ---------------------------------------------------------------------------
// Preview scale factor
// ---------------------------------------------------------------------------
const PREVIEW_SCALE = 0.4
const PREVIEW_SCALE_EMBEDDED = 0.75

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------
function PreviewLoading() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
      Loading preview...
    </div>
  )
}

// ---------------------------------------------------------------------------
// Spacing helpers (mirrors page.tsx spacingTokenToMarginStyle)
// ---------------------------------------------------------------------------
function tailwindSpacingToCssValue(spacingToken: string): string | undefined {
  const token = spacingToken.trim()
  const arbitrary = token.match(/^\[(.+)\]$/)
  if (arbitrary) return arbitrary[1]
  if (token === "px") return "1px"
  if (token === "0") return "0px"
  if (/^\d+(?:\.\d+)?$/.test(token)) return `calc(var(--spacing) * ${token})`
  return undefined
}

function spacingTokensToStyle(
  spacingTop?: string,
  spacingBottom?: string,
  outerSpacing?: string
): React.CSSProperties {
  const style: React.CSSProperties = {}
  const applyToken = (tokenRaw: string) => {
    const token = tokenRaw.trim()
    if (!token) return
    const pt = token.match(/^pt-(.+)$/)
    if (pt) { const v = tailwindSpacingToCssValue(pt[1]); if (v) style.paddingTop = v; return }
    const pb = token.match(/^pb-(.+)$/)
    if (pb) { const v = tailwindSpacingToCssValue(pb[1]); if (v) style.paddingBottom = v; return }
    const mt = token.match(/^mt-(.+)$/)
    if (mt) { const v = tailwindSpacingToCssValue(mt[1]); if (v) style.marginTop = v; return }
    const mb = token.match(/^mb-(.+)$/)
    if (mb) { const v = tailwindSpacingToCssValue(mb[1]); if (v) style.marginBottom = v; return }
    const my = token.match(/^my-(.+)$/)
    if (my) { const v = tailwindSpacingToCssValue(my[1]); if (v) style.marginBlock = v }
  }
  ;[spacingTop, spacingBottom, outerSpacing].forEach((raw) => {
    if (!raw) return
    raw.split(/\s+/).forEach(applyToken)
  })
  return style
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type SectionPreviewProps = {
  sectionType: string
  content: Record<string, unknown>
  formatting: Record<string, unknown>
  title: string
  subtitle: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  backgroundMediaUrl: string
  /** When true, renders directly without collapsible wrapper (for side-by-side layout). */
  embedded?: boolean
  /** Site color mode — applies light/dark class to isolate preview from admin shell theme. */
  colorMode?: "light" | "dark"
  /** Site-level design tokens — used to compute CSS custom properties matching the frontend. */
  siteTokens?: Record<string, unknown>
  /** Visual editing adapter — when provided, wraps the preview in VisualEditingProvider */
  visualEditing?: {
    sectionId: string
    getFieldValue: (path: FieldPath) => string
    getStructuredFieldValue?: (path: FieldPath) => unknown
    updateField: (path: FieldPath, value: string) => void
    updateStructuredField?: (path: FieldPath, value: unknown) => void
    linkResources?: import("@/components/landing/visual-editing-context").LinkResources
  }
}

// ---------------------------------------------------------------------------
// Section renderer mapper
// ---------------------------------------------------------------------------
function SectionRenderer({
  sectionType,
  content,
  formatting,
  title,
  subtitle,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  backgroundMediaUrl,
}: SectionPreviewProps) {
  const ui = useMemo(
    () => resolveSectionUi(formatting, sectionType),
    [formatting, sectionType]
  )

  switch (sectionType) {
    case "hero_cta": {
      const proofPanelRaw = asRecord(content.proofPanel)
      const proofPanel = proofPanelRaw.type
        ? {
            type: s(proofPanelRaw.type) as "stats" | "mockup" | "image",
            headline: s(proofPanelRaw.headline),
            items: asRecordArray(proofPanelRaw.items).map((it) => ({
              label: s(it.label),
              value: s(it.value),
            })),
            imageUrl: s(proofPanelRaw.imageUrl),
            mockupVariant: s(proofPanelRaw.mockupVariant) as
              | "dashboard"
              | "workflow"
              | "terminal"
              | undefined,
          }
        : undefined
      const trustItems = asRecordArray(content.trustItems).map((it) => ({
        text: s(it.text),
        icon: s(it.icon),
      }))
      const heroStats = asRecordArray(content.heroStats).map((it) => ({
        value: s(it.value),
        label: s(it.label),
      }))
      const heroContentOrder = asStringArray(content.heroContentOrder)
      const heroContentSides = asRecord(content.heroContentSides)
      const layoutVariant = s(content.layoutVariant)
      return (
        <HeroSection
          headline={title}
          subheadline={subtitle}
          eyebrow={s(content.eyebrow)}
          bullets={asStringArray(content.bullets)}
          primaryCta={{ label: ctaPrimaryLabel, href: ctaPrimaryHref || "#" }}
          secondaryCta={{
            label: ctaSecondaryLabel,
            href: ctaSecondaryHref || "#",
          }}
          trustLine={s(content.trustLine)}
          backgroundImageUrl={backgroundMediaUrl || undefined}
          layoutVariant={
            layoutVariant === "split" || layoutVariant === "split_reversed"
              ? layoutVariant
              : "centered"
          }
          proofPanel={proofPanel}
          trustItems={trustItems.length > 0 ? trustItems : undefined}
          heroStats={heroStats.length > 0 ? heroStats : undefined}
          heroContentOrder={heroContentOrder.length > 0 ? heroContentOrder : undefined}
          heroContentSides={Object.keys(heroContentSides).length > 0 ? heroContentSides as Record<string, "left" | "right"> : undefined}
          textAlign={
            s(formatting.textAlign) === "center" ? "center"
            : s(formatting.textAlign) === "left" ? "left"
            : undefined
          }
          rightColumnAlign={
            s(formatting.heroRightAlign) === "center" ? "center"
            : s(formatting.heroRightAlign) === "left" ? "left"
            : undefined
          }
          ui={ui}
        />
      )
    }

    case "card_grid": {
      const globalDisplay = asRecord(content.cardDisplay)
      const cards = asRecordArray(content.cards).map((c) => {
        const cardDisplay = asRecord(c.display)
        const img = asRecord(c.image)
        const hasImage = Boolean(s(img.url))
        return {
          title: s(c.title),
          text: s(c.text),
          textHtml: richHtml(c.textRichText, c.textHtml),
          icon: s(c.icon),
          tag: s(c.tag),
          stat: s(c.stat),
          imageUrl: s(img.url),
          imageAlt: s(img.alt) || s(c.title),
          imageWidthPx: Number(img.widthPx) || 240,
          youGet: asStringArray(c.youGet),
          bestFor: s(c.bestFor),
          bestForList: asStringArray(c.bestForList),
          display: {
            showTitle: cardDisplay.showTitle === false ? false : globalDisplay.showTitle === false ? false : true,
            showText: cardDisplay.showText === false ? false : globalDisplay.showText === false ? false : true,
            showImage: typeof cardDisplay.showImage === "boolean" ? cardDisplay.showImage : typeof globalDisplay.showImage === "boolean" ? (globalDisplay.showImage as boolean) : hasImage,
            showYouGet: cardDisplay.showYouGet === true || globalDisplay.showYouGet === true,
            showBestFor: cardDisplay.showBestFor === true || globalDisplay.showBestFor === true,
            youGetMode: (cardDisplay.youGetMode === "list" || globalDisplay.youGetMode === "list" ? "list" : "block") as "block" | "list",
            bestForMode: (cardDisplay.bestForMode === "list" || globalDisplay.bestForMode === "list" ? "list" : "block") as "block" | "list",
          },
        }
      })
      const columnsRaw = Number(content.columns)
      const columns =
        columnsRaw === 2 || columnsRaw === 3 || columnsRaw === 4
          ? columnsRaw
          : undefined
      return (
        <WhatIDeliverSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          cards={cards}
          columns={columns}
          ui={ui}
        />
      )
    }

    case "steps_list": {
      const steps = asRecordArray(content.steps).map((st) => ({
        title: s(st.title),
        body: s(st.body),
        bodyHtml: richHtml(st.bodyRichText, st.bodyHtml),
        icon: s(st.icon),
        stat: s(st.stat),
      }))
      const layoutVariantRaw = s(content.layoutVariant)
      const validLayouts = [
        "grid",
        "timeline",
        "connected_flow",
        "workflow_visual",
      ]
      const layoutVariant = validLayouts.includes(layoutVariantRaw)
        ? (layoutVariantRaw as
            | "grid"
            | "timeline"
            | "connected_flow"
            | "workflow_visual")
        : "grid"
      return (
        <HowItWorksSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          steps={steps}
          layoutVariant={layoutVariant}
          ui={ui}
        />
      )
    }

    case "title_body_list": {
      const items = asRecordArray(content.items).map((i) => ({
        title: s(i.title),
        body: s(i.body),
        bodyHtml: richHtml(i.bodyRichText, i.bodyHtml),
      }))
      const layoutVariantRaw = s(content.layoutVariant)
      const validLayouts = ["accordion", "stacked", "two_column", "cards"]
      const layoutVariant = validLayouts.includes(layoutVariantRaw)
        ? (layoutVariantRaw as
            | "accordion"
            | "stacked"
            | "two_column"
            | "cards")
        : "accordion"
      return (
        <WorkflowsSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          items={items}
          layoutVariant={layoutVariant}
          ui={ui}
        />
      )
    }

    case "rich_text_block": {
      return (
        <WhyThisApproachSection
          title={title}
          heading={subtitle}
          bodyHtml={richHtml(content.bodyRichText, content.bodyHtml)}
          eyebrow={s(content.eyebrow)}
          ui={ui}
        />
      )
    }

    case "label_value_list": {
      const items = asRecordArray(content.items).map((i) => ({
        label: s(i.label),
        value: s(i.value),
        icon: s(i.icon),
        imageUrl: s(i.imageUrl),
      }))
      const layoutVariantRaw = s(content.layoutVariant)
      const validLayouts = [
        "default",
        "metrics_grid",
        "trust_strip",
        "tool_badges",
        "logo_row",
        "marquee",
      ]
      const layoutVariant = validLayouts.includes(layoutVariantRaw)
        ? (layoutVariantRaw as
            | "default"
            | "metrics_grid"
            | "trust_strip"
            | "tool_badges"
            | "logo_row"
            | "marquee")
        : "default"
      return (
        <TechStackSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          items={items}
          layoutVariant={layoutVariant}
          compact={content.compact === true}
          ui={ui}
        />
      )
    }

    case "faq_list": {
      const items = asRecordArray(content.items).map((i) => ({
        question: s(i.question),
        answer: s(i.answer),
        answerHtml: richHtml(i.answerRichText, i.answerHtml),
      }))
      return (
        <FaqSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          items={items}
          ui={ui}
        />
      )
    }

    case "cta_block": {
      const layoutVariantRaw = s(content.layoutVariant)
      const validLayouts = ["centered", "split", "compact", "high_contrast"]
      const layoutVariant = validLayouts.includes(layoutVariantRaw)
        ? (layoutVariantRaw as
            | "centered"
            | "split"
            | "compact"
            | "high_contrast")
        : "centered"
      return (
        <FinalCtaSection
          headline={title}
          body={s(content.body)}
          bodyHtml={richHtml(content.bodyRichText, content.bodyHtml)}
          eyebrow={s(content.eyebrow)}
          primaryCta={{ label: ctaPrimaryLabel, href: ctaPrimaryHref || "#" }}
          secondaryCta={{
            label: ctaSecondaryLabel,
            href: ctaSecondaryHref || "#",
          }}
          layoutVariant={layoutVariant}
          ui={ui}
        />
      )
    }

    case "social_proof_strip": {
      const logos = asRecordArray(content.logos).map((l) => ({
        label: s(l.label),
        imageUrl: s(l.imageUrl),
        alt: s(l.alt),
        href: s(l.href),
      }))
      const badges = asRecordArray(content.badges).map((b) => ({
        text: s(b.text),
        icon: s(b.icon),
      }))
      const layoutVariantRaw = s(content.layoutVariant)
      const validLayouts = ["inline", "marquee", "grid"]
      const layoutVariant = validLayouts.includes(layoutVariantRaw)
        ? (layoutVariantRaw as "inline" | "marquee" | "grid")
        : "inline"
      return (
        <SocialProofStripSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          logos={logos}
          badges={badges}
          trustNote={s(content.trustNote)}
          layoutVariant={layoutVariant}
          ui={ui}
        />
      )
    }

    case "proof_cluster": {
      const metrics = asRecordArray(content.metrics).map((m) => ({
        value: s(m.value),
        label: s(m.label),
        icon: s(m.icon),
      }))
      const proofCardRaw = asRecord(content.proofCard)
      const proofCard = proofCardRaw.title
        ? {
            title: s(proofCardRaw.title),
            body: s(proofCardRaw.body),
            stats: asRecordArray(proofCardRaw.stats).map((st) => ({
              value: s(st.value),
              label: s(st.label),
            })),
          }
        : undefined
      const testimonialRaw = asRecord(content.testimonial)
      const testimonial = testimonialRaw.quote
        ? {
            quote: s(testimonialRaw.quote),
            author: s(testimonialRaw.author),
            role: s(testimonialRaw.role),
            imageUrl: s(testimonialRaw.imageUrl),
          }
        : undefined
      return (
        <ProofClusterSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          metrics={metrics}
          proofCard={proofCard}
          testimonial={testimonial}
          ctaLabel={ctaPrimaryLabel}
          ctaHref={ctaPrimaryHref}
          ui={ui}
        />
      )
    }

    case "case_study_split": {
      const stats = asRecordArray(content.stats).map((st) => ({
        value: s(st.value),
        label: s(st.label),
      }))
      return (
        <CaseStudySplitSection
          title={title}
          subtitle={subtitle}
          eyebrow={s(content.eyebrow)}
          narrativeHtml={richHtml(content.narrativeRichText, content.narrativeHtml) || s(content.narrative)}
          beforeLabel={s(content.beforeLabel)}
          afterLabel={s(content.afterLabel)}
          beforeItems={asStringArray(content.beforeItems)}
          afterItems={asStringArray(content.afterItems)}
          mediaTitle={s(content.mediaTitle)}
          mediaImageUrl={s(content.mediaImageUrl)}
          stats={stats}
          ctaLabel={ctaPrimaryLabel}
          ctaHref={ctaPrimaryHref}
          ui={ui}
        />
      )
    }

    case "booking_scheduler": {
      const intakeFields = asRecord(content.intakeFields)
      const intakeFieldsTyped: Record<string, { label: string; helpText?: string }> = {}
      for (const [k, v] of Object.entries(intakeFields)) {
        const f = asRecord(v)
        intakeFieldsTyped[k] = { label: s(f.label), helpText: s(f.helpText) }
      }
      return (
        <BookingSchedulerSection
          title={title}
          subtitle={subtitle}
          ctaLabel={ctaPrimaryLabel}
          ctaHref={ctaPrimaryHref}
          calLink={s(content.calLink)}
          formHeading={s(content.formHeading)}
          submitLabel={s(content.submitLabel)}
          intakeFields={intakeFieldsTyped}
          ui={ui}
        />
      )
    }

    case "footer_grid": {
      const cards = asRecordArray(content.cards)
        .slice(0, 2)
        .map((card) => {
          const cardRec = asRecord(card)
          return {
            title: s(cardRec.title),
            body: s(cardRec.body),
            linksMode: (s(cardRec.linksMode) === "grouped"
              ? "grouped"
              : "flat") as "flat" | "grouped",
            links: asRecordArray(cardRec.links).map((lnk) => ({
              label: s(lnk.label),
              href: s(lnk.href),
            })),
            groups: asRecordArray(cardRec.groups).map((grp) => ({
              title: s(grp.title),
              links: asRecordArray(grp.links).map((lnk) => ({
                label: s(lnk.label),
                href: s(lnk.href),
              })),
            })),
            subscribe: (() => {
              const sub = asRecord(cardRec.subscribe)
              return {
                enabled: sub.enabled === true,
                placeholder: s(sub.placeholder),
                buttonLabel: s(sub.buttonLabel),
              }
            })(),
            ctaPrimary: (() => {
              const cta = asRecord(cardRec.ctaPrimary)
              return { label: s(cta.label), href: s(cta.href) }
            })(),
            ctaSecondary: (() => {
              const cta = asRecord(cardRec.ctaSecondary)
              return { label: s(cta.label), href: s(cta.href) }
            })(),
          }
        })
      const legal = asRecord(content.legal)
      const legalLinks = asRecordArray(legal.links).map((lnk) => ({
        label: s(lnk.label),
        href: s(lnk.href),
      }))
      return (
        <FooterGridSection
          cards={cards}
          brandText={s(content.brandText)}
          legal={{ copyright: s(legal.copyright), links: legalLinks }}
          fullBleed={false}
        />
      )
    }

    case "nav_links": {
      const links = asRecordArray(content.links).map((l) => ({
        label: s(l.label),
        href: s(l.href),
        anchorId: s(l.anchorId) || undefined,
      }))
      const logoRaw = asRecord(content.logo)
      const logoUrl = s(logoRaw.url).trim()
      const logo = logoUrl
        ? {
            url: logoUrl,
            alt: s(logoRaw.alt).trim() || "Site logo",
            widthPx: Math.min(320, Math.max(60, Math.round(Number(logoRaw.widthPx) || 140))),
          }
        : undefined
      return (
        <SiteHeader
          links={links}
          logo={logo}
          cta={{
            label: ctaPrimaryLabel || "Book a call",
            href: ctaPrimaryHref || "#contact",
          }}
        />
      )
    }

    default:
      return (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No preview available for section type &ldquo;{sectionType}&rdquo;
        </div>
      )
  }
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
function SectionPreviewInner({
  sectionType,
  content,
  formatting,
  title,
  subtitle,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  backgroundMediaUrl,
  embedded,
  colorMode,
  siteTokens,
  visualEditing,
}: SectionPreviewProps) {
  // All hooks must be called unconditionally (React rules of hooks).
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((prev) => !prev), [])
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = useState(0)

  const scale = embedded ? PREVIEW_SCALE_EMBEDDED : PREVIEW_SCALE
  const tokenStyle = useMemo(() => siteTokens ? siteTokensToCssVars(siteTokens) : {}, [siteTokens])

  useEffect(() => {
    if (embedded || !open || !innerRef.current) {
      setInnerHeight(0)
      return
    }
    const el = innerRef.current
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInnerHeight(entry.contentRect.height)
      }
    })
    observer.observe(el)
    setInnerHeight(el.scrollHeight)
    return () => observer.disconnect()
  }, [open, embedded])

  // Spacing style from formatting tokens (mirrors page.tsx behavior)
  const spacingStyle = useMemo(
    () => spacingTokensToStyle(s(formatting.spacingTop), s(formatting.spacingBottom), s(formatting.outerSpacing)),
    [formatting.spacingTop, formatting.spacingBottom, formatting.outerSpacing]
  )

  // paddingY class from formatting — applied at wrapper level to match public renderer
  const paddingYClass = useMemo(() => {
    const py = s(formatting.paddingY)
    const allowed = new Set(["py-4", "py-6", "py-8", "py-10", "py-12"])
    return allowed.has(py) ? py : ""
  }, [formatting.paddingY])

  // Shared renderer element — wrapped in SkipAnimationProvider so scroll-triggered
  // animations (whileInView, IntersectionObserver) render immediately in the
  // scaled/overflow preview container where observers don't fire correctly.
  const rendererEl = (
    <SkipAnimationProvider value={true}>
      <Suspense fallback={<PreviewLoading />}>
        <div style={spacingStyle} className={paddingYClass}>
          <SectionRenderer
            sectionType={sectionType}
            content={content}
            formatting={formatting}
            title={title}
            subtitle={subtitle}
            ctaPrimaryLabel={ctaPrimaryLabel}
            ctaPrimaryHref={ctaPrimaryHref}
            ctaSecondaryLabel={ctaSecondaryLabel}
            ctaSecondaryHref={ctaSecondaryHref}
            backgroundMediaUrl={backgroundMediaUrl}
          />
        </div>
      </Suspense>
    </SkipAnimationProvider>
  )

  // --- Embedded mode: always-visible, no collapsible wrapper ---
  if (embedded) {
    const themeClass = colorMode === "light" ? "light" : "dark"
    // Use a ref to measure unscaled height and compute correct scaled container height
    const embeddedRef = useRef<HTMLDivElement>(null)
    const [embeddedHeight, setEmbeddedHeight] = useState(0)
    useEffect(() => {
      if (!embeddedRef.current) return
      const el = embeddedRef.current
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setEmbeddedHeight(entry.contentRect.height)
        }
      })
      observer.observe(el)
      setEmbeddedHeight(el.scrollHeight)
      return () => observer.disconnect()
    }, [])

    const rendererContent = visualEditing ? (
      <VisualEditingProvider
        sectionId={visualEditing.sectionId}
        getFieldValue={visualEditing.getFieldValue}
        getStructuredFieldValue={visualEditing.getStructuredFieldValue}
        updateField={visualEditing.updateField}
        updateStructuredField={visualEditing.updateStructuredField}
        linkResources={visualEditing.linkResources}
      >
        {rendererEl}
      </VisualEditingProvider>
    ) : rendererEl

    return (
      <div
        className={`${themeClass} bg-background text-foreground ${visualEditing ? "" : "pointer-events-none"} overflow-hidden`}
        style={{ colorScheme: colorMode || "dark", transformOrigin: "top left", ...tokenStyle, height: embeddedHeight ? embeddedHeight * scale : undefined }}
      >
        <div ref={embeddedRef} style={{ transform: `scale(${scale})`, width: `${100 / scale}%`, transformOrigin: "top left" }}>
          {rendererContent}
        </div>
      </div>
    )
  }

  // --- Collapsible mode (fallback for narrow layouts) ---
  const scaledHeight = innerHeight * scale

  return (
    <div className="rounded-md border border-[color:var(--mantine-color-dark-4)] overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-[color:var(--mantine-color-dimmed)] hover:text-[color:var(--mantine-color-text)] transition-colors bg-[color:var(--mantine-color-dark-6)]"
      >
        <span>Live Preview</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="relative overflow-hidden"
          style={{ height: scaledHeight > 0 ? scaledHeight : "auto" }}
        >
          <div
            ref={innerRef}
            className={`${colorMode === "light" ? "light" : "dark"} bg-background text-foreground origin-top-left pointer-events-none`}
            style={{
              colorScheme: colorMode || "dark",
              transform: `scale(${scale})`,
              width: `${100 / scale}%`,
              ...tokenStyle,
            }}
          >
            {rendererEl}
          </div>
        </div>
      )}
    </div>
  )
}

export const SectionPreview = React.memo(SectionPreviewInner)
