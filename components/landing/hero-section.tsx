import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HeroEntrance, AnimatedCounter } from "@/components/landing/motion-primitives"
import { HEADING_TREATMENT_CLASSES } from "@/lib/design-system/presentation"
import type { HeadingTreatment } from "@/lib/design-system/tokens"
import { cn } from "@/lib/utils"

function renderMetricValue(value: string, className?: string) {
  const match = value.match(/^([^0-9]*)([\d,.]+)(.*)$/)
  if (match) {
    const [, prefix, numStr, suffix] = match
    const num = parseFloat(numStr.replace(/,/g, ""))
    return <AnimatedCounter target={num} prefix={prefix} suffix={suffix} className={className} />
  }
  return <span className={className}>{value}</span>
}

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
  headingTreatment,
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
  headingTreatment?: HeadingTreatment
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
    <div className={cn("space-y-6", isSplit ? "text-left" : "text-center")}>
      {hasEyebrow ? (
        <HeroEntrance delay={0}>
          <p className="text-eyebrow text-muted-foreground">
            {eyebrow}
          </p>
        </HeroEntrance>
      ) : null}

      <HeroEntrance delay={hasEyebrow ? 0.15 : 0}>
        <div className="space-y-2">
          <h1
            className={cn(
              "text-display text-display-xl text-pretty leading-tight",
              isSplit ? "lg:text-6xl" : "",
              HEADING_TREATMENT_CLASSES[headingTreatment ?? "default"]
            )}
          >
            {headline}
          </h1>
          <p
            className={cn(
              "text-pretty text-base text-muted-foreground sm:text-lg",
              isSplit ? "max-w-lg" : "mx-auto max-w-3xl"
            )}
          >
            {subheadline}
          </p>
        </div>
      </HeroEntrance>

      {bullets.length > 0 ? (
        <HeroEntrance delay={hasEyebrow ? 0.3 : 0.15}>
          <ul className={cn("space-y-1 text-sm text-muted-foreground", isSplit ? "max-w-lg" : "mx-auto max-w-3xl")}>
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </HeroEntrance>
      ) : null}

      <HeroEntrance delay={hasEyebrow ? 0.45 : 0.3}>
        <div className={cn("flex flex-wrap items-center gap-2", isSplit ? "justify-start" : "justify-center")}>
          <Button size="default" variant="gradient" className="btn-press px-6" asChild>
            <Link href={primaryCta.href}>{primaryCta.label}<span className="cta-arrow ml-1">&rarr;</span></Link>
          </Button>
          <Button size="default" className="btn-press px-6" asChild>
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        </div>
      </HeroEntrance>

      {hasHeroStats ? (
        <HeroEntrance delay={hasEyebrow ? 0.6 : 0.45}>
          <div className={cn("flex flex-wrap gap-8 pt-4", isSplit ? "justify-start" : "justify-center")}>
            {heroStats!.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-metric text-2xl">{renderMetricValue(stat.value)}</p>
                <p className="text-label-mono text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </HeroEntrance>
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
          <div className="grid grid-cols-2 gap-2">
            {(proofPanel!.items ?? []).map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/30 bg-card/20 p-4 text-center backdrop-blur-sm"
              >
                <p className="text-metric text-xl">{renderMetricValue(item.value)}</p>
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
          {proofPanel!.imageUrl ? (
            <div className="overflow-hidden rounded-lg border border-border/40 bg-card/20 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofPanel!.imageUrl}
                alt={proofPanel!.headline ?? ""}
                className="h-auto w-full rounded"
              />
            </div>
          ) : proofPanel!.mockupVariant === "terminal" || proofPanel!.mockupVariant === "workflow" ? (
            <div className="overflow-hidden rounded-lg border border-border/40 bg-[#0d1117] shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[10px] text-white/30 font-mono">terminal</span>
              </div>
              <div className="p-4 font-mono text-xs leading-relaxed space-y-1">
                {(proofPanel!.items ?? []).length > 0 ? (
                  proofPanel!.items!.map((item, i) => (
                    <div key={i}>
                      {item.label ? (
                        <div className={i > 0 ? "mt-2" : ""}>
                          <span className="text-green-400/80">$ </span>
                          <span className="text-white/70">{item.label}</span>
                        </div>
                      ) : null}
                      {item.value ? (
                        <div className="text-white/40 pl-4">{item.value}</div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <span className="text-green-400/80">$ </span>
                      <span className="text-white/70">hopfner analyze --workflows</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-400/60">&rarr; </span>
                      <span className="text-white/40">Scanning 47 business processes...</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-400/60">&rarr; </span>
                      <span className="text-white/40">Found 12 automation opportunities</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-400/60">&rarr; </span>
                      <span className="text-white/40">Estimated efficiency gain: 340 hrs/quarter</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-green-400/80">$ </span>
                      <span className="text-white/70">hopfner deploy --priority high</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-emerald-400/70">&check; </span>
                      <span className="text-white/40">Workflow automation deployed</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-emerald-400/70">&check; </span>
                      <span className="text-white/40">Integration tests passed</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-emerald-400/70">&check; </span>
                      <span className="text-white/40">Monitoring active</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : proofPanel!.mockupVariant === "dashboard" ? (
            <div className="overflow-hidden rounded-lg border border-border/40 bg-[#0d1117]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
                <span className="text-[10px] font-mono text-white/30">dashboard</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {(proofPanel!.items ?? []).length > 0 ? (
                  proofPanel!.items!.map((item, i) => (
                    <div key={i} className="rounded-md border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-lg font-semibold text-white/80 font-mono">{item.value}</p>
                      <p className="text-[10px] text-white/30 font-mono mt-1">{item.label}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="rounded-md border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-lg font-semibold text-white/80 font-mono">340h</p>
                      <p className="text-[10px] text-white/30 font-mono mt-1">Hours Saved</p>
                    </div>
                    <div className="rounded-md border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-lg font-semibold text-emerald-400/70 font-mono">98.2%</p>
                      <p className="text-[10px] text-white/30 font-mono mt-1">Uptime</p>
                    </div>
                    <div className="rounded-md border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-lg font-semibold text-white/80 font-mono">12</p>
                      <p className="text-[10px] text-white/30 font-mono mt-1">Workflows</p>
                    </div>
                    <div className="rounded-md border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-lg font-semibold text-blue-400/70 font-mono">4.2x</p>
                      <p className="text-[10px] text-white/30 font-mono mt-1">ROI Multiple</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/40 bg-card/20 p-4">
              <div className="flex h-48 items-center justify-center text-muted-foreground/40">
                <span className="text-sm">Mockup preview</span>
              </div>
            </div>
          )}
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
            <Image
              src={heroImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              aria-hidden
              className="pointer-events-none object-cover object-center"
            />
          ) : (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 surface-gradient-mesh opacity-50"
            />
          )}
          {hasHeroImage && overlayOpacity > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_0%,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent_60%)]"
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
                  <HeroEntrance delay={0.6} className="flex flex-col justify-center">
                    {proofContent}
                  </HeroEntrance>
                ) : null}
              </div>
            ) : (
              textContent
            )}

            {!isSplit ? (
              <>
                {hasTrustItems ? (
                  <HeroEntrance delay={hasEyebrow ? 0.6 : 0.45}>
                    <Separator className="bg-border/60" />
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                      {trustItems!.map((item, i) => (
                        <span key={i} className="text-label-mono text-muted-foreground">
                          {item.text}
                        </span>
                      ))}
                    </div>
                  </HeroEntrance>
                ) : trustLine ? (
                  <HeroEntrance delay={hasEyebrow ? 0.6 : 0.45}>
                    <Separator className="bg-border/60" />
                    <p
                      className={cn("mt-4 text-center", trustLineColorValue ? undefined : "text-muted-foreground")}
                      style={{ fontSize: `${trustLineSize}px`, color: trustLineColorValue || undefined }}
                    >
                      {trustLine}
                    </p>
                  </HeroEntrance>
                ) : null}
              </>
            ) : (
              <>
                {hasTrustItems ? (
                  <HeroEntrance delay={0.6}>
                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {trustItems!.map((item, i) => (
                        <span key={i} className="text-label-mono text-muted-foreground">
                          {item.text}
                        </span>
                      ))}
                    </div>
                  </HeroEntrance>
                ) : trustLine ? (
                  <HeroEntrance delay={0.6}>
                    <div className="mt-6">
                      <Separator className="bg-border/60" />
                      <p
                        className={cn("mt-4 text-center", trustLineColorValue ? undefined : "text-muted-foreground")}
                        style={{ fontSize: `${trustLineSize}px`, color: trustLineColorValue || undefined }}
                      >
                        {trustLine}
                      </p>
                    </div>
                  </HeroEntrance>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
