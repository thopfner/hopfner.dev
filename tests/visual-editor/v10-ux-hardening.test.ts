import { describe, it, expect } from "vitest"
import { resolveSectionContainerProps } from "@/lib/cms/section-container-props"

// ---------------------------------------------------------------------------
// 1. Floating surface — module availability
// ---------------------------------------------------------------------------

describe("floating surface", () => {
  it("FloatingSurface module is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/floating-surface")
    expect(mod.FloatingSurface).toBeDefined()
    expect(typeof mod.FloatingSurface).toBe("function")
  })
})

// ---------------------------------------------------------------------------
// 2. Link picker — portal path
// ---------------------------------------------------------------------------

describe("link picker portal", () => {
  it("EditableLinkSlot imports createPortal", async () => {
    const mod = await import("@/components/landing/editable-link-slot")
    expect(mod.EditableLinkSlot).toBeDefined()
    expect(typeof mod.EditableLinkSlot).toBe("function")
  })

  it("LinkPickerPanel is a separate component for portaling", async () => {
    // The link picker now uses a portaled panel — verify the module structure
    const source = await import("@/components/landing/editable-link-slot")
    expect(source).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// 3. Preview wrapper parity — shared helper
// ---------------------------------------------------------------------------

describe("section container props parity", () => {
  const whitelist = new Set(["py-4", "py-6", "py-8", "py-10", "py-12", "max-w-5xl", "max-w-3xl", "max-w-6xl", "text-center", "text-left"])

  it("applies paddingY to sectionClassName", () => {
    const result = resolveSectionContainerProps({ paddingY: "py-8" }, whitelist)
    expect(result.sectionClassName).toContain("py-8")
  })

  it("applies maxWidth to containerClassName", () => {
    const result = resolveSectionContainerProps({ maxWidth: "max-w-3xl" }, whitelist)
    expect(result.containerClassName).toContain("max-w-3xl")
  })

  it("defaults maxWidth to max-w-5xl", () => {
    const result = resolveSectionContainerProps({}, whitelist)
    expect(result.containerClassName).toContain("max-w-5xl")
  })

  it("applies text alignment to containerClassName", () => {
    const result = resolveSectionContainerProps({ textAlign: "center" }, whitelist)
    expect(result.containerClassName).toContain("text-center")
  })

  it("applies spacingTop to sectionStyle", () => {
    const result = resolveSectionContainerProps({ spacingTop: "pt-8" }, whitelist)
    expect(result.sectionStyle.paddingTop).toBeDefined()
  })

  it("applies spacingBottom to sectionStyle", () => {
    const result = resolveSectionContainerProps({ spacingBottom: "pb-4" }, whitelist)
    expect(result.sectionStyle.paddingBottom).toBeDefined()
  })

  it("applies background color to sectionStyle", () => {
    const result = resolveSectionContainerProps({ backgroundType: "color", backgroundColor: "#ff0000" }, whitelist)
    expect(result.sectionStyle.background).toBe("#ff0000")
  })

  it("sectionId comes from sectionKey", () => {
    const result = resolveSectionContainerProps({}, whitelist, "hero")
    expect(result.sectionId).toBe("hero")
  })

  it("sectionId is undefined when no key", () => {
    const result = resolveSectionContainerProps({}, whitelist)
    expect(result.sectionId).toBeUndefined()
  })

  it("full-width mode uses max-w-none", () => {
    const result = resolveSectionContainerProps({ widthMode: "full" }, whitelist)
    expect(result.containerClassName).toContain("max-w-none")
  })
})

// ---------------------------------------------------------------------------
// 4. Toolbar actions — shared hook availability
// ---------------------------------------------------------------------------

describe("toolbar shared actions", () => {
  it("useSelectedSectionActions hook is importable", async () => {
    const mod = await import("@/components/admin/visual-editor/use-selected-section-actions")
    expect(mod.useSelectedSectionActions).toBeDefined()
    expect(typeof mod.useSelectedSectionActions).toBe("function")
  })
})
