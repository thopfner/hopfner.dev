"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { Menu, X } from "lucide-react"

import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { EditableLinkSlot } from "@/components/landing/editable-link-slot"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HeaderNavLink = { label: string; href: string; anchorId?: string }

export function SiteHeader({
  links,
  logo,
  cta,
  containerClassName,
  topBackdropEnabled,
  navOverlayOpacity = 0.18,
}: {
  links: HeaderNavLink[]
  logo?: { url: string; alt: string; widthPx: number }
  cta: { label: string; href: string }
  containerClassName?: string
  topBackdropEnabled?: boolean
  navOverlayOpacity?: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHash, setActiveHash] = useState("")
  const pathname = usePathname()
  const menuId = useId()
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    const onClickOutside = (event: MouseEvent) => {
      if (!mobileOpen || !mobileMenuRef.current) {
        return
      }

      if (!mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("mousedown", onClickOutside)

    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const previousOverscrollBehavior = body.style.overscrollBehavior

    if (mobileOpen) {
      const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
      const computedPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight || "0") || 0

      body.style.overflow = "hidden"
      body.style.overscrollBehavior = "contain"

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`
      }
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("mousedown", onClickOutside)
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      body.style.overscrollBehavior = previousOverscrollBehavior
    }
  }, [mobileOpen])

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || "")

    updateHash()
    window.addEventListener("hashchange", updateHash)

    const anchors = links
      .map((item) => {
        // Derive anchor from href first (canonical), fall back to anchorId (legacy)
        const hrefAnchor = item.href.startsWith("#") ? item.href.slice(1).trim() : ""
        return hrefAnchor || item.anchorId?.trim() || ""
      })
      .filter((id): id is string => Boolean(id))

    if (!anchors.length) {
      return () => window.removeEventListener("hashchange", updateHash)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!visible?.target?.id) return
        setActiveHash(`#${visible.target.id}`)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.15, 0.3, 0.5] }
    )

    anchors.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener("hashchange", updateHash)
      observer.disconnect()
    }
  }, [links])

  const overlayOpacity = Math.min(0.6, Math.max(0, navOverlayOpacity))

  return (
    <header
      data-topbg={topBackdropEnabled ? "true" : "false"}
      className={cn(
        "sticky top-0 z-50",
        topBackdropEnabled
          ? "border-b border-border/10 bg-transparent"
          : "border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      )}
      style={
        topBackdropEnabled
          ? {
              backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
              backdropFilter: "blur(8px)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5",
          containerClassName
        )}
      >
        {logo ? (
          <Link href="/home" className="min-w-0 shrink rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img
              src={logo.url}
              alt={logo.alt}
              style={{ maxWidth: `${logo.widthPx}px` }}
              className="block h-11 w-auto object-contain"
            />
          </Link>
        ) : null}

        <nav aria-label="Top navigation" className="min-w-0 flex-1">
          <ul className="hidden flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm md:flex">
            {links.map((item, idx) => {
              const isAnchorLink = item.href.startsWith("#")
              const isActive = isAnchorLink
                ? activeHash === item.href || (item.anchorId ? activeHash === `#${item.anchorId}` : false)
                : pathname === item.href

              return (
                <li key={`${item.href}-${idx}`} className="flex items-center">
                  <EditableLinkSlot
                    labelPath={`content.links.${idx}.label`}
                    hrefPath={`content.links.${idx}.href`}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "truncate rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-foreground/15 font-medium text-foreground"
                          : "text-foreground/70 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </EditableLinkSlot>
                  {idx < links.length - 1 ? (
                    <span aria-hidden className="px-0.5 text-foreground/20">
                      ·
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </nav>

        <Button size="default" variant="gradient" asChild className="hidden shrink-0 md:inline-flex">
          <Link href={cta.href}><EditableLinkSlot labelPath="meta.ctaPrimaryLabel" hrefPath="meta.ctaPrimaryHref">{cta.label}</EditableLinkSlot></Link>
        </Button>

        <div className="relative md:hidden" ref={mobileMenuRef}>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 shrink-0 border-border/70 bg-background/70 text-foreground hover:bg-muted"
            aria-haspopup="menu"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </Button>

          <div
            id={menuId}
            role="menu"
            aria-label="Mobile navigation"
            aria-hidden={!mobileOpen}
            className={cn(
              "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-md border border-border bg-background p-2 shadow-lg transition-all duration-200",
              mobileOpen
                ? "pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none translate-x-2 opacity-0"
            )}
          >
            <ul className="space-y-1">
              {links.map((item, idx) => {
                const isAnchorLink = item.href.startsWith("#")
                const isActive = isAnchorLink
                  ? activeHash === item.href || (item.anchorId ? activeHash === `#${item.anchorId}` : false)
                  : pathname === item.href

                return (
                  <li key={`mobile-${item.href}-${idx}`}>
                    <EditableLinkSlot
                      labelPath={`content.links.${idx}.label`}
                      hrefPath={`content.links.${idx}.href`}
                    >
                      <Link
                        href={item.href}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "block rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive ? "bg-primary font-semibold text-primary-foreground" : "text-foreground hover:bg-muted"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </EditableLinkSlot>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}
