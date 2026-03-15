import { describe, it, expect } from "vitest"
import { VISUAL_EDITOR_ENABLED } from "@/components/admin/visual-editor/feature-flag"

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

describe("feature flag", () => {
  it("VISUAL_EDITOR_ENABLED is a boolean", () => {
    expect(typeof VISUAL_EDITOR_ENABLED).toBe("boolean")
  })

  it("VISUAL_EDITOR_ENABLED is false by default", () => {
    // Default behavior: disabled unless explicitly set to "true"
    expect(VISUAL_EDITOR_ENABLED).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Route structure validation
// ---------------------------------------------------------------------------

describe("visual editor route structure", () => {
  it("route file exists at expected path", async () => {
    // Verify the module can be resolved
    const mod = await import(
      "@/components/admin/visual-editor/page-visual-editor"
    )
    expect(mod.PageVisualEditor).toBeDefined()
    expect(typeof mod.PageVisualEditor).toBe("function")
  })

  it("feature flag module is importable", async () => {
    const mod = await import(
      "@/components/admin/visual-editor/feature-flag"
    )
    expect(mod).toHaveProperty("VISUAL_EDITOR_ENABLED")
  })

  it("store context is importable", async () => {
    const mod = await import(
      "@/components/admin/visual-editor/page-visual-editor-store"
    )
    expect(mod.VisualEditorContext).toBeDefined()
    expect(mod.useVisualEditorStore).toBeDefined()
  })

  it("types are importable", async () => {
    // Types don't have runtime values, but the module should resolve
    const mod = await import(
      "@/components/admin/visual-editor/page-visual-editor-types"
    )
    expect(mod).toBeDefined()
  })

  it("data loader is importable", async () => {
    const mod = await import(
      "@/lib/admin/visual-editor/load-page-visual-state"
    )
    expect(mod.loadPageVisualState).toBeDefined()
    expect(typeof mod.loadPageVisualState).toBe("function")
  })

  it("persistence hook is importable", async () => {
    const mod = await import(
      "@/components/admin/visual-editor/use-visual-section-persistence"
    )
    expect(mod.useVisualSectionPersistence).toBeDefined()
    expect(typeof mod.useVisualSectionPersistence).toBe("function")
  })
})

// ---------------------------------------------------------------------------
// Dirty state handoff
// ---------------------------------------------------------------------------

describe("dirty state selection handoff", () => {
  it("dirty dialog module is importable", async () => {
    const mod = await import(
      "@/components/admin/visual-editor/page-visual-editor-dirty-dialog"
    )
    expect(mod.VisualEditorDirtyDialog).toBeDefined()
    expect(typeof mod.VisualEditorDirtyDialog).toBe("function")
  })
})

// ---------------------------------------------------------------------------
// Effective preview helper
// ---------------------------------------------------------------------------

describe("effective preview helper", () => {
  it("resolveEffectivePreview is importable", async () => {
    const mod = await import(
      "@/lib/admin/visual-editor/resolve-effective-visual-section"
    )
    expect(mod.resolveEffectivePreview).toBeDefined()
    expect(typeof mod.resolveEffectivePreview).toBe("function")
  })
})
