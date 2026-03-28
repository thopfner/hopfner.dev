# Visual Editor v4 In-Place Editing Plan

This bundle is a focused implementation brief for one outcome only:

- true in-place text editing
- true in-flow CTA/link editing

It is written for `/var/www/html/hopfner.dev-main` and is based on:

- code review of the current visual editor
- live admin visual QA
- inspection of the current overlay edit implementation
- inspection of `SectionPreview` and the shared landing section components

## Executive Decision

The current bottom overlay edit bar is not acceptable as the final interaction model.

It must be replaced with real in-place editing inside the rendered section markup.

## What This Brief Requires

- no bottom chip/edit bar as the primary text editing surface
- no fake duplicate admin-only section markup
- no schema change
- no frontend renderer contract change
- no global uncontrolled `contentEditable`

## What "True In-Place" Means Here

When the admin clicks visible text in the canvas:

- the text itself becomes editable in that exact visual position
- the field keeps its existing typography, spacing, and alignment
- committing the edit writes back to the existing draft payload path

When the admin edits a CTA:

- the CTA label is edited in place on the button/link itself
- the destination is edited from an anchored link popover attached to that CTA
- the link popover reuses the same internal/external/anchor logic as the form editor

## The Correct Technical Approach

Do not keep pushing the existing `InlineEditOverlay` pattern.

The correct approach is:

1. add a shared visual-editing context that is active only in admin preview
2. add field-slot components that render plain text in frontend mode and editable text in visual-editor mode
3. thread those field slots through the existing shared landing section components
4. keep `SectionPreview` as the admin-only adapter that mounts the visual-editing provider

This preserves one render system and avoids a second preview implementation.

## Files In This Bundle

- `01-target-and-non-negotiables.md`
- `02-exact-implementation-sequence.md`
- `03-file-touchpoints-and-coverage.md`
- `04-qa-and-acceptance.md`

## Approval Standard

Do not approve the implementation if it still feels like an overlay editor.

Approve it only if:

- text edits happen where the text lives
- CTA label edits happen on the actual CTA
- CTA destination editing is attached to the CTA, not buried in the inspector
- the renderer stays truthful
- the form editor is no longer required for common text/link edits
