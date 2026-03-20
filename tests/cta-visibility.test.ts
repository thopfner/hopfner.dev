/**
 * CTA visibility helper + renderer behavior tests.
 *
 * Sprint 2 — local shared CTA visibility.
 */
import { describe, it, expect } from "vitest"
import {
  isSharedCtaToggleSupported,
  getSharedCtaEnabled,
  setSharedCtaEnabled,
  getFooterCardCtaEnabled,
  setFooterCardCtaEnabled,
  getComposerBlockCtaEnabled,
  setComposerBlockCtaEnabled,
} from "@/lib/cms/cta-visibility"

// ---------------------------------------------------------------------------
// Shared CTA helpers
// ---------------------------------------------------------------------------

describe("getSharedCtaEnabled", () => {
  it("returns true when flag is missing (default enabled)", () => {
    expect(getSharedCtaEnabled({}, "ctaPrimary")).toBe(true)
    expect(getSharedCtaEnabled({}, "ctaSecondary")).toBe(true)
  })

  it("returns false when explicit flag is false", () => {
    expect(getSharedCtaEnabled({ ctaPrimaryEnabled: false }, "ctaPrimary")).toBe(false)
    expect(getSharedCtaEnabled({ ctaSecondaryEnabled: false }, "ctaSecondary")).toBe(false)
  })

  it("returns true when explicit flag is true", () => {
    expect(getSharedCtaEnabled({ ctaPrimaryEnabled: true }, "ctaPrimary")).toBe(true)
  })
})

describe("setSharedCtaEnabled", () => {
  it("sets the flag without modifying other content", () => {
    const content = { title: "hello", ctaPrimaryEnabled: true }
    const result = setSharedCtaEnabled(content, "ctaPrimary", false)
    expect(result.ctaPrimaryEnabled).toBe(false)
    expect(result.title).toBe("hello")
  })

  it("preserves existing content keys", () => {
    const content = { ctaSecondaryEnabled: true, items: [1, 2] }
    const result = setSharedCtaEnabled(content, "ctaSecondary", false)
    expect(result.ctaSecondaryEnabled).toBe(false)
    expect(result.items).toEqual([1, 2])
  })
})

describe("isSharedCtaToggleSupported", () => {
  it("excludes booking_scheduler", () => {
    expect(isSharedCtaToggleSupported("booking_scheduler", "ctaPrimary")).toBe(false)
    expect(isSharedCtaToggleSupported("booking_scheduler", "ctaSecondary")).toBe(false)
  })

  it("allows hero_cta", () => {
    expect(isSharedCtaToggleSupported("hero_cta", "ctaPrimary")).toBe(true)
    expect(isSharedCtaToggleSupported("hero_cta", "ctaSecondary")).toBe(true)
  })

  it("allows cta_block", () => {
    expect(isSharedCtaToggleSupported("cta_block", "ctaPrimary")).toBe(true)
  })

  it("allows proof_cluster", () => {
    expect(isSharedCtaToggleSupported("proof_cluster", "ctaPrimary")).toBe(true)
  })

  it("allows case_study_split", () => {
    expect(isSharedCtaToggleSupported("case_study_split", "ctaPrimary")).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Footer card CTA helpers
// ---------------------------------------------------------------------------

describe("getFooterCardCtaEnabled", () => {
  it("returns true when card has no CTA object", () => {
    expect(getFooterCardCtaEnabled({}, "ctaPrimary")).toBe(true)
  })

  it("returns true when CTA object exists but enabled flag is missing", () => {
    expect(getFooterCardCtaEnabled({ ctaPrimary: { label: "Go", href: "/" } }, "ctaPrimary")).toBe(true)
  })

  it("returns false when CTA object has enabled: false", () => {
    expect(getFooterCardCtaEnabled({ ctaPrimary: { label: "Go", href: "/", enabled: false } }, "ctaPrimary")).toBe(false)
  })
})

describe("setFooterCardCtaEnabled", () => {
  it("adds enabled flag to existing CTA object", () => {
    const card = { ctaPrimary: { label: "Go", href: "/" } }
    const result = setFooterCardCtaEnabled(card, "ctaPrimary", false)
    const cta = result.ctaPrimary as Record<string, unknown>
    expect(cta.enabled).toBe(false)
    expect(cta.label).toBe("Go")
    expect(cta.href).toBe("/")
  })
})

// ---------------------------------------------------------------------------
// Composer block CTA helpers
// ---------------------------------------------------------------------------

describe("getComposerBlockCtaEnabled", () => {
  it("returns true when flag is missing", () => {
    expect(getComposerBlockCtaEnabled({}, "ctaPrimary")).toBe(true)
  })

  it("returns false when explicit flag is false", () => {
    expect(getComposerBlockCtaEnabled({ ctaPrimaryEnabled: false }, "ctaPrimary")).toBe(false)
  })
})

describe("setComposerBlockCtaEnabled", () => {
  it("sets flag without losing other block data", () => {
    const block = { ctaPrimaryLabel: "Click", ctaPrimaryHref: "/go" }
    const result = setComposerBlockCtaEnabled(block, "ctaPrimary", false)
    expect(result.ctaPrimaryEnabled).toBe(false)
    expect(result.ctaPrimaryLabel).toBe("Click")
    expect(result.ctaPrimaryHref).toBe("/go")
  })
})
