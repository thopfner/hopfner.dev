import type { CSSProperties, ReactNode } from "react"

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
  rhythm?: "hero" | "statement" | "compact" | "standard" | "proof" | "cta" | "footer"
  surface?: "none" | "panel" | "soft_band" | "contrast_band" | "spotlight_stage" | "grid_stage"
  children: ReactNode
}) {
  const maxW = widthMode === "full" ? "max-w-7xl" : "max-w-5xl"

  const rhythmPadding: Record<string, string> = {
    hero: "py-10 sm:py-16",
    statement: "py-8 sm:py-12",
    compact: "py-3 sm:py-4",
    standard: "py-6 sm:py-10",
    proof: "py-6 sm:py-8",
    cta: "py-8 sm:py-14",
    footer: "py-6 sm:py-8",
  }

  const surfaceClasses: Record<string, string> = {
    none: "",
    panel: "surface-panel",
    soft_band: "bg-card/[0.03] border-y border-border/20",
    contrast_band: "bg-card/10 border-y border-border/40",
    spotlight_stage: "relative",
    grid_stage: "relative",
  }

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-20",
        rhythm ? rhythmPadding[rhythm] : "py-8 sm:py-10",
        surface ? surfaceClasses[surface] : "",
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

export function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="text-heading text-balance text-xl sm:text-2xl"
      style={{ color: "var(--foreground)" }}
    >
      {title}
    </h2>
  )
}
