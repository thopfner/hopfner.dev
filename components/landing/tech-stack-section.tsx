import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function TechStackSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  title,
  items,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  title: string
  items: Array<{ label: string; value: string }>
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="tech-title"
    style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)} style={containerStyle}>
        <h2 id="tech-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card
              key={item.label}
              className="gap-2 border-border/60 bg-card/40 py-3 shadow-sm"
            >
              <CardContent className="flex items-start gap-2 px-4">
                <Badge variant="secondary">{item.label}</Badge>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
