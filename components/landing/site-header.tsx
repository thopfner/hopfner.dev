"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HeaderNavLink = { label: string; href: string; anchorId?: string }

export function SiteHeader({
  links,
  logo,
  cta,
  containerClassName,
}: {
  links: HeaderNavLink[]
  logo?: { url: string; alt: string; widthPx: number }
  cta: { label: string; href: string }
  containerClassName?: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
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

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("mousedown", onClickOutside)
    }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5",
          containerClassName
        )}
      >
        {logo ? (
          <Link href="/home" className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img
              src={logo.url}
              alt={logo.alt}
              style={{ width: `${logo.widthPx}px`, height: "auto" }}
              className="block object-contain"
            />
          </Link>
        ) : null}

        <nav aria-label="Top navigation" className="min-w-0 flex-1">
          <ul className="hidden flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm md:flex">
            {links.map((item, idx) => (
              <li key={`${item.href}-${idx}`} className="flex items-center">
                <Link
                  href={item.href}
                  className="truncate rounded-sm px-1 py-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
                {idx < links.length - 1 ? (
                  <span aria-hidden className="px-1 text-muted-foreground/70">
                    ·
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <Button size="sm" asChild className="hidden shrink-0 md:inline-flex">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>

        <div className="relative md:hidden" ref={mobileMenuRef}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            aria-haspopup="menu"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span aria-hidden className="text-base leading-none">
              ☰
            </span>
          </Button>

          {mobileOpen ? (
            <div
              id={menuId}
              role="menu"
              aria-label="Mobile navigation"
              className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-md border border-border bg-background p-2 shadow-lg"
            >
              <ul className="space-y-1">
                {links.map((item, idx) => (
                  <li key={`mobile-${item.href}-${idx}`}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      className="block rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-2 border-t border-border pt-2">
                <Button size="sm" asChild className="w-full" onClick={() => setMobileOpen(false)}>
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
