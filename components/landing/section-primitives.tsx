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
  children,
}: {
  id?: string
  labelledBy?: string
  className?: string
  sectionClassName?: string
  sectionStyle?: CSSProperties
  containerClassName?: string
  containerStyle?: CSSProperties
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-20 py-8 sm:py-10", sectionClassName, className)}
      style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl space-y-5 px-4 sm:space-y-6", containerClassName)} style={containerStyle}>
        {children}
      </div>
    </section>
  )
}

export function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="text-balance text-xl font-semibold tracking-tight sm:text-2xl"
      style={{ color: "var(--foreground)" }}
    >
      {title}
    </h2>
  )
}
