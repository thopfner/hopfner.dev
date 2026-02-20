import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
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
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="how-it-works-title"
    style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)} style={containerStyle}>
        <h2
          id="how-it-works-title"
          className="text-lg font-semibold tracking-tight"
        >
          {title}
        </h2>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <li key={`${idx}-${step.title}`}>
              <Card className="gap-3 border-border/60 bg-card/40 py-4" style={panelStyle}>
                <CardContent className="space-y-2 px-4">
                  <Badge variant="secondary">{idx + 1}</Badge>
                  <div className="space-y-1">
                    <p className="text-sm">{step.title}</p>
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
      </div>
    </section>
  )
}
