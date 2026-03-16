import { describe, it, expect } from "vitest"

// ---------------------------------------------------------------------------
// Section-label chrome contract
// ---------------------------------------------------------------------------

describe("section-label chrome", () => {
  it("node module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-node")
    expect(mod.VisualSectionNodeView).toBeDefined()
  })

  it("chrome uses pill styling not edge-strip", async () => {
    // Verify the component source uses rounded-full (pill) instead of rounded-br (edge strip)
    const fs = await import("fs")
    const source = fs.readFileSync(
      "components/admin/visual-editor/page-visual-editor-node.tsx",
      "utf-8"
    )
    // Should have pill-style chip
    expect(source).toContain("rounded-full")
    // Should NOT have edge-strip border styling
    expect(source).not.toContain("rounded-br")
    // Chip should be inset, not flush (top-0 left-0)
    expect(source).not.toContain("top-0 left-0")
    // Chip should be pointer-events-none to not interfere with selection
    expect(source).toContain("pointer-events-none")
  })
})

// ---------------------------------------------------------------------------
// Preview anchor navigation suppression
// ---------------------------------------------------------------------------

describe("preview anchor suppression", () => {
  it("section-preview module is importable", async () => {
    const mod = await import("@/components/admin/section-preview")
    expect(mod.SectionPreview).toBeDefined()
  })

  it("preview uses onClickCapture for anchor suppression", async () => {
    const fs = await import("fs")
    const source = fs.readFileSync(
      "components/admin/section-preview.tsx",
      "utf-8"
    )
    // Should have the anchor suppression handler
    expect(source).toContain("suppressAnchorNav")
    expect(source).toContain("onClickCapture")
    // Should check for anchor elements
    expect(source).toContain('a[href]')
    // Should respect editor control markers
    expect(source).toContain("data-visual-editor-control")
  })
})

// ---------------------------------------------------------------------------
// Link-edit affordances preserved
// ---------------------------------------------------------------------------

describe("link-edit affordances", () => {
  it("EditableLinkSlot marks its wrapper as editor control", async () => {
    const fs = await import("fs")
    const source = fs.readFileSync(
      "components/landing/editable-link-slot.tsx",
      "utf-8"
    )
    // Should have the marker attribute
    expect(source).toContain("data-visual-editor-control")
  })

  it("EditableLinkSlot is importable and functional", async () => {
    const mod = await import("@/components/landing/editable-link-slot")
    expect(mod.EditableLinkSlot).toBeDefined()
    expect(typeof mod.EditableLinkSlot).toBe("function")
  })
})
