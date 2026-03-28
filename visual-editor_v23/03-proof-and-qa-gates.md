# Proof And QA Gates

## Required Tests

Add behavior tests for the new shared helper and the visual hero block-order path.

### Shared Helper Tests

Prove that `resolveHeroBlockOrder(...)`:

1. drops invalid keys
2. preserves valid user order
3. appends missing required keys
4. returns all three keys when input is empty

### Visual Editor Tests

Prove that the hero visual inspector:

1. does not render a free-text block-key field
2. does not render add/remove controls for hero block order
3. renders exactly three normalized rows
4. exposes up/down movement behavior
5. exposes left/right side controls only for split layouts
6. writes back to `heroContentOrder` and `heroContentSides`

## Required Commands

Run:

```bash
npm test -- tests/visual-editor
npm run build
```

## Required Completion Report

The completion report must include:

1. exact files changed
2. exact shared helper exports introduced
3. confirmation that `hero-cta-editor.tsx` and `page-visual-editor-inspector.tsx` both use the same helper
4. the exact test count from `npm test -- tests/visual-editor`
5. confirmation that the old generic hero `ContentArrayEditor` path was removed

## Final Acceptance Criteria

This batch is only accepted if all of the following are true:

1. the hero visual editor cannot create invalid block keys
2. the hero visual editor cannot omit required blocks
3. the hero visual editor exposes the same reorder and side-assignment workflow as the form editor
4. the payload keys remain unchanged
5. tests pass
6. build passes
