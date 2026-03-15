import { describe, it, expect } from "vitest"
import {
  versionRowToPayload,
  payloadToDraft,
  normalizeFormatting,
  deepMerge,
  asRecord,
} from "@/components/admin/section-editor/payload"
import type {
  SectionVersionRow,
  SectionTypeDefault,
} from "@/components/admin/section-editor/types"
import { resolveSectionUi } from "@/lib/design-system/resolve"
import { SECTION_CAPABILITIES } from "@/lib/design-system/capabilities"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeVersionRow(
  overrides: Partial<SectionVersionRow> = {}
): SectionVersionRow {
  return {
    id: "v1",
    owner_id: "s1",
    version: 1,
    status: "draft",
    title: "Test Section",
    subtitle: "A subtitle",
    cta_primary_label: null,
    cta_primary_href: null,
    cta_secondary_label: null,
    cta_secondary_href: null,
    background_media_url: null,
    formatting: {},
    content: {},
    created_at: "2026-01-01T00:00:00Z",
    published_at: null,
    ...overrides,
  }
}

function makeDefaults(
  sectionType: string,
  overrides: Partial<SectionTypeDefault> = {}
): SectionTypeDefault {
  return {
    section_type: sectionType,
    label: sectionType.replaceAll("_", " "),
    description: null,
    default_title: null,
    default_subtitle: null,
    default_cta_primary_label: null,
    default_cta_primary_href: null,
    default_cta_secondary_label: null,
    default_cta_secondary_href: null,
    default_background_media_url: null,
    default_formatting: {},
    default_content: {},
    capabilities: {},
    ...overrides,
  }
}

/**
 * Full pipeline: version row → payload → draft → resolve UI tokens.
 * This mirrors the exact path used by both the visual editor preview
 * and the public renderer.
 */
function runPipeline(
  sectionType: string,
  row: Partial<SectionVersionRow> = {},
  defaults?: Partial<SectionTypeDefault>
) {
  const versionRow = makeVersionRow(row)
  const typeDefaults = defaults
    ? makeDefaults(sectionType, defaults)
    : undefined
  const payload = versionRowToPayload(versionRow, typeDefaults)
  const draft = payloadToDraft(payload, sectionType)
  const ui = resolveSectionUi(
    asRecord(payload.formatting),
    sectionType
  )
  return { payload, draft, ui }
}

// ---------------------------------------------------------------------------
// Section types to test (12 representative built-in types)
// ---------------------------------------------------------------------------

const SECTION_TYPES = [
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
  "social_proof_strip",
  "proof_cluster",
  "case_study_split",
  "booking_scheduler",
] as const

// ---------------------------------------------------------------------------
// Render fidelity: token resolution per type
// ---------------------------------------------------------------------------

describe("render fidelity — token resolution pipeline", () => {
  it.each(SECTION_TYPES)(
    "%s: empty formatting resolves to valid defaults",
    (sectionType) => {
      const { ui } = runPipeline(sectionType)

      // Every resolved UI must have all required token fields
      expect(ui.rhythm).toBeDefined()
      expect(ui.surface).toBeDefined()
      expect(ui.density).toBeDefined()
      expect(ui.gridGap).toBeDefined()
      expect(ui.headingTreatment).toBeDefined()
      expect(ui.labelStyle).toBeDefined()
      expect(ui.dividerMode).toBeDefined()
      expect(ui.subtitleSize).toBeDefined()
    }
  )

  it.each(SECTION_TYPES)(
    "%s: explicit formatting tokens pass through resolver",
    (sectionType) => {
      const { ui } = runPipeline(sectionType, {
        formatting: {
          sectionRhythm: "compact",
          sectionSurface: "panel",
          contentDensity: "tight",
          gridGap: "wide",
          headingTreatment: "mono",
          labelStyle: "pill",
          dividerMode: "subtle",
          subtitleSize: "lg",
        },
      })

      expect(ui.rhythm).toBe("compact")
      expect(ui.surface).toBe("panel")
      expect(ui.density).toBe("tight")
      expect(ui.gridGap).toBe("wide")
      expect(ui.headingTreatment).toBe("mono")
      expect(ui.labelStyle).toBe("pill")
      expect(ui.dividerMode).toBe("subtle")
      expect(ui.subtitleSize).toBe("lg")
    }
  )

  it.each(SECTION_TYPES)(
    "%s: invalid tokens fall back to defaults",
    (sectionType) => {
      const { ui } = runPipeline(sectionType, {
        formatting: {
          sectionRhythm: "INVALID",
          sectionSurface: "INVALID",
          contentDensity: "INVALID",
          gridGap: "INVALID",
          subtitleSize: "INVALID",
        },
      })

      // Should get fallback defaults, not crash
      expect(ui.rhythm).not.toBe("INVALID")
      expect(ui.surface).not.toBe("INVALID")
      expect(ui.density).not.toBe("INVALID")
      expect(ui.gridGap).not.toBe("INVALID")
      expect(ui.subtitleSize).not.toBe("INVALID")
    }
  )
})

// ---------------------------------------------------------------------------
// Section-type default rhythms
// ---------------------------------------------------------------------------

