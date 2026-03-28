# Exact Action Plan

This pass should be implemented in two batches.

## Batch 1: Expose the missing section-spacing controls

Goal: align the section editor with the spacing contract the public renderer already supports, without changing frontend output when the new fields are not used.

### A. Extend section formatting state and payload round-trip

Add these fields to the section formatting contract:
- `spacingTop`
- `spacingBottom`

Primary files:
- `/var/www/html/hopfner.dev-main/components/admin/formatting-controls.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/types.ts`

Required work:
- add the fields to `FormattingState`
- hydrate them in `normalizeFormatting()`
- persist them in `formattingToJsonb()`
- ensure preview/live render consume them consistently through the existing renderer path

Rules:
- preserve existing defaults
- empty values must produce no layout change
- do not touch column/mobile behavior

### B. Reorganize spacing controls in the drawer

Spacing controls should be easier to understand.

Required UI structure:
- keep `sectionRhythm` in the semantic controls area as the first/default spacing layer
- move spacing-specific low-level controls into a dedicated `Advanced spacing` group
- include:
  - `Top spacing`
  - `Bottom spacing`
  - `Section spacing (outer)`

Purpose:
- semantic spacing stays the default
- advanced spacing becomes an explicit override layer

Guardrails:
- do not add arbitrary class text inputs for spacing
- do not add new layout-system knobs
- do not add background-treatment controls in this batch

### C. Make precedence clear in the implementation

The intended model should be:
- `sectionRhythm` = semantic/default rhythm selection
- `spacingTop` / `spacingBottom` / `outerSpacing` = explicit margin overrides when set

Implementation requirement:
- if explicit spacing fields are empty, existing semantic/default behavior remains in effect
- if explicit spacing fields are set, they only affect spacing and nothing else

## Batch 2: Safe code optimization cleanup

Goal: remove stale code and source-of-truth drift without changing frontend content behavior.

### A. Split types from legacy content

Move the reusable `LandingContent` type out of:
- `/var/www/html/hopfner.dev-main/lib/landing-content.ts`

Into a type-only location, for example:
- `/var/www/html/hopfner.dev-main/lib/landing-types.ts`

Update any consumers to import the type from the new file.

### B. Remove or archive the unused static content object

The `landingContent` object is stale and appears unused.

Acceptable outcomes:
- delete it if confirmed unused
- or move it to an explicitly named archival file if you discover it is still useful as reference

Preferred outcome:
- remove it entirely if no runtime dependency exists

### C. Keep content behavior unchanged

For v21, do not:
- change live/public copy
- change CTA fallback copy
- change link rendering behavior
- add publish-time content validation

This batch is code cleanup only.
