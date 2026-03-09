"use client"

import { useReducer, useCallback, useMemo } from "react"
import type { FormattingState } from "@/components/admin/formatting-controls"
import type { EditorDraft, EditorDraftMeta } from "./types"
import { DEFAULT_FORMATTING } from "./payload"
import {
  computeDirtyPaths,
  updateDirtyPathForMeta,
  updateDirtyPathForFormatting,
  updateDirtyPathForContent,
  updateDirtyPathForContentPath,
  updateDirtyPathForFormattingPath,
  updateDirtyPathForCustomBlock,
  setAtPath,
} from "./dirty-paths"

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type EditorSessionState = {
  draft: EditorDraft
  baseSnapshot: EditorDraft | null
  dirtyPaths: Set<string>
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type EditorSessionAction =
  | { type: "hydrate"; draft: EditorDraft }
  | { type: "set-meta-field"; field: keyof EditorDraftMeta; value: string }
  | { type: "set-formatting"; updater: (prev: FormattingState) => FormattingState }
  | { type: "set-formatting-path"; path: string; value: unknown }
  | { type: "set-content"; updater: (prev: Record<string, unknown>) => Record<string, unknown> }
  | { type: "set-content-path"; path: string; value: unknown }
  | { type: "replace-content"; value: Record<string, unknown> }
  | { type: "patch-custom-block"; blockId: string; patch: Record<string, unknown> }
  | { type: "reset-to-base" }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function reducer(state: EditorSessionState, action: EditorSessionAction): EditorSessionState {
  switch (action.type) {
    case "hydrate": {
      return {
        draft: action.draft,
        baseSnapshot: action.draft,
        dirtyPaths: new Set(),
      }
    }

    case "set-meta-field": {
      const nextMeta = { ...state.draft.meta, [action.field]: action.value }
      const nextDraft = { ...state.draft, meta: nextMeta }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForMeta(
          state.dirtyPaths,
          action.field,
          action.value,
          state.baseSnapshot
        ),
      }
    }

    case "set-formatting": {
      const nextFormatting = action.updater(state.draft.formatting)
      const nextDraft = { ...state.draft, formatting: nextFormatting }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForFormatting(
          state.dirtyPaths,
          nextFormatting,
          state.baseSnapshot
        ),
      }
    }

    case "set-formatting-path": {
      const nextFormatting = setAtPath(
        state.draft.formatting as Record<string, unknown>,
        action.path,
        action.value
      ) as FormattingState
      const nextDraft = { ...state.draft, formatting: nextFormatting }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForFormattingPath(
          state.dirtyPaths,
          action.path,
          action.value,
          state.baseSnapshot
        ),
      }
    }

    case "set-content": {
      const nextContent = action.updater(state.draft.content)
      const nextDraft = { ...state.draft, content: nextContent }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForContent(
          state.dirtyPaths,
          nextContent,
          state.baseSnapshot
        ),
      }
    }

    case "set-content-path": {
      const nextContent = setAtPath(state.draft.content, action.path, action.value)
      const nextDraft = { ...state.draft, content: nextContent }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForContentPath(
          state.dirtyPaths,
          action.path,
          action.value,
          state.baseSnapshot
        ),
      }
    }

    case "replace-content": {
      const nextDraft = { ...state.draft, content: action.value }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForContent(
          state.dirtyPaths,
          action.value,
          state.baseSnapshot
        ),
      }
    }

    case "patch-custom-block": {
      const existingCustomBlocks = asRecord(state.draft.content.customBlocks)
      const current = asRecord(existingCustomBlocks[action.blockId])
      const patchedBlock = { ...current, ...action.patch }
      const nextContent = {
        ...state.draft.content,
        customBlocks: {
          ...existingCustomBlocks,
          [action.blockId]: patchedBlock,
        },
      }
      const nextDraft = { ...state.draft, content: nextContent }
      return {
        ...state,
        draft: nextDraft,
        dirtyPaths: updateDirtyPathForCustomBlock(
          state.dirtyPaths,
          action.blockId,
          patchedBlock,
          state.baseSnapshot
        ),
      }
    }

    case "reset-to-base": {
      if (!state.baseSnapshot) return state
      return {
        ...state,
        draft: state.baseSnapshot,
        dirtyPaths: new Set(),
      }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_STATE: EditorSessionState = {
  draft: {
    meta: {
      title: "",
      subtitle: "",
      ctaPrimaryLabel: "",
      ctaPrimaryHref: "",
      ctaSecondaryLabel: "",
      ctaSecondaryHref: "",
      backgroundMediaUrl: "",
    },
    formatting: { ...DEFAULT_FORMATTING },
    content: {},
  },
  baseSnapshot: null,
  dirtyPaths: new Set(),
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export type SectionEditorSession = {
  draft: EditorDraft
  baseSnapshot: EditorDraft | null
  isDirty: boolean
  dirtyPaths: Set<string>
  hydrate: (draft: EditorDraft) => void
  resetToBase: () => void
  actions: {
    setMetaField: (field: keyof EditorDraftMeta, value: string) => void
    setFormatting: (updater: (prev: FormattingState) => FormattingState) => void
    setFormattingPath: (path: string, value: unknown) => void
    setContent: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void
    setContentPath: (path: string, value: unknown) => void
    replaceContent: (next: Record<string, unknown>) => void
    patchCustomBlock: (blockId: string, patch: Record<string, unknown>) => void
  }
}

export function useSectionEditorSession(): SectionEditorSession {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const hydrate = useCallback(
    (draft: EditorDraft) => dispatch({ type: "hydrate", draft }),
    []
  )

  const resetToBase = useCallback(
    () => dispatch({ type: "reset-to-base" }),
    []
  )

  const setMetaField = useCallback(
    (field: keyof EditorDraftMeta, value: string) =>
      dispatch({ type: "set-meta-field", field, value }),
    []
  )

  const setFormatting = useCallback(
    (updater: (prev: FormattingState) => FormattingState) =>
      dispatch({ type: "set-formatting", updater }),
    []
  )

  const setFormattingPath = useCallback(
    (path: string, value: unknown) =>
      dispatch({ type: "set-formatting-path", path, value }),
    []
  )

  const setContent = useCallback(
    (updater: (prev: Record<string, unknown>) => Record<string, unknown>) =>
      dispatch({ type: "set-content", updater }),
    []
  )

  const setContentPath = useCallback(
    (path: string, value: unknown) =>
      dispatch({ type: "set-content-path", path, value }),
    []
  )

  const replaceContent = useCallback(
    (next: Record<string, unknown>) =>
      dispatch({ type: "replace-content", value: next }),
    []
  )

  const patchCustomBlock = useCallback(
    (blockId: string, patch: Record<string, unknown>) =>
      dispatch({ type: "patch-custom-block", blockId, patch }),
    []
  )

  const actions = useMemo(
    () => ({
      setMetaField,
      setFormatting,
      setFormattingPath,
      setContent,
      setContentPath,
      replaceContent,
      patchCustomBlock,
    }),
    [setMetaField, setFormatting, setFormattingPath, setContent, setContentPath, replaceContent, patchCustomBlock]
  )

  const isDirty = state.dirtyPaths.size > 0

  return {
    draft: state.draft,
    baseSnapshot: state.baseSnapshot,
    isDirty,
    dirtyPaths: state.dirtyPaths,
    hydrate,
    resetToBase,
    actions,
  }
}
