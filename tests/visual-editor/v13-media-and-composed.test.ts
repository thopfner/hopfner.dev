import { describe, it, expect } from "vitest"
import {
  normalizeComposerSchema,
  flattenComposerSchemaBlocks,
  normalizeFormatting,
  payloadToDraft,
  draftToPayload,
  stableStringify,
} from "@/components/admin/section-editor/payload"

// ---------------------------------------------------------------------------
// Phase 1: Page backdrop persistence contract
// ---------------------------------------------------------------------------

describe("page backdrop persistence contract", () => {
  it("page settings hook exports canonical field names", async () => {
    const mod = await import("@/components/admin/visual-editor/use-page-settings-actions")
    expect(mod.usePageSettingsActions).toBeDefined()
  })

  it("page settings hook returns separate bgImageUrl and formattingOverride", async () => {
    // Verify the hook API shape includes canonical field accessors
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/use-page-settings-actions.ts", "utf-8")
    // Must write both pages.bg_image_url and pages.formatting_override
    expect(content).toContain("bg_image_url")
    expect(content).toContain("formatting_override")
    // Must NOT write only formatting_override
    expect(content).toContain("bgImageUrl")
    expect(content).toContain("updateBgImageUrl")
    expect(content).toContain("updateFormattingOverride")
  })

  it("page panel reads backdrop from pageBgImageUrl", async () => {
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/page-visual-editor-page-panel.tsx", "utf-8")
    // Must read from effectiveBgImageUrl, not formatting_override
    expect(content).toContain("effectiveBgImageUrl")
    // Must NOT read from ad hoc formatting keys for backdrop
    expect(content).not.toContain("topBackdropImageUrl")
  })
})

// ---------------------------------------------------------------------------
// Phase 1: Media library integration
// ---------------------------------------------------------------------------

describe("media library integration", () => {
  it("media field uses ImageFieldPicker", async () => {
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/page-visual-editor-media-field.tsx", "utf-8")
    expect(content).toContain("ImageFieldPicker")
    expect(content).toContain("MediaLibraryModal")
    expect(content).toContain("uploadMedia")
  })

  it("page panel uses ImageFieldPicker for backdrop", async () => {
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/page-visual-editor-page-panel.tsx", "utf-8")
    expect(content).toContain("ImageFieldPicker")
    expect(content).toContain("MediaLibraryModal")
  })

  it("MediaField component exports correctly", async () => {
    const mod = await import("@/components/admin/visual-editor/page-visual-editor-media-field")
    expect(mod.MediaField).toBeDefined()
    expect(typeof mod.MediaField).toBe("function")
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Composer schema behavior
// ---------------------------------------------------------------------------

describe("composed section editor behavior", () => {
  it("normalizeComposerSchema handles valid schema", () => {
    const raw = {
      rows: [
        {
          id: "row-1",
          columns: [
            {
              id: "col-1",
              blocks: [
                { id: "blk-1", type: "heading", title: "Test Heading" },
                { id: "blk-2", type: "rich_text", body: "Test body" },
              ],
            },
          ],
        },
      ],
    }
    const schema = normalizeComposerSchema(raw)
    expect(schema.rows).toBeDefined()
    expect(schema.rows!.length).toBe(1)
    expect(schema.rows![0].columns.length).toBe(1)
    expect(schema.rows![0].columns[0].blocks.length).toBe(2)
  })

  it("normalizeComposerSchema handles empty input", () => {
    const schema = normalizeComposerSchema(null)
    expect(schema.rows).toEqual([])
  })

  it("flattenComposerSchemaBlocks produces flat block list", () => {
    const schema = normalizeComposerSchema({
      rows: [
        {
          id: "r1",
          columns: [
            { id: "c1", blocks: [{ id: "b1", type: "heading" }, { id: "b2", type: "image" }] },
            { id: "c2", blocks: [{ id: "b3", type: "cta" }] },
          ],
        },
      ],
    })
    const blocks = flattenComposerSchemaBlocks(schema)
    expect(blocks.length).toBe(3)
    expect(blocks[0].block.type).toBe("heading")
    expect(blocks[1].block.type).toBe("image")
    expect(blocks[2].block.type).toBe("cta")
  })

  it("composed panel uses CustomComposerEditor for valid schema", async () => {
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx", "utf-8")
    // Must use the existing composer editor
    expect(content).toContain("CustomComposerEditor")
    expect(content).toContain("normalizeComposerSchema")
    expect(content).toContain("flattenComposerSchemaBlocks")
    // Must NOT be a dead-end redirect
    expect(content).not.toContain("Edit it from the form editor for full control")
  })

  it("composed panel shows truthful empty state for no schema", async () => {
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx", "utf-8")
    expect(content).toContain("No editable blocks configured")
  })

  it("visual page state includes composerSchemas", async () => {
    const source = await import("fs")
    const content = source.readFileSync("components/admin/visual-editor/page-visual-editor-types.ts", "utf-8")
    expect(content).toContain("composerSchemas")
  })

  it("loader hydrates composerSchemas from section_type_registry", async () => {
    const source = await import("fs")
    const content = source.readFileSync("lib/admin/visual-editor/load-page-visual-state.ts", "utf-8")
    expect(content).toContain("composerSchemas")
    expect(content).toContain("composer_schema")
  })
})

// ---------------------------------------------------------------------------
// Draft round-trip for composed content
// ---------------------------------------------------------------------------

describe("composed content draft round-trip", () => {
  it("block override content survives payloadToDraft → draftToPayload", () => {
    const payload = {
      title: "Custom Section",
      subtitle: null,
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      background_media_url: null,
      formatting: {},
      content: {
        _blockOverrides: {
          "blk-1": { title: "Override Title" },
        },
        composerSchema: { rows: [] },
      },
    }

    const draft = payloadToDraft(payload)
    expect(draft.content._blockOverrides).toBeDefined()

    const roundTripped = draftToPayload(draft)
    expect(roundTripped.content._blockOverrides).toBeDefined()
    const overrides = roundTripped.content._blockOverrides as Record<string, unknown>
    expect((overrides["blk-1"] as Record<string, unknown>).title).toBe("Override Title")
  })
})
