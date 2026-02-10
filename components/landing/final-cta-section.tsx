import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function FinalCtaSection({
  sectionId,
  sectionClassName,
  containerClassName,
  headline,
  body,
  primaryCta,
  secondaryCta,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  headline: string
  body: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="final-cta-title"
    >
      <div className={cn("mx-auto max-w-5xl px-4", containerClassName)}>
        <Card className="relative overflow-hidden gap-3 border-border/60 bg-card/40 py-4 shadow-sm">
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
            <p className="text-sm text-muted-foreground">{body}</p>
            <div className="flex flex-wrap items-center gap-2">
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
