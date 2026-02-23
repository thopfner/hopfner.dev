import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function HowItWorksSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  steps,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  steps: Array<{ title: string; body?: string; bodyHtml?: string }>
}) {
  return (
    <SectionShell
      id={sectionId}
      labelledBy="how-it-works-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
    >
      <SectionHeading id="how-it-works-title" title={title} />

      <ol className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {steps.map((step, idx) => (
          <li key={`${idx}-${step.title}`} className="relative">
            <Card className="surface-panel interactive-lift gap-3 py-4" style={panelStyle}>
              <CardContent className="space-y-2 px-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="min-w-7 justify-center rounded-full">
                    {idx + 1}
                  </Badge>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Step {idx + 1}</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium sm:text-base">{step.title}</p>
                  {step.bodyHtml?.trim() ? (
                    <div
                      className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                      dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                    />
                  ) : step.body ? (
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}
