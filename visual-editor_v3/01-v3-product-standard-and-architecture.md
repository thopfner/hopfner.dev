# 01 v3 Product Standard and Architecture

This phase defines the target product standard and the architectural guardrails.

## Core Product Position

The visual editor is no longer just a pilot shell.

It is now being built as the future default authoring surface, while still remaining parallel to the form editor during this cycle.

## Architectural Decision

Keep the current section-based architecture.

Do not migrate this release to `Craft.js`, `Puck`, or any other block-tree editor abstraction.

Reason:

- the CMS is already a section/version system with specific payload contracts
- the public site renderer already knows how to resolve those contracts
- the database already stores formatting and token state in JSON/JSONB-backed fields
- introducing a second authoring model would increase risk without fixing the actual parity and UX gaps

## What Must Stay Canonical

The following must remain canonical:

- public renderer merge order
- `resolveSectionUi` and existing section renderer logic
- current page/section/global-section versioning semantics
- current publish and restore RPC semantics
- current Supabase table ownership and RLS assumptions

The visual editor must adapt to the existing model. The model should not be warped to fit a new editor library.

## Stored Data Reality

Formatting and token state are already stored as structured blobs, not normalized per-control columns.

The agent should assume the main editable contracts live in:

- `section_versions.payload`
- `section_versions.formatting`
- `global_section_versions.payload`
- `global_section_versions.formatting`
- `sections.formatting_override`
- `pages.formatting_override`
- `site_formatting_settings.settings`
- `design_theme_presets.tokens`
- `section_presentation_presets.tokens`
- `component_family_presets.tokens`

This is the right foundation for an elite visual editor, because it allows richer editing without schema churn, as long as the editor writes exactly the same semantic shapes.

## v3 Product Requirements

v3 must support:

- full form-editor field parity
- full form-editor formatting parity
- direct editing of text-bearing fields in the visual workflow
- direct editing of CTA labels and links in the visual workflow
- direct manipulation for spacing and sizing using existing token scales
- locked-but-visible handling for global sections
- clear distinction between inherited, preset-derived, and explicitly overridden state
- premium keyboard and mouse behavior

## What Not To Do

Do not add:

- arbitrary freeform pixel positioning
- nested layout composition beyond the current section model
- a second persistence format
- frontend renderer changes just to make authoring easier
- hidden one-off style props that do not map back to stored design variables

## Recommended Internal Architecture

Split the visual editor into five layers:

1. `Data contract layer`
   Reads and writes the existing page/section/version shapes.

2. `Truthful preview layer`
   Uses the same merge order and section renderer logic as the public site.

3. `Field descriptor layer`
   Declares which payload and meta fields exist for each section type and where they appear visually.

4. `Interaction layer`
   Handles selection, inline edit state, drag/drop, manipulation handles, keyboard commands, and dirty tracking.

5. `Persistence layer`
   Saves drafts, publishes versions, restores state, and reorders sections using the existing semantics.

## Required Reuse

The coding agent should prefer extracting shared pure helpers rather than rewriting logic twice.

Priority candidates:

- field visibility and support detection
- formatting capability checks
- payload path helpers
- publish/save argument shaping
- renderer-truth preview merge helpers

Do not aggressively deduplicate stateful UI unless the behavior is already proven equivalent.

## Exit Criteria For This Phase

- architecture documented in code comments and plan notes where needed
- no dependency decision left ambiguous
- a clear "same data, better UI" rule visible across the implementation
- no proposed work item depends on changing the public renderer contract
