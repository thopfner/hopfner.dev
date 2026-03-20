/**
 * CTA field-state parity tests — visual editor surfaces.
 *
 * Proves that CTA label/link inputs become disabled when their
 * corresponding toggle is off, and re-enable with preserved values
 * when toggled back on.
 */
import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import {
  setSharedCtaEnabled,
  getSharedCtaEnabled,
  setFooterCardCtaEnabled,
  getFooterCardCtaEnabled,
} from "@/lib/cms/cta-visibility"

// ---------------------------------------------------------------------------
// Source for structural assertions
// ---------------------------------------------------------------------------
const inspectorSource = fs.readFileSync(
  path.resolve("components/admin/visual-editor/page-visual-editor-inspector.tsx"),
  "utf-8"
)
const globalPanelSource = fs.readFileSync(
  path.resolve("components/admin/visual-editor/page-visual-editor-global-section-panel.tsx"),
  "utf-8"
)

// ---------------------------------------------------------------------------
// InspectorInput disabled support
// ---------------------------------------------------------------------------
describe("InspectorInput disabled prop", () => {
  it("accepts a disabled prop in its type signature", () => {
    expect(inspectorSource).toContain("disabled?: boolean")
  })

  it("includes disabled styling classes", () => {
    expect(inspectorSource).toContain("disabled:opacity-40")
    expect(inspectorSource).toContain("disabled:cursor-not-allowed")
  })

  it("forwards disabled attribute to native elements", () => {
    // Both branches (input and textarea) must forward disabled
    const fnBody = inspectorSource.slice(
      inspectorSource.indexOf("function InspectorInput"),
      inspectorSource.indexOf("function InspectorDivider")
    )
    // Count occurrences of disabled={disabled} — should be at least 2 (input + textarea)
    const matches = fnBody.match(/disabled=\{disabled\}/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Visual inspector CTA disabled state
// ---------------------------------------------------------------------------
describe("Visual inspector CTA disabled state", () => {
  it("primary CTA inputs are disabled when toggle is off", () => {
    // The CTA Label and CTA Link inputs after the primary toggle must have disabled prop
    expect(inspectorSource).toContain('label="CTA Label"')
    expect(inspectorSource).toContain('label="CTA Link"')
    // Both must reference canTogglePri and priEnabled in their disabled expression
    const actionsBlock = inspectorSource.slice(
      inspectorSource.indexOf("ACTIONS (CTA"),
      inspectorSource.indexOf("STYLE")
    )
    // Count disabled={canTogglePri && !priEnabled} occurrences
    const priDisabled = (actionsBlock.match(/disabled=\{canTogglePri && !priEnabled\}/g) ?? [])
    expect(priDisabled.length).toBe(2) // label + link
  })

  it("secondary CTA inputs are disabled when toggle is off", () => {
    const actionsBlock = inspectorSource.slice(
      inspectorSource.indexOf("ACTIONS (CTA"),
      inspectorSource.indexOf("STYLE")
    )
    const secDisabled = (actionsBlock.match(/disabled=\{canToggleSec && !secEnabled\}/g) ?? [])
    expect(secDisabled.length).toBe(2) // label + link
  })
})

// ---------------------------------------------------------------------------
// GInput disabled support
// ---------------------------------------------------------------------------
describe("GInput disabled prop", () => {
  it("accepts a disabled prop in its type signature", () => {
    expect(globalPanelSource).toContain("disabled?: boolean")
  })

  it("includes disabled styling classes", () => {
    expect(globalPanelSource).toContain("disabled:opacity-40")
    expect(globalPanelSource).toContain("disabled:cursor-not-allowed")
  })

  it("forwards disabled attribute to native elements", () => {
    const fnBody = globalPanelSource.slice(
      globalPanelSource.indexOf("function GInput"),
      globalPanelSource.indexOf("function GSelect")
    )
    const matches = fnBody.match(/disabled=\{disabled\}/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Global panel — NavLinks header CTA disabled state
// ---------------------------------------------------------------------------
describe("Global panel NavLinks header CTA disabled state", () => {
  it("header CTA label is disabled when ctaEnabled is false", () => {
    const navLinksBlock = globalPanelSource.slice(
      globalPanelSource.indexOf("function NavLinksContent"),
      globalPanelSource.indexOf("function FooterGridContent")
    )
    expect(navLinksBlock).toContain('label="CTA Label"')
    expect(navLinksBlock).toContain("disabled={!ctaEnabled}")
  })

  it("header CTA link is disabled when ctaEnabled is false", () => {
    const navLinksBlock = globalPanelSource.slice(
      globalPanelSource.indexOf("function NavLinksContent"),
      globalPanelSource.indexOf("function FooterGridContent")
    )
    expect(navLinksBlock).toContain('label="CTA Link"')
    // Count disabled={!ctaEnabled} — should be 2 (label + link)
    const matches = navLinksBlock.match(/disabled=\{!ctaEnabled\}/g) ?? []
    expect(matches.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Global panel — footer card CTA disabled state
// ---------------------------------------------------------------------------
describe("Global panel footer card CTA disabled state", () => {
  // Extract footer grid content function body
  const footerStart = globalPanelSource.indexOf("function FooterGridContent")
  const footerEnd = globalPanelSource.indexOf("// -----", footerStart)
  const footerBlock = footerEnd > footerStart
    ? globalPanelSource.slice(footerStart, footerEnd)
    : globalPanelSource.slice(footerStart)

  it("CTA 1 label/link are disabled when card primary CTA is hidden", () => {
    expect(footerBlock).toContain('label="CTA 1 Label"')
    expect(footerBlock).toContain('label="CTA 1 Link"')
    const priDisabled = (footerBlock.match(/disabled=\{!getFooterCardCtaEnabled\(card, "ctaPrimary"\)\}/g) ?? [])
    expect(priDisabled.length).toBe(2)
  })

  it("CTA 2 label/link are disabled when card secondary CTA is hidden", () => {
    expect(footerBlock).toContain('label="CTA 2 Label"')
    expect(footerBlock).toContain('label="CTA 2 Link"')
    const secDisabled = (footerBlock.match(/disabled=\{!getFooterCardCtaEnabled\(card, "ctaSecondary"\)\}/g) ?? [])
    expect(secDisabled.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Global panel — stale top-level subscribe removal
// ---------------------------------------------------------------------------
describe("Global panel footer subscribe truth", () => {
  it("does not contain top-level subscribe field editing calls", () => {
    // The live footer renderer reads subscribe per card.
    // The global panel must NOT have top-level subscribeEnabled/subscribePlaceholder/subscribeButtonLabel editing.
    expect(globalPanelSource).not.toMatch(/onContentChange\("subscribeEnabled"/)
    expect(globalPanelSource).not.toMatch(/onContentChange\("subscribePlaceholder"/)
    expect(globalPanelSource).not.toMatch(/onContentChange\("subscribeButtonLabel"/)
  })

  it("does not render a top-level Subscribe collapsible", () => {
    // There should be no GCollapsible with label="Subscribe"
    expect(globalPanelSource).not.toMatch(/label="Subscribe"/)
  })
})

// ---------------------------------------------------------------------------
// CTA value preservation — behavioral proof
// ---------------------------------------------------------------------------
describe("CTA value preservation on toggle", () => {
  it("shared CTA values are preserved through disable/enable cycle", () => {
    const content = {
      ctaPrimaryLabel: "Get started",
      ctaPrimaryHref: "/contact",
      ctaPrimaryEnabled: true,
      other: "data",
    }
    const disabled = setSharedCtaEnabled(content, "ctaPrimary", false)
    expect(disabled.ctaPrimaryEnabled).toBe(false)
    expect(disabled.ctaPrimaryLabel).toBe("Get started")
    expect(disabled.ctaPrimaryHref).toBe("/contact")
    expect(disabled.other).toBe("data")

    const reEnabled = setSharedCtaEnabled(disabled, "ctaPrimary", true)
    expect(reEnabled.ctaPrimaryEnabled).toBe(true)
    expect(reEnabled.ctaPrimaryLabel).toBe("Get started")
    expect(reEnabled.ctaPrimaryHref).toBe("/contact")
  })

  it("footer card CTA values are preserved through disable/enable cycle", () => {
    const card = {
      ctaPrimary: { label: "Learn more", href: "/about", enabled: true },
      title: "Footer card",
    }
    const disabled = setFooterCardCtaEnabled(card, "ctaPrimary", false)
    const cta = disabled.ctaPrimary as Record<string, unknown>
    expect(cta.enabled).toBe(false)
    expect(cta.label).toBe("Learn more")
    expect(cta.href).toBe("/about")

    const reEnabled = setFooterCardCtaEnabled(disabled, "ctaPrimary", true)
    const ctaRe = reEnabled.ctaPrimary as Record<string, unknown>
    expect(ctaRe.enabled).toBe(true)
    expect(ctaRe.label).toBe("Learn more")
    expect(ctaRe.href).toBe("/about")
  })
})
