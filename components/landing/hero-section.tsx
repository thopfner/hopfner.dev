import Link from "next/link"
import type { CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type ProofPanelProps = {
  type?: "stats" | "mockup" | "image"
  headline?: string
  items?: { label: string; value: string }[]
  imageUrl?: string
  mockupVariant?: "dashboard" | "workflow" | "terminal"
}

type HeroStat = {
  value: string
  label: string
}

type TrustItem = {
  text: string
  icon?: string
}

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
  layoutVariant = "centered",
  eyebrow,
  proofPanel,
  trustItems,
  heroStats,
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
  layoutVariant?: "centered" | "split" | "split_reversed"
  eyebrow?: string
  proofPanel?: ProofPanelProps
  trustItems?: TrustItem[]
  heroStats?: HeroStat[]
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

  const isSplit = layoutVariant === "split" || layoutVariant === "split_reversed"
  const isReversed = layoutVariant === "split_reversed"
  const hasProofPanel = isSplit && proofPanel && (proofPanel.type === "stats" || proofPanel.type === "mockup" || proofPanel.type === "image")
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasTrustItems = Array.isArray(trustItems) && trustItems.length > 0
  const hasHeroStats = Array.isArray(heroStats) && heroStats.length > 0

  const textContent = (
    <div className={cn("space-y-4", isSplit ? "text-left" : "text-center")}>
      {hasEyebrow ? (
        <p className="text-eyebrow text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <div className="space-y-2">
        <h1
          className={cn(
            "text-display text-pretty leading-tight",
            isSplit
              ? "text-3xl sm:text-4xl lg:text-5xl"
              : "text-3xl sm:text-4xl"
          )}
        >
          {headline}
        </h1>
        <p
          className={cn(
            "text-pretty text-sm text-muted-foreground sm:text-base",
            isSplit ? "max-w-lg" : "mx-auto max-w-3xl"
          )}
        >
          {subheadline}
        </p>
      </div>

      {bullets.length > 0 ? (
        <ul className={cn("space-y-1 text-sm text-muted-foreground", isSplit ? "max-w-lg" : "mx-auto max-w-3xl")}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}

      <div className={cn("flex flex-wrap items-center gap-2", isSplit ? "justify-start" : "justify-center")}>
        <Button size="sm" variant="secondary" asChild>
          <Link href={primaryCta.href}>{primaryCta.label}</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
        </Button>
      </div>

      {hasHeroStats ? (
        <div className={cn("flex flex-wrap gap-6 pt-2", isSplit ? "justify-start" : "justify-center")}>
          {heroStats!.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-metric text-2xl">{stat.value}</p>
              <p className="text-label-mono text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )

  const proofContent = hasProofPanel ? (
    <div className="flex items-center justify-center">
      {proofPanel!.type === "stats" ? (
        <div className="w-full space-y-3">
          {proofPanel!.headline ? (
            <p className="text-sm font-medium text-muted-foreground">{proofPanel!.headline}</p>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {(proofPanel!.items ?? []).map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/40 bg-card/30 p-3 text-center"
              >
                <p className="text-metric text-xl">{item.value}</p>
                <p className="text-label-mono text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : proofPanel!.type === "mockup" ? (
        <div className="w-full">
          {proofPanel!.headline ? (
            <p className="mb-2 text-sm font-medium text-muted-foreground">{proofPanel!.headline}</p>
          ) : null}
          <div
            className={cn(
              "overflow-hidden rounded-lg border border-border/40",
              proofPanel!.mockupVariant === "terminal"
                ? "bg-[#1a1a2e] p-4 font-mono text-xs text-green-400/80"
                : proofPanel!.mockupVariant === "workflow"
                  ? "bg-card/20 p-4"
                  : "bg-card/20 p-4"
            )}
          >
            {proofPanel!.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proofPanel!.imageUrl}
                alt={proofPanel!.headline ?? ""}
                className="h-auto w-full rounded"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground/40">
                <span className="text-sm">Mockup preview</span>
              </div>
            )}
          </div>
        </div>
      ) : proofPanel!.type === "image" && proofPanel!.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proofPanel!.imageUrl}
          alt={proofPanel!.headline ?? ""}
          className="h-auto max-h-80 w-full rounded-lg object-contain"
        />
      ) : null}
    </div>
  ) : null

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
              "relative z-20 px-4 sm:px-6",
              fullBleed ? "mx-auto w-full max-w-5xl" : undefined,
              minHeight && minHeight !== "auto" ? "flex h-full flex-col justify-center" : undefined,
              !isSplit ? "space-y-4" : undefined
            )}
          >
            {isSplit ? (
              <div className={cn(
                "grid gap-8 lg:grid-cols-2 lg:gap-12",
                isReversed ? "lg:[direction:rtl] lg:[&>*]:[direction:ltr]" : undefined
              )}>
                <div className="flex flex-col justify-center">{textContent}</div>
                {proofContent ? (
                  <div className="flex flex-col justify-center">{proofContent}</div>
                ) : null}
              </div>
            ) : (
              textContent
            )}

            {!isSplit ? (
              <>
                {hasTrustItems ? (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                      {trustItems!.map((item, i) => (
                        <span key={i} className="text-label-mono text-muted-foreground">
                          {item.text}
                        </span>
                      ))}
                    </div>
                  </>
                ) : trustLine ? (
                  <>
                    <Separator className="bg-border/60" />
                    <p
                      className={cn("text-center", trustLineColorValue ? undefined : "text-muted-foreground")}
                      style={{ fontSize: `${trustLineSize}px`, color: trustLineColorValue || undefined }}
                    >
                      {trustLine}
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <>
                {hasTrustItems ? (
                  <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {trustItems!.map((item, i) => (
                      <span key={i} className="text-label-mono text-muted-foreground">
                        {item.text}
                      </span>
                    ))}
                  </div>
                ) : trustLine ? (
                  <div className="mt-6">
                    <Separator className="bg-border/60" />
                    <p
                      className={cn("mt-4 text-center", trustLineColorValue ? undefined : "text-muted-foreground")}
                      style={{ fontSize: `${trustLineSize}px`, color: trustLineColorValue || undefined }}
                    >
                      {trustLine}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
