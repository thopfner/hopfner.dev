"use client"

import { useCallback, useRef, useState } from "react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import {
  versionRowToPayload,
  payloadToDraft,
  normalizeFormatting,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "./page-visual-editor-types"

// Token-snapped spacing scales
const PADDING_SCALE = [
  { value: "", label: "Default", px: 0 },
  { value: "py-4", label: "py-4", px: 16 },
  { value: "py-6", label: "py-6", px: 24 },
  { value: "py-8", label: "py-8", px: 32 },
  { value: "py-10", label: "py-10", px: 40 },
  { value: "py-12", label: "py-12", px: 48 },
]

function findClosestToken(dragDeltaPx: number, currentIdx: number, scale: typeof PADDING_SCALE): number {
  const stepsFromDelta = Math.round(dragDeltaPx / 20) // 20px per step
  const newIdx = Math.max(0, Math.min(scale.length - 1, currentIdx + stepsFromDelta))
  return newIdx
}

/**
 * Spacing handles shown on top/bottom of selected section.
 * Drag to snap through paddingY token values.
 */
export function SpacingHandles({ node }: { node: VisualSectionNode }) {
  const { pageState, selection, getDirtyDraft, setDirtyDraft } = useVisualEditorStore()
  const [dragging, setDragging] = useState<"top" | "bottom" | null>(null)
  const [previewLabel, setPreviewLabel] = useState("")
  const startYRef = useRef(0)
  const startIdxRef = useRef(0)

  const isSelected = selection?.sectionId === node.sectionId
  if (!isSelected || !pageState || node.isGlobal || node.isCustomComposed) return null

  // Get effective draft
  const dirtyDraft = getDirtyDraft(node.sectionId)
  let effectiveDraft: EditorDraft | null = dirtyDraft
  if (!effectiveDraft) {
    const version = node.draftVersion ?? node.publishedVersion
    if (!version) return null
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    effectiveDraft = payloadToDraft(payload, node.sectionType)
  }

  const originalDraft = (() => {
    const version = node.draftVersion ?? node.publishedVersion
    if (!version) return effectiveDraft
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, node.sectionType)
  })()

  const currentPaddingY = effectiveDraft?.formatting.paddingY ?? ""
  const currentIdx = PADDING_SCALE.findIndex((s) => s.value === currentPaddingY)

  const handleMouseDown = useCallback((edge: "top" | "bottom", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(edge)
    startYRef.current = e.clientY
    startIdxRef.current = currentIdx >= 0 ? currentIdx : 0

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = edge === "bottom" ? ev.clientY - startYRef.current : startYRef.current - ev.clientY
      const newIdx = findClosestToken(delta, startIdxRef.current, PADDING_SCALE)
      const token = PADDING_SCALE[newIdx]
      setPreviewLabel(token.label)

      if (effectiveDraft && originalDraft) {
        const newFormatting = { ...effectiveDraft.formatting, paddingY: token.value }
        const newDraft: EditorDraft = {
          ...effectiveDraft,
          formatting: normalizeFormatting(newFormatting as unknown as Record<string, unknown>),
        }
        setDirtyDraft(node.sectionId, newDraft, originalDraft)
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      setPreviewLabel("")
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }, [currentIdx, effectiveDraft, originalDraft, node.sectionId, setDirtyDraft])

  const handleCls = "absolute left-0 right-0 h-2 cursor-ns-resize z-30 group/handle flex items-center justify-center"
  const barCls = "w-12 h-0.5 rounded-full bg-blue-500/60 group-hover/handle:bg-blue-400 group-hover/handle:h-1 transition-all"

  return (
    <>
      {/* Top handle */}
      <div className={`${handleCls} -top-1`} onMouseDown={(e) => handleMouseDown("top", e)}>
        <div className={barCls} />
        {dragging === "top" && previewLabel && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-medium bg-blue-500 text-white rounded whitespace-nowrap">
            Section padding: {previewLabel}
          </div>
        )}
      </div>

      {/* Bottom handle */}
      <div className={`${handleCls} -bottom-1`} onMouseDown={(e) => handleMouseDown("bottom", e)}>
        <div className={barCls} />
        {dragging === "bottom" && previewLabel && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-medium bg-blue-500 text-white rounded whitespace-nowrap">
            Section padding: {previewLabel}
          </div>
        )}
      </div>
    </>
  )
}
