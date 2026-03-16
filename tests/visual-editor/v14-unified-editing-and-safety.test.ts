import { describe, it, expect } from "vitest"
import fs from "fs"

// ---------------------------------------------------------------------------
// Phase 1: Unified overlay text editing
// ---------------------------------------------------------------------------

describe("unified overlay text editing", () => {
  const source = fs.readFileSync("components/landing/editable-text-slot.tsx", "utf-8")

  it("has NO inline replacement branch for small text", () => {
    // The old inline branch used ring-1 ring-blue-500/60 rounded-sm bg-transparent
    // with an in-flow input/textarea. After unification, ALL editing uses createPortal.
    expect(source).not.toContain("// Inline editor for small/single-line text")
    expect(source).not.toContain("bg-transparent cursor-text min-w-[2ch]")
  })

  it("uses createPortal for ALL editing modes", () => {
    expect(source).toContain("createPortal")
    // The overlay path should be the ONLY editing path
    const portalCount = (source.match(/createPortal/g) || []).length
    expect(portalCount).toBeGreaterThanOrEqual(2) // import + usage
  })

  it("uses one unified overlay for both textarea and input", () => {
    // Both textarea (multiline) and input (single-line) should render inside the portal
    expect(source).toContain("<textarea")
    expect(source).toContain("<input")
    // Both should have the overlay ring/shadow styling
    expect(source).toContain("ring-2 ring-blue-500/60 rounded-md bg-[#0c0e14]")
  })

  it("preserves no-op dirty guard", () => {
    expect(source).toContain("originalValueRef")
    expect(source).toContain("cancelEdit()")
    expect(source).toContain("localValue === originalValueRef.current")
  })

  it("preserves edit-mode typography downshift for large text", () => {
    expect(source).toContain("editModeClassName")
    expect(source).toContain("EDIT_TYPOGRAPHY_MAP")
    expect(source).toContain("isLargeTextTag")
  })

  it("keeps display element invisible for layout stability during edit", () => {
    expect(source).toContain("invisible")
    expect(source).toContain("createElement(as!")
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Page preview truth
// ---------------------------------------------------------------------------

describe("page preview truth", () => {
  it("page settings hook pushes draft to store", () => {
    const source = fs.readFileSync("components/admin/visual-editor/use-page-settings-actions.ts", "utf-8")
    expect(source).toContain("setPageSettingsDraft")
    expect(source).toContain("useEffect")
  })

  it("store exposes pageSettingsDraft", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor-store.ts", "utf-8")
    expect(source).toContain("pageSettingsDraft")
    expect(source).toContain("setPageSettingsDraft")
  })

  it("main provider wires pageSettingsDraft state", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor.tsx", "utf-8")
    expect(source).toContain("pageSettingsDraft")
    expect(source).toContain("setPageSettingsDraft")
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Composed section real link/media resources
// ---------------------------------------------------------------------------

describe("composed section real resources", () => {
  const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx", "utf-8")

  it("uses real page loading via Supabase", () => {
    expect(source).toContain("createClient")
    expect(source).toContain('from("pages")')
    expect(source).toContain("ensurePagesLoaded")
  })

  it("uses real anchor loading via Supabase", () => {
    expect(source).toContain('from("sections")')
    expect(source).toContain("ensureAnchorsLoaded")
  })

  it("uses real media library modal", () => {
    expect(source).toContain("MediaLibraryModal")
    expect(source).toContain("handleOpenCustomImageLibrary")
    expect(source).toContain("mediaBlockIdRef")
  })

  it("does NOT use stubbed empty resource handlers", () => {
    expect(source).not.toContain("ensurePagesLoaded: async () => {}")
    expect(source).not.toContain("ensureAnchorsLoaded: async () => {}")
    expect(source).not.toContain("onOpenCustomImageLibrary={() => {}}")
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Preview link safety (click + keyboard)
// ---------------------------------------------------------------------------

describe("preview link safety", () => {
  const source = fs.readFileSync("components/admin/section-preview.tsx", "utf-8")

  it("suppresses click navigation on anchors", () => {
    expect(source).toContain("suppressAnchorNav")
    expect(source).toContain("onClickCapture")
  })

  it("suppresses keyboard navigation on anchors", () => {
    expect(source).toContain("suppressAnchorKeyboard")
    expect(source).toContain("onKeyDownCapture")
    // Must handle Enter and Space keys
    expect(source).toContain('"Enter"')
    expect(source).toContain('" "')
  })

  it("respects editor control markers", () => {
    expect(source).toContain("data-visual-editor-control")
  })
})
