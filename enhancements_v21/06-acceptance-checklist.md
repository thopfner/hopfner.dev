# Acceptance Checklist

## Batch 1: Spacing contract alignment

- `FormattingState` includes `spacingTop` and `spacingBottom`.
- `normalizeFormatting()` hydrates both fields correctly.
- `formattingToJsonb()` persists both fields correctly.
- The section drawer shows an `Advanced spacing` group.
- `sectionRhythm` remains in the semantic/default controls area.
- `Top spacing` is editable.
- `Bottom spacing` is editable.
- `Section spacing (outer)` remains available.
- Preview reflects the spacing fields.
- Live render reflects the same spacing fields.
- Leaving the new spacing fields empty preserves current public output.

## Batch 2: Cleanup

- `LandingContent` type is no longer coupled to a stale static content object.
- The old `landingContent` object is removed or clearly archived as legacy-only.
- No runtime code still depends on the old static object.

## Final QA

- `npm run build` passes.
- The section drawer can save, reload, and preview the new spacing controls.
- No existing section layout regressed when new controls are left at defaults.
- No public copy or content behavior changed in this batch.
