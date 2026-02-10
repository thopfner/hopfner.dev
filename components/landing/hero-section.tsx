import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function HeroSection({
  sectionId,
  sectionClassName,
  containerClassName,
  headline,
  subheadline,
  bullets,
  primaryCta,
  secondaryCta,
  trustLine,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  headline: string
  subheadline: string
  bullets: string[]
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  trustLine: string
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
    >
      <div className={cn("mx-auto max-w-5xl px-4", containerClassName)}>
        <Card className="relative overflow-hidden border-border/60 bg-card/40 py-4 shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_60%)]"
          />
          <CardContent className="relative space-y-4 px-4 sm:px-6">
            <div className="space-y-2 text-center">
              <h1 className="text-pretty text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {headline}
              </h1>
              <p className="mx-auto max-w-3xl text-pretty text-sm text-muted-foreground sm:text-base">
                {subheadline}
              </p>
            </div>

            <ul className="mx-auto max-w-3xl space-y-1 text-sm text-muted-foreground">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            </div>

            <Separator className="bg-border/60" />

            <p className="text-center text-xs text-muted-foreground">
              {trustLine}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
