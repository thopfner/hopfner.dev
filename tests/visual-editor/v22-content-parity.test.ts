import { describe, it, expect } from "vitest"
import fs from "fs"

const inspectorSource = fs.readFileSync(
  "components/admin/visual-editor/page-visual-editor-inspector.tsx",
  "utf-8"
)

const globalPanelSource = fs.readFileSync(
  "components/admin/visual-editor/page-visual-editor-global-section-panel.tsx",
  "utf-8"
)

// ---------------------------------------------------------------------------
// Phase 2: Hero, Rich Text, Booking, Proof Cluster, Case Study
// ---------------------------------------------------------------------------

describe("hero_cta content controls", () => {
  it("has heroContentOrder block order editor", () => {
    expect(inspectorSource).toContain("heroContentOrder")
  })

  it("has bullets array editor", () => {
    expect(inspectorSource).toMatch(/sectionType === "hero_cta"[\s\S]*?bullets/)
  })

  it("has trustLine input", () => {
    expect(inspectorSource).toMatch(/sectionType === "hero_cta"[\s\S]*?trustLine/)
  })

  it("has trustItems array editor", () => {
    expect(inspectorSource).toMatch(/sectionType === "hero_cta"[\s\S]*?trustItems/)
  })

  it("has heroStats array editor", () => {
    expect(inspectorSource).toMatch(/sectionType === "hero_cta"[\s\S]*?heroStats/)
  })

  it("has proofPanel controls", () => {
    expect(inspectorSource).toContain("proofPanel")
    expect(inspectorSource).toContain("Proof Panel Type")
  })
})

describe("rich_text_block content controls", () => {
  it("has body textarea (not just 'best edited' message)", () => {
    const richTextBlock = inspectorSource.match(
      /sectionType === "rich_text_block"[\s\S]*?(?=sectionType ===|$)/
    )
    expect(richTextBlock).toBeTruthy()
    expect(richTextBlock![0]).toContain("content.body")
    // Old message should be gone as the primary content
    expect(richTextBlock![0]).not.toMatch(
      /Rich text content is best edited in the form editor\./
    )
  })

  it("references bodyRichText with TipTapJsonEditor", () => {
    expect(inspectorSource).toContain("bodyRichText")
    expect(inspectorSource).toContain("TipTapJsonEditor")
  })
})

describe("booking_scheduler content controls", () => {
  it("has calLink, formHeading, submitLabel", () => {
    expect(inspectorSource).toContain('"calLink"')
    expect(inspectorSource).toContain('"formHeading"')
    expect(inspectorSource).toContain('"submitLabel"')
  })

  it("has intake field label and help text editors", () => {
    expect(inspectorSource).toContain("intakeFields")
    expect(inspectorSource).toContain("fullName")
    expect(inspectorSource).toContain("workEmail")
    expect(inspectorSource).toContain("desiredOutcome90d")
  })

  it("references all 9 intake field keys", () => {
    const keys = [
      "fullName", "workEmail", "company", "jobTitle", "teamSize",
      "functionArea", "currentTools", "mainBottleneck", "desiredOutcome90d",
    ]
    for (const key of keys) {
      expect(inspectorSource).toContain(key)
    }
  })
})

