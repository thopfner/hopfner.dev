import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function WhatIDeliverSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  cards,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
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
  }>
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="services-title"
    style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)} style={containerStyle}>
        <SectionHeading id="services-title" title={title} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

            return (
            <Card
              key={`${item.title}-${idx}`}
              className="surface-panel interactive-lift gap-3 py-4"
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
                {item.display.showTitle ? (
                  <h3 className="text-sm font-semibold leading-none">
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
          )})}
        </div>
      </div>
    </section>
  )
}
