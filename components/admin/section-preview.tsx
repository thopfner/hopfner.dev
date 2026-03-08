"use client"

import React, { Suspense, useMemo, useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { resolveSectionUi } from "@/lib/design-system/resolve"
import { SkipAnimationProvider } from "@/components/landing/motion-primitives"

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

const FooterGridSection = dynamic(
  () =>
    import("@/components/landing/footer-grid-section").then((m) => ({
      default: m.FooterGridSection,
    })),
  { ssr: false }
)

// ---------------------------------------------------------------------------
// Preview scale factor
// ---------------------------------------------------------------------------
const PREVIEW_SCALE = 0.4
const PREVIEW_SCALE_EMBEDDED = 0.55

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
          ui={ui}
        />
      )
    }

    case "card_grid": {
      const cards = asRecordArray(content.cards).map((c) => ({
        title: s(c.title),
        text: s(c.text),
        textHtml: s(c.textHtml),
        icon: s(c.icon),
        tag: s(c.tag),
        stat: s(c.stat),
        imageUrl: s(asRecord(c.image).url),
        imageAlt: s(asRecord(c.image).alt) || s(c.title),
        imageWidthPx: 240,
        youGet: asStringArray(c.youGet),
        bestFor: s(c.bestFor),
        bestForList: asStringArray(c.bestForList),
        display: {
          showTitle: true,
          showText: true,
          showImage: false,
          showYouGet: false,
          showBestFor: false,
          youGetMode: "block" as const,
          bestForMode: "block" as const,
        },
      }))
      const sectionVariantRaw = s(content.sectionVariant)
      const validVariants = [
        "default",
        "value_pillars",
        "services",
        "problem_cards",
        "proof_cards",
        "logo_tiles",
      ]
      const sectionVariant = validVariants.includes(sectionVariantRaw)
        ? (sectionVariantRaw as
            | "default"
            | "value_pillars"
            | "services"
            | "problem_cards"
            | "proof_cards"
            | "logo_tiles")
        : "default"
      const columnsRaw = Number(content.columns)
      const columns =
        columnsRaw === 2 || columnsRaw === 3 || columnsRaw === 4
          ? columnsRaw
          : undefined
      const cardToneRaw = s(content.cardTone)
      const validTones = ["default", "elevated", "muted", "contrast"]
      const cardTone = validTones.includes(cardToneRaw)
        ? (cardToneRaw as "default" | "elevated" | "muted" | "contrast")
        : "default"
      return (
        <WhatIDeliverSection
          title={title}
          subtitle={s(content.subtitle) || subtitle}
          eyebrow={s(content.eyebrow)}
          cards={cards}
          sectionVariant={sectionVariant}
          columns={columns}
          cardTone={cardTone}
          ui={ui}
        />
      )
    }

    case "steps_list": {
      const steps = asRecordArray(content.steps).map((st) => ({
        title: s(st.title),
        body: s(st.body),
        bodyHtml: s(st.bodyHtml),
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
          subtitle={s(content.subtitle) || subtitle}
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
        bodyHtml: s(i.bodyHtml),
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
          subtitle={s(content.subtitle) || subtitle}
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
          bodyHtml={s(content.bodyHtml)}
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
          subtitle={s(content.subtitle) || subtitle}
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
        answerHtml: s(i.answerHtml),
      }))
      return (
        <FaqSection
          title={title}
          subtitle={s(content.subtitle) || subtitle}
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
          bodyHtml={s(content.bodyHtml)}
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
          subtitle={s(content.subtitle) || subtitle}
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
          subtitle={s(content.subtitle) || subtitle}
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
          subtitle={s(content.subtitle) || subtitle}
          eyebrow={s(content.eyebrow)}
          narrativeHtml={s(content.narrativeHtml) || s(content.narrative)}
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

    default:
      return (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No preview available for section type &ldquo;{sectionType}&rdquo;
        </div>
      )
  }
}

// ---------------------------------------------------------------------------
// Debounce hook — delays updates so rapid keystrokes batch into one render.
// ---------------------------------------------------------------------------
const DEBOUNCE_MS = 300

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
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
}: SectionPreviewProps) {
  // All hooks must be called unconditionally (React rules of hooks).
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((prev) => !prev), [])
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = useState(0)

  const dContent = useDebouncedValue(content, DEBOUNCE_MS)
  const dFormatting = useDebouncedValue(formatting, DEBOUNCE_MS)
  const dTitle = useDebouncedValue(title, DEBOUNCE_MS)
  const dSubtitle = useDebouncedValue(subtitle, DEBOUNCE_MS)
  const dCtaPrimaryLabel = useDebouncedValue(ctaPrimaryLabel, DEBOUNCE_MS)
  const dCtaPrimaryHref = useDebouncedValue(ctaPrimaryHref, DEBOUNCE_MS)
  const dCtaSecondaryLabel = useDebouncedValue(ctaSecondaryLabel, DEBOUNCE_MS)
  const dCtaSecondaryHref = useDebouncedValue(ctaSecondaryHref, DEBOUNCE_MS)
  const dBackgroundMediaUrl = useDebouncedValue(backgroundMediaUrl, DEBOUNCE_MS)

  const scale = embedded ? PREVIEW_SCALE_EMBEDDED : PREVIEW_SCALE

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

  // Shared renderer element — wrapped in SkipAnimationProvider so scroll-triggered
  // animations (whileInView, IntersectionObserver) render immediately in the
  // scaled/overflow preview container where observers don't fire correctly.
  const rendererEl = (
    <SkipAnimationProvider value={true}>
      <Suspense fallback={<PreviewLoading />}>
        <SectionRenderer
          sectionType={sectionType}
          content={dContent}
          formatting={dFormatting}
          title={dTitle}
          subtitle={dSubtitle}
          ctaPrimaryLabel={dCtaPrimaryLabel}
          ctaPrimaryHref={dCtaPrimaryHref}
          ctaSecondaryLabel={dCtaSecondaryLabel}
          ctaSecondaryHref={dCtaSecondaryHref}
          backgroundMediaUrl={dBackgroundMediaUrl}
        />
      </Suspense>
    </SkipAnimationProvider>
  )

  // --- Embedded mode: always-visible, no collapsible wrapper ---
  if (embedded) {
    return (
      <div className="dark text-foreground pointer-events-none" style={{ transformOrigin: "top left" }}>
        <div style={{ transform: `scale(${scale})`, width: `${100 / scale}%`, transformOrigin: "top left" }}>
          {rendererEl}
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
            className="dark bg-[oklch(0.145_0_0)] text-foreground origin-top-left pointer-events-none"
            style={{
              transform: `scale(${scale})`,
              width: `${100 / scale}%`,
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
