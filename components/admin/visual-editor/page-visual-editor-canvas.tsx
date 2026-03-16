"use client"

import { useMemo, useRef, useEffect } from "react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { VisualSectionNodeView } from "./page-visual-editor-node"
import type { VisualSectionNode } from "./page-visual-editor-types"

const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
} as const

/**
 * Scroll a target element into view within a specific scroll container.
 * Does NOT use element.scrollIntoView — that can escape to the wrong container.
 */
export function scrollContainerToElement(
  container: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior = "smooth"
) {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const relativeTop = targetRect.top - containerRect.top + container.scrollTop
  const targetCenter = relativeTop - containerRect.height / 2 + targetRect.height / 2

  container.scrollTo({ top: Math.max(0, targetCenter), behavior })
}

export function VisualEditorCanvas() {
  const { pageState, sectionOrder, viewport, selection } = useVisualEditorStore()
  const canvasRef = useRef<HTMLDivElement>(null)

  const orderedSections = useMemo(() => {
    if (!pageState) return []
    const map = new Map(pageState.sections.map((s) => [s.sectionId, s]))
    return sectionOrder
      .map((id) => map.get(id))
      .filter((s): s is VisualSectionNode => !!s)
  }, [pageState, sectionOrder])

  const canvasWidth = VIEWPORT_WIDTHS[viewport]

  // Auto-scroll: explicit canvas-container scroll when selection changes
  useEffect(() => {
    if (!selection?.sectionId || !canvasRef.current) return
    const target = canvasRef.current.querySelector(`[data-section-id="${selection.sectionId}"]`) as HTMLElement | null
    if (target) {
      scrollContainerToElement(canvasRef.current, target)
    }
  }, [selection?.sectionId])

  return (
    <div ref={canvasRef} className="flex-1 overflow-auto bg-[var(--mantine-color-dark-8)]">
      <div className="flex justify-center py-6 min-h-full">
        <div
          className={`transition-all duration-300 ease-out ${
            viewport !== "desktop" ? "shadow-[0_0_0_1px_var(--mantine-color-dark-4)]" : ""
          }`}
          style={{
            width: canvasWidth,
            maxWidth: "100%",
          }}
        >
          {orderedSections.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm text-[var(--mantine-color-dimmed)]">
              No sections on this page
            </div>
          ) : (
            <div className="space-y-0">
              {orderedSections.map((node) => (
                <div
                  key={node.sectionId}
                  data-section-id={node.sectionId}
                >
                  <VisualSectionNodeView node={node} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
