# Root Cause And Required Direction

## Issue List

1. Visual inspector CTA fields remain editable when the CTA is hidden.
2. Global-section visual CTA fields remain editable when the CTA is hidden.
3. The global footer visual panel still exposes a top-level subscribe block that is not part of the live footer renderer contract.
4. Current proof is too helper-heavy for these UI states.

## Why Each Issue Exists

### 1. Visual inspector hidden CTA fields

In `components/admin/visual-editor/page-visual-editor-inspector.tsx`, the toggle state is wired, but `InspectorInput` does not currently accept or use a `disabled` prop, and the CTA label/link inputs are always active.

### 2. Global-section visual CTA fields

In `components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`, the same pattern exists for `GInput`: toggles are present, but the corresponding CTA fields do not change state when the CTA is hidden.

### 3. Stale top-level footer subscribe controls

The live footer renderer reads subscribe state per card in `components/landing/footer-grid-section.tsx`.

The form-editor canonical editing path is also per card in:
- `components/admin/section-editor/editors/footer-card-row.tsx`
- `components/admin/section-editor/editors/footer-grid-editor.tsx`

But the global visual panel still exposes:
- `content.subscribeEnabled`
- `content.subscribePlaceholder`
- `content.subscribeButtonLabel`

Those fields are stale for the current renderer contract and create a misleading editor path.

### 4. Proof gap

The current CTA batch is covered mainly by:
- shared helper tests
- button variant tests

That is useful, but it does not prove the visual editor surfaces themselves become read-only when hidden.

## Required Direction

1. Extend the local visual-editor input primitives so they support `disabled`.
2. Thread disabled state through the existing CTA toggle sections.
3. Keep CTA values preserved while hidden.
4. Remove the stale top-level footer subscribe block from the global visual panel.
5. Add rendered tests that prove the above behavior.

## Files Expected To Change

- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
- `/var/www/html/hopfner.dev-main/tests/visual-editor/v22-content-parity.test.ts`
- one or more new or existing rendered test files under `/var/www/html/hopfner.dev-main/tests/visual-editor`

## Stop Condition If Assumptions Break

Stop and report if any of the following is false:
- the visual editor still uses `ctaPrimaryEnabled` and `ctaSecondaryEnabled` as the canonical hide/show flags
- the live footer renderer still reads subscribe config per card
- disabling the inputs would break an intentional save flow or dirty-state rule
