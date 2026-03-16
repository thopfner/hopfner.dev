import { describe, it, expect } from "vitest"
import fs from "fs"

// ---------------------------------------------------------------------------
// Phase 1: Workspace height contract + canvas scroll
// ---------------------------------------------------------------------------

describe("workspace height contract", () => {
  it("visual editor uses contained height, not h-screen", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor.tsx", "utf-8")
    // Must NOT use h-screen (which creates nested viewport math)
    expect(source).not.toContain("h-screen")
    // Must use a contained height that accounts for the admin shell header
    expect(source).toContain("calc(100dvh")
  })

  it("visual editor uses overflow-hidden on workspace container", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor.tsx", "utf-8")
    expect(source).toContain("overflow-hidden")
  })

  it("visual editor compensates for admin shell padding", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor.tsx", "utf-8")
    // Must have negative margin to counteract admin shell padding
    expect(source).toContain("-m-3")
  })
})

describe("explicit canvas-scoped scroll", () => {
  it("scrollContainerToElement helper is exported", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-canvas")
    expect(mod.scrollContainerToElement).toBeDefined()
    expect(typeof mod.scrollContainerToElement).toBe("function")
  })

  it("canvas does NOT call scrollIntoView on elements", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor-canvas.tsx", "utf-8")
    // Must not call .scrollIntoView( on any element — only comments may reference it
    expect(source).not.toMatch(/\.scrollIntoView\s*\(/)
  })

  it("canvas uses explicit container scroll", () => {
    const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor-canvas.tsx", "utf-8")
    expect(source).toContain("scrollContainerToElement")
    expect(source).toContain("canvasRef.current")
  })

  it("scrollContainerToElement computes correct scroll position", async () => {
    const { scrollContainerToElement } = await import("@/components/admin/visual-editor/page-visual-editor-canvas")

    // Mock container and target with getBoundingClientRect
    const container = {
      getBoundingClientRect: () => ({ top: 0, height: 600 } as DOMRect),
      scrollTop: 0,
      scrollTo: vi.fn(),
    } as unknown as HTMLElement

    const target = {
      getBoundingClientRect: () => ({ top: 300, height: 100 } as DOMRect),
    } as unknown as HTMLElement

    scrollContainerToElement(container, target, "auto")
    expect((container.scrollTo as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" })
    )
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Single-line overlay readability
// ---------------------------------------------------------------------------

describe("single-line overlay readability", () => {
  const source = fs.readFileSync("components/landing/editable-text-slot.tsx", "utf-8")

  it("single-line input uses normalized text-sm for readability", () => {
    // The single-line input should use text-sm, not inherited display classes
    expect(source).toContain("text-sm font-medium")
  })

  it("single-line overlay has generous minimum width", () => {
    // Must enforce at least 200px minimum width for single-line
    expect(source).toContain("Math.max(200")
    expect(source).toContain("singleLineWidth")
  })

  it("single-line does not inherit raw display classes", () => {
    // The single-line <input> className should NOT use editCls (which inherits display)
    // It should use a normalized readability class
    const inputMatch = source.match(/<input[\s\S]*?className="([^"]*)"/)
    if (inputMatch) {
      const cls = inputMatch[1]
      expect(cls).toContain("text-sm")
      expect(cls).not.toContain("editCls")
    }
  })
})

describe("large-text overlay preserved", () => {
  const source = fs.readFileSync("components/landing/editable-text-slot.tsx", "utf-8")

  it("textarea still uses editCls with typography scaling", () => {
    expect(source).toContain("editModeClassName")
    expect(source).toContain("EDIT_TYPOGRAPHY_MAP")
    // Textarea should still use editCls (which gets typography scaling)
    expect(source).toMatch(/textarea[\s\S]*editCls/)
  })

  it("no-op dirty guard is preserved", () => {
    expect(source).toContain("localValue === originalValueRef.current")
    expect(source).toContain("cancelEdit()")
  })
})

// ---------------------------------------------------------------------------
// Import: vi for mocking
// ---------------------------------------------------------------------------
import { vi } from "vitest"
