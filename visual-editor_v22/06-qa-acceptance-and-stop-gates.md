# QA Acceptance And Stop Gates

## Required Commands After Every Phase

Run from `/var/www/html/hopfner.dev-main`:

```bash
npm test -- tests/visual-editor
npm run build
```

If either command fails, stop.

## Manual QA Requirements By Phase

### After Phase 1

Verify:

1. selecting a preset in the visual editor actually changes the exposed formatting fields
2. `pb-24` is selectable
3. inner shadow strength uses the same precision as the form editor

### After Phase 2

Verify:

1. hero content block order can be changed visually
2. hero trust/stats/proof-panel content edits reflect correctly in preview
3. rich text block is editable
4. booking intake field labels/help text are editable
5. proof cluster proof-card fields are editable
6. case study media fields are editable

### After Phase 3

Verify:

1. card-grid image and advanced per-card controls are editable
2. card-grid content still renders truthfully in preview
3. social-proof logos can use the proper media workflow
4. label-value compact mode is editable

### After Phase 4

Verify:

1. nav can be edited from the visual workflow
2. footer can be edited from the visual workflow
3. global semantics still read clearly

## Stop Conditions

Stop and report immediately if:

1. a targeted section remains only partially complete in its assigned phase
2. the visual editor starts diverging from the form editor data contract
3. tests are added that only prove source strings instead of behavior
4. `npm test -- tests/visual-editor` fails
5. `npm run build` fails

## Completion Report Requirements For Each Phase

1. exact files changed
2. exact parity gaps closed
3. exact tests added or upgraded
4. exact live/manual QA performed
5. any blocker or compromise, with the exact file and reason
