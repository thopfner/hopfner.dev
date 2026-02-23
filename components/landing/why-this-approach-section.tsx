import { Card, CardContent } from "@/components/ui/card"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function WhyThisApproachSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  heading,
  bodyHtml,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  heading: string
  bodyHtml: string
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="why-title"
    style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)} style={containerStyle}>
        <SectionHeading id="why-title" title={title} />

        <Card className="surface-panel gap-3 py-4" style={panelStyle}>
          <CardContent className="space-y-2 px-4">
            <h3 className="text-sm font-semibold">{heading}</h3>
            <div
              className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
