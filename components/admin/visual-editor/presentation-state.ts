/**
 * Pure presentation-state resolvers for the visual editor.
 *
 * These extract the render-decision logic from React components into
 * testable pure functions.  Each function takes the minimum required
 * inputs and returns the exact state that drives the UI.
 */

import type { VisualSectionNode } from "./page-visual-editor-types"
import { isComposedSectionSupported } from "./composed-support"

// ---------------------------------------------------------------------------
// Canvas node chrome state
// ---------------------------------------------------------------------------

export type CanvasNodeChromeState = {
  /** Whether the node shows as a supported composed section with the "Composed" chip */
  showComposedChip: boolean
  /** Whether the node shows the unsupported fallback banner */
  showUnsupportedBanner: boolean
  /** Whether the global/locked indicator is visible */
  showGlobalLocked: boolean
  /** Whether the unsaved dot is visible */
  showDirtyDot: boolean
  /** Chrome layout model — "surface-inset" means chrome is rendered inside the preview surface with small insets */
  chromeLayout: "surface-inset"
}

export function resolveCanvasNodeChromeState(
  node: Pick<VisualSectionNode, "isCustomComposed" | "isGlobal">,
  isDirty: boolean,
  composerSchema: unknown | undefined | null,
): CanvasNodeChromeState {
  const hasComposerSchema = node.isCustomComposed && isComposedSectionSupported(composerSchema)
  return {
    showComposedChip: hasComposerSchema,
    showUnsupportedBanner: node.isCustomComposed && !hasComposerSchema,
    showGlobalLocked: node.isGlobal,
    showDirtyDot: isDirty,
    chromeLayout: "surface-inset",
  }
}

// ---------------------------------------------------------------------------
// Structure rail row state
// ---------------------------------------------------------------------------

export type RailRowState = {
  /** Primary display title (title or fallback to type) */
  primaryTitle: string
  /** Whether to show the type as secondary context (only when a real title exists) */
  showTypeAsSecondary: boolean
  /** Whether the global/locked indicator is visible */
  showGlobalLocked: boolean
  /** Whether the disabled/hidden indicator is visible */
  showDisabled: boolean
  /** Status dot kind */
  statusDot: "dirty" | "draft-only" | "unpublished-changes" | "published" | "none"
}

export function resolveRailRowState(
  node: Pick<VisualSectionNode, "isGlobal" | "enabled" | "draftVersion" | "publishedVersion">,
  isDirty: boolean,
  sectionTitle: string,
  typeLabel: string,
): RailRowState {
  const hasDraft = !!node.draftVersion
  const hasPublished = !!node.publishedVersion

  let statusDot: RailRowState["statusDot"] = "none"
  if (isDirty) statusDot = "dirty"
  else if (hasDraft && !hasPublished) statusDot = "draft-only"
  else if (hasDraft && hasPublished) statusDot = "unpublished-changes"
  else if (!hasDraft && hasPublished) statusDot = "published"

  return {
    primaryTitle: sectionTitle || typeLabel,
    showTypeAsSecondary: !!sectionTitle,
    showGlobalLocked: node.isGlobal,
    showDisabled: !node.enabled,
    statusDot,
  }
}

// ---------------------------------------------------------------------------
// Page workspace footer state
// ---------------------------------------------------------------------------

export type PageFooterState = {
  /** Whether the primary save button is enabled */
  saveEnabled: boolean
  /** Primary slot label */
  primaryLabel: string
  /** Whether the discard button is active in the secondary slot */
  secondaryIsDiscard: boolean
  /** Number of slots — always 2 for structural stability */
  slotCount: 2
}

export function resolvePageFooterState(isDirty: boolean): PageFooterState {
  return {
    saveEnabled: isDirty,
    primaryLabel: isDirty ? "Save page settings" : "Saved",
    secondaryIsDiscard: isDirty,
    slotCount: 2,
  }
}
