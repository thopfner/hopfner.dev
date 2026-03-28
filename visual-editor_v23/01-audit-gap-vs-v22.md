# Audit: Gap Vs v22 Plan

## What Was Checked

This audit checked the current codebase against the `v22` parity brief, with emphasis on the high-impact Phase 2 content controls.

## Status Summary

| Area | v22 Expectation | Current State | Status |
|---|---|---|---|
| `hero_cta` bullets | Present in visual editor | Present | Done |
| `hero_cta` trust line | Present in visual editor | Present | Done |
| `hero_cta` trust items | Present in visual editor | Present | Done |
| `hero_cta` hero stats | Present in visual editor | Present | Done |
| `hero_cta` proof panel fields | Present in visual editor | Present | Done |
| `hero_cta` content block order | Match form-editor workflow | Generic free-form array editor | Not done |
| `hero_cta` block side assignment | Match form-editor workflow | Present, but tied to weak block-order model | Partial |
| `rich_text_block` body editor | Present in visual editor | Present | Done |
| `booking_scheduler` intake-field labels/help text | Present in visual editor | Present | Done |
| `proof_cluster` proof-card + testimonial image | Present in visual editor | Present | Done |
| `case_study_split` media title/image | Present in visual editor | Present | Done |

## Exact Hero Gap

The remaining hero gap is not that the fields are missing.
The remaining gap is that the block-order workflow is implemented with the wrong control model.

### Form Editor

The form editor currently uses:

- fixed valid block keys: `ctas`, `stats`, `trust`
- `BLOCK_LABELS`
- order normalization that appends missing required blocks
- explicit move up/down actions
- left/right segmented controls for split layouts

### Visual Editor

The visual editor currently uses:

- generic `ContentArrayEditor`
- a free-text `key` field
- no fixed block-key enforcement in the UI
- no exact reuse of the form-editor hero ordering contract

## Why This Must Be Fixed

The current visual editor can drift into invalid or incomplete states that the form editor would never allow.

That is not elite product behavior.
It is also unnecessary, because the correct model already exists in the form editor.

## Files Verified

- `components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `components/admin/section-editor/editors/hero-cta-editor.tsx`
- `components/landing/hero-section.tsx`

## Exact Code-Level Mismatch

The weak path is the current visual-editor hero block-order implementation:

- `ContentArrayEditor label="Block Order"`
- free-text field: `Block key (ctas/stats/trust)`

That must be replaced with a dedicated hero-only control.
