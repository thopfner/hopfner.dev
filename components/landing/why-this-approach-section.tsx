import { Card, CardContent } from "@/components/ui/card"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
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
  rhythm,
  surface,
  headingTreatment,
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
  rhythm?: string
  surface?: string
  headingTreatment?: string
}) {
  return (
    <SectionShell
      id={sectionId}
      labelledBy="why-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={rhythm as any}
      surface={surface as any}
    >
        <SectionHeading id="why-title" title={title} />

        <Card className="surface-panel gap-3 py-4" style={panelStyle}>
          <CardContent className="space-y-2 px-4">
            <h3 className={cn("text-sm font-semibold", headingTreatment === "display" && "text-display text-base", headingTreatment === "mono" && "text-label-mono")}>{heading}</h3>
            <div
              className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </CardContent>
        </Card>
    </SectionShell>
  )
}
