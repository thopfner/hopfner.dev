"use client"

import { useCallback, useMemo, useRef, useEffect } from "react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { VisualSectionNodeView } from "./page-visual-editor-node"
import type { VisualSectionNode } from "./page-visual-editor-types"

const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
} as const

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

  // Auto-scroll to selected section
  useEffect(() => {
    if (!selection?.sectionId || !canvasRef.current) return
    const el = canvasRef.current.querySelector(`[data-section-id="${selection.sectionId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
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
