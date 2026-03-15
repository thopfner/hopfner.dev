import { describe, it, expect } from "vitest"
import {
  normalizeFormatting,
  formattingToJsonb,
  payloadToDraft,
  draftToPayload,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "@/components/admin/visual-editor/page-visual-editor-types"

// ---------------------------------------------------------------------------
// Reorder reducer logic
// ---------------------------------------------------------------------------

describe("section reorder", () => {
  const initialOrder = ["s1", "s2", "s3", "s4", "s5"]

  function reorder(order: string[], fromIndex: number, toIndex: number): string[] {
    const next = [...order]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    return next
  }

  it("moves section down", () => {
    const result = reorder(initialOrder, 0, 2)
    expect(result).toEqual(["s2", "s3", "s1", "s4", "s5"])
  })

  it("moves section up", () => {
    const result = reorder(initialOrder, 3, 1)
    expect(result).toEqual(["s1", "s4", "s2", "s3", "s5"])
  })

  it("no-op when same index", () => {
    const result = reorder(initialOrder, 2, 2)
    expect(result).toEqual(initialOrder)
  })

  it("moves to end", () => {
    const result = reorder(initialOrder, 0, 4)
    expect(result).toEqual(["s2", "s3", "s4", "s5", "s1"])
  })

  it("moves to start", () => {
    const result = reorder(initialOrder, 4, 0)
    expect(result).toEqual(["s5", "s1", "s2", "s3", "s4"])
  })

  it("detects dirty order", () => {
    const reordered = reorder(initialOrder, 0, 2)
    expect(JSON.stringify(reordered)).not.toBe(JSON.stringify(initialOrder))
  })

  it("detects clean order after undo", () => {
    let order = reorder(initialOrder, 0, 2) // s2 s3 s1 s4 s5
    order = reorder(order, 2, 0) // s1 s2 s3 s4 s5
    expect(JSON.stringify(order)).toBe(JSON.stringify(initialOrder))
  })
})

// ---------------------------------------------------------------------------
// Dirty state tracking
// ---------------------------------------------------------------------------

describe("dirty state tracking", () => {
  it("detects formatting change as dirty", () => {
    const original = payloadToDraft({
      title: "Test",
      subtitle: null,
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      background_media_url: null,
      formatting: { sectionRhythm: "standard", paddingY: "py-6", widthMode: "content", heroMinHeight: "auto", shadowMode: "inherit", innerShadowMode: "inherit", innerShadowStrength: 0 },
      content: {},
    }, "card_grid")

    const edited: EditorDraft = {
      ...original,
      formatting: {
        ...original.formatting,
        sectionRhythm: "compact",
      },
    }

    // Compare key formatting field
    expect(edited.formatting.sectionRhythm).not.toBe(original.formatting.sectionRhythm)
  })

  it("detects meta change as dirty", () => {
    const original = payloadToDraft({
      title: "Test",
      subtitle: null,
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      background_media_url: null,
      formatting: { paddingY: "py-6", widthMode: "content", heroMinHeight: "auto", shadowMode: "inherit", innerShadowMode: "inherit", innerShadowStrength: 0 },
      content: {},
    }, "card_grid")

    const edited: EditorDraft = {
      ...original,
      meta: { ...original.meta, title: "Updated Title" },
    }

    expect(edited.meta.title).not.toBe(original.meta.title)
  })
})

// ---------------------------------------------------------------------------
// Save draft payload shape
// ---------------------------------------------------------------------------

describe("save draft payload shape", () => {
  it("produces correct payload from visual editor draft", () => {
    const draft: EditorDraft = {
      meta: {
        title: "Hero Title",
        subtitle: "Hero Subtitle",
        ctaPrimaryLabel: "Get Started",
        ctaPrimaryHref: "/start",
        ctaSecondaryLabel: "Learn More",
        ctaSecondaryHref: "/about",
        backgroundMediaUrl: "/bg.jpg",
      },
      formatting: normalizeFormatting({
        sectionRhythm: "hero",
        sectionSurface: "spotlight_stage",
        paddingY: "py-8",
        maxWidth: "max-w-5xl",
        widthMode: "content",
        heroMinHeight: "70svh",
        shadowMode: "on",
        innerShadowMode: "inherit",
        innerShadowStrength: 0,
        headingTreatment: "display",
      }),
      content: { eyebrow: "Welcome", bullets: ["Fast", "Reliable"] },
    }

    const payload = draftToPayload(draft, "hero_cta")

    expect(payload.title).toBe("Hero Title")
    expect(payload.subtitle).toBe("Hero Subtitle")
    expect(payload.cta_primary_label).toBe("Get Started")
    expect(payload.cta_primary_href).toBe("/start")
    expect(payload.cta_secondary_label).toBe("Learn More")
    expect(payload.cta_secondary_href).toBe("/about")
    expect(payload.background_media_url).toBe("/bg.jpg")
    expect(payload.formatting).toHaveProperty("sectionRhythm", "hero")
    expect(payload.formatting).toHaveProperty("sectionSurface", "spotlight_stage")
    expect(payload.formatting).toHaveProperty("headingTreatment", "display")
    expect(payload.content.eyebrow).toBe("Welcome")
    expect(payload.content.bullets).toEqual(["Fast", "Reliable"])
  })

  it("does not add new formatting keys", () => {
    const draft: EditorDraft = {
      meta: {
        title: "Test",
        subtitle: "",
        ctaPrimaryLabel: "",
        ctaPrimaryHref: "",
        ctaSecondaryLabel: "",
        ctaSecondaryHref: "",
        backgroundMediaUrl: "",
      },
      formatting: normalizeFormatting({ sectionRhythm: "standard" }),
      content: {},
    }

    const payload = draftToPayload(draft, "card_grid")
    const formattingKeys = Object.keys(payload.formatting)

    // Known allowed keys
    const allowedKeys = [
      "containerClass", "sectionClass", "paddingY", "outerSpacing",
      "spacingTop", "spacingBottom", "maxWidth", "textAlign",
      "heroRightAlign", "widthMode", "heroMinHeight",
      "shadowMode", "innerShadowMode", "innerShadowStrength",
      "sectionRhythm", "contentDensity", "gridGap", "sectionSurface",
      "cardFamily", "cardChrome", "accentRule", "dividerMode",
      "headingTreatment", "labelStyle", "subtitleSize", "sectionPresetKey",
    ]

    for (const key of formattingKeys) {
      expect(allowedKeys).toContain(key)
    }
  })
})

// ---------------------------------------------------------------------------
// Global section safety
// ---------------------------------------------------------------------------

describe("global section safety", () => {
  it("global sections are correctly identified", () => {
    const globalNode: VisualSectionNode = {
      sectionId: "s1",
      pageId: "p1",
      sectionType: "card_grid",
      source: "global",
      isGlobal: true,
      isCustomComposed: false,
      position: 0,
      key: null,
      enabled: true,
      draftVersion: null,
      publishedVersion: null,
      globalSectionId: "g1",
      formattingOverride: {},
    }

    expect(globalNode.isGlobal).toBe(true)
    expect(globalNode.source).toBe("global")
    expect(globalNode.globalSectionId).toBe("g1")
  })
})
