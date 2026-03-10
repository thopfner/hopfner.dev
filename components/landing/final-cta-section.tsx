import Link from "next/link"
import type { CSSProperties } from "react"

import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { FadeIn } from "@/components/landing/motion-primitives"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { Button } from "@/components/ui/button"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { HEADING_TREATMENT_CLASSES, LABEL_STYLE_CLASSES } from "@/lib/design-system/presentation"
import { cn } from "@/lib/utils"

type LayoutVariant = "centered" | "split" | "compact" | "high_contrast"

export function FinalCtaSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  headline,
  body,
  bodyHtml,
  primaryCta,
  secondaryCta,
  layoutVariant = "centered",
  eyebrow,
  ui,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  headline: string
  body: string
  bodyHtml?: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  layoutVariant?: LayoutVariant
  eyebrow?: string
  ui?: ResolvedSectionUi
}) {
  const card = resolveCardPresentation(ui, { mode: "cta" })
  const ctaJustify = containerClassName?.includes("text-center")
    ? "justify-center"
    : "justify-start"
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const labelStyle = ui?.labelStyle ?? "default"
  const headingId = sectionId ? `${sectionId}-heading` : "final-cta-title"

  if (layoutVariant === "compact") {
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
        <FadeIn>
          <div
            className={cn(card.cardClass, card.spacing.rootPadding, "flex flex-col items-center justify-between sm:flex-row", card.spacing.gap)}
            style={panelStyle}
          >
            <div>
              {hasEyebrow ? (
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
              ) : null}
              <p className={cn("text-sm font-semibold text-foreground sm:text-base", HEADING_TREATMENT_CLASSES[ui?.headingTreatment ?? "default"])}>{headline}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button size="sm" variant="gradient" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}<span className="cta-arrow ml-1">&rarr;</span></Link>
              </Button>
              {secondaryCta.label ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </FadeIn>
      </SectionShell>
    )
  }

  if (layoutVariant === "split") {
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
        <FadeIn>
          <div className={cn(card.cardClass, "relative overflow-hidden", card.spacing.gap, card.spacing.rootPadding)} style={panelStyle}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_50%_0%,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent_60%)]"
            />
            <div className="relative">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  {hasEyebrow ? (
                    <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
                  ) : null}
                  <SectionHeading id={headingId} title={headline} headingTreatment={ui?.headingTreatment} />
                  {bodyHtml?.trim() ? (
                    <div
                      className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                  ) : body ? (
                    <p className="text-sm text-muted-foreground">{body}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start justify-center gap-3 sm:items-end">
                  <Button size="sm" variant="gradient" asChild>
                    <Link href={primaryCta.href}>{primaryCta.label}<span className="cta-arrow ml-1">&rarr;</span></Link>
                  </Button>
                  {secondaryCta.label ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionShell>
    )
  }

  if (layoutVariant === "high_contrast") {
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
        <FadeIn>
          <div
            className={cn(card.cardClass, "relative overflow-hidden text-center", card.spacing.rootPadding)}
            style={panelStyle}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_0%,color-mix(in_oklch,var(--foreground)_12%,transparent),transparent_60%)]"
            />
            <div className="relative space-y-4">
              {hasEyebrow ? (
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle], "mx-auto")}>{eyebrow}</p>
              ) : null}
              <h2 className={cn("text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl", HEADING_TREATMENT_CLASSES[ui?.headingTreatment ?? "default"])}>{headline}</h2>
              {bodyHtml?.trim() ? (
                <div
                  className={cn("mx-auto max-w-xl text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : body ? (
                <p className="mx-auto max-w-xl text-sm text-muted-foreground">{body}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="gradient" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}<span className="cta-arrow ml-1">&rarr;</span></Link>
                </Button>
                {secondaryCta.label ? (
                  <Button variant="outline" asChild>
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionShell>
    )
  }

  // Default centered layout
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
      <FadeIn>
        <div className={cn(card.cardClass, "relative overflow-hidden", card.spacing.gap, card.spacing.rootPadding)} style={panelStyle}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_50%_0%,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent_60%)]"
          />
          <div className="relative space-y-3">
            {hasEyebrow ? (
              <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
            ) : null}
            <SectionHeading id={headingId} title={headline} headingTreatment={ui?.headingTreatment} />
            {bodyHtml?.trim() ? (
              <div
                className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{body}</p>
            )}
            <div className={cn("flex flex-wrap items-center gap-2", ctaJustify)}>
              <Button size="sm" variant="gradient" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}<span className="cta-arrow ml-1">&rarr;</span></Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </SectionShell>
  )
}
