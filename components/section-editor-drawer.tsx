"use client"

// ---------------------------------------------------------------------------
// Compatibility re-export.
//
// The section editor drawer has been refactored into a modular architecture
// under components/admin/section-editor/. This file preserves the original
// import path for all existing callers.
// ---------------------------------------------------------------------------

export { SectionEditorDrawerShell as SectionEditorDrawer } from "./admin/section-editor/section-editor-drawer-shell"
