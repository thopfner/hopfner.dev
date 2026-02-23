import Link from "next/link"
import type { CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type FooterLink = { label: string; href: string }
type FooterLinkGroup = { title?: string; links: FooterLink[] }

type FooterCard = {
  title?: string
  body?: string
  linksMode?: "flat" | "grouped"
  links?: FooterLink[]
  groups?: FooterLinkGroup[]
  subscribe?: { enabled?: boolean; placeholder?: string; buttonLabel?: string }
  ctaPrimary?: { label?: string; href?: string }
  ctaSecondary?: { label?: string; href?: string }
}

export function FooterGridSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  fullBleed,
  cards,
  brandText,
  legal,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  fullBleed?: boolean
  cards: FooterCard[]
  brandText?: string
  legal?: { copyright?: string; links?: FooterLink[] }
}) {
  return (
    <section id={sectionId} className={cn("scroll-mt-16 py-8", sectionClassName)} style={sectionStyle}>
      <div
        className={cn(
          fullBleed ? "mx-auto max-w-none space-y-6 px-0" : "mx-auto max-w-6xl space-y-6 px-4",
          containerClassName
        )}
        style={containerStyle}
      >
        <div className={cn("grid grid-cols-1 gap-4", cards.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1")}>
          {cards.map((card, idx) => {
            const title = (card.title ?? "").trim()
            const body = (card.body ?? "").trim()
            const linksMode = card.linksMode === "grouped" ? "grouped" : "flat"
            const flatLinks = (card.links ?? []).filter((lnk) => lnk?.label?.trim() || lnk?.href?.trim())
            const groups = (card.groups ?? []).filter((g) => (g?.title ?? "").trim() || (g?.links ?? []).length > 0)
            const subscribeEnabled = card.subscribe?.enabled === true
            const subscribePlaceholder = card.subscribe?.placeholder?.trim() || "Email Address"
            const subscribeButtonLabel = card.subscribe?.buttonLabel?.trim() || "Subscribe"
            const cta1Label = card.ctaPrimary?.label?.trim() || ""
            const cta1Href = card.ctaPrimary?.href?.trim() || ""
            const cta2Label = card.ctaSecondary?.label?.trim() || ""
            const cta2Href = card.ctaSecondary?.href?.trim() || ""

            return (
              <Card key={idx} className="relative border-border/60 bg-card/40" style={panelStyle}>
                <CardContent className="space-y-4 px-4 py-4">
                  {title ? <h3 className="text-sm font-semibold tracking-wide">{title}</h3> : null}
                  {body ? <p className="text-sm text-muted-foreground">{body}</p> : null}

                  {linksMode === "grouped" ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {groups.map((group, groupIdx) => {
                        const groupTitle = (group.title ?? "").trim()
                        const groupLinks = (group.links ?? []).filter((lnk) => lnk?.label?.trim() && lnk?.href?.trim())
                        if (!groupTitle && !groupLinks.length) return null
                        return (
                          <div key={groupIdx} className="space-y-2">
                            {groupTitle ? <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{groupTitle}</p> : null}
                            <ul className="space-y-1">
                              {groupLinks.map((lnk, i) => (
                                <li key={i}>
                                  <Link href={lnk.href} className="text-sm hover:underline">
                                    {lnk.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {flatLinks.map((lnk, i) => (
                        <li key={i}>
                          <Link href={lnk.href || "#"} className="text-sm hover:underline">
                            {lnk.label || lnk.href}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {subscribeEnabled ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        aria-label="Email address"
                        autoComplete="email"
                        placeholder={subscribePlaceholder}
                        className="h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <Button type="button" size="sm" className="w-full">
                        {subscribeButtonLabel}
                      </Button>
                    </div>
                  ) : null}

                  {cta1Label || cta2Label ? (
                    <div className="flex flex-wrap gap-2">
                      {cta1Label ? (
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={cta1Href || "#"}>{cta1Label}</Link>
                        </Button>
                      ) : null}
                      {cta2Label ? (
                        <Button size="sm" asChild>
                          <Link href={cta2Href || "#"}>{cta2Label}</Link>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>{legal?.copyright || "© 2026 Your Company"}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {(legal?.links ?? []).map((lnk, idx) => (
                <Link key={idx} href={lnk.href || "#"} className="hover:underline">
                  {lnk.label || "Link"}
                </Link>
              ))}
            </div>
          </div>
          {brandText?.trim() ? (
            <p className="pointer-events-none select-none text-4xl font-bold leading-none text-foreground/10 sm:text-6xl">
              {brandText}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
