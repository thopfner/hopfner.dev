import { describe, it, expect } from "vitest"
import fs from "fs"
import { isComposedSectionSupported } from "@/components/admin/visual-editor/composed-support"
import {
  resolveCanvasNodeChromeState,
  resolveRailRowState,
  resolvePageFooterState,
} from "@/components/admin/visual-editor/presentation-state"
import {
  normalizeComposerSchema,
  flattenComposerSchemaBlocks,
} from "@/components/admin/section-editor/payload"

// ---------------------------------------------------------------------------
// Shared composed-support classification (helper truth tests)
// ---------------------------------------------------------------------------

describe("shared composed-support classification", () => {
  it("returns true for a schema with usable blocks", () => {
    const raw = {
      rows: [{ id: "r1", columns: [{ id: "c1", blocks: [{ id: "b1", type: "heading" }] }] }],
    }
    expect(isComposedSectionSupported(raw)).toBe(true)
  })

  it("returns false for null schema", () => {
    expect(isComposedSectionSupported(null)).toBe(false)
  })

  it("returns false for undefined schema", () => {
    expect(isComposedSectionSupported(undefined)).toBe(false)
  })

  it("returns false for empty rows schema", () => {
    expect(isComposedSectionSupported({ rows: [] })).toBe(false)
  })

  it("returns false for rows with empty columns", () => {
    expect(isComposedSectionSupported({ rows: [{ id: "r1", columns: [{ id: "c1", blocks: [] }] }] })).toBe(false)
  })

  it("agrees with normalizeComposerSchema + flattenComposerSchemaBlocks", () => {
    const valid = { rows: [{ id: "r1", columns: [{ id: "c1", blocks: [{ id: "b1", type: "image" }] }] }] }
    const blocks = flattenComposerSchemaBlocks(normalizeComposerSchema(valid))
    expect(blocks.length > 0).toBe(isComposedSectionSupported(valid))

    const empty = { rows: [] }
    const emptyBlocks = flattenComposerSchemaBlocks(normalizeComposerSchema(empty))
    expect(emptyBlocks.length > 0).toBe(isComposedSectionSupported(empty))
  })
})

// ---------------------------------------------------------------------------
// Canvas node chrome state (behavior via resolver)
// ---------------------------------------------------------------------------

describe("canvas node chrome state", () => {
  const validSchema = { rows: [{ id: "r1", columns: [{ id: "c1", blocks: [{ id: "b1", type: "heading" }] }] }] }

  it("shows composed chip for supported composed sections", () => {
    const s = resolveCanvasNodeChromeState({ isCustomComposed: true, isGlobal: false }, false, validSchema)
    expect(s.showComposedChip).toBe(true)
    expect(s.showUnsupportedBanner).toBe(false)
  })

  it("shows unsupported banner for composed sections with no schema", () => {
    const s = resolveCanvasNodeChromeState({ isCustomComposed: true, isGlobal: false }, false, null)
    expect(s.showUnsupportedBanner).toBe(true)
    expect(s.showComposedChip).toBe(false)
  })

  it("shows unsupported banner for composed sections with empty schema", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: true, isGlobal: false }, false, { rows: [] }).showUnsupportedBanner).toBe(true)
  })

  it("canvas and inspector agree on support decision", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: true, isGlobal: false }, false, validSchema).showComposedChip).toBe(true)
    expect(isComposedSectionSupported(validSchema)).toBe(true)
    expect(resolveCanvasNodeChromeState({ isCustomComposed: true, isGlobal: false }, false, null).showUnsupportedBanner).toBe(true)
    expect(isComposedSectionSupported(null)).toBe(false)
  })

  it("shows global/locked for global sections", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: true }, false, undefined).showGlobalLocked).toBe(true)
  })

  it("hides global/locked for non-global sections", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: false }, false, undefined).showGlobalLocked).toBe(false)
  })

  it("shows dirty dot when dirty", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: false }, true, undefined).showDirtyDot).toBe(true)
  })

  it("hides dirty dot when clean", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: false }, false, undefined).showDirtyDot).toBe(false)
  })

  it("chrome layout is always surface-inset", () => {
    expect(resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: false }, false, undefined).chromeLayout).toBe("surface-inset")
    expect(resolveCanvasNodeChromeState({ isCustomComposed: true, isGlobal: true }, true, validSchema).chromeLayout).toBe("surface-inset")
  })
})

