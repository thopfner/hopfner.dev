import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HeaderNavLink = { label: string; href: string; anchorId?: string }

export function SiteHeader({
  links,
  cta,
  containerClassName,
}: {
  links: HeaderNavLink[]
  cta: { label: string; href: string }
  containerClassName?: string
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5",
          containerClassName
        )}
      >
        <nav aria-label="Top navigation" className="min-w-0">
          <ul className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
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

        <Button size="sm" asChild className="shrink-0">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>
    </header>
  )
}
