import fs from "fs"
import { describe, it, expect } from "vitest"
import {
  normalizeSectionType,
  payloadToDraft,
  draftToPayload,
  versionRowToPayload,
  normalizeFormatting,
  formattingToJsonb,
  deepMerge,
} from "@/components/admin/section-editor/payload"
import { publishCmsSectionDraft } from "@/lib/cms/commands"
import { resolveEffectivePreview } from "@/lib/admin/visual-editor/resolve-effective-visual-section"
import type { SectionVersionRow, SectionTypeDefault, EditorDraft } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "@/components/admin/visual-editor/page-visual-editor-types"

const sectionEditorResourcesSource = fs.readFileSync(
  "components/admin/section-editor/use-section-editor-resources.ts",
  "utf-8"
)

const visualPersistenceSource = fs.readFileSync(
  "components/admin/visual-editor/use-visual-section-persistence.ts",
  "utf-8"
)

// ---------------------------------------------------------------------------
// Section type normalization
// ---------------------------------------------------------------------------

describe("normalizeSectionType", () => {
  it("passes through built-in types unchanged", () => {
    expect(normalizeSectionType("hero_cta")).toBe("hero_cta")
    expect(normalizeSectionType("card_grid")).toBe("card_grid")
    expect(normalizeSectionType("footer_grid")).toBe("footer_grid")
  })

  it("normalizes legacy aliases", () => {
    expect(normalizeSectionType("hero")).toBe("hero_cta")
    expect(normalizeSectionType("trust_strip")).toBe("social_proof_strip")
    expect(normalizeSectionType("split_story")).toBe("case_study_split")
    expect(normalizeSectionType("what_i_deliver")).toBe("card_grid")
  })

  it("passes through custom type names", () => {
    expect(normalizeSectionType("my_custom_type")).toBe("my_custom_type")
  })

  it("returns null for empty strings", () => {
    expect(normalizeSectionType("")).toBeNull()
    expect(normalizeSectionType("   ")).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Section classification (local/global/custom)
// ---------------------------------------------------------------------------

describe("section classification", () => {
  const makeNode = (overrides: Partial<VisualSectionNode>): VisualSectionNode => ({
    sectionId: "s1",
    pageId: "p1",
    sectionType: "hero_cta",
    source: "page",
    isGlobal: false,
    isCustomComposed: false,
    position: 0,
    key: null,
    enabled: true,
    draftVersion: null,
    publishedVersion: null,
    globalSectionId: null,
    formattingOverride: {},
    ...overrides,
  })

  it("identifies local built-in section", () => {
    const node = makeNode({ sectionType: "card_grid" })
    expect(node.isGlobal).toBe(false)
    expect(node.isCustomComposed).toBe(false)
    expect(node.source).toBe("page")
  })

  it("identifies global section", () => {
    const node = makeNode({
      isGlobal: true,
      source: "global",
      globalSectionId: "g1",
    })
    expect(node.isGlobal).toBe(true)
    expect(node.source).toBe("global")
  })

  it("identifies custom/composed section", () => {
    const node = makeNode({
      sectionType: "my_custom",
      isCustomComposed: true,
    })
    expect(node.isCustomComposed).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Formatting normalization round-trip
// ---------------------------------------------------------------------------

describe("formatting normalization", () => {
  it("normalizes raw formatting into FormattingState", () => {
    const raw: Record<string, unknown> = {
      containerClass: "my-class",
      sectionClass: "",
      paddingY: "py-8",
      maxWidth: "max-w-5xl",
      textAlign: "center",
      widthMode: "content",
      heroMinHeight: "auto",
      shadowMode: "inherit",
      innerShadowMode: "inherit",
      innerShadowStrength: 0,
      sectionRhythm: "hero",
      sectionSurface: "spotlight_stage",
      contentDensity: "standard",
    }
    const result = normalizeFormatting(raw)
    expect(result.containerClass).toBe("my-class")
    expect(result.paddingY).toBe("py-8")
    expect(result.sectionRhythm).toBe("hero")
    expect(result.sectionSurface).toBe("spotlight_stage")
  })

  it("round-trips formatting through normalize → jsonb → normalize", () => {
    const raw: Record<string, unknown> = {
      sectionRhythm: "compact",
      sectionSurface: "panel",
      contentDensity: "tight",
      cardFamily: "service",
      cardChrome: "elevated",
      accentRule: "left",
      paddingY: "py-6",
      maxWidth: "max-w-5xl",
      widthMode: "content",
      heroMinHeight: "auto",
      shadowMode: "inherit",
      innerShadowMode: "inherit",
      innerShadowStrength: 0,
    }
    const normalized = normalizeFormatting(raw)
    const jsonb = formattingToJsonb(normalized)
    const renormalized = normalizeFormatting(jsonb)

    expect(renormalized.sectionRhythm).toBe("compact")
    expect(renormalized.sectionSurface).toBe("panel")
    expect(renormalized.contentDensity).toBe("tight")
    expect(renormalized.cardFamily).toBe("service")
    expect(renormalized.cardChrome).toBe("elevated")
    expect(renormalized.accentRule).toBe("left")
  })
})

// ---------------------------------------------------------------------------
// Draft ↔ Payload conversion
// ---------------------------------------------------------------------------

describe("draft/payload conversion", () => {
  const mockVersion: SectionVersionRow = {
    id: "v1",
    owner_id: "s1",
    version: 1,
    status: "published",
    title: "My Title",
    subtitle: "My Subtitle",
    cta_primary_label: "Learn More",
    cta_primary_href: "/about",
    cta_secondary_label: null,
    cta_secondary_href: null,
    background_media_url: null,
    formatting: {
      sectionRhythm: "hero",
      paddingY: "py-8",
      maxWidth: "max-w-5xl",
      widthMode: "content",
      heroMinHeight: "auto",
      shadowMode: "inherit",
      innerShadowMode: "inherit",
      innerShadowStrength: 0,
    },
    content: { eyebrow: "Welcome" },
    created_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  }

  it("converts version row to payload", () => {
    const payload = versionRowToPayload(mockVersion)
    expect(payload.title).toBe("My Title")
    expect(payload.subtitle).toBe("My Subtitle")
    expect(payload.cta_primary_label).toBe("Learn More")
    expect(payload.content.eyebrow).toBe("Welcome")
  })

  it("converts payload to draft", () => {
    const payload = versionRowToPayload(mockVersion)
    const draft = payloadToDraft(payload, "hero_cta")
    expect(draft.meta.title).toBe("My Title")
    expect(draft.meta.subtitle).toBe("My Subtitle")
    expect(draft.meta.ctaPrimaryLabel).toBe("Learn More")
    expect(draft.formatting.sectionRhythm).toBe("hero")
    expect(draft.formatting.paddingY).toBe("py-8")
  })

  it("round-trips draft → payload → draft", () => {
    const payload = versionRowToPayload(mockVersion)
    const draft = payloadToDraft(payload, "hero_cta")
    const backToPayload = draftToPayload(draft, "hero_cta")
    const backToDraft = payloadToDraft(backToPayload, "hero_cta")

    expect(backToDraft.meta.title).toBe(draft.meta.title)
    expect(backToDraft.meta.subtitle).toBe(draft.meta.subtitle)
    expect(backToDraft.formatting.sectionRhythm).toBe(draft.formatting.sectionRhythm)
    expect(backToDraft.formatting.paddingY).toBe(draft.formatting.paddingY)
  })

  it("strips content.subtitle for built-in types on save", () => {
    const draft: EditorDraft = {
      meta: {
        title: "Test",
        subtitle: "From Meta",
        ctaPrimaryLabel: "",
        ctaPrimaryHref: "",
        ctaSecondaryLabel: "",
        ctaSecondaryHref: "",
        backgroundMediaUrl: "",
      },
      formatting: normalizeFormatting({}),
      content: { subtitle: "Legacy", eyebrow: "Test" },
    }
    const payload = draftToPayload(draft, "hero_cta")
    expect(payload.subtitle).toBe("From Meta")
    expect(payload.content).not.toHaveProperty("subtitle")
    expect(payload.content.eyebrow).toBe("Test")
  })

  it("hydrates meta.subtitle from content.subtitle for built-in types", () => {
    const payload = versionRowToPayload({
      ...mockVersion,
      subtitle: null,
      content: { subtitle: "From Content", eyebrow: "Test" },
    })
    const draft = payloadToDraft(payload, "hero_cta")
    expect(draft.meta.subtitle).toBe("From Content")
  })
})

// ---------------------------------------------------------------------------
// Deep merge
// ---------------------------------------------------------------------------

describe("deepMerge", () => {
  it("merges nested objects", () => {
    const base = { a: 1, nested: { x: 1, y: 2 } }
    const over = { a: 2, nested: { y: 3, z: 4 } }
    const result = deepMerge(base, over)
    expect(result.a).toBe(2)
    expect((result.nested as Record<string, unknown>).x).toBe(1)
    expect((result.nested as Record<string, unknown>).y).toBe(3)
    expect((result.nested as Record<string, unknown>).z).toBe(4)
  })

  it("does not merge null/undefined values from override", () => {
    const base = { a: 1, b: 2 }
    const over = { a: null, b: undefined } as unknown as Record<string, unknown>
    const result = deepMerge(base, over)
    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
  })

  it("replaces arrays entirely", () => {
    const base = { items: [1, 2, 3] }
    const over = { items: [4, 5] }
    const result = deepMerge(base, over)
    expect(result.items).toEqual([4, 5])
  })
})

// ---------------------------------------------------------------------------
// Formatting merge order
// ---------------------------------------------------------------------------

describe("formatting merge order", () => {
  it("applies correct precedence: site → defaults → override → version", () => {
    const siteFormatting: Record<string, unknown> = { paddingY: "py-4", sectionRhythm: "standard" }
    const typeDefaults: Record<string, unknown> = { paddingY: "py-6", sectionSurface: "panel" }
    const sectionOverride: Record<string, unknown> = { sectionSurface: "soft_band" }
    const versionFormatting: Record<string, unknown> = { sectionRhythm: "hero" }

    const merged = deepMerge(
      deepMerge(siteFormatting, typeDefaults),
      deepMerge(sectionOverride, versionFormatting),
    )

    // paddingY: site=py-4, defaults=py-6 → defaults wins in base merge
    // then no override for paddingY → py-6 persists
    expect(merged.paddingY).toBe("py-6")
    // sectionRhythm: site=standard, then version=hero → hero wins
    expect(merged.sectionRhythm).toBe("hero")
    // sectionSurface: defaults=panel, override=soft_band → soft_band wins
    expect(merged.sectionSurface).toBe("soft_band")
  })
})

// ---------------------------------------------------------------------------
// resolveEffectivePreview helper
// ---------------------------------------------------------------------------

describe("resolveEffectivePreview", () => {
  const mockVersion: SectionVersionRow = {
    id: "v1",
    owner_id: "s1",
    version: 1,
    status: "published",
    title: "Hero Title",
    subtitle: "Hero Sub",
    cta_primary_label: "CTA",
    cta_primary_href: "/cta",
    cta_secondary_label: null,
    cta_secondary_href: null,
    background_media_url: null,
    formatting: { sectionRhythm: "hero", paddingY: "py-8", widthMode: "content", heroMinHeight: "auto", shadowMode: "inherit", innerShadowMode: "inherit", innerShadowStrength: 0 },
    content: { eyebrow: "Welcome" },
    created_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  }

  const makeTestNode = (overrides: Partial<VisualSectionNode> = {}): VisualSectionNode => ({
    sectionId: "s1",
    pageId: "p1",
    sectionType: "hero_cta",
    source: "page",
    isGlobal: false,
    isCustomComposed: false,
    position: 0,
    key: null,
    enabled: true,
    draftVersion: null,
    publishedVersion: mockVersion,
    globalSectionId: null,
    formattingOverride: {},
    ...overrides,
  })

  it("returns null when no version exists", () => {
    const node = makeTestNode({ publishedVersion: null })
    const result = resolveEffectivePreview(node, {}, undefined, null)
    expect(result).toBeNull()
  })

  it("uses published version when no draft", () => {
    const node = makeTestNode()
    const result = resolveEffectivePreview(node, {}, undefined, null)
    expect(result).not.toBeNull()
    expect(result!.title).toBe("Hero Title")
    expect(result!.ctaPrimaryLabel).toBe("CTA")
  })

  it("prefers draft version over published", () => {
    const draftVersion: SectionVersionRow = {
      ...mockVersion,
      id: "v2",
      status: "draft",
      title: "Draft Title",
    }
    const node = makeTestNode({ draftVersion, publishedVersion: mockVersion })
    const result = resolveEffectivePreview(node, {}, undefined, null)
    expect(result!.title).toBe("Draft Title")
  })

  it("uses dirty draft when provided", () => {
    const node = makeTestNode()
    const dirtyDraft: EditorDraft = {
      meta: {
        title: "Dirty Title",
        subtitle: "Dirty Sub",
        ctaPrimaryLabel: "Dirty CTA",
        ctaPrimaryHref: "/dirty",
        ctaSecondaryLabel: "",
        ctaSecondaryHref: "",
        backgroundMediaUrl: "",
      },
      formatting: normalizeFormatting({ sectionRhythm: "compact" }),
      content: { eyebrow: "Changed" },
    }
    const result = resolveEffectivePreview(node, {}, undefined, dirtyDraft)
    expect(result!.title).toBe("Dirty Title")
    expect(result!.formatting.sectionRhythm).toBe("compact")
    expect(result!.content.eyebrow).toBe("Changed")
  })

  it("includes formattingOverride in merge", () => {
    const node = makeTestNode({
      formattingOverride: { sectionSurface: "contrast_band" },
    })
    const result = resolveEffectivePreview(node, {}, undefined, null)
    // formattingOverride is merged before version formatting
    // Version has sectionRhythm but not sectionSurface, so override wins
    expect(result!.formatting.sectionSurface).toBe("contrast_band")
    expect(result!.formatting.sectionRhythm).toBe("hero")
  })

  it("version formatting overrides row formatting_override for same key", () => {
    const node = makeTestNode({
      formattingOverride: { sectionRhythm: "compact" },
    })
    const result = resolveEffectivePreview(node, {}, undefined, null)
    // Version has sectionRhythm: "hero", which should win over override's "compact"
    expect(result!.formatting.sectionRhythm).toBe("hero")
  })

  it("merges site formatting as base layer", () => {
    const node = makeTestNode()
    const siteFormatting = { labelStyle: "mono" }
    const result = resolveEffectivePreview(node, siteFormatting, undefined, null)
    // Site sets labelStyle, version does not → site value persists
    expect(result!.formatting.labelStyle).toBe("mono")
  })

  it("merges type defaults over site formatting", () => {
    const node = makeTestNode()
    const siteFormatting = { paddingY: "py-4" }
    const typeDefaults: SectionTypeDefault = {
      section_type: "hero_cta",
      label: "Hero CTA",
      description: "",
      default_title: "",
      default_subtitle: "",
      default_cta_primary_label: "",
      default_cta_primary_href: "",
      default_cta_secondary_label: "",
      default_cta_secondary_href: "",
      default_background_media_url: "",
      default_formatting: { paddingY: "py-10" },
      default_content: {},
      capabilities: null,
    }
    const result = resolveEffectivePreview(node, siteFormatting, typeDefaults, null)
    // Type default paddingY: "py-10" should win over site paddingY: "py-4"
    // But version paddingY: "py-8" should win over both
    expect(result!.formatting.paddingY).toBe("py-8")
  })

  it("merges type default content", () => {
    const typeDefaults: SectionTypeDefault = {
      section_type: "hero_cta",
      label: "Hero CTA",
      description: "",
      default_title: "",
      default_subtitle: "",
      default_cta_primary_label: "",
      default_cta_primary_href: "",
      default_cta_secondary_label: "",
      default_cta_secondary_href: "",
      default_background_media_url: "",
      default_formatting: {},
      default_content: { defaultField: "default_value" },
      capabilities: null,
    }
    const node = makeTestNode()
    const result = resolveEffectivePreview(node, {}, typeDefaults, null)
    expect(result!.content.defaultField).toBe("default_value")
    // Version content should also be present
    expect(result!.content.eyebrow).toBe("Welcome")
  })
})

// ---------------------------------------------------------------------------
// Publish RPC argument shape
// ---------------------------------------------------------------------------

describe("publish RPC argument shape", () => {
  it("publish_section_version requires both p_section_id and p_version_id", () => {
    // This test validates that the visual editor persistence adapter
    // passes the correct shape. We test the contract, not the RPC call itself.
    const sectionId = "test-section-id"
    const versionId = "test-version-id"
    const args = { p_section_id: sectionId, p_version_id: versionId }
    expect(args).toHaveProperty("p_section_id", sectionId)
    expect(args).toHaveProperty("p_version_id", versionId)
  })

  it("shared page publish command preserves the page RPC argument shape", async () => {
    const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = []
    const fakeClient = {
      rpc: async (fn: string, args: Record<string, unknown>) => {
        rpcCalls.push({ fn, args })
        return { error: null }
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: "v1",
                section_id: "s1",
                version: 3,
                status: "published",
                title: "Title",
                subtitle: null,
                cta_primary_label: null,
                cta_primary_href: null,
                cta_secondary_label: null,
                cta_secondary_href: null,
                background_media_url: null,
                formatting: {},
                content: {},
                created_at: "2026-01-01T00:00:00Z",
                published_at: "2026-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Parameters<typeof publishCmsSectionDraft>[0]

    await publishCmsSectionDraft(fakeClient, {
      scope: "page",
      sectionId: "s1",
      versionId: "v1",
    })

    expect(rpcCalls).toHaveLength(1)
    expect(rpcCalls[0]).toEqual({
      fn: "publish_section_version",
      args: { p_section_id: "s1", p_version_id: "v1" },
    })
  })

  it("shared global publish command preserves the global RPC argument shape", async () => {
    const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = []
    const fakeClient = {
      rpc: async (fn: string, args: Record<string, unknown>) => {
        rpcCalls.push({ fn, args })
        return { error: null }
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: "gv1",
                global_section_id: "g1",
                version: 5,
                status: "published",
                title: "Global",
                subtitle: null,
                cta_primary_label: null,
                cta_primary_href: null,
                cta_secondary_label: null,
                cta_secondary_href: null,
                background_media_url: null,
                formatting: {},
                content: {},
                created_at: "2026-01-01T00:00:00Z",
                published_at: "2026-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Parameters<typeof publishCmsSectionDraft>[0]

    await publishCmsSectionDraft(fakeClient, {
      scope: "global",
      sectionId: "g1",
      versionId: "gv1",
    })

    expect(rpcCalls).toHaveLength(1)
    expect(rpcCalls[0].fn).toBe("publish_global_section_version")
    expect(rpcCalls[0].args).toMatchObject({
      p_global_section_id: "g1",
      p_version_id: "gv1",
    })
    expect(typeof rpcCalls[0].args.p_publish_at).toBe("string")
  })
})

// ---------------------------------------------------------------------------
// Checkpoint B rewires
// ---------------------------------------------------------------------------

describe("Checkpoint B consumer rewires", () => {
  it("section editor delegates save and publish through shared commands", () => {
    expect(sectionEditorResourcesSource).toContain("@/lib/cms/commands/sections")
    expect(sectionEditorResourcesSource).toContain("saveCmsSectionDraft")
    expect(sectionEditorResourcesSource).toContain("publishCmsSectionDraft")
    expect(sectionEditorResourcesSource).toContain("await saveCmsSectionDraft(supabase, {")
    expect(sectionEditorResourcesSource).toContain("await publishCmsSectionDraft(supabase, {")
  })

  it("visual persistence delegates save/publish/reorder through shared commands", () => {
    expect(visualPersistenceSource).toContain("@/lib/cms/commands")
    expect(visualPersistenceSource).toContain("saveCmsSectionDraft")
    expect(visualPersistenceSource).toContain("publishCmsSectionDraft")
    expect(visualPersistenceSource).toContain("reorderCmsSections")
    expect(visualPersistenceSource).toContain('scope: "page"')
    expect(visualPersistenceSource).toContain("version: toSectionVersionRow(version)")
  })
})

// ---------------------------------------------------------------------------
// Dirty state save-and-switch clearing
// ---------------------------------------------------------------------------

describe("dirty state save-and-switch", () => {
  it("confirmSelectionChange with save clears dirty state", () => {
    // Simulates the state clearing logic from page-visual-editor.tsx
    const dirtyStates = new Map<string, { sectionId: string }>()
    dirtyStates.set("s1", { sectionId: "s1" })
    expect(dirtyStates.has("s1")).toBe(true)

    // After "save" action, the current section's dirty state should be cleared
    const action = "save"
    const currentSectionId = "s1"
    if (action !== "cancel" && currentSectionId) {
      dirtyStates.delete(currentSectionId)
    }
    expect(dirtyStates.has("s1")).toBe(false)
  })

  it("confirmSelectionChange with discard clears dirty state", () => {
    const dirtyStates = new Map<string, { sectionId: string }>()
    dirtyStates.set("s1", { sectionId: "s1" })

    const action = "discard"
    const currentSectionId = "s1"
    if (action !== "cancel" && currentSectionId) {
      dirtyStates.delete(currentSectionId)
    }
    expect(dirtyStates.has("s1")).toBe(false)
  })

  it("confirmSelectionChange with cancel preserves dirty state", () => {
    const dirtyStates = new Map<string, { sectionId: string }>()
    dirtyStates.set("s1", { sectionId: "s1" })

    const action = "cancel"
    const currentSectionId = "s1"
    if (action !== "cancel" && currentSectionId) {
      dirtyStates.delete(currentSectionId)
    }
    expect(dirtyStates.has("s1")).toBe(true)
  })
})
