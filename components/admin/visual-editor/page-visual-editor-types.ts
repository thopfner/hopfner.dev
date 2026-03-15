/**
 * Types for the visual editor — ephemeral UI state only.
 * Canonical data shapes come from components/admin/section-editor/types.ts.
 */

import type { FormattingState } from "@/components/admin/formatting-controls"
import type {
  CmsSectionType,
  EditorDraft,
  SectionVersionRow,
  SectionTypeDefault,
  VersionPayload,
} from "@/components/admin/section-editor/types"
import type { SectionCapability } from "@/lib/design-system/capabilities"
import type { SectionPreset } from "@/lib/design-system/presets"

// ---------------------------------------------------------------------------
// Visual section node — ephemeral projection for the canvas
// ---------------------------------------------------------------------------

export type VisualSectionSource = "page" | "global"

export type VisualSectionNode = {
  sectionId: string
  pageId: string
  sectionType: CmsSectionType
  source: VisualSectionSource
  isGlobal: boolean
  isCustomComposed: boolean
  position: number
  key: string | null
  enabled: boolean
  /** Latest draft if one exists */
  draftVersion: SectionVersionRow | null
  /** Latest published version */
  publishedVersion: SectionVersionRow | null
  /** Global section ID (only if isGlobal) */
  globalSectionId: string | null
  /** Row-level formatting override from the sections table */
  formattingOverride: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Visual page state — loaded from DB, drives the canvas
// ---------------------------------------------------------------------------

export type VisualPageState = {
  pageId: string
  pageSlug: string
  pageTitle: string
  pageBgImageUrl: string
  pageFormattingOverride: Record<string, unknown>
  sections: VisualSectionNode[]
  sectionTypeDefaults: Partial<Record<string, SectionTypeDefault>>
  siteFormattingSettings: Record<string, unknown>
  siteTokens: Record<string, unknown>
  siteColorMode: "light" | "dark"
  presets: Record<string, SectionPreset>
  capabilities: Record<string, SectionCapability>
  tailwindWhitelist: Set<string>
  customTypeRegistry: Set<string>
}

// ---------------------------------------------------------------------------
// Editor store state
// ---------------------------------------------------------------------------

export type VisualEditorSelection = {
  sectionId: string
} | null

export type VisualEditorDirtyState = {
  sectionId: string
  draft: EditorDraft
  originalDraft: EditorDraft
}

export type VisualEditorSaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "publishing"
  | "published"
  | "error"

export type VisualEditorStore = {
  // Page-level state
  pageState: VisualPageState | null
  loading: boolean
  error: string | null

  // Selection
  selection: VisualEditorSelection
  setSelection: (sel: VisualEditorSelection) => void

  // Section order (optimistic local state)
  sectionOrder: string[]
  setSectionOrder: (order: string[]) => void
  orderDirty: boolean

  // Per-section editing state
  dirtyStates: Map<string, VisualEditorDirtyState>
  getDirtyDraft: (sectionId: string) => EditorDraft | null
  setDirtyDraft: (sectionId: string, draft: EditorDraft, original: EditorDraft) => void
  clearDirtyDraft: (sectionId: string) => void
  isSectionDirty: (sectionId: string) => boolean

  // Save status
  saveStatus: VisualEditorSaveStatus
  saveError: string | null
  setSaveStatus: (status: VisualEditorSaveStatus, error?: string) => void

  // Viewport
  viewport: "desktop" | "tablet" | "mobile"
  setViewport: (vp: "desktop" | "tablet" | "mobile") => void
}

// ---------------------------------------------------------------------------
// Formatting control definition for the inspector
// ---------------------------------------------------------------------------

export type FormattingControlDef = {
  key: keyof FormattingState
  label: string
  type: "select" | "slider" | "toggle"
  options?: { value: string; label: string }[]
  semanticControl?: string // maps to SectionCapability check
  min?: number
  max?: number
  step?: number
}
