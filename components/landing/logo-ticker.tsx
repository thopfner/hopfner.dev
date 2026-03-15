"use client"

import { useReducedMotion } from "framer-motion"
import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { useVisualEditing } from "@/components/landing/visual-editing-context"
import { cn } from "@/lib/utils"

type LogoTickerItem = {
  label: string
  imageUrl?: string
  icon?: string
}

export function LogoTicker({
  items,
  speed = 30,
  pauseOnHover = true,
  className,
  /** Field path prefix for editable labels (e.g. "content.items" or "content.logos") */
  editablePathPrefix,
}: {
  items: LogoTickerItem[]
  speed?: number
  pauseOnHover?: boolean
  className?: string
  editablePathPrefix?: string
}) {
  const reducedMotion = useReducedMotion()
  const ctx = useVisualEditing()
  const isVisualEditing = !!ctx

  if (!items.length) return null

  const renderItem = (item: LogoTickerItem, idx: number) => (
    <div
      key={idx}
      className="flex shrink-0 items-center gap-2 px-4"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.label}
          className="h-8 w-auto object-contain opacity-70 transition-opacity duration-300"
        />
      ) : item.icon ? (
        <span className="text-lg opacity-70 transition-opacity duration-300">
          {item.icon}
        </span>
      ) : null}
      {editablePathPrefix && isVisualEditing ? (
        <EditableTextSlot
          as="span"
          fieldPath={`${editablePathPrefix}.${idx}.label`}
          className="whitespace-nowrap text-xs font-medium text-muted-foreground/70 transition-opacity duration-300"
        >
          {item.label}
        </EditableTextSlot>
      ) : (
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground/70 transition-opacity duration-300">
          {item.label}
        </span>
      )}
    </div>
  )

  // Visual editing active OR reduced motion: render as stable editable row
  if (reducedMotion || isVisualEditing) {
    return (
      <div
        role="marquee"
        aria-label="Logo showcase"
        className={cn("flex flex-wrap items-center justify-center gap-2 overflow-hidden", className)}
      >
        {items.map((item, idx) => renderItem(item, idx))}
      </div>
    )
  }

  const animationCSS = `
    @keyframes logo-ticker-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    ${pauseOnHover ? ".logo-ticker-area:hover .logo-ticker-track { animation-play-state: paused !important; }" : ""}
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationCSS }} />
      <div
        role="marquee"
        aria-label="Logo showcase"
        className={cn("logo-ticker-area overflow-hidden", className)}
      >
        <div
          className="logo-ticker-track flex w-max items-center"
          style={{
            animation: `logo-ticker-scroll ${speed}s linear infinite`,
          }}
        >
          {items.map((item, idx) => renderItem(item, idx))}
          {items.map((item, idx) => renderItem(item, idx + items.length))}
        </div>
      </div>
    </>
  )
}
