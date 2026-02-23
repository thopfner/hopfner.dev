import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Metric({
  label,
  value,
  icon,
  className,
  style,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/55 p-4 shadow-sm backdrop-blur-[1px]",
        className
      )}
      style={style}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm text-foreground sm:text-base">{value}</div>
    </div>
  )
}
