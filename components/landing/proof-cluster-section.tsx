import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/landing/motion-primitives"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import { DENSITY_GAP, LABEL_STYLE_CLASSES } from "@/lib/design-system/presentation"
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
  const labelStyle = ui?.labelStyle ?? "default"
  const card = resolveCardPresentation(ui, { mode: "compact" })

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
      {hasEyebrow || hasTitle || hasSubtitle ? (
        <FadeIn>
          <div className="space-y-1">
            {hasEyebrow ? (
              <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
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

      {hasMetrics ? (
        <StaggerContainer className={cn("grid grid-cols-2 sm:grid-cols-3", DENSITY_GAP[density])}>
          {metrics.map((m) => (
            <StaggerItem key={m.label} className="h-full">
              <div className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col text-center")}>
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
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle], "mt-auto pt-0.5")}>{m.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : null}

      {hasProofCard || hasTestimonial ? (
        <div className={cn("grid grid-cols-1 gap-5", hasProofCard && hasTestimonial ? "md:grid-cols-2" : "")}>
          {hasProofCard ? (
            <FadeIn delay={0.1}>
              <div className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col")} style={panelStyle}>
                <h3 className="text-sm font-semibold">{proofCard!.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{proofCard!.body}</p>
                {proofCard!.stats.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-4 border-t border-border/30 pt-3">
                    {proofCard!.stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-metric text-lg font-semibold">{s.value}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </FadeIn>
          ) : null}

          {hasTestimonial ? (
            <FadeIn delay={0.15}>
              <div className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col")} style={panelStyle}>
                <blockquote className="flex-1 text-sm italic text-muted-foreground">
                  &ldquo;{testimonial!.quote}&rdquo;
                </blockquote>
                <div className="mt-3 flex items-center gap-3 border-t border-border/30 pt-3">
                  {testimonial!.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial!.imageUrl}
                      alt={testimonial!.author}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent">
                      {testimonial!.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium">{testimonial!.author}</p>
                    <p className="text-[10px] text-muted-foreground">{testimonial!.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ) : null}
        </div>
      ) : null}

      {hasCta ? (
        <FadeIn delay={0.2}>
          <div className="text-center">
            <a href={ctaHref} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              {ctaLabel} &rarr;
            </a>
          </div>
        </FadeIn>
      ) : null}
    </SectionShell>
  )
}
