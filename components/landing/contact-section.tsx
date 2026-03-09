import Link from "next/link"

import { SectionHeading } from "@/components/landing/section-primitives"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { LandingContent } from "@/lib/landing-types"

export function ContactSection({
  content,
}: {
  content: LandingContent["contact"]
}) {
  return (
    <section
      id={content.id.slice(1)}
      className="scroll-mt-16 py-6"
      aria-labelledby="contact-title"
    >
      <div className="space-y-4">
        <SectionHeading id="contact-title" title={content.title} />

        <Card className="gap-3 border-border/60 bg-card/40 py-4 shadow-sm">
          <CardContent className="space-y-3 px-4">
            <p className="text-sm text-muted-foreground">{content.body}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={content.primaryCta.href}>
                  {content.primaryCta.label}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={content.secondaryCta.href}>
                  {content.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
