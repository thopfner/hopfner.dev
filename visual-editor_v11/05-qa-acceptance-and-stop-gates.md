# QA, Acceptance, And Stop Gates

## Automated Checks

Run these commands after each phase if that phase changed the covered area:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
npm run build
```

If either command fails, stop and fix the failure before proceeding.

## Required Test Additions

Add or extend visual-editor tests to cover:

1. add section
2. insert above and below
3. duplicate current-page section
4. delete local section with confirmation
5. page settings save and discard
6. visible undo and redo
7. section history restore
8. global-section in-context workflow
9. custom/composed fallback behavior or explicit blocker behavior
10. media-field save behavior
11. responsive visibility of save and publish actions

## Manual QA

Complete these manual checks in a logged-in admin session:

1. Open a page with mixed built-in and global sections.
2. Add a built-in section from the toolbar.
3. Insert a built-in section between two existing sections from the canvas.
4. Duplicate a section on the current page.
5. Delete a local section.
6. Reorder sections and save order.
7. Edit page backdrop settings and confirm the preview updates.
8. Save and discard page settings.
9. Open section history and restore a previous version.
10. Use visible undo and redo buttons.
11. Open a global section workflow and return to the same page context.
12. Open a custom/composed section and verify the fallback path.
13. Replace a page backdrop image and one section-level image.
14. Verify save and publish remain accessible on narrower widths.

## Completion Report Required From The Coding Agent

The completion report must include:

1. Phase-by-phase summary.
2. Exact files changed.
3. Exact tests added.
4. Exact command output summary for `npm test -- tests/visual-editor`.
5. Exact command output summary for `npm run build`.
6. Manual QA results for every required scenario.
7. Any blocker or partial completion, with the reason.

## Explicit Non-Goals

Do not report this batch as complete based on any of the following:

1. the shell looks nicer
2. some workflows still require the old form editor
3. keyboard-only undo/redo exists
4. custom/composed sections still dead-end
5. media is still form-editor-only

## Final Stop Gate

This batch is not complete if any one of these remains true:

1. a user still has to leave the visual editor to perform a normal page-composition task
2. page-level backdrop settings are still form-editor-only
3. version restore is still form-editor-only
4. global or custom/composed sections still hard-stop the user
5. primary save and publish actions are not reliably visible