describe("proof_cluster content controls", () => {
  it("has proofCard title and body", () => {
    expect(inspectorSource).toContain("proofCard")
    expect(inspectorSource).toContain("Proof Card Title")
    expect(inspectorSource).toContain("Proof Card Body")
  })

  it("has proofCard stats array", () => {
    expect(inspectorSource).toContain("Proof Card Stats")
  })

  it("has testimonial imageUrl field", () => {
    // The testimonial section must include imageUrl
    const proofClusterBlock = inspectorSource.match(
      /sectionType === "proof_cluster"[\s\S]*?(?=\{\/\* |$)/
    )
    expect(proofClusterBlock).toBeTruthy()
    expect(proofClusterBlock![0]).toContain("imageUrl")
  })
})

describe("case_study_split content controls", () => {
  it("has mediaTitle input", () => {
    expect(inspectorSource).toContain('"mediaTitle"')
  })

  it("has mediaImageUrl with MediaField", () => {
    expect(inspectorSource).toContain('"mediaImageUrl"')
    // Should use MediaField component
    const caseStudyBlock = inspectorSource.match(
      /sectionType === "case_study_split"[\s\S]*?(?=\{\/\* |$)/
    )
    expect(caseStudyBlock).toBeTruthy()
    expect(caseStudyBlock![0]).toContain("MediaField")
  })
})

// ---------------------------------------------------------------------------
// Phase 3: Card Grid, Social Proof Strip, Label Value List
// ---------------------------------------------------------------------------

describe("card_grid enhanced content controls", () => {
  it("card array includes imageUrl field", () => {
    const cardGridBlock = inspectorSource.match(
      /sectionType === "card_grid"[\s\S]*?(?=\{\/\* |$)/
    )
    expect(cardGridBlock).toBeTruthy()
    expect(cardGridBlock![0]).toContain("imageUrl")
  })
})

describe("social_proof_strip content controls", () => {
  it("has logo array with imageUrl field", () => {
    const socialBlock = inspectorSource.match(
      /sectionType === "social_proof_strip"[\s\S]*?(?=\{\/\* |$)/
    )
    expect(socialBlock).toBeTruthy()
    expect(socialBlock![0]).toContain("imageUrl")
  })
})

describe("label_value_list content controls", () => {
  it("has compact mode toggle", () => {
    const lvlBlock = inspectorSource.match(
      /sectionType === "label_value_list"[\s\S]*?(?=\{\/\* |$)/
    )
    expect(lvlBlock).toBeTruthy()
    expect(lvlBlock![0]).toContain("compact")
  })
})

// ---------------------------------------------------------------------------
// Phase 4: Global Nav & Footer Parity
// ---------------------------------------------------------------------------

describe("nav_links global section content controls", () => {
  it("has logo editing (MediaField + alt + width)", () => {
    expect(globalPanelSource).toContain("NavLinksContent")
    expect(globalPanelSource).toContain("Logo Image")
    expect(globalPanelSource).toContain("Alt Text")
    expect(globalPanelSource).toContain("Width (px)")
  })

  it("has nav links array editor with label and href", () => {
    expect(globalPanelSource).toContain("Nav Links")
    expect(globalPanelSource).toMatch(/fields.*label.*Label.*href.*Link URL/)
  })

  it("renders NavLinksContent for nav_links section type", () => {
    expect(globalPanelSource).toContain('sectionType === "nav_links"')
  })
})

describe("footer_grid global section content controls", () => {
  it("has brand text and copyright", () => {
    expect(globalPanelSource).toContain("FooterGridContent")
    expect(globalPanelSource).toContain("Brand Text")
    expect(globalPanelSource).toContain("Copyright")
  })

  it("has footer cards array editor", () => {
    expect(globalPanelSource).toContain("Footer Cards")
  })

  it("has legal links array editor", () => {
    expect(globalPanelSource).toContain("Legal Links")
  })

  it("has CTA 1 and CTA 2 controls", () => {
    expect(globalPanelSource).toContain("CTA 1 Label")
    expect(globalPanelSource).toContain("CTA 1 Link")
    expect(globalPanelSource).toContain("CTA 2 Label")
    expect(globalPanelSource).toContain("CTA 2 Link")
  })

  it("has subscribe toggle, placeholder, button label", () => {
    expect(globalPanelSource).toContain("subscribeEnabled")
    expect(globalPanelSource).toContain("subscribePlaceholder")
    expect(globalPanelSource).toContain("subscribeButtonLabel")
  })

  it("renders FooterGridContent for footer_grid section type", () => {
    expect(globalPanelSource).toContain('sectionType === "footer_grid"')
  })
})

describe("global section safety", () => {
  it("warning banner is still present", () => {
    expect(globalPanelSource).toContain("global-warning-banner")
    expect(globalPanelSource).toContain("Changes affect all pages using it")
  })

  it("save/publish buttons present for editable global sections", () => {
    expect(globalPanelSource).toContain("Save draft")
    expect(globalPanelSource).toContain("Publish")
  })

  it("link to global section editor still present", () => {
    expect(globalPanelSource).toContain("/admin/global-sections")
    expect(globalPanelSource).toContain("Open global section editor")
  })
})

// ---------------------------------------------------------------------------
// Remediation Gaps 1–5
// ---------------------------------------------------------------------------

describe("Gap 1: hero_cta heroContentSides (split layout block assignment)", () => {
  it("has heroContentSides field in inspector", () => {
    expect(inspectorSource).toContain("heroContentSides")
  })

  it("shows Block Sides divider for split layouts", () => {
    expect(inspectorSource).toContain('"Block Sides"')
  })

  it("only renders side selects when layout is split or split_reversed", () => {
    expect(inspectorSource).toMatch(/layoutVariant.*===.*"split"/)
    expect(inspectorSource).toMatch(/layoutVariant.*===.*"split_reversed"/)
  })

  it("offers left/right options per block", () => {
    expect(inspectorSource).toMatch(/value: "left".*label: "Left"/)
    expect(inspectorSource).toMatch(/value: "right".*label: "Right"/)
  })
})

describe("Gap 2: rich_text_block TipTapJsonEditor integration", () => {
  it("imports TipTapJsonEditor", () => {
    expect(inspectorSource).toContain("TipTapJsonEditor")
  })

  it("renders TipTapJsonEditor when bodyRichText is present", () => {
    expect(inspectorSource).toMatch(/bodyRichText.*typeof.*=== "object"[\s\S]*?TipTapJsonEditor/)
  })

  it("falls back to plain text body when bodyRichText is absent", () => {
    // The fallback InspectorInput for body should still be present
    const richBlock = inspectorSource.match(
      /sectionType === "rich_text_block"[\s\S]*?(?=\{\/\*|$)/
    )
    expect(richBlock).toBeTruthy()
    expect(richBlock![0]).toContain("content.body")
  })
})

describe("Gap 3: card_grid display toggles and extended fields", () => {
  it("has cardDisplay global toggle section", () => {
    expect(inspectorSource).toContain("cardDisplay")
    expect(inspectorSource).toContain('"Default Card Fields"')
  })

  it("has all 5 display toggle keys", () => {
    for (const key of ["showTitle", "showText", "showImage", "showYouGet", "showBestFor"]) {
      expect(inspectorSource).toContain(key)
    }
  })

  it("card array includes alt and bestFor fields", () => {
    const cardGridBlock = inspectorSource.match(
      /sectionType === "card_grid"[\s\S]*?(?=\{\/\*|$)/
    )
    expect(cardGridBlock).toBeTruthy()
    expect(cardGridBlock![0]).toContain('"alt"')
    expect(cardGridBlock![0]).toContain('"bestFor"')
  })
})

describe("Gap 4: social_proof_strip MediaField logos", () => {
  it("uses MediaField for logo images", () => {
    const socialBlock = inspectorSource.match(
      /sectionType === "social_proof_strip"[\s\S]*?(?=\{\/\*|$)/
    )
    expect(socialBlock).toBeTruthy()
    expect(socialBlock![0]).toContain("MediaField")
  })

  it("has per-logo collapsible groups", () => {
    const socialBlock = inspectorSource.match(
      /sectionType === "social_proof_strip"[\s\S]*?(?=\{\/\*|$)/
    )
    expect(socialBlock).toBeTruthy()
    expect(socialBlock![0]).toContain("CollapsibleGroup")
  })

  it("has add/remove/move controls for logos", () => {
    const socialBlock = inspectorSource.match(
      /sectionType === "social_proof_strip"[\s\S]*?(?=\{\/\*|$)/
    )
    expect(socialBlock).toBeTruthy()
    expect(socialBlock![0]).toContain("Add Logo")
    expect(socialBlock![0]).toContain("Remove")
    expect(socialBlock![0]).toContain("Move up")
    expect(socialBlock![0]).toContain("Move down")
  })
})

describe("Gap 5: footer_grid per-card linksMode and links", () => {
  it("has linksMode select per card", () => {
    expect(globalPanelSource).toContain("Links Mode")
    expect(globalPanelSource).toContain("linksMode")
  })

  it("has per-card links array editor", () => {
    // Should have a nested GArrayEditor for links within each card
    expect(globalPanelSource).toMatch(/GArrayEditor.*label="Links"/)
  })

  it("has flat and grouped options for linksMode", () => {
    expect(globalPanelSource).toMatch(/value.*flat.*label.*Flat/)
    expect(globalPanelSource).toMatch(/value.*grouped.*label.*Grouped/)
  })

  it("has per-card move and remove controls", () => {
    expect(globalPanelSource).toContain("Move up")
    expect(globalPanelSource).toContain("Move down")
    expect(globalPanelSource).toContain("Add Card")
  })
})
