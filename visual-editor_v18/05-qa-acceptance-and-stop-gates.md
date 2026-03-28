# QA Acceptance And Stop Gates

## Required Commands

Run all of the following from `/var/www/html/hopfner.dev-main`:

```bash
npm test -- tests/visual-editor
npm run build
```

If either command fails, stop and report the exact failure.

## Manual QA Checklist

Use the visual editor on a real page and verify all of the following:

1. the page-workspace footer is visible before any edits are made
2. in clean state, the footer still looks like an action bar and keeps the primary save action visible but disabled
3. after changing a page setting, the footer keeps the same layout and enables save/discard
4. after saving, the footer returns to the clean state without collapsing structurally
5. global sections communicate reusable/locked meaning clearly in the canvas node chrome
6. the same section communicates compatible meaning in the structure rail
7. dirty node state is visible but does not overpower the section label
8. the touched UI feels quieter and more deliberate than v17

## Stop Conditions

Stop and report immediately if any of the following occur:

1. the page-workspace footer disappears again in any state
2. the clean-state footer hides the primary action area
3. canvas chrome becomes noisier than the rail
4. global/locked semantics are still ambiguous on canvas
5. the new tests are mostly source inspection again
6. `npm test -- tests/visual-editor` fails
7. `npm run build` fails

## Completion Report Requirements

The completion report must include:

1. exact files changed
2. exact tests upgraded from source inspection to behavior proof
3. exact clean-state footer layout after the change
4. exact dirty-state footer layout after the change
5. exact canvas-chrome semantic changes for global, locked, and dirty status
6. exact command output summaries for test and build
7. any blocker or compromise, with the exact reason
