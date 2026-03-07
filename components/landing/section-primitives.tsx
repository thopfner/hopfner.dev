import type { CSSProperties, ReactNode } from "react"

import { RHYTHM_CLASSES, SURFACE_CLASSES, HEADING_TREATMENT_CLASSES } from "@/lib/design-system/presentation"
import type { Rhythm, Surface, HeadingTreatment } from "@/lib/design-system/tokens"
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
  children: ReactNode
}) {
  const maxW = widthMode === "full" ? "max-w-7xl" : "max-w-5xl"

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-20",
        rhythm ? RHYTHM_CLASSES[rhythm] : "py-8 sm:py-10",
        surface ? SURFACE_CLASSES[surface] : "",
        surface === "spotlight_stage" && "sig-obsidian-signal",
        surface === "grid_stage" && "sig-grid-rays",
        sectionClassName,
        className
      )}
      style={sectionStyle}
    >
      <div className={cn("mx-auto space-y-5 px-4 sm:space-y-6", maxW, containerClassName)} style={containerStyle}>
        {children}
      </div>
    </section>
  )
}

export function SectionHeading({ id, title, headingTreatment }: { id: string; title: string; headingTreatment?: HeadingTreatment }) {
  return (
    <h2
      id={id}
      className={cn(
        "text-heading text-balance text-xl sm:text-2xl",
        headingTreatment ? HEADING_TREATMENT_CLASSES[headingTreatment] : ""
      )}
      style={{ color: "var(--foreground)" }}
    >
      {title}
    </h2>
  )
}