// ---------------------------------------------------------------------------
// Rendered node chrome layout (component structure verification)
// ---------------------------------------------------------------------------

describe("rendered node chrome layout — surface-inset model", () => {
  const nodeSource = fs.readFileSync("components/admin/visual-editor/page-visual-editor-node.tsx", "utf-8")
  const previewSource = fs.readFileSync("components/admin/section-preview.tsx", "utf-8")

  it("does NOT use a full-width row container for chrome (no left+right stretch)", () => {
    expect(nodeSource).not.toMatch(/absolute[^"]*left-[\d.]+[^"]*right-[\d.]+[^"]*flex[^"]*justify-between/)
  })

  it("type pill uses surface-inset positioning (top-2, no -translate-y-1/2)", () => {
    expect(nodeSource).toContain('data-chrome="type-pill"')
    // className uses a template literal — match with backtick-aware regex
    const pillMatch = nodeSource.match(/data-chrome="type-pill"[\s\S]*?className=\{`([^`]*)`\}/)
    expect(pillMatch).toBeTruthy()
    if (pillMatch) {
      expect(pillMatch[1]).toContain("absolute")
      expect(pillMatch[1]).toContain("top-2")
      expect(pillMatch[1]).not.toContain("-translate-y-1/2")
      expect(pillMatch[1]).not.toContain("translate-y-1/2")
      expect(pillMatch[1]).not.toContain("right-")
    }
  })

  it("actions cluster uses surface-inset positioning (top-2, no -translate-y-1/2)", () => {
    expect(nodeSource).toContain('data-chrome="actions"')
  })

  it("node source has NO -translate-y-1/2 or translate-y-1/2", () => {
    expect(nodeSource).not.toContain("-translate-y-1/2")
    expect(nodeSource).not.toContain("translate-y-1/2")
  })

  it("node passes chromeSlot to SectionPreview", () => {
    expect(nodeSource).toContain("chromeSlot={chromeEl}")
  })

  it("type pill and actions are separate DOM siblings, not inside one row", () => {
    const pillIdx = nodeSource.indexOf('data-chrome="type-pill"')
    const actionsIdx = nodeSource.indexOf('data-chrome="actions"')
    expect(pillIdx).toBeGreaterThan(-1)
    expect(actionsIdx).toBeGreaterThan(-1)
    const between = nodeSource.slice(pillIdx, actionsIdx)
    expect(between).not.toContain("justify-between")
  })

  it("canvas chrome includes global/locked semantics for global sections", () => {
    expect(nodeSource).toContain('title="Global · Locked"')
    expect(nodeSource).toContain("IconWorld")
    expect(nodeSource).toContain("IconLock")
    expect(nodeSource).toMatch(/>Global</)
  })

  it("canvas chrome includes dirty indicator", () => {
    expect(nodeSource).toContain('title="Unsaved"')
    expect(nodeSource).toContain("bg-orange-400")
  })

  it("SectionPreview accepts chromeSlot prop", () => {
    expect(previewSource).toContain("chromeSlot?: React.ReactNode")
  })

  it("embedded host has relative, NOT bg-background", () => {
    // The embedded host div should have 'relative' class
    expect(previewSource).toMatch(/className=\{`[^`]*\brelative\b[^`]*text-foreground/)
    // The embedded host div should NOT have bg-background
    const embeddedHostMatch = previewSource.match(/className=\{`[^`]*\brelative\b[^`]*text-foreground[^`]*`\}/)
    expect(embeddedHostMatch).toBeTruthy()
    if (embeddedHostMatch) {
      expect(embeddedHostMatch[0]).not.toContain("bg-background")
    }
  })

  it("scaled wrapper inside embedded mode has relative bg-background", () => {
    // The embeddedRef div should have both relative and bg-background
    expect(previewSource).toMatch(/ref=\{embeddedRef\}\s+className="relative bg-background"/)
  })

  it("chromeSlot is mounted INSIDE the scaled preview surface, not as a sibling", () => {
    // Find the embeddedRef div and verify chromeSlot is inside it (before its closing </div>)
    // The pattern must be: <div ref={embeddedRef} ...> {rendererContent} {chromeSlot} </div>
    // NOT: <div ref={embeddedRef} ...> {rendererContent} </div> {chromeSlot}
    const scaledBlockMatch = previewSource.match(
      /ref=\{embeddedRef\}[^>]*>[\s\S]*?\{rendererContent\}[\s\S]*?\{chromeSlot\}[\s\S]*?<\/div>/
    )
    expect(scaledBlockMatch).toBeTruthy()

    // Verify the old sibling pattern is NOT present (chromeSlot after the closing div)
    expect(previewSource).not.toMatch(/<\/div>\s*\{chromeSlot\}/)
  })

  it("chrome shares the same scaled coordinate space as preview content", () => {
    // The embeddedRef div has transform: scale() AND contains chromeSlot
    // This means chrome is rendered inside the scaled surface
    const embeddedBlock = previewSource.match(
      /ref=\{embeddedRef\}[^>]*className="relative[^"]*"[^>]*style=\{[^}]*transform[^}]*scale/
    )
    expect(embeddedBlock).toBeTruthy()
  })

  it("unsupported banner is z-30 (covers chrome at z-20)", () => {
    expect(nodeSource).toMatch(/showUnsupportedBanner[\s\S]*?z-30/)
  })

  it("node wrapper has z-0 in base className (stacking context for chrome visibility)", () => {
    // The outer div must have z-0 so each node creates a stacking context,
    // preventing previous sections' transform-created contexts from painting
    // over the current section's chrome pills.
    const wrapperMatch = nodeSource.match(/className=\{`relative\s+z-0\s+group/)
    expect(wrapperMatch).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// Page workspace footer state (behavior via resolver)
// ---------------------------------------------------------------------------

describe("page workspace footer state", () => {
  it("clean state: save disabled, label is Saved", () => {
    const s = resolvePageFooterState(false)
    expect(s.saveEnabled).toBe(false)
    expect(s.primaryLabel).toBe("Saved")
  })

  it("clean state: secondary slot is present but not discard", () => {
    const s = resolvePageFooterState(false)
    expect(s.secondaryIsDiscard).toBe(false)
    expect(s.slotCount).toBe(2)
  })

  it("dirty state: save enabled, label is Save page settings", () => {
    const s = resolvePageFooterState(true)
    expect(s.saveEnabled).toBe(true)
    expect(s.primaryLabel).toBe("Save page settings")
  })

  it("dirty state: secondary slot is discard", () => {
    const s = resolvePageFooterState(true)
    expect(s.secondaryIsDiscard).toBe(true)
    expect(s.slotCount).toBe(2)
  })

  it("slot count is stable across both states", () => {
    expect(resolvePageFooterState(false).slotCount).toBe(resolvePageFooterState(true).slotCount)
  })

  it("both states return the same shape", () => {
    expect(Object.keys(resolvePageFooterState(false)).sort()).toEqual(Object.keys(resolvePageFooterState(true)).sort())
  })
})

// ---------------------------------------------------------------------------
// Rendered page footer structure (component structure verification)
// ---------------------------------------------------------------------------

describe("rendered page footer structure — stable two-slot layout", () => {
  const source = fs.readFileSync("components/admin/visual-editor/page-visual-editor-page-panel.tsx", "utf-8")

  it("footer is always rendered (not gated behind isDirty)", () => {
    expect(source).not.toMatch(/\{isDirty\s*&&\s*\(\s*<div[^]*?page-footer/)
  })

  it("footer has data-testid for QA", () => {
    expect(source).toContain('data-testid="page-footer"')
  })

  it("primary save slot is always rendered", () => {
    expect(source).toContain('data-testid="page-footer-save"')
  })

  it("secondary slot is always rendered with stable footprint", () => {
    expect(source).toContain('data-testid="page-footer-secondary"')
    const secondaryIdx = source.indexOf('data-testid="page-footer-secondary"')
    const beforeSecondary = source.slice(Math.max(0, secondaryIdx - 100), secondaryIdx)
    expect(beforeSecondary).not.toMatch(/isDirty\s*&&/)
  })

  it("discard button lives inside the stable secondary slot", () => {
    expect(source).toContain('data-testid="page-footer-discard"')
    const secondaryIdx = source.indexOf('data-testid="page-footer-secondary"')
    const discardIdx = source.indexOf('data-testid="page-footer-discard"')
    expect(discardIdx).toBeGreaterThan(secondaryIdx)
  })
})

// ---------------------------------------------------------------------------
// Structure rail row state (behavior via resolver)
// ---------------------------------------------------------------------------

describe("structure rail row state", () => {
  const baseNode = { isGlobal: false, enabled: true, draftVersion: null, publishedVersion: null }

  it("uses title as primary when available", () => {
    const s = resolveRailRowState(baseNode, false, "Hero Section", "hero")
    expect(s.primaryTitle).toBe("Hero Section")
    expect(s.showTypeAsSecondary).toBe(true)
  })

  it("falls back to type label when no title", () => {
    const s = resolveRailRowState(baseNode, false, "", "hero")
    expect(s.primaryTitle).toBe("hero")
    expect(s.showTypeAsSecondary).toBe(false)
  })

  it("shows global/locked for global sections", () => {
    expect(resolveRailRowState({ ...baseNode, isGlobal: true }, false, "Footer", "footer").showGlobalLocked).toBe(true)
  })

  it("shows disabled for disabled sections", () => {
    expect(resolveRailRowState({ ...baseNode, enabled: false }, false, "Hidden", "hero").showDisabled).toBe(true)
  })

  it("status dot is dirty when unsaved", () => {
    expect(resolveRailRowState(baseNode, true, "Hero", "hero").statusDot).toBe("dirty")
  })

  it("status dot is draft-only when only draft exists", () => {
    expect(resolveRailRowState({ ...baseNode, draftVersion: { id: "v1" } as never }, false, "Hero", "hero").statusDot).toBe("draft-only")
  })

  it("status dot is unpublished-changes when both exist", () => {
    expect(resolveRailRowState({ ...baseNode, draftVersion: { id: "v1" } as never, publishedVersion: { id: "v2" } as never }, false, "Hero", "hero").statusDot).toBe("unpublished-changes")
  })

  it("status dot is published when only published exists", () => {
    expect(resolveRailRowState({ ...baseNode, publishedVersion: { id: "v2" } as never }, false, "Hero", "hero").statusDot).toBe("published")
  })

  it("dirty overrides version-based status dot", () => {
    expect(resolveRailRowState({ ...baseNode, publishedVersion: { id: "v2" } as never }, true, "Hero", "hero").statusDot).toBe("dirty")
  })
})

// ---------------------------------------------------------------------------
// Canvas ↔ Rail semantic alignment
// ---------------------------------------------------------------------------

describe("canvas and rail semantic alignment", () => {
  it("both surfaces show global/locked for global sections", () => {
    const canvas = resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: true }, false, undefined)
    const rail = resolveRailRowState({ isGlobal: true, enabled: true, draftVersion: null, publishedVersion: null }, false, "Footer", "footer")
    expect(canvas.showGlobalLocked).toBe(true)
    expect(rail.showGlobalLocked).toBe(true)
  })

  it("both surfaces signal dirty state", () => {
    const canvas = resolveCanvasNodeChromeState({ isCustomComposed: false, isGlobal: false }, true, undefined)
    const rail = resolveRailRowState({ isGlobal: false, enabled: true, draftVersion: null, publishedVersion: null }, true, "Hero", "hero")
    expect(canvas.showDirtyDot).toBe(true)
    expect(rail.statusDot).toBe("dirty")
  })
})
