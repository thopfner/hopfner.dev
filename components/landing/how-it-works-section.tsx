import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function HowItWorksSection({
  sectionId,
  sectionClassName,
  containerClassName,
  title,
  steps,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  title: string
  steps: Array<{ title: string; body?: string }>
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="how-it-works-title"
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)}>
        <h2
          id="how-it-works-title"
          className="text-lg font-semibold tracking-tight"
        >
          {title}
        </h2>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <li key={`${idx}-${step.title}`}>
              <Card className="gap-3 border-border/60 bg-card/40 py-4 shadow-sm">
                <CardContent className="space-y-2 px-4">
                  <Badge variant="secondary">{idx + 1}</Badge>
                  <div className="space-y-1">
                    <p className="text-sm">{step.title}</p>
                    {step.body ? (
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
