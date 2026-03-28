# QA Acceptance And Stop Gates

## Automated Checks

Run all of the following:

1. `npm test -- tests/visual-editor`
2. `npm run build`

Do not claim completion if either command fails.

## Manual QA

Run all of the following in the visual editor:

1. click several sections from the left rail and verify the visual-editor toolbar remains visible the entire time
2. select sections near the top, middle, and bottom of the page and verify only the canvas scrolls to reveal them
3. verify the structure rail and inspector still scroll independently after the workspace contract change
4. open a short single-line field and verify the overlay is easy to read and not visually cramped
5. open a longer single-line field and verify the text is still readable without feeling truncated to a tiny visible region
6. open a large heading/display field and verify the current good editing experience remains intact
7. click into a text field and blur without changes; verify no unsaved-change prompt is created

## Required Test Additions

The completion report must identify the new or upgraded tests for:

1. explicit canvas-scoped section scrolling
2. corrected visual-editor workspace layout contract
3. single-line overlay readability treatment
4. preserved large-text overlay behavior
5. preserved no-op dirty-state behavior

## Completion Report Required From The Coding Agent

The completion report must include:

1. exact files changed
2. the old and new workspace height/overflow contract
3. the old and new section-selection scroll path
4. the exact single-line overlay readability rules now in effect
5. exact automated command output summaries
6. exact manual QA results for each scenario above

## Explicit Non-Goals

Do not claim completion for any of the following:

1. unrelated shell polish
2. rich-text redesign
3. inspector redesign
4. new page-builder capability work

## Final Stop Gate

Stop and report instead of claiming success if any of the following is true:

1. the toolbar can still scroll away during left-rail navigation
2. section selection still depends on browser-level implicit scrolling
3. single-line editing still feels cramped, oversized, or effectively truncated
4. the large-text overlay got worse
5. the only proof for any touched behavior is a source-string or import-only test
