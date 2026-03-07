import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { DENSITY_PADDING, GRID_GAP_CLASSES } from "@/lib/design-system/presentation"
import { resolveCardClasses, DEFAULT_CARD_CLASS } from "@/lib/design-system/component-families"

type SectionVariant =
  | "default"
  | "value_pillars"
  | "services"
  | "problem_cards"
  | "proof_cards"
  | "logo_tiles"

type CardTone = "default" | "elevated" | "muted" | "contrast"

export function WhatIDeliverSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  eyebrow,
  cards,
  sectionVariant = "default",
  columns,
  cardTone = "default",
  ui,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  subtitle?: string
  eyebrow?: string
  cards: Array<{
    display: {
      showTitle: boolean
      showText: boolean
      showImage: boolean
      showYouGet: boolean
      showBestFor: boolean
      youGetMode: "block" | "list"
      bestForMode: "block" | "list"
    }
    title: string
    text: string
    textHtml?: string
    imageUrl?: string
    imageAlt?: string
    imageWidthPx?: number
    youGet: string[]
    bestFor: string
    bestForList: string[]
    icon?: string
    stat?: string
    tag?: string
  }>
  sectionVariant?: SectionVariant
  columns?: 2 | 3 | 4
  cardTone?: CardTone
  ui?: ResolvedSectionUi
}) {
  const effectiveColumns = columns ?? (sectionVariant === "logo_tiles" ? 4 : 3)
  const gridCols =
    effectiveColumns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : effectiveColumns === 4
        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"

  // Legacy tone fallback — used only when ui?.componentFamily is not set
  const toneClasses: Record<CardTone, string> = {
    default: DEFAULT_CARD_CLASS,
    elevated: "surface-panel interactive-lift border-border/80 shadow-md",
    muted: "border-border/40 bg-card/20",
    contrast: "border-border/80 bg-foreground/[0.04] shadow-sm",
  }

  // Resolve card classes from design-system tokens when available
  const resolved = ui?.componentFamily
    ? resolveCardClasses(ui.componentFamily, ui.componentChrome, ui.accentRule)
    : null

  const variantCardClass = (variant: SectionVariant): string => {
    switch (variant) {
      case "value_pillars":
        return "border-l-2 border-l-accent/60"
      case "problem_cards":
        return "border-t-2 border-t-accent/40"
      case "proof_cards":
        return "bg-card/30"
      case "logo_tiles":
        return "flex items-center justify-center p-6"
      default:
        return ""
    }
  }

  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0

  return (
    <SectionShell
      id={sectionId}
      labelledBy="services-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
    >
        <div className="space-y-1">
          {hasEyebrow ? (
            <p className="text-eyebrow text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading id="services-title" title={title} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className={cn("grid", GRID_GAP_CLASSES[ui?.gridGap ?? "standard"], gridCols)}>
          {cards.map((item, idx) => {
            const hasYouGetBlock =
              item.display.showYouGet &&
              item.display.youGetMode === "block" &&
              item.youGet.length > 0
            const hasYouGetList =
              item.display.showYouGet &&
              item.display.youGetMode === "list" &&
              item.youGet.length > 0
            const hasBestForBlock =
              item.display.showBestFor &&
              item.display.bestForMode === "block" &&
              item.bestFor.trim().length > 0
            const hasBestForList =
              item.display.showBestFor &&
              item.display.bestForMode === "list" &&
              item.bestForList.length > 0
            const hasYouGet = hasYouGetBlock || hasYouGetList
            const hasBestFor = hasBestForBlock || hasBestForList
            const hasDetails = hasYouGet || hasBestFor
            const imageWidth = Math.min(420, Math.max(80, Math.round(item.imageWidthPx ?? 240)))
            const hasIcon = (item.icon ?? "").trim().length > 0
            const hasStat = (item.stat ?? "").trim().length > 0
            const hasTag = (item.tag ?? "").trim().length > 0

            if (sectionVariant === "logo_tiles") {
              return (
                <div
                  key={`${item.title}-${idx}`}
                  className={cn(
                    "rounded-xl border border-border/40 bg-card/20 p-4",
                    "flex items-center justify-center",
                    resolved ? resolved.cardClass : toneClasses[cardTone]
                  )}
                  style={panelStyle}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title}
                      className="h-8 max-w-[120px] object-contain opacity-70 grayscale"
                    />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{item.title}</span>
                  )}
                </div>
              )
            }

            return (
              <Card
                key={`${item.title}-${idx}`}
                className={cn(
                  "gap-3",
                  DENSITY_PADDING[ui?.density ?? "standard"],
                  resolved
                    ? resolved.cardClass
                    : cn(toneClasses[cardTone], variantCardClass(sectionVariant))
                )}
                style={panelStyle}
              >
                {item.display.showImage && item.imageUrl ? (
                  <div className="flex justify-center px-4">
                    <div
                      className="overflow-hidden rounded-md border border-border/60 bg-card"
                      style={{ backgroundColor: "color-mix(in srgb, var(--card) calc(var(--page-panel-opacity, 1) * 100%), transparent)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt || item.title || "Card image"}
                        className="mx-auto h-auto max-w-full object-contain"
                        style={{ width: imageWidth }}
                      />
                    </div>
                  </div>
                ) : null}
                <CardHeader className="gap-1 px-4 pb-0">
                  {hasTag ? (
                    <span className="text-label-mono w-fit rounded-full border border-border/50 px-2 py-0.5 text-muted-foreground">
                      {item.tag}
                    </span>
                  ) : null}
                  {hasIcon ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : null}
                  {hasStat ? (
                    <p className="text-metric text-2xl">{item.stat}</p>
                  ) : null}
                  {item.display.showTitle ? (
                    <h3 className={cn(
                      "font-semibold leading-none",
                      sectionVariant === "value_pillars" ? "text-base" : "text-sm"
                    )}>
                      {item.title}
                    </h3>
                  ) : null}
                  {item.display.showText ? (
                    item.textHtml?.trim() ? (
                      <div
                        className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                        dangerouslySetInnerHTML={{ __html: item.textHtml }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    )
                  ) : null}
                </CardHeader>
                {hasDetails ? (
                  <CardContent className="space-y-2 px-4">
                    <Separator className="bg-border/60" />
                    <dl className="space-y-1 text-sm">
                      {hasYouGet ? (
                        <div className="flex flex-col gap-0.5">
                          <dt className="font-medium">You get:</dt>
                          {hasYouGetList ? (
                            <dd>
                              <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                                {item.youGet.map((entry, entryIndex) => (
                                  <li key={`${entry}-${entryIndex}`}>{entry}</li>
                                ))}
                              </ul>
                            </dd>
                          ) : (
                            <dd className="text-muted-foreground">{item.youGet.join(" · ")}</dd>
                          )}
                        </div>
                      ) : null}
                      {hasBestFor ? (
                        <div className="flex flex-col gap-0.5">
                          <dt className="font-medium">Best for:</dt>
                          {hasBestForList ? (
                            <dd>
                              <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                                {item.bestForList.map((entry, entryIndex) => (
                                  <li key={`${entry}-${entryIndex}`}>{entry}</li>
                                ))}
                              </ul>
                            </dd>
                          ) : (
                            <dd className="text-muted-foreground">{item.bestFor}</dd>
                          )}
                        </div>
                      ) : null}
                    </dl>
                  </CardContent>
                ) : null}
              </Card>
            )
          })}
        </div>
    </SectionShell>
  )
}
