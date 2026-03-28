# Final QA And Ship Gate

This file is the final completion checklist. If any line fails, the batch is not done.

## Required Automated Checks

Run exactly:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
npm run build
```

Both commands must pass.

## Required Manual QA

### 1. Page chooser

On the visual editor:

1. Open a visually dense page.
2. Open the page chooser.
3. Confirm the dropdown surface is fully readable.
4. Confirm the selected page row is obvious.
5. Confirm `Escape` closes it.
6. Confirm outside click closes it.

Pass condition:
- no preview text or visual noise compromises readability

### 2. CTA/link picker

Test at:
- desktop preview width
- tablet preview width
- mobile preview width

For at least one primary CTA and one secondary/footer CTA:

1. Open the link picker.
2. Navigate to another page.
3. Navigate to a page section.
4. Open custom URL mode.

Pass condition:
- no horizontal canvas scrolling is required to complete the interaction
- picker remains vertically navigable and readable

### 3. Spacing truthfulness

For a section with visible vertical padding:

1. Drag spacing handle through multiple token states.
2. Confirm preview changes live.
3. Save draft.
4. Publish.
5. Compare the public page with the visual preview result.

Pass condition:
- preview and frontend match

### 4. Save/publish visibility

At:
- wide desktop width
- medium laptop width
- narrow admin width

1. Select a section.
2. Make it dirty.
3. Confirm save/publish remain visible without scrolling the inspector.
4. Save from the toolbar.
5. Publish from the toolbar.
6. Confirm inspector actions still work.

Pass condition:
- primary actions stay obvious and usable

## Required Test Coverage Additions

The coding agent must add targeted tests for all four areas:

1. floating chooser surface
2. link picker portal and overflow behavior
3. preview wrapper parity
4. toolbar action visibility and shared action path

It is not acceptable to ship this batch with only manual QA.

## Completion Report Required From The Coding Agent

The coding agent must close out with:

1. files changed
2. tests added
3. commands run
4. which gate was hardest and how it was resolved
5. any remaining known risk

## Explicit Non-Goals

Do not expand into:

- schema work
- new frontend section features
- design-token expansion
- large admin-shell redesign
- library replacement

This batch is a strict UX hardening pass on the current visual editor.
