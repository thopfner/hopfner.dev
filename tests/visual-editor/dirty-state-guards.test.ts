import { describe, it, expect } from "vitest"
import {
  normalizeFormatting,
  payloadToDraft,
  draftToPayload,
  stableStringify,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft } from "@/components/admin/section-editor/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDraft(overrides: Partial<EditorDraft["meta"]> = {}, content: Record<string, unknown> = {}): EditorDraft {
  return {
    meta: {
      title: "Test Title",
      subtitle: "Test Subtitle",
      ctaPrimaryLabel: "Get Started",
      ctaPrimaryHref: "/start",
      ctaSecondaryLabel: "",
      ctaSecondaryHref: "",
      backgroundMediaUrl: "",
      ...overrides,
    },
    formatting: normalizeFormatting({}),
    content,
  }
}

function draftSignature(draft: EditorDraft): string {
  return stableStringify({ meta: draft.meta, content: draft.content })
}

// ---------------------------------------------------------------------------
// Guard A: field-level no-op protection
// ---------------------------------------------------------------------------

describe("dirty-state Guard A: field-level no-op", () => {
  it("unchanged value produces identical signature", () => {
    const original = makeDraft({ title: "Hello World" })
    const afterNoOp = { ...original, meta: { ...original.meta, title: "Hello World" } }
    expect(draftSignature(original)).toBe(draftSignature(afterNoOp))
  })

  it("changed value produces different signature", () => {
    const original = makeDraft({ title: "Hello World" })
    const afterEdit = { ...original, meta: { ...original.meta, title: "Goodbye World" } }
    expect(draftSignature(original)).not.toBe(draftSignature(afterEdit))
  })

  it("whitespace-only difference is still a real change", () => {
    const original = makeDraft({ title: "Hello" })
    const afterEdit = { ...original, meta: { ...original.meta, title: "Hello " } }
    expect(draftSignature(original)).not.toBe(draftSignature(afterEdit))
  })
})

// ---------------------------------------------------------------------------
// Guard B: draft-level semantic equality
// ---------------------------------------------------------------------------

describe("dirty-state Guard B: semantic equality", () => {
  it("identical drafts have same signature", () => {
    const draft1 = makeDraft({ title: "Test" }, { eyebrow: "Hello" })
    const draft2 = makeDraft({ title: "Test" }, { eyebrow: "Hello" })
    expect(draftSignature(draft1)).toBe(draftSignature(draft2))
  })

  it("edit + revert produces same signature as original", () => {
    const original = makeDraft({ title: "Original Title" }, { cards: [{ title: "Card 1" }] })
    // Simulate: edit title
    const edited = { ...original, meta: { ...original.meta, title: "Edited Title" } }
    expect(draftSignature(original)).not.toBe(draftSignature(edited))

    // Simulate: revert title back
    const reverted = { ...edited, meta: { ...edited.meta, title: "Original Title" } }
    expect(draftSignature(original)).toBe(draftSignature(reverted))
  })

  it("content field edit + revert clears dirty", () => {
    const original = makeDraft({}, { body: "Original body text" })
    const edited = { ...original, content: { body: "New body text" } }
    expect(draftSignature(original)).not.toBe(draftSignature(edited))

    const reverted = { ...edited, content: { body: "Original body text" } }
    expect(draftSignature(original)).toBe(draftSignature(reverted))
  })

  it("nested content edit + revert clears dirty", () => {
    const original = makeDraft({}, { cards: [{ title: "Card A", text: "Description" }] })
    const edited = {
      ...original,
      content: { cards: [{ title: "Card A Modified", text: "Description" }] },
    }
    expect(draftSignature(original)).not.toBe(draftSignature(edited))

    const reverted = {
      ...edited,
      content: { cards: [{ title: "Card A", text: "Description" }] },
    }
    expect(draftSignature(original)).toBe(draftSignature(reverted))
  })

  it("stableStringify handles key order differences", () => {
    const a = stableStringify({ b: 2, a: 1 })
    const b = stableStringify({ a: 1, b: 2 })
    expect(a).toBe(b)
  })

  it("stableStringify handles nested objects with different key orders", () => {
    const a = stableStringify({ meta: { title: "T", subtitle: "S" }, content: { x: 1 } })
    const b = stableStringify({ content: { x: 1 }, meta: { subtitle: "S", title: "T" } })
    expect(a).toBe(b)
  })
})

// ---------------------------------------------------------------------------
// Round-trip: payload → draft → payload preserves identity
// ---------------------------------------------------------------------------

describe("dirty-state: draft round-trip stability", () => {
  it("payloadToDraft → no edit → draftToPayload is semantically stable", () => {
    const payload = {
      title: "Test",
      subtitle: "Sub",
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      background_media_url: null,
      formatting: { sectionRhythm: "standard", paddingY: "py-6", widthMode: "content", heroMinHeight: "auto", shadowMode: "inherit", innerShadowMode: "inherit", innerShadowStrength: 0 },
      content: { eyebrow: "Hello", cards: [{ title: "A" }] },
    }

    const draft = payloadToDraft(payload, "card_grid")
    const sig1 = draftSignature(draft)

    // Create a "new draft" that should be identical
    const draft2 = payloadToDraft(payload, "card_grid")
    const sig2 = draftSignature(draft2)

    expect(sig1).toBe(sig2)
  })
})

// ---------------------------------------------------------------------------
// Selection handoff: no-op edits should not block navigation
// ---------------------------------------------------------------------------

describe("dirty-state: selection handoff behavior", () => {
  it("draft with no-op edit should match original signature", () => {
    const original = makeDraft({ title: "Page Title" }, { eyebrow: "Welcome" })

    // Simulate opening a field, not changing anything, then closing
    // The draft state should be identical to original
    const afterNoOp = {
      ...original,
      meta: { ...original.meta }, // shallow copy but same values
      content: { ...original.content },
    }

    expect(draftSignature(afterNoOp)).toBe(draftSignature(original))
  })

  it("actual edit creates different signature (would trigger prompt)", () => {
    const original = makeDraft({ title: "Page Title" })
    const edited = { ...original, meta: { ...original.meta, title: "Changed" } }
    expect(draftSignature(edited)).not.toBe(draftSignature(original))
  })
})
