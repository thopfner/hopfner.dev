# QA, Acceptance, And Stop Gates

## Automated Checks

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
npm run build
```

If either command fails, stop and fix the failure before claiming completion.

## Manual QA

Complete all of the following in a logged-in admin visual-editor session:

1. open the page panel with no section selected
2. choose a backdrop image from the media library
3. save page settings
4. reload the page and confirm the backdrop remains correct
5. clear the backdrop and save again
6. select a section with background media support and choose an image from the library
7. upload a new image from the visual editor and confirm the field updates
8. open a composed section with a valid schema
9. confirm the inspector shows an in-context editor instead of a dead-end redirect
10. edit at least one text field, one link-capable field if present, and one image-capable field if present
11. save and reload, then confirm the composed section changes persist

## Required Test Additions

The completion report must identify real behavior tests for:

1. canonical page backdrop persistence
2. media-library open/select behavior
3. composed-section editor rendering and draft updates
4. empty-schema composed-section handling

## Completion Report Required From The Coding Agent

The completion report must include:

1. exact files changed
2. exact shared helpers reused or extracted
3. whether any Mantine dependency actually remained in the touched path
4. exact canonical page fields written by the save flow
5. exact custom block types exercised in manual QA
6. exact test results

## Explicit Non-Goals

This batch is not about:

1. full custom-section direct manipulation on canvas
2. redesigning the visual-editor shell
3. global-section workflow overhaul
4. speculative schema redesign

## Final Stop Gate

Do not claim completion if any of these remain true:

1. the visual editor still cannot open the current media library for its wired media fields
2. the page backdrop URL still persists outside the canonical `pages.bg_image_url` path
3. a valid composed section still dead-ends back to the form editor
4. the main evidence is still import-only tests rather than behavior tests
