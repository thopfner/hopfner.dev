"use client"

import { useCallback } from "react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { useVisualSectionPersistence } from "./use-visual-section-persistence"

type Props = {
  sectionId: string
  onConfirm: (action: "save" | "discard" | "cancel") => void
}

export function VisualEditorDirtyDialog({ sectionId, onConfirm }: Props) {
  const { pageState, getDirtyDraft, setSaveStatus } = useVisualEditorStore()
  const { saveDraft } = useVisualSectionPersistence(pageState)

  const handleSaveAndSwitch = useCallback(async () => {
    if (!pageState) return onConfirm("cancel")

    const node = pageState.sections.find((s) => s.sectionId === sectionId)
    const draft = getDirtyDraft(sectionId)
    if (!node || !draft) return onConfirm("discard")

    setSaveStatus("saving")
    const result = await saveDraft(node, draft)
    if (result.success) {
      setSaveStatus("saved")
      onConfirm("save")
    } else {
      setSaveStatus("error", result.error)
      // Stay on current section if save fails
      onConfirm("cancel")
    }
  }, [pageState, sectionId, getDirtyDraft, saveDraft, setSaveStatus, onConfirm])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--mantine-color-dark-7)] border border-[var(--mantine-color-dark-4)] rounded-lg p-5 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-sm font-semibold text-[var(--mantine-color-text)] mb-2">
          Unsaved changes
        </h3>
        <p className="text-xs text-[var(--mantine-color-dimmed)] mb-4">
          This section has unsaved formatting changes. What would you like to do?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveAndSwitch}
            className="flex-1 px-3 py-2 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => onConfirm("discard")}
            className="flex-1 px-3 py-2 text-xs font-medium rounded bg-[var(--mantine-color-dark-5)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-4)] transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => onConfirm("cancel")}
            className="flex-1 px-3 py-2 text-xs font-medium rounded border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
