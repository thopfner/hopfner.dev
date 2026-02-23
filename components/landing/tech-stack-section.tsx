import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { Metric } from "@/components/ui/metric"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function TechStackSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  items,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  items: Array<{ label: string; value: string }>
}) {
  return (
    <SectionShell
      id={sectionId}
      labelledBy="tech-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
    >
      <SectionHeading id="tech-title" title={title} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Metric
            key={item.label}
            label={item.label}
            value={<p className="text-muted-foreground">{item.value}</p>}
            className={cn("interactive-lift")}
            style={panelStyle}
          />
        ))}
      </div>
    </SectionShell>
  )
}
