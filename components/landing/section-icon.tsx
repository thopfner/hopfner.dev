import { cn } from "@/lib/utils"

type SectionIconProps = {
  icon?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SectionIcon({ icon, size = "md", className }: SectionIconProps) {
  if (!icon?.trim()) return null

  const sizeClasses = {
    sm: "h-8 w-8 text-base",
    md: "h-10 w-10 text-xl",
    lg: "h-12 w-12 text-2xl",
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-accent/[0.08] shadow-[0_0_16px_color-mix(in_oklch,var(--accent-glow,var(--foreground))_6%,transparent)]",
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      <span>{icon}</span>
    </div>
  )
}
