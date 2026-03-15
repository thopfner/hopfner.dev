"use client"

/**
 * Shared selected-section action hook.
 * Used by both toolbar and inspector to ensure consistent save/publish/discard behavior.
 */

import { useCallback } from "react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { useVisualSectionPersistence } from "./use-visual-section-persistence"
import type { VisualSectionNode } from "./page-visual-editor-types"

export function useSelectedSectionActions() {
  const {
    pageState,
    selection,
    getDirtyDraft,
    clearDirtyDraft,
    isSectionDirty,
    setSaveStatus,
    reload,
  } = useVisualEditorStore()

  const { saveDraft, publishDraft } = useVisualSectionPersistence(pageState)

  const selectedNode = pageState?.sections.find(
    (s) => s.sectionId === selection?.sectionId
  ) ?? null

  const isDirty = selectedNode ? isSectionDirty(selectedNode.sectionId) : false
  const dirtyDraft = selectedNode ? getDirtyDraft(selectedNode.sectionId) : null

  const handleSave = useCallback(async () => {
    if (!selectedNode || !dirtyDraft) return
    setSaveStatus("saving")
    const result = await saveDraft(selectedNode as VisualSectionNode, dirtyDraft)
    if (result.success) {
      clearDirtyDraft(selectedNode.sectionId)
      setSaveStatus("saved")
      await reload()
    } else {
      setSaveStatus("error", result.error)
    }
  }, [selectedNode, dirtyDraft, saveDraft, clearDirtyDraft, setSaveStatus, reload])

  const handlePublish = useCallback(async () => {
    if (!selectedNode || !dirtyDraft) return
    setSaveStatus("publishing")
    const result = await publishDraft(selectedNode as VisualSectionNode, dirtyDraft)
    if (result.success) {
      clearDirtyDraft(selectedNode.sectionId)
      setSaveStatus("published")
      await reload()
    } else {
      setSaveStatus("error", result.error)
    }
  }, [selectedNode, dirtyDraft, publishDraft, clearDirtyDraft, setSaveStatus, reload])

  const handleDiscard = useCallback(() => {
    if (!selectedNode) return
    clearDirtyDraft(selectedNode.sectionId)
  }, [selectedNode, clearDirtyDraft])

  return {
    selectedNode,
    isDirty,
    dirtyDraft,
    handleSave,
    handlePublish,
    handleDiscard,
  }
}
