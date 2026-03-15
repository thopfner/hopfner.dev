"use client"

/**
 * Visual editing context — active only inside admin visual editor preview.
 *
 * When this provider is NOT mounted (public frontend), the slot components
 * degrade to plain text/link output with zero overhead.
 *
 * When mounted (admin SectionPreview), slot components gain in-place editing
 * behavior that writes back to existing draft payload paths.
 */

import { createContext, useContext, useCallback, useState, type ReactNode } from "react"

export type FieldPath = string // e.g. "meta.title", "content.cards.0.title"

export type LinkResources = {
  currentPageId: string
  loadPages: () => Promise<Array<{ id: string; slug: string; title: string }>>
  loadAnchors: (pageId: string) => Promise<string[]>
}

export type VisualEditingState = {
  sectionId: string
  /** Currently focused field (hover/click affordance visible) */
  focusedField: FieldPath | null
  /** Currently editing field (input is active) */
  editingField: FieldPath | null
  /** Link editor open for this field path */
  linkEditField: FieldPath | null
  /** Rich-text editor open for this field path */
  richEditField: FieldPath | null

  // Actions
  focusField: (path: FieldPath) => void
  blurField: () => void
  startEdit: (path: FieldPath) => void
  commitEdit: (path: FieldPath, value: string) => void
  cancelEdit: () => void
  openLinkEditor: (path: FieldPath) => void
  closeLinkEditor: () => void
  openRichEditor: (path: FieldPath) => void
  closeRichEditor: () => void

  /** Read a field value from the current draft */
  getFieldValue: (path: FieldPath) => string
  /** Read a structured field value (object/array) from the draft */
  getStructuredFieldValue: (path: FieldPath) => unknown
  /** Update a field value in the current draft */
  updateField: (path: FieldPath, value: string) => void
  /** Update a structured field value (object/array) in the draft */
  updateStructuredField: (path: FieldPath, value: unknown) => void

  /** Link editing resources (pages, anchors) — loaded lazily */
  linkResources?: LinkResources
}

const VisualEditingContext = createContext<VisualEditingState | null>(null)

/**
 * Hook to access visual editing context.
 * Returns null when not inside the provider (public frontend).
 */
export function useVisualEditing(): VisualEditingState | null {
  return useContext(VisualEditingContext)
}

type ProviderProps = {
  sectionId: string
  getFieldValue: (path: FieldPath) => string
  getStructuredFieldValue?: (path: FieldPath) => unknown
  updateField: (path: FieldPath, value: string) => void
  updateStructuredField?: (path: FieldPath, value: unknown) => void
  linkResources?: LinkResources
  children: ReactNode
}

export function VisualEditingProvider({
  sectionId,
  getFieldValue,
  getStructuredFieldValue: getStructuredFieldValueProp,
  updateField,
  updateStructuredField: updateStructuredFieldProp,
  linkResources,
  children,
}: ProviderProps) {
  const [focusedField, setFocusedField] = useState<FieldPath | null>(null)
  const [editingField, setEditingField] = useState<FieldPath | null>(null)
  const [linkEditField, setLinkEditField] = useState<FieldPath | null>(null)
  const [richEditField, setRichEditField] = useState<FieldPath | null>(null)

  const focusField = useCallback((path: FieldPath) => {
    if (editingField || richEditField) return
    setFocusedField(path)
  }, [editingField, richEditField])

  const blurField = useCallback(() => {
    if (!editingField && !richEditField) setFocusedField(null)
  }, [editingField, richEditField])

  const startEdit = useCallback((path: FieldPath) => {
    setFocusedField(path)
    setEditingField(path)
  }, [])

  const commitEdit = useCallback((path: FieldPath, value: string) => {
    updateField(path, value)
    setEditingField(null)
  }, [updateField])

  const cancelEdit = useCallback(() => {
    setEditingField(null)
  }, [])

  const openLinkEditor = useCallback((path: FieldPath) => {
    setLinkEditField(path)
  }, [])

  const closeLinkEditor = useCallback(() => {
    setLinkEditField(null)
  }, [])

  const openRichEditor = useCallback((path: FieldPath) => {
    setFocusedField(path)
    setRichEditField(path)
  }, [])

  const closeRichEditor = useCallback(() => {
    setRichEditField(null)
  }, [])

  const getStructuredFieldValue = useCallback((path: FieldPath): unknown => {
    if (getStructuredFieldValueProp) return getStructuredFieldValueProp(path)
    return getFieldValue(path)
  }, [getStructuredFieldValueProp, getFieldValue])

  const updateStructuredField = useCallback((path: FieldPath, value: unknown) => {
    if (updateStructuredFieldProp) {
      updateStructuredFieldProp(path, value)
    } else if (typeof value === "string") {
      updateField(path, value)
    }
  }, [updateStructuredFieldProp, updateField])

  const state: VisualEditingState = {
    sectionId,
    focusedField,
    editingField,
    linkEditField,
    richEditField,
    focusField,
    blurField,
    startEdit,
    commitEdit,
    cancelEdit,
    openLinkEditor,
    closeLinkEditor,
    openRichEditor,
    closeRichEditor,
    getFieldValue,
    getStructuredFieldValue,
    updateField,
    updateStructuredField,
    linkResources,
  }

  return (
    <VisualEditingContext.Provider value={state}>
      {children}
    </VisualEditingContext.Provider>
  )
}
