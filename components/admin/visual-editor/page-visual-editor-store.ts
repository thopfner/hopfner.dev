/**
 * Visual editor store — React context-based state management.
 * All state is ephemeral (not persisted to DB).
 * Canonical persistence goes through existing section version writes.
 */

"use client"

import { createContext, useContext } from "react"
import type {
  VisualEditorSelection,
  VisualEditorDirtyState,
  VisualEditorSaveStatus,
  VisualPageState,
} from "./page-visual-editor-types"
import type { EditorDraft } from "@/components/admin/section-editor/types"

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

export type VisualEditorStoreValue = {
  pageState: VisualPageState | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>

  selection: VisualEditorSelection
  setSelection: (sel: VisualEditorSelection) => void

  sectionOrder: string[]
  setSectionOrder: (order: string[]) => void
  orderDirty: boolean

  dirtyStates: Map<string, VisualEditorDirtyState>
  getDirtyDraft: (sectionId: string) => EditorDraft | null
  setDirtyDraft: (sectionId: string, draft: EditorDraft, original: EditorDraft) => void
  clearDirtyDraft: (sectionId: string) => void
  isSectionDirty: (sectionId: string) => boolean

  saveStatus: VisualEditorSaveStatus
  saveError: string | null
  setSaveStatus: (status: VisualEditorSaveStatus, error?: string) => void

  viewport: "desktop" | "tablet" | "mobile"
  setViewport: (vp: "desktop" | "tablet" | "mobile") => void

  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

  /** Unsaved page-level settings draft for live preview */
  pageSettingsDraft: { bgImageUrl: string; formattingOverride: Record<string, unknown> } | null
  setPageSettingsDraft: (draft: { bgImageUrl: string; formattingOverride: Record<string, unknown> } | null) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const VisualEditorContext = createContext<VisualEditorStoreValue | null>(null)

export function useVisualEditorStore(): VisualEditorStoreValue {
  const ctx = useContext(VisualEditorContext)
  if (!ctx) throw new Error("useVisualEditorStore must be used within VisualEditorContext.Provider")
  return ctx
}
