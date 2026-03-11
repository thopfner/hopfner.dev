import type { CSSProperties, ReactNode } from "react"

import { RHYTHM_CLASSES, SURFACE_CLASSES, HEADING_TREATMENT_CLASSES, DENSITY_SECTION_GAP } from "@/lib/design-system/presentation"
import type { Rhythm, Surface, HeadingTreatment, ContentDensity } from "@/lib/design-system/tokens"
import { cn } from "@/lib/utils"

export function SectionShell({
  id,
  labelledBy,
  className,
  sectionClassName,
  sectionStyle,
  containerClassName,
  containerStyle,
  widthMode,
  rhythm,
  surface,
  density,
  children,
}: {
  id?: string
  labelledBy?: string
  className?: string
  sectionClassName?: string
  sectionStyle?: CSSProperties
  containerClassName?: string
  containerStyle?: CSSProperties
  widthMode?: "content" | "full"
  rhythm?: Rhythm
  surface?: Surface
  density?: ContentDensity
  children: ReactNode
}) {
  const maxW = widthMode === "full" ? "max-w-7xl" : "max-w-5xl"
  const stackGap = density ? DENSITY_SECTION_GAP[density] : "space-y-6 sm:space-y-7"

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-20",
        RHYTHM_CLASSES[rhythm ?? "standard"],
        surface ? SURFACE_CLASSES[surface] : "",
        surface === "spotlight_stage" && "sig-obsidian-signal",
        surface === "grid_stage" && "sig-grid-rays",
        sectionClassName,
        className
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 500px", ...sectionStyle }}
    >
      <div className={cn("mx-auto px-4", stackGap, maxW, containerClassName)} style={containerStyle}>
        {children}
      </div>
    </section>
  )
}

export function SectionHeading({ id, title, headingTreatment }: { id: string; title: string; headingTreatment?: HeadingTreatment }) {
  const isGradient = headingTreatment === "gradient" || headingTreatment === "gradient_accent"
  return (
    <h2
      id={id}
      className={cn(
        "text-heading text-balance text-xl sm:text-2xl",
        HEADING_TREATMENT_CLASSES[headingTreatment ?? "default"]
      )}
      style={isGradient ? undefined : { color: "var(--foreground)" }}
    >
      {title}
    </h2>
  )
}
