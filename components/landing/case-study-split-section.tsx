import { EditableLinkSlot } from "@/components/landing/editable-link-slot"
import { EditableRichTextSlot } from "@/components/landing/editable-rich-text-slot"
import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn } from "@/components/landing/motion-primitives"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import {
  DENSITY_SECTION_GAP,
  GRID_GAP_CLASSES,
  LABEL_STYLE_CLASSES,
  SUBTITLE_SIZE_CLASSES,
} from "@/lib/design-system/presentation"
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
  ctaPrimaryEnabled,
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
  ctaPrimaryEnabled?: boolean
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasTitle = (title ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const hasNarrative = (narrativeHtml ?? "").trim().length > 0
  const hasComparison = beforeItems.length > 0 || afterItems.length > 0
  const hasMedia = (mediaImageUrl ?? "").trim().length > 0 || (mediaTitle ?? "").trim().length > 0
  const hasStats = stats.length > 0
  const hasCta = (ctaPrimaryEnabled !== false) && (ctaLabel ?? "").trim().length > 0 && (ctaHref ?? "").trim().length > 0
  const density = ui?.density ?? "standard"
  const gridGap = ui?.gridGap ?? "standard"
  const labelStyle = ui?.labelStyle ?? "default"
  const headingId = sectionId ? `${sectionId}-heading` : "case-study-title"
  const card = resolveCardPresentation(ui, { mode: "compact" })
  const bLabel = (beforeLabel ?? "").trim() || "Before"
  const aLabel = (afterLabel ?? "").trim() || "After"

  return (
    <SectionShell
      id={sectionId}
      labelledBy={headingId}
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
      <div className={cn("grid grid-cols-1 lg:grid-cols-2", GRID_GAP_CLASSES[gridGap])}>
        {/* Left column: narrative + comparison */}
        <div className={DENSITY_SECTION_GAP[density]}>
          {hasEyebrow || hasTitle || hasSubtitle ? (
            <FadeIn>
              <div className="space-y-1.5">
                {hasEyebrow ? (
                  <EditableTextSlot as="p" fieldPath="content.eyebrow" className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</EditableTextSlot>
                ) : null}
                {hasTitle ? (
                  <SectionHeading id={headingId} title={title!} headingTreatment={ui?.headingTreatment} fieldPath="meta.title" />
                ) : null}
                {hasSubtitle ? (
                  <EditableTextSlot as="p" fieldPath="meta.subtitle" className={cn("max-w-lg text-muted-foreground", SUBTITLE_SIZE_CLASSES[ui?.subtitleSize ?? "sm"])} multiline>{subtitle}</EditableTextSlot>
                ) : null}
              </div>
            </FadeIn>
          ) : null}

          {hasNarrative ? (
            <FadeIn delay={0.05}>
              <EditableRichTextSlot
                richTextPath="content.narrativeRichText"
                html={narrativeHtml!}
                className={cn("text-sm leading-relaxed text-muted-foreground", RICH_TEXT_CLASS)}
              />
            </FadeIn>
          ) : null}

          {/* Before / After comparison — editorial contrast */}
          {hasComparison ? (
            <FadeIn delay={0.1}>
              <div className={cn("grid grid-cols-2", GRID_GAP_CLASSES[gridGap])}>
                {/* Before: restrained, colder */}
                <div className={cn(card.cardClass, card.spacing.rootPadding, "border-t-2 border-t-red-400/30")} style={panelStyle}>
                  {card.isInlineAccent ? (
                    <div aria-hidden className="mb-2 h-0.5 w-5 rounded-full bg-red-400/40" />
                  ) : null}
                  <EditableTextSlot as="p" fieldPath="content.beforeLabel" className={cn(
                    LABEL_STYLE_CLASSES[labelStyle],
                    "mb-2.5 !text-red-400/70"
                  )}>{bLabel}</EditableTextSlot>
                  <ul className="space-y-2">
                    {beforeItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground/70">
                        <span className="mt-0.5 shrink-0 text-red-400/50">✕</span>
                        <EditableTextSlot as="span" fieldPath={`content.beforeItems.${i}`}>{item}</EditableTextSlot>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* After: resolved, brighter, accent-tinted */}
                <div className={cn(card.cardClass, card.spacing.rootPadding, "border-t-2 border-t-green-400/40")} style={panelStyle}>
                  {card.isInlineAccent ? (
                    <div aria-hidden className="mb-2 h-0.5 w-5 rounded-full bg-green-400/40" />
                  ) : null}
                  <EditableTextSlot as="p" fieldPath="content.afterLabel" className={cn(
                    LABEL_STYLE_CLASSES[labelStyle],
                    "mb-2.5 !text-green-400/80"
                  )}>{aLabel}</EditableTextSlot>
                  <ul className="space-y-2">
                    {afterItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 shrink-0 text-green-400/60">✓</span>
                        <EditableTextSlot as="span" fieldPath={`content.afterItems.${i}`}>{item}</EditableTextSlot>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ) : null}

          {hasCta ? (
            <FadeIn delay={0.15}>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                <EditableLinkSlot labelPath="meta.ctaPrimaryLabel" hrefPath="meta.ctaPrimaryHref">
                  {ctaLabel} &rarr;
                </EditableLinkSlot>
              </span>
            </FadeIn>
          ) : null}
        </div>

        {/* Right column: media + stats */}
        <div className={DENSITY_SECTION_GAP[density]}>
          {hasMedia ? (
            <FadeIn delay={0.1}>
              <div className={cn(card.cardClass, "overflow-hidden")} style={panelStyle}>
                {card.isInlineAccent ? (
                  <div aria-hidden className="mx-4 mt-4 h-0.5 w-8 rounded-full bg-accent/50" />
                ) : null}
                {mediaTitle ? (
                  <div className="px-4 pt-4">
                    <EditableTextSlot as="p" fieldPath="content.mediaTitle" className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{mediaTitle}</EditableTextSlot>
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
                ) : null}
              </div>
            </FadeIn>
          ) : null}

          {/* Stats — reinforce the "after" side */}
          {hasStats ? (
            <FadeIn delay={0.15}>
              <div className={cn("grid grid-cols-2", stats.length > 2 && "sm:grid-cols-3", GRID_GAP_CLASSES[gridGap])}>
                {stats.map((s, sIdx) => (
                  <div
                    key={s.label}
                    className={cn(card.cardClass, card.spacing.rootPadding, "min-w-0 text-center")}
                    style={panelStyle}
                  >
                    {card.isInlineAccent ? (
                      <div aria-hidden className="mx-auto mb-1.5 h-0.5 w-6 rounded-full bg-accent/50" />
                    ) : null}
                    <EditableTextSlot as="p" fieldPath={`content.stats.${sIdx}.value`} className="text-metric text-gradient text-xl font-semibold sm:text-2xl">{s.value}</EditableTextSlot>
                    <EditableTextSlot as="p" fieldPath={`content.stats.${sIdx}.label`} className={cn(LABEL_STYLE_CLASSES[labelStyle], "mt-1.5")}>{s.label}</EditableTextSlot>
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
