import { describe, it, expect } from "vitest"
import {
  getSupportedControls,
  isControlSupported,
  SECTION_CAPABILITIES,
  type SemanticControl,
} from "@/lib/design-system/capabilities"
import {
  isBuiltinSectionType,
  resolveMetaFieldVisibility,
  BUILTIN_EDITOR_META_CONTRACT,
} from "@/components/admin/section-editor/builtin-editor-contract"

// ---------------------------------------------------------------------------
// Capability gating
// ---------------------------------------------------------------------------

describe("capability matrix", () => {
  it("hero_cta does not support sectionRhythm", () => {
    expect(isControlSupported("hero_cta", "sectionRhythm")).toBe(false)
  })

  it("hero_cta supports sectionSurface", () => {
    expect(isControlSupported("hero_cta", "sectionSurface")).toBe(true)
  })

  it("card_grid supports cardFamily", () => {
    expect(isControlSupported("card_grid", "cardFamily")).toBe(true)
  })

  it("footer_grid supports nothing", () => {
    expect(getSupportedControls("footer_grid")).toEqual([])
  })

  it("nav_links supports nothing", () => {
    expect(getSupportedControls("nav_links")).toEqual([])
  })

  it("unknown type falls back to composed capabilities", () => {
    const composed = getSupportedControls("composed")
    const unknown = getSupportedControls("totally_unknown_type")
    expect(unknown).toEqual(composed)
  })

  it("all built-in types have capability entries", () => {
    const builtins = [
      "hero_cta", "card_grid", "steps_list", "title_body_list",
      "rich_text_block", "label_value_list", "faq_list", "cta_block",
      "footer_grid", "nav_links", "social_proof_strip", "proof_cluster",
      "case_study_split", "booking_scheduler",
    ]
    for (const type of builtins) {
      expect(SECTION_CAPABILITIES[type]).toBeDefined()
    }
  })
})

// ---------------------------------------------------------------------------
// Built-in meta field visibility
// ---------------------------------------------------------------------------

describe("meta field visibility", () => {
  it("hero_cta shows all meta fields", () => {
    const vis = resolveMetaFieldVisibility("hero_cta", {})
    expect(vis.title).toBe(true)
    expect(vis.subtitle).toBe(true)
    expect(vis.ctaPrimary).toBe(true)
    expect(vis.ctaSecondary).toBe(true)
    expect(vis.backgroundMedia).toBe(true)
  })

  it("card_grid hides CTA and background media", () => {
    const vis = resolveMetaFieldVisibility("card_grid", {})
    expect(vis.title).toBe(true)
    expect(vis.subtitle).toBe(true)
    expect(vis.ctaPrimary).toBe(false)
    expect(vis.ctaSecondary).toBe(false)
    expect(vis.backgroundMedia).toBe(false)
  })

  it("footer_grid hides everything", () => {
    const vis = resolveMetaFieldVisibility("footer_grid", {})
    expect(vis.title).toBe(false)
    expect(vis.subtitle).toBe(false)
    expect(vis.ctaPrimary).toBe(false)
    expect(vis.ctaSecondary).toBe(false)
    expect(vis.backgroundMedia).toBe(false)
  })

  it("cta_block hides subtitle", () => {
    const vis = resolveMetaFieldVisibility("cta_block", {})
    expect(vis.title).toBe(true)
    expect(vis.subtitle).toBe(false)
    expect(vis.ctaPrimary).toBe(true)
    expect(vis.ctaSecondary).toBe(true)
  })

  it("custom type defaults to showing most fields", () => {
    const vis = resolveMetaFieldVisibility("my_custom_type", {})
    expect(vis.title).toBe(true)
    expect(vis.subtitle).toBe(true)
    expect(vis.ctaPrimary).toBe(true)
    expect(vis.ctaSecondary).toBe(true)
    expect(vis.backgroundMedia).toBe(false) // requires explicit true
  })

  it("custom type respects DB capability overrides", () => {
    const vis = resolveMetaFieldVisibility("my_custom_type", {
      title: false,
      background_media: true,
    })
    expect(vis.title).toBe(false)
    expect(vis.backgroundMedia).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Global section lock behavior
// ---------------------------------------------------------------------------

describe("global section lock", () => {
  it("isBuiltinSectionType correctly identifies types", () => {
    expect(isBuiltinSectionType("hero_cta")).toBe(true)
    expect(isBuiltinSectionType("card_grid")).toBe(true)
    expect(isBuiltinSectionType("my_custom")).toBe(false)
    expect(isBuiltinSectionType(null)).toBe(false)
  })

  it("all built-in types have meta field contracts", () => {
    const types = Object.keys(BUILTIN_EDITOR_META_CONTRACT)
    expect(types).toContain("hero_cta")
    expect(types).toContain("footer_grid")
    expect(types).toContain("booking_scheduler")
    expect(types.length).toBe(14)
  })
})

// ---------------------------------------------------------------------------
// Unsupported control gating
// ---------------------------------------------------------------------------

describe("unsupported control gating", () => {
  it("does not expose cardFamily for booking_scheduler", () => {
    expect(isControlSupported("booking_scheduler", "cardFamily")).toBe(false)
  })

  it("does not expose gridGap for hero_cta", () => {
    expect(isControlSupported("hero_cta", "gridGap")).toBe(false)
  })

  it("does not expose dividerMode for hero_cta", () => {
    expect(isControlSupported("hero_cta", "dividerMode")).toBe(false)
  })

  it("exposes dividerMode for faq_list", () => {
    expect(isControlSupported("faq_list", "dividerMode")).toBe(true)
  })

  it("exposes subtitleSize for social_proof_strip", () => {
    expect(isControlSupported("social_proof_strip", "subtitleSize")).toBe(true)
  })
})
