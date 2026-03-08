import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/landing/motion-primitives"
import { resolveCardPresentation, resolveCardClasses } from "@/lib/design-system/component-families"
import {
  DENSITY_SECTION_GAP,
  GRID_GAP_CLASSES,
  LABEL_STYLE_CLASSES,
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
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasTitle = (title ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const hasMetrics = metrics.length > 0
  const hasProofCard = proofCard && proofCard.title.trim().length > 0
  const hasTestimonial = testimonial && testimonial.quote.trim().length > 0
  const hasCta = (ctaLabel ?? "").trim().length > 0 && (ctaHref ?? "").trim().length > 0
  const density = ui?.density ?? "standard"
  const gridGap = ui?.gridGap ?? "standard"
  const labelStyle = ui?.labelStyle ?? "default"

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
      labelledBy="proof-cluster-title"
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
            <div className="space-y-1.5">
              {hasEyebrow ? (
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
              ) : null}
              {hasTitle ? (
                <SectionHeading id="proof-cluster-title" title={title!} headingTreatment={ui?.headingTreatment} />
              ) : null}
              {hasSubtitle ? (
                <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </FadeIn>
        ) : null}

        {/* Metrics row — sharp, data-forward, high-confidence */}
        {hasMetrics ? (
          <StaggerContainer className={cn("grid grid-cols-2 sm:grid-cols-3", GRID_GAP_CLASSES[gridGap])}>
            {metrics.map((m) => (
              <StaggerItem key={m.label} className="h-full">
                <div className={cn(metricCard.cardClass, metricCard.spacing.rootPadding, "h-full flex flex-col text-center")}>
                  {metricCard.isInlineAccent ? (
                    <div aria-hidden className="mx-auto mb-2 h-0.5 w-8 rounded-full bg-accent/50" />
                  ) : null}
                  {m.icon ? <span className="mb-1 block text-xl">{m.icon}</span> : null}
                  <p className="text-metric text-gradient text-2xl lg:text-3xl">
                    {(() => {
                      const match = m.value.match(/^([^0-9]*)([\d,.]+)(.*)$/)
                      if (match) {
                        const [, pre, numStr, suf] = match
                        const num = parseFloat(numStr.replace(/,/g, ""))
                        return <AnimatedCounter target={num} prefix={pre} suffix={suf} />
                      }
                      return m.value
                    })()}
                  </p>
                  <p className={cn(LABEL_STYLE_CLASSES[labelStyle], "mt-auto pt-1")}>{m.label}</p>
                </div>
              </StaggerItem>
            ))}
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
                  <h3 className="text-base font-semibold tracking-tight">{proofCard!.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{proofCard!.body}</p>
                  {proofCard!.stats.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-6 border-t border-border/20 pt-4">
                      {proofCard!.stats.map((s) => (
                        <div key={s.label}>
                          <p className="text-metric text-xl font-semibold">{s.value}</p>
                          <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{s.label}</p>
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
                  <span aria-hidden className="pointer-events-none select-none text-4xl leading-none text-accent/20">&ldquo;</span>
                  <blockquote className="mt-1 flex-1 text-sm italic leading-relaxed text-muted-foreground">
                    {testimonial!.quote}
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3 border-t border-border/20 pt-3">
                    {testimonial!.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testimonial!.imageUrl}
                        alt={testimonial!.author}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-border/20"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                        {testimonial!.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">{testimonial!.author}</p>
                      <p className="text-[10px] tracking-wide text-muted-foreground/60">{testimonial!.role}</p>
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
              <a href={ctaHref} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                {ctaLabel} &rarr;
              </a>
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
    componentChrome: ui?.componentChrome,
    accentRule: ui?.accentRule,
  }
}
