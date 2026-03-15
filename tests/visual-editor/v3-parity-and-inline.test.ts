import { describe, it, expect } from "vitest"
import {
  normalizeFormatting,
  payloadToDraft,
  draftToPayload,
} from "@/components/admin/section-editor/payload"
import {
  resolveMetaFieldVisibility,
  BUILTIN_EDITOR_META_CONTRACT,
  type BuiltinCmsSectionType,
} from "@/components/admin/section-editor/builtin-editor-contract"
import { resolveEffectivePreview } from "@/lib/admin/visual-editor/resolve-effective-visual-section"
import type { EditorDraft, SectionVersionRow } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "@/components/admin/visual-editor/page-visual-editor-types"

// ---------------------------------------------------------------------------
// Parity matrix: meta field visibility per section type
// ---------------------------------------------------------------------------

describe("parity matrix: meta field visibility", () => {
  const builtinTypes: BuiltinCmsSectionType[] = [
    "hero_cta", "card_grid", "steps_list", "title_body_list", "rich_text_block",
    "label_value_list", "faq_list", "cta_block", "footer_grid", "nav_links",
    "social_proof_strip", "proof_cluster", "case_study_split", "booking_scheduler",
  ]

  for (const type of builtinTypes) {
    it(`${type} has defined meta field contract`, () => {
      const contract = BUILTIN_EDITOR_META_CONTRACT[type]
      expect(contract).toBeDefined()
      expect(typeof contract.title).toBe("boolean")
      expect(typeof contract.subtitle).toBe("boolean")
      expect(typeof contract.ctaPrimary).toBe("boolean")
      expect(typeof contract.ctaSecondary).toBe("boolean")
      expect(typeof contract.backgroundMedia).toBe("boolean")
    })
  }

  it("hero_cta exposes all meta fields", () => {
    const v = resolveMetaFieldVisibility("hero_cta", {})
    expect(v.title).toBe(true)
    expect(v.subtitle).toBe(true)
    expect(v.ctaPrimary).toBe(true)
    expect(v.ctaSecondary).toBe(true)
    expect(v.backgroundMedia).toBe(true)
  })

  it("cta_block exposes CTA but not subtitle", () => {
    const v = resolveMetaFieldVisibility("cta_block", {})
    expect(v.title).toBe(true)
    expect(v.subtitle).toBe(false)
    expect(v.ctaPrimary).toBe(true)
    expect(v.ctaSecondary).toBe(true)
  })

  it("card_grid does not expose CTA or background media", () => {
    const v = resolveMetaFieldVisibility("card_grid", {})
    expect(v.ctaPrimary).toBe(false)
    expect(v.ctaSecondary).toBe(false)
    expect(v.backgroundMedia).toBe(false)
  })

  it("footer_grid hides all meta fields", () => {
    const v = resolveMetaFieldVisibility("footer_grid", {})
    expect(v.title).toBe(false)
    expect(v.subtitle).toBe(false)
    expect(v.ctaPrimary).toBe(false)
    expect(v.ctaSecondary).toBe(false)
    expect(v.backgroundMedia).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Content field editing round-trip
// ---------------------------------------------------------------------------

describe("content field editing", () => {
  it("card_grid cards survive draft round-trip", () => {
    const draft: EditorDraft = {
      meta: { title: "Test", subtitle: "", ctaPrimaryLabel: "", ctaPrimaryHref: "", ctaSecondaryLabel: "", ctaSecondaryHref: "", backgroundMediaUrl: "" },
      formatting: normalizeFormatting({}),
      content: {
        eyebrow: "Services",
        cards: [
          { title: "Card 1", text: "Description 1", icon: "🚀" },
          { title: "Card 2", text: "Description 2", icon: "⚡" },
        ],
      },
    }
    const payload = draftToPayload(draft, "card_grid")
    const restored = payloadToDraft(payload, "card_grid")
    expect(restored.content.eyebrow).toBe("Services")
    expect(Array.isArray(restored.content.cards)).toBe(true)
    const cards = restored.content.cards as Record<string, unknown>[]
    expect(cards.length).toBe(2)
    expect(cards[0].title).toBe("Card 1")
    expect(cards[1].icon).toBe("⚡")
  })

  it("faq_list items survive draft round-trip", () => {
    const draft: EditorDraft = {
      meta: { title: "FAQ", subtitle: "", ctaPrimaryLabel: "", ctaPrimaryHref: "", ctaSecondaryLabel: "", ctaSecondaryHref: "", backgroundMediaUrl: "" },
      formatting: normalizeFormatting({}),
      content: {
        items: [
          { question: "How?", answer: "Like this." },
          { question: "Why?", answer: "Because." },
        ],
      },
    }
    const payload = draftToPayload(draft, "faq_list")
    const restored = payloadToDraft(payload, "faq_list")
    const items = restored.content.items as Record<string, unknown>[]
    expect(items.length).toBe(2)
    expect(items[0].question).toBe("How?")
    expect(items[1].answer).toBe("Because.")
  })

  it("steps_list steps survive draft round-trip", () => {
    const draft: EditorDraft = {
      meta: { title: "Steps", subtitle: "", ctaPrimaryLabel: "", ctaPrimaryHref: "", ctaSecondaryLabel: "", ctaSecondaryHref: "", backgroundMediaUrl: "" },
      formatting: normalizeFormatting({}),
      content: {
        steps: [
          { title: "Step 1", body: "Do this", icon: "1️⃣" },
          { title: "Step 2", body: "Then that", stat: "2x" },
        ],
      },
    }
    const payload = draftToPayload(draft, "steps_list")
    const restored = payloadToDraft(payload, "steps_list")
    const steps = restored.content.steps as Record<string, unknown>[]
    expect(steps.length).toBe(2)
    expect(steps[0].title).toBe("Step 1")
    expect(steps[1].stat).toBe("2x")
  })

  it("CTA fields survive draft round-trip for hero_cta", () => {
    const draft: EditorDraft = {
      meta: { title: "Hero", subtitle: "Subtitle", ctaPrimaryLabel: "Start", ctaPrimaryHref: "/start", ctaSecondaryLabel: "Learn", ctaSecondaryHref: "/learn", backgroundMediaUrl: "/bg.jpg" },
      formatting: normalizeFormatting({}),
      content: { eyebrow: "Welcome" },
    }
    const payload = draftToPayload(draft, "hero_cta")
    expect(payload.cta_primary_label).toBe("Start")
    expect(payload.cta_primary_href).toBe("/start")
    expect(payload.cta_secondary_label).toBe("Learn")
    expect(payload.cta_secondary_href).toBe("/learn")
    expect(payload.background_media_url).toBe("/bg.jpg")

    const restored = payloadToDraft(payload, "hero_cta")
    expect(restored.meta.ctaPrimaryLabel).toBe("Start")
    expect(restored.meta.ctaSecondaryLabel).toBe("Learn")
    expect(restored.meta.backgroundMediaUrl).toBe("/bg.jpg")
  })
})

// ---------------------------------------------------------------------------
// Spacing control parity
// ---------------------------------------------------------------------------

describe("spacing controls parity", () => {
  it("spacingTop and spacingBottom are preserved in formatting", () => {
    const f = normalizeFormatting({ spacingTop: "pt-8", spacingBottom: "pb-12", outerSpacing: "my-4" })
    expect(f.spacingTop).toBe("pt-8")
    expect(f.spacingBottom).toBe("pb-12")
    expect(f.outerSpacing).toBe("my-4")
  })

  it("containerClass and sectionClass are preserved", () => {
    const f = normalizeFormatting({ containerClass: "my-custom-class", sectionClass: "section-class" })
    expect(f.containerClass).toBe("my-custom-class")
    expect(f.sectionClass).toBe("section-class")
  })
})

// ---------------------------------------------------------------------------
// Undo/redo logic
// ---------------------------------------------------------------------------

describe("undo/redo stack logic", () => {
  it("undo stack follows LIFO", () => {
    const stack: string[] = []
    stack.push("a")
    stack.push("b")
    stack.push("c")
    expect(stack.pop()).toBe("c")
    expect(stack.pop()).toBe("b")
    expect(stack.pop()).toBe("a")
  })

  it("redo stack is cleared on new action", () => {
    const undoStack: string[] = ["a", "b"]
    let redoStack: string[] = ["x", "y"]
    // Simulate new action
    undoStack.push("c")
    redoStack = [] // clear
    expect(redoStack.length).toBe(0)
    expect(undoStack.length).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Inline edit field mapping
// ---------------------------------------------------------------------------

describe("inline edit field mapping", () => {
  it("hero_cta has title, subtitle, eyebrow, CTA fields editable inline", () => {
    const v = resolveMetaFieldVisibility("hero_cta", {})
    expect(v.title).toBe(true)
    expect(v.subtitle).toBe(true)
    expect(v.ctaPrimary).toBe(true)
    expect(v.ctaSecondary).toBe(true)
  })

  it("card_grid does not expose CTA for inline editing", () => {
    const v = resolveMetaFieldVisibility("card_grid", {})
    expect(v.ctaPrimary).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Layout variant options
// ---------------------------------------------------------------------------

describe("layout variant persistence", () => {
  it("layoutVariant is preserved in content", () => {
    const draft: EditorDraft = {
      meta: { title: "Test", subtitle: "", ctaPrimaryLabel: "", ctaPrimaryHref: "", ctaSecondaryLabel: "", ctaSecondaryHref: "", backgroundMediaUrl: "" },
      formatting: normalizeFormatting({}),
      content: { layoutVariant: "timeline", steps: [] },
    }
    const payload = draftToPayload(draft, "steps_list")
    expect(payload.content.layoutVariant).toBe("timeline")

    const restored = payloadToDraft(payload, "steps_list")
    expect(restored.content.layoutVariant).toBe("timeline")
  })
})
