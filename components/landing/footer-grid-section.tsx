import Link from "next/link"
import type { CSSProperties } from "react"

import { Button } from "@/components/ui/button"
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

function hasContent(s: string | undefined | null): boolean {
  return (s ?? "").trim().length > 0
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
  const legalLinks = (legal?.links ?? []).filter((l) => hasContent(l.label))

  return (
    <footer
      id={sectionId}
      className={cn("scroll-mt-16 border-t border-border/40 py-10 sm:py-14", sectionClassName)}
      style={sectionStyle}
    >
      <div
        className={cn(
          fullBleed ? "mx-auto max-w-none space-y-10 px-0" : "mx-auto max-w-5xl space-y-10 px-4",
          containerClassName
        )}
        style={containerStyle}
      >
        {/* Card grid */}
        <div className={cn(
          "grid grid-cols-1 gap-10",
          cards.length > 1 ? "md:grid-cols-2 lg:gap-14" : "md:grid-cols-1"
        )}>
          {cards.map((card, idx) => {
            const title = (card.title ?? "").trim()
            const body = (card.body ?? "").trim()
            const linksMode = card.linksMode === "grouped" ? "grouped" : "flat"
            const flatLinks = (card.links ?? []).filter((l) => hasContent(l.label))
            const groups = (card.groups ?? [])
              .map((g) => ({
                title: (g?.title ?? "").trim(),
                links: (g?.links ?? []).filter((l) => hasContent(l.label)),
              }))
              .filter((g) => g.title || g.links.length > 0)
            const subscribeEnabled = card.subscribe?.enabled === true
            const subscribePlaceholder = card.subscribe?.placeholder?.trim() || "Email address"
            const subscribeButtonLabel = card.subscribe?.buttonLabel?.trim() || "Subscribe"
            const cta1Label = card.ctaPrimary?.label?.trim() || ""
            const cta1Href = card.ctaPrimary?.href?.trim() || ""
            const cta2Label = card.ctaSecondary?.label?.trim() || ""
            const cta2Href = card.ctaSecondary?.href?.trim() || ""
            const hasLinks = linksMode === "grouped" ? groups.length > 0 : flatLinks.length > 0
            const hasCta = (cta1Label && cta1Href) || (cta2Label && cta2Href)

            return (
              <div key={idx} className="space-y-5" style={panelStyle}>
                {title ? (
                  <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
                ) : null}
                {body ? (
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
                ) : null}

                {/* Grouped links */}
                {hasLinks && linksMode === "grouped" ? (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                    {groups.map((group, groupIdx) => (
                      <div key={groupIdx} className="space-y-3">
                        {group.title ? (
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            {group.title}
                          </p>
                        ) : null}
                        <ul className="space-y-2">
                          {group.links.map((lnk, i) => (
                            <li key={i}>
                              <Link
                                href={lnk.href || "#"}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {lnk.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : hasLinks ? (
                  <ul className="space-y-2">
                    {flatLinks.map((lnk, i) => (
                      <li key={i}>
                        <Link
                          href={lnk.href || "#"}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {lnk.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* Subscribe */}
                {subscribeEnabled ? (
                  <div className="flex w-full max-w-sm items-center gap-2">
                    <input
                      type="email"
                      aria-label="Email address"
                      autoComplete="email"
                      placeholder={subscribePlaceholder}
                      className="h-9 flex-1 rounded-md border border-border/50 bg-background/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus-visible:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent/30"
                    />
                    <Button type="button" size="sm" variant="secondary" className="shrink-0">
                      {subscribeButtonLabel}
                    </Button>
                  </div>
                ) : null}

                {/* CTAs */}
                {hasCta ? (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {cta1Label && cta1Href ? (
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={cta1Href}>{cta1Label}</Link>
                      </Button>
                    ) : null}
                    {cta2Label && cta2Href ? (
                      <Button size="sm" asChild>
                        <Link href={cta2Href}>{cta2Label}</Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Legal bar */}
        <div className="space-y-3 border-t border-border/30 pt-6">
          <div className="flex flex-col gap-2 text-[11px] tracking-wide text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between">
            {legal?.copyright ? <p>{legal.copyright}</p> : null}
            {legalLinks.length > 0 ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {legalLinks.map((lnk, idx) => (
                  <Link
                    key={idx}
                    href={lnk.href || "#"}
                    className="transition-colors hover:text-muted-foreground"
                  >
                    {lnk.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {brandText?.trim() ? (
            <p className="pointer-events-none select-none text-4xl font-bold leading-none text-foreground/[0.06] sm:text-6xl">
              {brandText}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
