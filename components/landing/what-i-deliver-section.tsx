import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/landing/motion-primitives"
import { SectionIcon } from "@/components/landing/section-icon"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import {
  DENSITY_PADDING,
  DENSITY_GAP,
  DENSITY_HEADER_PADDING,
  DENSITY_BODY_PADDING,
  GRID_GAP_CLASSES,
  LABEL_STYLE_CLASSES,
  SUBTITLE_SIZE_CLASSES,
} from "@/lib/design-system/presentation"
import { resolveCardClasses, SERVICE_CARD_INNER } from "@/lib/design-system/component-families"

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
  columns,
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
  columns?: 2 | 3 | 4
  ui?: ResolvedSectionUi
}) {
  const effectiveColumns = columns ?? 3
  const gridCols =
    effectiveColumns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : effectiveColumns === 4
        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"

  const density = ui?.density ?? "standard"
  const isServiceFamily = ui?.componentFamily === "service"
  const dividerMode = ui?.dividerMode ?? "none"
  const labelStyle = ui?.labelStyle ?? "default"
  const headingId = sectionId ? `${sectionId}-heading` : "services-title"

  const resolved = resolveCardClasses(ui?.componentFamily, ui?.componentChrome, ui?.accentRule)

  const xlOrphan = effectiveColumns >= 3 && cards.length % 3 === 1

  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0

  // Internal card divider strength based on dividerMode
  const cardSeparatorClass =
    dividerMode === "strong"
      ? "bg-border/70"
      : dividerMode === "subtle"
        ? "bg-border/30"
        : "bg-border/50"

  // Inline accent indicator
  const showInlineAccent = resolved?.isInlineAccent ?? false

  return (
    <SectionShell
      id={sectionId}
      labelledBy={headingId}
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
        <FadeIn>
          <div className="space-y-1">
            {hasEyebrow ? (
              <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>
                {eyebrow}
              </p>
            ) : null}
            <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
            {hasSubtitle ? (
              <p className={cn("max-w-2xl text-muted-foreground", SUBTITLE_SIZE_CLASSES[ui?.subtitleSize ?? "sm"])}>{subtitle}</p>
            ) : null}
          </div>
        </FadeIn>

        <StaggerContainer className={cn("grid", GRID_GAP_CLASSES[ui?.gridGap ?? "standard"], gridCols)}>
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

            // Service family: enhanced internal structure
            if (isServiceFamily) {
              return (
                <StaggerItem key={`${item.title}-${idx}`} className={cn("h-full row-span-2 grid grid-rows-subgrid", xlOrphan && idx === cards.length - 1 && "xl:col-start-2")}>
                <Card
                  className={cn(
                    "h-full grid grid-rows-subgrid row-span-2 gap-0 overflow-hidden",
                    DENSITY_PADDING[density],
                    resolved?.cardClass
                  )}
                  style={panelStyle}
                >
                  {/* Subgrid row 1: header + body content */}
                  <div className="flex flex-col">
                    <CardHeader className={cn(
                      DENSITY_HEADER_PADDING[density],
                      SERVICE_CARD_INNER.headerClass,
                      DENSITY_GAP[density]
                    )}>
                      {showInlineAccent ? (
                        <div className="h-0.5 w-8 rounded-full bg-accent/50" />
                      ) : null}
                      {hasTag ? (
                        <span className={cn("w-fit", LABEL_STYLE_CLASSES[labelStyle])}>
                          {item.tag}
                        </span>
                      ) : null}
                      {hasIcon ? (
                        <SectionIcon icon={item.icon} size={density === "tight" ? "sm" : "md"} />
                      ) : null}
                      {hasStat ? (
                        <p className="text-metric text-2xl">{item.stat}</p>
                      ) : null}
                      {item.display.showTitle ? (
                        <h3 className={SERVICE_CARD_INNER.titleClass}>
                          {item.title}
                        </h3>
                      ) : null}
                    </CardHeader>

                    <div className={cn(
                      "flex-1",
                      DENSITY_BODY_PADDING[density],
                      density === "airy" ? "space-y-4" : density === "tight" ? "space-y-1.5" : "space-y-3"
                    )}>
                      {item.display.showImage && item.imageUrl ? (
                        <div className="flex justify-center">
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
                      {item.display.showText ? (
                        item.textHtml?.trim() ? (
                          <div
                            className={cn(SERVICE_CARD_INNER.bodyClass, RICH_TEXT_CLASS)}
                            dangerouslySetInnerHTML={{ __html: item.textHtml }}
                          />
                        ) : (
                          <p className={SERVICE_CARD_INNER.bodyClass}>{item.text}</p>
                        )
                      ) : null}
                    </div>
                  </div>
                  {/* Subgrid row 2: details (aligned across cards via subgrid) */}
                  {hasDetails ? (
                    <div className={cn(
                      DENSITY_BODY_PADDING[density],
                      density === "airy" ? "space-y-2.5" : "space-y-2"
                    )}>
                      <Separator className={cardSeparatorClass} />
                      <dl className={cn("text-sm", density === "airy" ? "space-y-4" : density === "tight" ? "space-y-2" : "space-y-3")}>
                        {hasYouGet ? (
                          <div className="flex flex-col gap-0.5">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-foreground/80">You get:</dt>
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
                            <dt className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Best for:</dt>
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
                    </div>
                  ) : <div />}
                </Card>
                </StaggerItem>
              )
            }

            // Default / other families
            return (
              <StaggerItem key={`${item.title}-${idx}`} className={cn("h-full row-span-2 grid grid-rows-subgrid", xlOrphan && idx === cards.length - 1 && "xl:col-start-2")}>
              <Card
                className={cn(
                  "h-full grid grid-rows-subgrid row-span-2",
                  DENSITY_GAP[density],
                  DENSITY_PADDING[density],
                  resolved.cardClass
                )}
                style={panelStyle}
              >
                {/* Subgrid row 1: card header content */}
                <div className={cn("flex flex-col", DENSITY_GAP[density])}>
                  {showInlineAccent ? (
                    <div className="mx-4 h-0.5 w-8 rounded-full bg-accent/50" />
                  ) : null}
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
                  <CardHeader className={cn(DENSITY_HEADER_PADDING[density], DENSITY_GAP[density])}>
                    {hasTag ? (
                      <span className={cn("w-fit", LABEL_STYLE_CLASSES[labelStyle])}>
                        {item.tag}
                      </span>
                    ) : null}
                    {hasIcon ? (
                      <SectionIcon icon={item.icon} size={density === "tight" ? "sm" : "md"} />
                    ) : null}
                    {hasStat ? (
                      <p className="text-metric text-2xl">{item.stat}</p>
                    ) : null}
                    {item.display.showTitle ? (
                      <h3 className="text-sm font-semibold leading-none text-foreground">
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
                </div>
                {/* Subgrid row 2: details (aligned across cards via subgrid) */}
                {hasDetails ? (
                  <CardContent className={cn(DENSITY_BODY_PADDING[density], density === "airy" ? "space-y-2.5" : "space-y-2")}>
                    <Separator className={cardSeparatorClass} />
                    <dl className={cn("text-sm", density === "airy" ? "space-y-4" : density === "tight" ? "space-y-2" : "space-y-3")}>
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
                ) : <div />}
              </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
    </SectionShell>
  )
}
