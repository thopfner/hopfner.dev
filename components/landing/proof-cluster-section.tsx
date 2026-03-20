import { EditableLinkSlot } from "@/components/landing/editable-link-slot"
import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/landing/motion-primitives"
import { resolveCardPresentation, resolveCardClasses } from "@/lib/design-system/component-families"
import {
  DENSITY_SECTION_GAP,
  GRID_GAP_CLASSES,
  LABEL_STYLE_CLASSES,
  SUBTITLE_SIZE_CLASSES,
} from "@/lib/design-system/presentation"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function ProofClusterSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  eyebrow,
  metrics,
  proofCard,
  testimonial,
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
  metrics: Array<{ value: string; label: string; icon?: string }>
  proofCard?: { title: string; body: string; stats: Array<{ value: string; label: string }> }
  testimonial?: { quote: string; author: string; role: string; imageUrl?: string }
  ctaLabel?: string
  ctaHref?: string
  ctaPrimaryEnabled?: boolean
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasTitle = (title ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const hasMetrics = metrics.length > 0
  const hasProofCard = proofCard && proofCard.title.trim().length > 0
  const hasTestimonial = testimonial && testimonial.quote.trim().length > 0
  const hasCta = (ctaPrimaryEnabled !== false) && (ctaLabel ?? "").trim().length > 0 && (ctaHref ?? "").trim().length > 0
  const density = ui?.density ?? "standard"
  const gridGap = ui?.gridGap ?? "standard"
  const labelStyle = ui?.labelStyle ?? "default"
  const dividerMode = ui?.dividerMode ?? "none"
  const dividerBorder = dividerMode === "strong" ? "border-border/50" : dividerMode === "subtle" ? "border-border/25" : "border-border/25"
  const headingId = sectionId ? `${sectionId}-heading` : "proof-cluster-title"

  // Differentiated card treatments per zone
  // Metrics: use metric family (data-forward, centered, crisp)
  const metricCard = resolveCardPresentation(
    ui?.componentFamily
      ? ui
      : { ...fallbackUi(ui), componentFamily: "metric" },
    { mode: "compact" }
  )
  // Proof card: use proof family (editorial, matte gradient)
  const proofCardStyle = resolveCardPresentation(
    ui?.componentFamily
      ? ui
      : { ...fallbackUi(ui), componentFamily: "proof" },
    { mode: "compact" }
  )
  // Testimonial: use quiet family (restrained, matte) — distinct from proof card
  const testimonialCard = resolveCardPresentation(
    ui?.componentFamily
      ? ui
      : { ...fallbackUi(ui), componentFamily: "quiet" },
    { mode: "compact" }
  )

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
      <div className={DENSITY_SECTION_GAP[density]}>
        {/* Heading cluster */}
        {hasEyebrow || hasTitle || hasSubtitle ? (
          <FadeIn>
            <div className="space-y-1.5 text-left">
              {hasEyebrow ? (
                <EditableTextSlot as="p" fieldPath="content.eyebrow" className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</EditableTextSlot>
              ) : null}
              {hasTitle ? (
                <SectionHeading id={headingId} title={title!} headingTreatment={ui?.headingTreatment} fieldPath="meta.title" />
              ) : null}
              {hasSubtitle ? (
                <EditableTextSlot as="p" fieldPath="meta.subtitle" className={cn("max-w-2xl text-muted-foreground", SUBTITLE_SIZE_CLASSES[ui?.subtitleSize ?? "sm"])} multiline>{subtitle}</EditableTextSlot>
              ) : null}
            </div>
          </FadeIn>
        ) : null}

        {/* Metrics row — sharp, data-forward, high-confidence */}
        {hasMetrics ? (
          <StaggerContainer className={cn("grid grid-cols-2 sm:grid-cols-3", GRID_GAP_CLASSES[gridGap])}>
            {(() => { const smOrphan = metrics.length % 3 === 1; return metrics.map((m, idx) => (
              <StaggerItem key={m.label} className={cn("h-full", smOrphan && idx === metrics.length - 1 && "sm:col-start-2")}>
                <div className={cn(metricCard.cardClass, metricCard.spacing.rootPadding, "h-full flex flex-col items-center text-center")}>
                  {metricCard.isInlineAccent ? (
                    <div aria-hidden className="mx-auto mb-2 h-0.5 w-8 rounded-full bg-accent/50" />
                  ) : null}
                  {m.icon ? <span className="mb-1.5 block text-2xl">{m.icon}</span> : null}
                  <EditableTextSlot as="p" fieldPath={`content.metrics.${idx}.value`} className="text-metric text-gradient text-3xl lg:text-4xl">
                    {(() => {
                      const match = m.value.match(/^([^0-9]*)([\d,.]+)(.*)$/)
                      if (match) {
                        const [, pre, numStr, suf] = match
                        const num = parseFloat(numStr.replace(/,/g, ""))
                        return <AnimatedCounter target={num} prefix={pre} suffix={suf} />
                      }
                      return m.value
                    })()}
                  </EditableTextSlot>
                  <EditableTextSlot as="p" fieldPath={`content.metrics.${idx}.label`} className={cn(LABEL_STYLE_CLASSES[labelStyle], "mt-auto pt-1")}>{m.label}</EditableTextSlot>
                </div>
              </StaggerItem>
            )); })()}
          </StaggerContainer>
        ) : null}

        {/* Proof card + Testimonial row — deliberately paired, distinct roles */}
        {hasProofCard || hasTestimonial ? (
          <div className={cn("grid grid-cols-1", GRID_GAP_CLASSES[gridGap], hasProofCard && hasTestimonial ? "md:grid-cols-5" : "")}>
            {/* Proof card: narrative, substantial — takes more space */}
            {hasProofCard ? (
              <FadeIn delay={0.1} className={hasTestimonial ? "md:col-span-3" : ""}>
                <div className={cn(proofCardStyle.cardClass, proofCardStyle.spacing.rootPadding, "h-full flex flex-col")} style={panelStyle}>
                  {proofCardStyle.isInlineAccent ? (
                    <div aria-hidden className="mb-2 h-0.5 w-6 rounded-full bg-accent/50" />
                  ) : null}
                  <EditableTextSlot as="h3" fieldPath="content.proofCard.title" className="text-base font-semibold tracking-tight text-foreground">{proofCard!.title}</EditableTextSlot>
                  <EditableTextSlot as="p" fieldPath="content.proofCard.body" className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground" multiline>{proofCard!.body}</EditableTextSlot>
                  {proofCard!.stats.length > 0 ? (
                    <div className={cn("mt-5 flex flex-wrap gap-6 border-t pt-4", dividerBorder)}>
                      {proofCard!.stats.map((s, sIdx) => (
                        <div key={s.label}>
                          <EditableTextSlot as="p" fieldPath={`content.proofCard.stats.${sIdx}.value`} className="text-metric text-xl font-semibold text-foreground">{s.value}</EditableTextSlot>
                          <EditableTextSlot as="p" fieldPath={`content.proofCard.stats.${sIdx}.label`} className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{s.label}</EditableTextSlot>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </FadeIn>
            ) : null}

            {/* Testimonial: editorial quote treatment — visually distinct from proof card */}
            {hasTestimonial ? (
              <FadeIn delay={0.15} className={hasProofCard ? "md:col-span-2" : ""}>
                <div className={cn(testimonialCard.cardClass, testimonialCard.spacing.rootPadding, "relative h-full flex flex-col")} style={panelStyle}>
                  {testimonialCard.isInlineAccent ? (
                    <div aria-hidden className="mb-2 h-0.5 w-6 rounded-full bg-accent/50" />
                  ) : null}
                  {/* Large quote mark — editorial treatment */}
                  <span aria-hidden className="pointer-events-none select-none text-5xl leading-none text-accent/25">&ldquo;</span>
                  <EditableTextSlot as="blockquote" fieldPath="content.testimonial.quote" className="mt-2 flex-1 text-sm italic leading-relaxed text-muted-foreground/90" multiline>
                    {testimonial!.quote}
                  </EditableTextSlot>
                  <div className={cn("mt-5 flex items-center gap-3 border-t pt-4", dividerBorder)}>
                    {testimonial!.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testimonial!.imageUrl}
                        alt={testimonial!.author}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-border/30"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                        {testimonial!.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <EditableTextSlot as="p" fieldPath="content.testimonial.author" className="text-sm font-semibold tracking-tight text-foreground">{testimonial!.author}</EditableTextSlot>
                      <EditableTextSlot as="p" fieldPath="content.testimonial.role" className="text-[11px] tracking-wide text-muted-foreground/60">{testimonial!.role}</EditableTextSlot>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ) : null}
          </div>
        ) : null}

        {/* CTA */}
        {hasCta ? (
          <FadeIn delay={0.2}>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                <EditableLinkSlot labelPath="meta.ctaPrimaryLabel" hrefPath="meta.ctaPrimaryHref">
                  {ctaLabel} &rarr;
                </EditableLinkSlot>
              </span>
            </div>
          </FadeIn>
        ) : null}
      </div>
    </SectionShell>
  )
}

/** Helper to construct a fallback UI with default-family overrides */
function fallbackUi(ui: ResolvedSectionUi | undefined): ResolvedSectionUi {
  return {
    rhythm: ui?.rhythm ?? "standard",
    surface: ui?.surface ?? "none",
    density: ui?.density ?? "standard",
    gridGap: ui?.gridGap ?? "standard",
    headingTreatment: ui?.headingTreatment ?? "default",
    labelStyle: ui?.labelStyle ?? "default",
    dividerMode: ui?.dividerMode ?? "none",
    subtitleSize: ui?.subtitleSize ?? "sm",
    componentChrome: ui?.componentChrome,
    accentRule: ui?.accentRule,
  }
}
