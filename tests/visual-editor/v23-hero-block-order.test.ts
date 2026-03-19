import { describe, it, expect } from "vitest"
import fs from "fs"
import {
  resolveHeroBlockOrder,
  ALL_BLOCK_KEYS,
  BLOCK_LABELS,
} from "@/lib/admin/hero-block-order"

// ---------------------------------------------------------------------------
// Shared helper tests
// ---------------------------------------------------------------------------

describe("resolveHeroBlockOrder", () => {
  it("returns all 3 keys in default order for empty input", () => {
    expect(resolveHeroBlockOrder([])).toEqual(["ctas", "stats", "trust"])
  })

  it("appends missing keys at the end", () => {
    expect(resolveHeroBlockOrder(["trust", "ctas"])).toEqual(["trust", "ctas", "stats"])
  })

  it("strips invalid keys and fills missing ones", () => {
    expect(resolveHeroBlockOrder(["invalid", "ctas"])).toEqual(["ctas", "stats", "trust"])
  })

  it("preserves valid order when all keys present", () => {
    expect(resolveHeroBlockOrder(["stats", "trust", "ctas"])).toEqual(["stats", "trust", "ctas"])
  })

  it("exports all expected constants", () => {
    expect(ALL_BLOCK_KEYS).toEqual(["ctas", "stats", "trust"])
    expect(BLOCK_LABELS).toEqual({ ctas: "CTAs", stats: "Stats", trust: "Trust" })
  })
})

// ---------------------------------------------------------------------------
// Visual editor inspector: hero block-order uses dedicated control
// ---------------------------------------------------------------------------

const inspectorSource = fs.readFileSync(
  "components/admin/visual-editor/page-visual-editor-inspector.tsx",
  "utf-8"
)

describe("visual editor hero block-order control", () => {
  it("imports resolveHeroBlockOrder from shared helper", () => {
    expect(inspectorSource).toContain("resolveHeroBlockOrder")
    expect(inspectorSource).toContain("@/lib/admin/hero-block-order")
  })

  it("renders exactly 3 block rows via resolveHeroBlockOrder", () => {
    // The inspector calls resolveHeroBlockOrder which always returns 3 keys
    expect(inspectorSource).toMatch(/resolveHeroBlockOrder\(strArr\(content\.heroContentOrder\)\)/)
  })

  it("uses BLOCK_LABELS for display text", () => {
    expect(inspectorSource).toContain("BLOCK_LABELS[key]")
  })

  it("does not use ContentArrayEditor for block order", () => {
    // The old generic ContentArrayEditor for block order used "Block key (ctas/stats/trust)" field label
    expect(inspectorSource).not.toContain('Block key (ctas/stats/trust)')
  })

  it("does not have add/remove buttons in block-order section", () => {
    // ContentArrayEditor had an addItem function and remove buttons — the new
    // dedicated control only has move up/down buttons (no Add, no remove)
    // Verify the old "Block Order" ContentArrayEditor pattern is gone
    expect(inspectorSource).not.toMatch(/ContentArrayEditor[^}]*label="Block Order"/)
  })

  it("has move up/down controls for block order", () => {
    expect(inspectorSource).toMatch(/move\(idx, -1\)/)
    expect(inspectorSource).toMatch(/move\(idx, 1\)/)
  })

  it("renders side controls only when layout is split or split_reversed", () => {
    // isSplit guard for inline side selectors
    expect(inspectorSource).toMatch(/const isSplit = s\(content\.layoutVariant\) === "split" \|\| s\(content\.layoutVariant\) === "split_reversed"/)
    expect(inspectorSource).toMatch(/\{isSplit && \(/)
  })

  it("writes to heroContentSides when side is changed", () => {
    expect(inspectorSource).toContain('onContentChange("heroContentSides"')
  })
})

// ---------------------------------------------------------------------------
// Form editor: also imports from shared helper
// ---------------------------------------------------------------------------

const formEditorSource = fs.readFileSync(
  "components/admin/section-editor/editors/hero-cta-editor.tsx",
  "utf-8"
)

describe("form editor uses shared hero-block-order helper", () => {
  it("imports from shared helper", () => {
    expect(formEditorSource).toContain("@/lib/admin/hero-block-order")
  })

  it("does not have private ALL_BLOCK_KEYS definition", () => {
    expect(formEditorSource).not.toMatch(/^const ALL_BLOCK_KEYS/m)
  })

  it("calls resolveHeroBlockOrder (not resolveBlockOrder)", () => {
    expect(formEditorSource).toContain("resolveHeroBlockOrder")
    expect(formEditorSource).not.toMatch(/\bresolveBlockOrder\(/)
  })
})
