import Link from "next/link"
import type { CSSProperties } from "react"

import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading } from "@/components/landing/section-primitives"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
}) {
  const ctaJustify = containerClassName?.includes("text-center")
    ? "justify-center"
    : "justify-start"
  const hasEyebrow = (eyebrow ?? "").trim().length > 0

  if (layoutVariant === "compact") {
    return (
      <section
        id={sectionId}
        className={cn("scroll-mt-16 py-4", sectionClassName)}
        aria-labelledby="final-cta-title"
        style={sectionStyle}
      >
        <div className={cn("mx-auto max-w-5xl px-4", containerClassName)} style={containerStyle}>
          <div
            className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/30 px-6 py-4 sm:flex-row"
            style={panelStyle}
          >
            <div>
              {hasEyebrow ? (
                <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
              ) : null}
              <p className="text-sm font-semibold sm:text-base">{headline}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta.label ? (
                <Button size="sm" asChild>
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (layoutVariant === "split") {
    return (
      <section
        id={sectionId}
        className={cn("scroll-mt-16 py-6", sectionClassName)}
        aria-labelledby="final-cta-title"
        style={sectionStyle}
      >
        <div className={cn("mx-auto max-w-5xl px-4", containerClassName)} style={containerStyle}>
          <Card className="surface-panel relative overflow-hidden gap-3 py-4" style={panelStyle}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_60%)]"
            />
            <CardContent className="relative px-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  {hasEyebrow ? (
                    <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
                  ) : null}
                  <SectionHeading id="final-cta-title" title={headline} />
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
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={primaryCta.href}>{primaryCta.label}</Link>
                  </Button>
                  {secondaryCta.label ? (
                    <Button size="sm" asChild>
                      <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (layoutVariant === "high_contrast") {
    return (
      <section
        id={sectionId}
        className={cn("scroll-mt-16 py-6", sectionClassName)}
        aria-labelledby="final-cta-title"
        style={sectionStyle}
      >
        <div className={cn("mx-auto max-w-5xl px-4", containerClassName)} style={containerStyle}>
          <div
            className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.06] px-6 py-8 text-center shadow-lg sm:px-10 sm:py-10"
            style={panelStyle}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_0%,hsl(var(--foreground)/0.12),transparent_60%)]"
            />
            <div className="relative space-y-4">
              {hasEyebrow ? (
                <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
              ) : null}
              <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{headline}</h2>
              {bodyHtml?.trim() ? (
                <div
                  className={cn("mx-auto max-w-xl text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : body ? (
                <p className="mx-auto max-w-xl text-sm text-muted-foreground">{body}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="secondary" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
                {secondaryCta.label ? (
                  <Button asChild>
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default centered layout
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="final-cta-title"
      style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl px-4", containerClassName)} style={containerStyle}>
        <Card className="surface-panel relative overflow-hidden gap-3 py-4" style={panelStyle}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_60%)]"
          />
          <CardContent className="relative space-y-3 px-4">
            {hasEyebrow ? (
              <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
            ) : null}
            <SectionHeading id="final-cta-title" title={headline} />
            {bodyHtml?.trim() ? (
              <div
                className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{body}</p>
            )}
            <div className={cn("flex flex-wrap items-center gap-2", ctaJustify)}>
              <Button size="sm" variant="secondary" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
