import Link from "next/link"
import type { CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function HeroSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  fullBleed,
  minHeight,
  headline,
  subheadline,
  bullets,
  primaryCta,
  secondaryCta,
  trustLine,
  backgroundImageUrl,
  imageOverlayColor,
  imageOverlayOpacity,
  transitionToNext,
  nextSectionBgColor,
  trustLineFontSizePx,
  trustLineColor,
  heroBlendStrength,
  useSharedTopBackdrop,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  fullBleed?: boolean
  minHeight?: "auto" | "70svh" | "100svh"
  headline: string
  subheadline: string
  bullets: string[]
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  trustLine: string
  backgroundImageUrl?: string
  imageOverlayColor?: string
  imageOverlayOpacity?: number
  transitionToNext?: boolean
  nextSectionBgColor?: string
  trustLineFontSizePx?: number
  trustLineColor?: string
  heroBlendStrength?: number
  useSharedTopBackdrop?: boolean
}) {
  const sectionStyleWithMinHeight: CSSProperties = {
    ...(sectionStyle ?? {}),
    minHeight: minHeight && minHeight !== "auto" ? minHeight : sectionStyle?.minHeight,
    ["--next-section-bg" as string]: (nextSectionBgColor ?? "var(--page-bg, #0B0F14)").trim(),
  }
  const heroImageUrl = (backgroundImageUrl ?? "").trim()
  const hasHeroImage = heroImageUrl.length > 0 && !useSharedTopBackdrop
  const overlayOpacity = Number.isFinite(imageOverlayOpacity)
    ? Math.min(1, Math.max(0, imageOverlayOpacity ?? 0))
    : 0
  const overlayColor = (imageOverlayColor ?? "").trim() || "#000000"
  const hasTopImageSource = (backgroundImageUrl ?? "").trim().length > 0
  const showSectionTransition = Boolean(transitionToNext && hasTopImageSource)
  const trustSizeRaw = Number(trustLineFontSizePx)
  const trustLineSize = Number.isFinite(trustSizeRaw) ? Math.min(28, Math.max(10, Math.round(trustSizeRaw))) : 12
  const trustLineColorValue = (trustLineColor ?? "").trim()
  const blendStrengthRaw = Number(heroBlendStrength)
  const blendStrength = Number.isFinite(blendStrengthRaw) ? Math.min(1, Math.max(0, blendStrengthRaw)) : 0.72

  return (
    <section
      id={sectionId}
      className={cn(
        "relative scroll-mt-16 py-6",
        sectionClassName,
        fullBleed || (minHeight && minHeight !== "auto") ? "pt-0" : undefined
      )}
      style={sectionStyleWithMinHeight}
    >
      <div className={cn("relative z-10", fullBleed ? "mx-auto max-w-none px-0" : "mx-auto max-w-5xl px-4", containerClassName)} style={containerStyle}>
        <Card className={cn("relative overflow-hidden border-border/60 bg-card/40 py-4", fullBleed ? "rounded-none border-x-0" : undefined, minHeight && minHeight !== "auto" ? "h-full" : undefined, showSectionTransition ? "border-b-0" : undefined)} style={panelStyle}>
          {hasHeroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : null}
          {hasHeroImage && overlayOpacity > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_60%)]"
          />
          {showSectionTransition ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -bottom-px h-32 sm:h-44"
              style={{
                zIndex: 10,
                background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, color-mix(in srgb, var(--next-section-bg) ${Math.round(
                  blendStrength * 60
                )}%, transparent) 58%, var(--next-section-bg) 100%)`,
              }}
            />
          ) : null}
          <CardContent
            className={cn(
              "relative z-20 space-y-4 px-4 sm:px-6",
              fullBleed ? "mx-auto w-full max-w-5xl" : undefined,
              minHeight && minHeight !== "auto" ? "flex h-full flex-col justify-center" : undefined
            )}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-pretty text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {headline}
              </h1>
              <p className="mx-auto max-w-3xl text-pretty text-sm text-muted-foreground sm:text-base">
                {subheadline}
              </p>
            </div>

            <ul className="mx-auto max-w-3xl space-y-1 text-sm text-muted-foreground">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            </div>

            <Separator className="bg-border/60" />

            <p
              className={cn("text-center", trustLineColorValue ? undefined : "text-muted-foreground")}
              style={{ fontSize: `${trustLineSize}px`, color: trustLineColorValue || undefined }}
            >
              {trustLine}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
