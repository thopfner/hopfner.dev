import Link from "next/link"
import type { CSSProperties } from "react"

import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
}) {
  const ctaJustify = containerClassName?.includes("text-center")
    ? "justify-center"
    : "justify-start"

  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="final-cta-title"
    style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl px-4", containerClassName)} style={containerStyle}>
        <Card className="relative overflow-hidden gap-3 border-border/60 bg-card/40 py-4" style={panelStyle}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_60%)]"
          />
          <CardContent className="relative space-y-3 px-4">
            <h2
              id="final-cta-title"
              className="text-lg font-semibold tracking-tight"
            >
              {headline}
            </h2>
            {bodyHtml?.trim() ? (
              <div
                className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{body}</p>
            )}
            <div className={cn("flex flex-wrap items-center gap-2", ctaJustify)}>
              <Button size="sm" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
