"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { VisualEditorContext, type VisualEditorStoreValue } from "./page-visual-editor-store"
import { VisualEditorToolbar } from "./page-visual-editor-toolbar"
import { VisualEditorStructure } from "./page-visual-editor-structure"
import { VisualEditorCanvas } from "./page-visual-editor-canvas"
import { VisualEditorInspector } from "./page-visual-editor-inspector"
import { VisualEditorDirtyDialog } from "./page-visual-editor-dirty-dialog"
import { loadPageVisualState } from "@/lib/admin/visual-editor/load-page-visual-state"
import type {
  VisualEditorSelection,
  VisualEditorDirtyState,
  VisualEditorSaveStatus,
  VisualPageState,
} from "./page-visual-editor-types"
import type { EditorDraft } from "@/components/admin/section-editor/types"

export function PageVisualEditor({ pageId }: { pageId: string }) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [pageState, setPageState] = useState<VisualPageState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selection, setSelectionRaw] = useState<VisualEditorSelection>(null)
  const [pendingSelection, setPendingSelection] = useState<VisualEditorSelection | undefined>(undefined)
  const [sectionOrder, setSectionOrderRaw] = useState<string[]>([])
  const [initialOrder, setInitialOrder] = useState<string[]>([])
  const [dirtyStates, setDirtyStates] = useState<Map<string, VisualEditorDirtyState>>(new Map())
  const [saveStatus, setSaveStatusRaw] = useState<VisualEditorSaveStatus>("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [pageSettingsDraft, setPageSettingsDraft] = useState<{ bgImageUrl: string; formattingOverride: Record<string, unknown> } | null>(null)

  // Auto-clear save status after delay
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const state = await loadPageVisualState(pageId)
      setPageState(state)
      const order = state.sections
        .sort((a, b) => a.position - b.position)
        .map((s) => s.sectionId)
      setSectionOrderRaw(order)
      setInitialOrder(order)
    } catch (err) {
      console.error("Visual editor load failed:", err)
      setError(err instanceof Error ? err.message : "Failed to load page data")
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const orderDirty = useMemo(
    () => JSON.stringify(sectionOrder) !== JSON.stringify(initialOrder),
    [sectionOrder, initialOrder],
  )

  // ---------------------------------------------------------------------------
  // Store methods
  // ---------------------------------------------------------------------------
  const setSectionOrder = useCallback((order: string[]) => {
    setSectionOrderRaw(order)
  }, [])

  const getDirtyDraft = useCallback((sectionId: string): EditorDraft | null => {
    return dirtyStates.get(sectionId)?.draft ?? null
  }, [dirtyStates])

  // Undo/redo stack
  const undoStackRef = useRef<Map<string, EditorDraft>[]>([])
  const redoStackRef = useRef<Map<string, EditorDraft>[]>([])
  const MAX_UNDO = 50

  const setDirtyDraft = useCallback((sectionId: string, draft: EditorDraft, original: EditorDraft) => {
    setDirtyStates((prev) => {
      // Push current state to undo stack before changing
      const snapshot = new Map<string, EditorDraft>()
      prev.forEach((v, k) => snapshot.set(k, v.draft))
      undoStackRef.current.push(snapshot)
      if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift()
      redoStackRef.current = [] // clear redo on new change

      const next = new Map(prev)
      next.set(sectionId, { sectionId, draft, originalDraft: original })
      return next
    })
  }, [])

  const clearDirtyDraft = useCallback((sectionId: string) => {
    setDirtyStates((prev) => {
      const next = new Map(prev)
      next.delete(sectionId)
      return next
    })
  }, [])

  const isSectionDirty = useCallback((sectionId: string): boolean => {
    return dirtyStates.has(sectionId)
  }, [dirtyStates])

  // Guarded selection: if current section is dirty, prompt before switching
  const setSelection = useCallback((sel: VisualEditorSelection) => {
    if (
      selection?.sectionId &&
      sel?.sectionId !== selection.sectionId &&
      dirtyStates.has(selection.sectionId)
    ) {
      setPendingSelection(sel)
      return
    }
    setSelectionRaw(sel)
  }, [selection, dirtyStates])

  const confirmSelectionChange = useCallback((action: "save" | "discard" | "cancel") => {
    if (action === "cancel") {
      setPendingSelection(undefined)
      return
    }
    if (selection?.sectionId) {
      // Clear dirty state after both save and discard
      setDirtyStates((prev) => {
        const next = new Map(prev)
        next.delete(selection.sectionId)
        return next
      })
    }
    if (pendingSelection !== undefined) {
      setSelectionRaw(pendingSelection)
      setPendingSelection(undefined)
    }
  }, [selection, pendingSelection])

  // Undo function
  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return
    const snapshot = undoStackRef.current.pop()!
    // Save current state to redo stack
    const currentSnapshot = new Map<string, EditorDraft>()
    dirtyStates.forEach((v, k) => currentSnapshot.set(k, v.draft))
    redoStackRef.current.push(currentSnapshot)
    // Restore from snapshot
    setDirtyStates((prev) => {
      const next = new Map<string, VisualEditorDirtyState>()
      snapshot.forEach((draft, sectionId) => {
        const existing = prev.get(sectionId)
        next.set(sectionId, { sectionId, draft, originalDraft: existing?.originalDraft ?? draft })
      })
      return next
    })
  }, [dirtyStates])

  // Redo function
  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return
    const snapshot = redoStackRef.current.pop()!
    // Save current state to undo stack
    const currentSnapshot = new Map<string, EditorDraft>()
    dirtyStates.forEach((v, k) => currentSnapshot.set(k, v.draft))
    undoStackRef.current.push(currentSnapshot)
    // Restore from snapshot
    setDirtyStates((prev) => {
      const next = new Map<string, VisualEditorDirtyState>()
      snapshot.forEach((draft, sectionId) => {
        const existing = prev.get(sectionId)
        next.set(sectionId, { sectionId, draft, originalDraft: existing?.originalDraft ?? draft })
      })
      return next
    })
  }, [dirtyStates])

  // Keyboard navigation + shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd+Z / Ctrl+Z — Undo
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      // Cmd+Shift+Z / Ctrl+Shift+Z — Redo
      if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }

      // Skip for form inputs (arrow nav + other shortcuts below)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return

      // Arrow key section navigation
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        const currentIdx = selection?.sectionId
          ? sectionOrder.indexOf(selection.sectionId)
          : -1

        let nextIdx: number
        if (e.key === "ArrowUp") {
          nextIdx = currentIdx <= 0 ? sectionOrder.length - 1 : currentIdx - 1
        } else {
          nextIdx = currentIdx >= sectionOrder.length - 1 ? 0 : currentIdx + 1
        }

        if (sectionOrder[nextIdx]) {
          setSelection({ sectionId: sectionOrder[nextIdx] })
        }
        return
      }

      // Escape — deselect
      if (e.key === "Escape") {
        setSelection(null)
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selection, sectionOrder, setSelection, undo, redo])

  const setSaveStatus = useCallback((status: VisualEditorSaveStatus, err?: string) => {
    setSaveStatusRaw(status)
    setSaveError(err ?? null)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (status === "saved" || status === "published") {
      saveTimerRef.current = setTimeout(() => setSaveStatusRaw("idle"), 3000)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  const storeValue: VisualEditorStoreValue = useMemo(() => ({
    pageState,
    loading,
    error,
    reload: loadData,
    selection,
    setSelection,
    sectionOrder,
    setSectionOrder,
    orderDirty,
    dirtyStates,
    getDirtyDraft,
    setDirtyDraft,
    clearDirtyDraft,
    isSectionDirty,
    saveStatus,
    saveError,
    setSaveStatus,
    viewport,
    setViewport,
    undo,
    redo,
    canUndo: undoStackRef.current.length > 0,
    canRedo: redoStackRef.current.length > 0,
    pageSettingsDraft,
    setPageSettingsDraft,
  }), [
    pageState, loading, error, loadData,
    selection, setSelection, sectionOrder, setSectionOrder, orderDirty,
    dirtyStates, getDirtyDraft, setDirtyDraft, clearDirtyDraft, isSectionDirty,
    saveStatus, saveError, setSaveStatus,
    viewport, undo, redo,
    pageSettingsDraft, setPageSettingsDraft,
  ])

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-56px)] bg-[var(--mantine-color-dark-8)]">
        <div className="text-center space-y-3">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full mx-auto" />
          <p className="text-sm text-[var(--mantine-color-dimmed)]">Loading visual editor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-56px)] bg-[var(--mantine-color-dark-8)]">
        <div className="text-center space-y-3 max-w-md px-6">
          <p className="text-sm text-red-400 font-medium">Failed to load page</p>
          <p className="text-xs text-[var(--mantine-color-dimmed)]">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2 text-xs rounded bg-[var(--mantine-color-dark-5)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-4)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <VisualEditorContext.Provider value={storeValue}>
      {/* Negative margin to counteract admin shell padding */}
      <div className="-m-3 sm:-m-[18px]">
      <div className="flex flex-col h-[calc(100dvh-56px)] overflow-hidden bg-[var(--mantine-color-dark-8)]">
        <VisualEditorToolbar />
        <div className="flex flex-1 overflow-hidden">
          <VisualEditorStructure />
          <VisualEditorCanvas />
          <VisualEditorInspector />
        </div>
      </div>

      {/* Dirty state confirmation dialog */}
      {pendingSelection !== undefined && selection?.sectionId && (
        <VisualEditorDirtyDialog
          sectionId={selection.sectionId}
          onConfirm={confirmSelectionChange}
        />
      )}
    </div>
    </VisualEditorContext.Provider>
  )
}
