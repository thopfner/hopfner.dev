import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn } from "@/components/landing/motion-primitives"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function CaseStudySplitSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  eyebrow,
  narrativeHtml,
  beforeLabel,
  afterLabel,
  beforeItems,
  afterItems,
  mediaTitle,
  mediaImageUrl,
  stats,
  ctaLabel,
  ctaHref,
  ui,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title?: string
  subtitle?: string
  eyebrow?: string
  narrativeHtml?: string
  beforeLabel?: string
  afterLabel?: string
  beforeItems: string[]
  afterItems: string[]
  mediaTitle?: string
  mediaImageUrl?: string
  stats: Array<{ value: string; label: string }>
  ctaLabel?: string
  ctaHref?: string
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasTitle = (title ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const hasNarrative = (narrativeHtml ?? "").trim().length > 0
  const hasComparison = beforeItems.length > 0 || afterItems.length > 0
  const hasMedia = (mediaImageUrl ?? "").trim().length > 0 || (mediaTitle ?? "").trim().length > 0
  const hasStats = stats.length > 0
  const hasCta = (ctaLabel ?? "").trim().length > 0 && (ctaHref ?? "").trim().length > 0
  const card = resolveCardPresentation(ui, { mode: "compact" })
  const bLabel = (beforeLabel ?? "").trim() || "Before"
  const aLabel = (afterLabel ?? "").trim() || "After"

  return (
    <SectionShell
      id={sectionId}
      labelledBy="case-study-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left column: narrative + comparison */}
        <div className="space-y-5">
          {hasEyebrow || hasTitle || hasSubtitle ? (
            <FadeIn>
              <div className="space-y-1">
                {hasEyebrow ? (
                  <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
                ) : null}
                {hasTitle ? (
                  <SectionHeading id="case-study-title" title={title!} headingTreatment={ui?.headingTreatment} />
                ) : null}
                {hasSubtitle ? (
                  <p className="max-w-lg text-sm text-muted-foreground">{subtitle}</p>
                ) : null}
              </div>
            </FadeIn>
          ) : null}

          {hasNarrative ? (
            <FadeIn delay={0.05}>
              <div
                className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                dangerouslySetInnerHTML={{ __html: narrativeHtml! }}
              />
            </FadeIn>
          ) : null}

          {hasComparison ? (
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(card.cardClass, card.spacing.rootPadding)} style={panelStyle}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400/80">{bLabel}</p>
                  <ul className="space-y-1.5">
                    {beforeItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 text-red-400/60">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={cn(card.cardClass, card.spacing.rootPadding)} style={panelStyle}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400/80">{aLabel}</p>
                  <ul className="space-y-1.5">
                    {afterItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 text-green-400/60">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ) : null}

          {hasCta ? (
            <FadeIn delay={0.15}>
              <a href={ctaHref} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                {ctaLabel} &rarr;
              </a>
            </FadeIn>
          ) : null}
        </div>

        {/* Right column: media + stats */}
        <div className="space-y-5">
          {hasMedia ? (
            <FadeIn delay={0.1}>
              <div className={cn(card.cardClass, "overflow-hidden")} style={panelStyle}>
                {mediaTitle ? (
                  <div className="px-4 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{mediaTitle}</p>
                  </div>
                ) : null}
                {mediaImageUrl ? (
                  <div className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaImageUrl}
                      alt={mediaTitle || "Case study visual"}
                      className="w-full rounded-md object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-card/30 text-muted-foreground/40">
                    <span className="text-sm">Media placeholder</span>
                  </div>
                )}
              </div>
            </FadeIn>
          ) : null}

          {hasStats ? (
            <FadeIn delay={0.15}>
              <div className="flex flex-wrap gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className={cn(card.cardClass, card.spacing.rootPadding, "flex-1 min-w-[100px] text-center")}
                    style={panelStyle}
                  >
                    <p className="text-metric text-lg font-semibold">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          ) : null}
        </div>
      </div>
    </SectionShell>
  )
}
