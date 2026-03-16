import { describe, it, expect } from "vitest"

// ---------------------------------------------------------------------------
// Phase 1: Composition actions
// ---------------------------------------------------------------------------

describe("page composition actions", () => {
  it("usePageCompositionActions hook is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/use-page-composition-actions")
    expect(mod.usePageCompositionActions).toBeDefined()
    expect(typeof mod.usePageCompositionActions).toBe("function")
  })

  it("section library module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-section-library")
    expect(mod.SectionLibrary).toBeDefined()
    expect(typeof mod.SectionLibrary).toBe("function")
  })

  it("section actions menu module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-section-actions-menu")
    expect(mod.SectionActionsMenu).toBeDefined()
    expect(typeof mod.SectionActionsMenu).toBe("function")
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Page workspace, history, coverage
// ---------------------------------------------------------------------------

describe("page workspace and history", () => {
  it("usePageSettingsActions hook is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/use-page-settings-actions")
    expect(mod.usePageSettingsActions).toBeDefined()
    expect(typeof mod.usePageSettingsActions).toBe("function")
  })

  it("page panel module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-page-panel")
    expect(mod.PagePanel).toBeDefined()
    expect(typeof mod.PagePanel).toBe("function")
  })

  it("history panel module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-history-panel")
    expect(mod.HistoryPanel).toBeDefined()
    expect(typeof mod.HistoryPanel).toBe("function")
  })

  it("global section panel module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-global-section-panel")
    expect(mod.GlobalSectionPanel).toBeDefined()
    expect(typeof mod.GlobalSectionPanel).toBe("function")
  })

  it("composed section panel module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-composed-section-panel")
    expect(mod.ComposedSectionPanel).toBeDefined()
    expect(typeof mod.ComposedSectionPanel).toBe("function")
  })

  it("store exposes undo/redo in type", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-store")
    expect(mod.VisualEditorContext).toBeDefined()
    expect(mod.useVisualEditorStore).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Phase 3: Media and shell
// ---------------------------------------------------------------------------

describe("media and shell productization", () => {
  it("media field module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-media-field")
    expect(mod.MediaField).toBeDefined()
    expect(typeof mod.MediaField).toBe("function")
  })
})
