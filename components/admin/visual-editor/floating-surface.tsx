"use client"

/**
 * FloatingSurface — shared portaled floating panel for visual editor.
 * Used by page chooser, link picker, and other anchored surfaces.
 *
 * - Rendered via createPortal to document.body
 * - position: fixed, viewport-clamped
 * - outside-click close, Escape close
 * - strong opaque surface styling
 */

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"

type Props = {
  anchorRect: DOMRect | null
  open: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: number
  maxHeight?: number
  /** Preferred horizontal alignment relative to anchor */
  align?: "left" | "right" | "center"
  className?: string
}

export function FloatingSurface({
  anchorRect,
  open,
  onClose,
  children,
  maxWidth = 340,
  maxHeight = 400,
  align = "left",
  className = "",
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid the opening click from immediately closing
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handler)
    }
  }, [open, onClose])

  // Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener("keydown", handler, true)
    return () => document.removeEventListener("keydown", handler, true)
  }, [open, onClose])

  if (!open || !anchorRect) return null
  if (typeof document === "undefined") return null

  const pad = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Compute clamped position
  const effectiveMaxW = Math.min(maxWidth, vw - pad * 2)
  const effectiveMaxH = Math.min(maxHeight, vh - pad * 2)

  let left = align === "right"
    ? anchorRect.right - effectiveMaxW
    : align === "center"
    ? anchorRect.left + anchorRect.width / 2 - effectiveMaxW / 2
    : anchorRect.left

  left = Math.max(pad, Math.min(left, vw - effectiveMaxW - pad))
  const top = Math.min(anchorRect.bottom + 4, vh - effectiveMaxH - pad)

  const style: React.CSSProperties = {
    position: "fixed",
    top,
    left,
    width: effectiveMaxW,
    maxHeight: effectiveMaxH,
    zIndex: 99999,
  }

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={`bg-[#1a1b1e] border border-[#373a40] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col ${className}`}
    >
      <div className="overflow-y-auto overflow-x-hidden flex-1">
        {children}
      </div>
    </div>,
    document.body
  )
}
