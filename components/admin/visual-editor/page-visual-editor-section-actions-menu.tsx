"use client"

/**
 * Section-level context actions menu.
 * Shows insert above/below, duplicate, hide/show, delete actions.
 */

import { useState, useRef, useCallback } from "react"
import {
  IconDotsVertical,
  IconArrowUp,
  IconArrowDown,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react"
import { FloatingSurface } from "./floating-surface"
import { SectionLibrary } from "./page-visual-editor-section-library"
import { usePageCompositionActions } from "./use-page-composition-actions"
import type { VisualSectionNode } from "./page-visual-editor-types"

type Props = {
  node: VisualSectionNode
}

export function SectionActionsMenu({ node }: Props) {
  const [open, setOpen] = useState(false)
  const [insertMode, setInsertMode] = useState<"above" | "below" | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const { insertRelative, duplicateSection, deleteSection, toggleSection } = usePageCompositionActions()

  const handleOpen = useCallback(() => {
    if (triggerRef.current) setAnchorRect(triggerRef.current.getBoundingClientRect())
    setOpen(true)
    setConfirmDelete(false)
    setInsertMode(null)
  }, [])

  const handleInsert = useCallback(async (sectionType: string) => {
    if (!insertMode) return
    await insertRelative(node.sectionId, insertMode, sectionType)
    setInsertMode(null)
  }, [insertMode, insertRelative, node.sectionId])

  const handleDuplicate = useCallback(async () => {
    setOpen(false)
    await duplicateSection(node.sectionId)
  }, [duplicateSection, node.sectionId])

  const handleDelete = useCallback(async () => {
    setOpen(false)
    await deleteSection(node.sectionId)
  }, [deleteSection, node.sectionId])

  const handleToggle = useCallback(async () => {
    setOpen(false)
    await toggleSection(node.sectionId)
  }, [toggleSection, node.sectionId])

  const menuItemCls = "w-full text-left px-3 py-1.5 text-xs text-[#c1c2c5] hover:bg-[#2c2e33] rounded transition-colors flex items-center gap-2"

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); handleOpen() }}
        onMouseDown={(e) => e.stopPropagation()}
        className="p-1 rounded text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-5)] transition-colors"
        title="Section actions"
      >
        <IconDotsVertical size={14} />
      </button>

      <FloatingSurface anchorRect={anchorRect} open={open} onClose={() => setOpen(false)} maxWidth={220} maxHeight={320}>
        <div className="p-1 space-y-0.5">
          <button type="button" className={menuItemCls} onClick={() => { setOpen(false); setInsertMode("above"); if (triggerRef.current) setAnchorRect(triggerRef.current.getBoundingClientRect()) }}>
            <IconArrowUp size={13} /> Insert above
          </button>
          <button type="button" className={menuItemCls} onClick={() => { setOpen(false); setInsertMode("below"); if (triggerRef.current) setAnchorRect(triggerRef.current.getBoundingClientRect()) }}>
            <IconArrowDown size={13} /> Insert below
          </button>
          <div className="border-t border-[#2c2e33] my-1" />
          <button type="button" className={menuItemCls} onClick={handleDuplicate}>
            <IconCopy size={13} /> Duplicate
          </button>
          <button type="button" className={menuItemCls} onClick={handleToggle}>
            {node.enabled ? <><IconEyeOff size={13} /> Hide</> : <><IconEye size={13} /> Show</>}
          </button>
          {!node.isGlobal && (
            <>
              <div className="border-t border-[#2c2e33] my-1" />
              {confirmDelete ? (
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[10px] text-red-400 font-medium">Delete this section? This cannot be undone.</p>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={handleDelete} className="flex-1 px-2 py-1 text-[10px] font-medium rounded bg-red-600 text-white hover:bg-red-500 transition-colors">
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 px-2 py-1 text-[10px] font-medium rounded bg-[#2c2e33] text-[#c1c2c5] hover:bg-[#373a40] transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className={`${menuItemCls} text-red-400 hover:text-red-300`} onClick={() => setConfirmDelete(true)}>
                  <IconTrash size={13} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </FloatingSurface>

      {/* Insert section library */}
      {insertMode && (
        <SectionLibrary
          onSelect={handleInsert}
          anchorRect={anchorRect}
          open={!!insertMode}
          onClose={() => setInsertMode(null)}
        />
      )}
    </>
  )
}
