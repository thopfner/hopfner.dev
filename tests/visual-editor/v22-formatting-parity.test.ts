import { describe, it, expect } from "vitest"
import fs from "fs"
import { SECTION_PRESETS } from "@/lib/design-system/presets"

const inspectorSource = fs.readFileSync(
  "components/admin/visual-editor/page-visual-editor-inspector.tsx",
  "utf-8"
)

// ---------------------------------------------------------------------------
// F1 — Preset selector applies presentation tokens (not just the key)
// ---------------------------------------------------------------------------

describe("F1: preset selector applies tokens", () => {
  it("every SECTION_PRESETS entry has presentation tokens", () => {
    for (const [key, preset] of Object.entries(SECTION_PRESETS)) {
      expect(preset.presentation, `preset ${key} missing presentation`).toBeDefined()
      expect(preset.presentation.rhythm, `preset ${key} missing rhythm`).toBeTruthy()
      expect(preset.presentation.surface, `preset ${key} missing surface`).toBeDefined()
      expect(preset.presentation.density, `preset ${key} missing density`).toBeTruthy()
    }
  })

  it("inspector applies preset.presentation tokens on change (not just sectionPresetKey)", () => {
    // The preset onChange must spread presentation tokens into formatting
    expect(inspectorSource).toContain("preset.presentation.rhythm")
    expect(inspectorSource).toContain("preset.presentation.surface")
    expect(inspectorSource).toContain("preset.presentation.density")
    expect(inspectorSource).toContain("preset.presentation.gridGap")
    expect(inspectorSource).toContain("preset.presentation.headingTreatment")
    expect(inspectorSource).toContain("preset.presentation.labelStyle")
    expect(inspectorSource).toContain("preset.presentation.dividerMode")
    expect(inspectorSource).toContain("preset.presentation.subtitleSize")
  })

  it("inspector applies preset.component tokens on change", () => {
    expect(inspectorSource).toContain("preset.component?.family")
    expect(inspectorSource).toContain("preset.component?.chrome")
    expect(inspectorSource).toContain("preset.component?.accentRule")
  })

  it("inspector has updateFormattingBatch helper", () => {
    expect(inspectorSource).toContain("updateFormattingBatch")
  })
})

// ---------------------------------------------------------------------------
// F2 — pb-24 in SPACING_BOTTOM_OPTIONS
// ---------------------------------------------------------------------------

describe("F2: pb-24 spacing bottom option", () => {
  it("SPACING_BOTTOM_OPTIONS includes pb-24", () => {
    expect(inspectorSource).toMatch(/SPACING_BOTTOM_OPTIONS[\s\S]*?"pb-24"/)
  })
})

// ---------------------------------------------------------------------------
// F3 — Inner shadow step is 0.05
// ---------------------------------------------------------------------------

describe("F3: inner shadow step precision", () => {
  it("inner shadow slider uses step={0.05}", () => {
    // Find the InspectorSlider for inner shadow strength and verify step
    const match = inspectorSource.match(/innerShadowStrength[\s\S]*?step=\{([\d.]+)\}/)
    expect(match).toBeTruthy()
    expect(parseFloat(match![1])).toBe(0.05)
  })

  it("step is NOT 0.1 (the old value)", () => {
    // Ensure the old coarse step is gone for inner shadow
    const sliderBlock = inspectorSource.match(
      /innerShadowStrength[\s\S]{0,200}?step=\{([\d.]+)\}/
    )
    expect(sliderBlock).toBeTruthy()
    expect(parseFloat(sliderBlock![1])).not.toBe(0.1)
  })
})
