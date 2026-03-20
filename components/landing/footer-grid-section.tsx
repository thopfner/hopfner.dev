import Link from "next/link"
import type { CSSProperties } from "react"

import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { EditableLinkSlot } from "@/components/landing/editable-link-slot"
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
  ctaPrimary?: { label?: string; href?: string; enabled?: boolean }
  ctaSecondary?: { label?: string; href?: string; enabled?: boolean }
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
            const cta1Enabled = (card.ctaPrimary as Record<string, unknown> | undefined)?.enabled !== false
            const cta1Label = card.ctaPrimary?.label?.trim() || ""
            const cta1Href = card.ctaPrimary?.href?.trim() || ""
            const cta2Enabled = (card.ctaSecondary as Record<string, unknown> | undefined)?.enabled !== false
            const cta2Label = card.ctaSecondary?.label?.trim() || ""
            const cta2Href = card.ctaSecondary?.href?.trim() || ""
            const hasLinks = linksMode === "grouped" ? groups.length > 0 : flatLinks.length > 0
            const hasCta = (cta1Enabled && cta1Label && cta1Href) || (cta2Enabled && cta2Label && cta2Href)

            return (
              <div key={idx} className="space-y-5" style={panelStyle}>
                {title ? (
                  <EditableTextSlot as="h3" fieldPath={`content.cards.${idx}.title`} className="text-base font-semibold tracking-tight text-foreground">{title}</EditableTextSlot>
                ) : null}
                {body ? (
                  <EditableTextSlot as="p" fieldPath={`content.cards.${idx}.body`} className="max-w-sm text-sm leading-relaxed text-muted-foreground" multiline>{body}</EditableTextSlot>
                ) : null}

                {/* Grouped links */}
                {hasLinks && linksMode === "grouped" ? (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                    {groups.map((group, groupIdx) => (
                      <div key={groupIdx} className="space-y-3">
                        {group.title ? (
                          <EditableTextSlot as="p" fieldPath={`content.cards.${idx}.groups.${groupIdx}.title`} className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            {group.title}
                          </EditableTextSlot>
                        ) : null}
                        <ul className="space-y-2">
                          {group.links.map((lnk, lnkIdx) => (
                            <li key={lnkIdx}>
                              <EditableLinkSlot
                                labelPath={`content.cards.${idx}.groups.${groupIdx}.links.${lnkIdx}.label`}
                                hrefPath={`content.cards.${idx}.groups.${groupIdx}.links.${lnkIdx}.href`}
                              >
                                <Link
                                  href={lnk.href || "#"}
                                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  {lnk.label}
                                </Link>
                              </EditableLinkSlot>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : hasLinks ? (
                  <ul className="space-y-2">
                    {flatLinks.map((lnk, lnkIdx) => (
                      <li key={lnkIdx}>
                        <EditableLinkSlot
                          labelPath={`content.cards.${idx}.links.${lnkIdx}.label`}
                          hrefPath={`content.cards.${idx}.links.${lnkIdx}.href`}
                        >
                          <Link
                            href={lnk.href || "#"}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {lnk.label}
                          </Link>
                        </EditableLinkSlot>
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
                      <EditableTextSlot as="span" fieldPath={`content.cards.${idx}.subscribe.buttonLabel`}>{subscribeButtonLabel}</EditableTextSlot>
                    </Button>
                  </div>
                ) : null}

                {/* CTAs */}
                {hasCta ? (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {cta1Enabled && cta1Label && cta1Href ? (
                      <Button size="sm" variant="gradient" asChild>
                        <Link href={cta1Href}><EditableLinkSlot labelPath={`content.cards.${idx}.ctaPrimary.label`} hrefPath={`content.cards.${idx}.ctaPrimary.href`}>{cta1Label}</EditableLinkSlot></Link>
                      </Button>
                    ) : null}
                    {cta2Enabled && cta2Label && cta2Href ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={cta2Href}><EditableLinkSlot labelPath={`content.cards.${idx}.ctaSecondary.label`} hrefPath={`content.cards.${idx}.ctaSecondary.href`}>{cta2Label}</EditableLinkSlot></Link>
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
            {legal?.copyright ? <EditableTextSlot as="p" fieldPath="content.legal.copyright">{legal.copyright}</EditableTextSlot> : null}
            {legalLinks.length > 0 ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {legalLinks.map((lnk, legalIdx) => (
                  <EditableLinkSlot
                    key={legalIdx}
                    labelPath={`content.legal.links.${legalIdx}.label`}
                    hrefPath={`content.legal.links.${legalIdx}.href`}
                  >
                    <Link
                      href={lnk.href || "#"}
                      className="transition-colors hover:text-muted-foreground"
                    >
                      {lnk.label}
                    </Link>
                  </EditableLinkSlot>
                ))}
              </div>
            ) : null}
          </div>
          {brandText?.trim() ? (
            <EditableTextSlot as="p" fieldPath="content.brandText" className="pointer-events-none select-none text-4xl font-bold leading-none text-foreground/[0.06] sm:text-6xl">
              {brandText}
            </EditableTextSlot>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
