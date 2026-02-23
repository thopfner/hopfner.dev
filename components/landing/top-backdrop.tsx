import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

export function TopBackdrop({
  imageUrl,
  imageOpacity = 1,
  navOverlayOpacity = 0.18,
  scope = "hero-only",
  className,
  children,
}: {
  imageUrl?: string | null
  imageOpacity?: number
  navOverlayOpacity?: number
  scope?: "hero-only" | "full-page"
  className?: string
  children: ReactNode
}) {
  const enabled = Boolean((imageUrl ?? "").trim())
  const style = enabled
    ? ({
        ["--top-bg-image" as string]: `url(${imageUrl})`,
        ["--top-bg-image-opacity" as string]: String(Math.min(1, Math.max(0, imageOpacity))),
        ["--top-nav-overlay-opacity" as string]: String(Math.min(0.6, Math.max(0, navOverlayOpacity))),
      } as CSSProperties)
    : undefined

  return (
    <div
      className={cn(
        "top-backdrop relative",
        enabled ? "is-enabled" : undefined,
        enabled && scope === "full-page" ? "min-h-dvh" : undefined,
        className
      )}
      style={style}
    >
      {enabled ? (
        <>
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-0",
              scope === "full-page" ? "bottom-0" : "h-[clamp(380px,72vh,980px)]"
            )}
            style={{
              backgroundImage: "var(--top-bg-image)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: "var(--top-bg-image-opacity)",
            }}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-[1]",
              scope === "full-page" ? "h-[clamp(220px,42vh,560px)]" : "h-[clamp(320px,62vh,900px)]"
            )}
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.14) 72%, rgba(0,0,0,0.00) 100%)",
            }}
          />
        </>
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