describe("render fidelity — section-type default rhythms", () => {
  it("hero_cta defaults to 'hero' rhythm", () => {
    const { ui } = runPipeline("hero_cta")
    expect(ui.rhythm).toBe("hero")
  })

  it("cta_block defaults to 'cta' rhythm", () => {
    const { ui } = runPipeline("cta_block")
    expect(ui.rhythm).toBe("cta")
  })

  it("social_proof_strip defaults to 'compact' rhythm", () => {
    const { ui } = runPipeline("social_proof_strip")
    expect(ui.rhythm).toBe("compact")
  })

  it("label_value_list defaults to 'compact' rhythm", () => {
    const { ui } = runPipeline("label_value_list")
    expect(ui.rhythm).toBe("compact")
  })

  it("card_grid defaults to 'standard' rhythm", () => {
    const { ui } = runPipeline("card_grid")
    expect(ui.rhythm).toBe("standard")
  })
})

// ---------------------------------------------------------------------------
// Formatting merge precedence: defaults → version override
// ---------------------------------------------------------------------------

describe("render fidelity — merge precedence", () => {
  it("version formatting overrides type defaults", () => {
    const { ui } = runPipeline(
      "card_grid",
      { formatting: { sectionSurface: "contrast_band", subtitleSize: "lg" } },
      { default_formatting: { sectionSurface: "panel", subtitleSize: "sm" } }
    )

    expect(ui.surface).toBe("contrast_band")
    expect(ui.subtitleSize).toBe("lg")
  })

  it("type defaults apply when version formatting is empty", () => {
    const { ui } = runPipeline(
      "steps_list",
      { formatting: {} },
      {
        default_formatting: {
          sectionSurface: "soft_band",
          contentDensity: "airy",
          subtitleSize: "md",
        },
      }
    )

    expect(ui.surface).toBe("soft_band")
    expect(ui.density).toBe("airy")
    expect(ui.subtitleSize).toBe("md")
  })

  it("deepMerge preserves nested formatting keys", () => {
    const base = { sectionRhythm: "standard", contentDensity: "standard" }
    const override = { contentDensity: "tight", gridGap: "wide" }
    const merged = deepMerge(base, override)

    expect(merged.sectionRhythm).toBe("standard")
    expect(merged.contentDensity).toBe("tight")
    expect(merged.gridGap).toBe("wide")
  })
})

// ---------------------------------------------------------------------------
// Draft round-trip fidelity
// ---------------------------------------------------------------------------

describe("render fidelity — draft round-trip", () => {
  it.each(SECTION_TYPES)(
    "%s: payload → draft → formatting preserves all tokens",
    (sectionType) => {
      const formatting = {
        sectionRhythm: "compact",
        sectionSurface: "panel",
        contentDensity: "tight",
        subtitleSize: "md",
        paddingY: "py-8",
        maxWidth: "max-w-5xl",
        widthMode: "content",
        heroMinHeight: "auto",
        shadowMode: "inherit",
        innerShadowMode: "inherit",
        innerShadowStrength: 0,
      }

      const row = makeVersionRow({ formatting })
      const payload = versionRowToPayload(row)
      const draft = payloadToDraft(payload, sectionType)

      expect(draft.formatting.sectionRhythm).toBe("compact")
      expect(draft.formatting.sectionSurface).toBe("panel")
      expect(draft.formatting.contentDensity).toBe("tight")
      expect(draft.formatting.subtitleSize).toBe("md")
    }
  )
})

// ---------------------------------------------------------------------------
// Subtitle hydration from content
// ---------------------------------------------------------------------------

describe("render fidelity — subtitle hydration", () => {
  it("hydrates meta.subtitle from content.subtitle for built-in types", () => {
    const { draft } = runPipeline("card_grid", {
      subtitle: null,
      content: { subtitle: "From content" },
    })
    expect(draft.meta.subtitle).toBe("From content")
  })

  it("meta.subtitle takes precedence over content.subtitle", () => {
    const { draft } = runPipeline("hero_cta", {
      subtitle: "From meta",
      content: { subtitle: "From content" },
    })
    expect(draft.meta.subtitle).toBe("From meta")
  })
})

// ---------------------------------------------------------------------------
// Component tokens (cardFamily, cardChrome, accentRule)
// ---------------------------------------------------------------------------

describe("render fidelity — component tokens", () => {
  it("cardFamily/cardChrome resolve when set", () => {
    const { ui } = runPipeline("card_grid", {
      formatting: { cardFamily: "service", cardChrome: "elevated" },
    })
    expect(ui.componentFamily).toBe("service")
    expect(ui.componentChrome).toBe("elevated")
  })

  it("component tokens are undefined when empty", () => {
    const { ui } = runPipeline("rich_text_block", {
      formatting: {},
    })
    expect(ui.componentFamily).toBeUndefined()
    expect(ui.componentChrome).toBeUndefined()
    expect(ui.accentRule).toBeUndefined()
  })

  it("accentRule resolves when set", () => {
    const { ui } = runPipeline("proof_cluster", {
      formatting: { accentRule: "left" },
    })
    expect(ui.accentRule).toBe("left")
  })
})

// ---------------------------------------------------------------------------
// Capability matrix consistency
// ---------------------------------------------------------------------------

describe("render fidelity — capability matrix", () => {
  it.each(SECTION_TYPES)(
    "%s: has capability entry",
    (sectionType) => {
      expect(SECTION_CAPABILITIES[sectionType]).toBeDefined()
      expect(Array.isArray(SECTION_CAPABILITIES[sectionType].supported)).toBe(
        true
      )
    }
  )
})
