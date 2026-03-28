# Phase 1: CMS Command Layer

## Goal

Extract a shared server-side CMS command layer and server-safe payload utilities that preserve existing admin/editor behavior.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`
2. new `lib/cms/commands/*` and related shared payload modules
3. `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
4. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
5. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
6. `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
7. `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
8. `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
9. new tests for the extracted command layer

## Source Workflows / Files To Reuse

- section editor save/publish/delete/restore behavior from `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
- visual editor section add/duplicate/delete/reorder behavior from `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
- visual editor save/publish behavior from `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
- page creation behavior from `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
- theme preset / site formatting behavior from `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`

## Step-By-Step Implementation

1. Extract payload normalization and draft-to-payload logic into a server-safe shared module.
2. Create shared CMS command functions for:
   - page create
   - section add
   - section duplicate
   - section reorder
   - section save draft
   - section publish draft
   - theme preset create/update/apply
   - media metadata finalize
3. Keep current client surfaces as thin adapters over the new command layer or thin admin APIs that call it.
4. Keep existing publish RPC usage and CMS table contracts identical.
5. Add tests that assert the command layer preserves current payload and mutation behavior.

## Required Behavior

- No visible regression in current page editor, visual editor, page list, global section, or theme flows.
- Existing page creation still works.
- Existing draft save/publish behavior still works.
- Existing theme preset/apply behavior still works.
- Shared command functions are reusable by later worker phases.

## What Must Not Change In The Phase

- Do not add the worker.
- Do not add prompt execution.
- Do not add agent job tables.
- Do not change publish ownership.
- Do not add new section type support.

## Required Tests For The Phase

- `npm run test`
- `npm run build`
- existing page-list and visual-editor tests
- new unit tests for extracted command functions
- new tests for any new admin route wrappers added in this phase

## Gate For Moving Forward

Do not proceed until:
- current UI parity is preserved
- command extraction is complete
- tests and build pass
- coding agent reports exact client surfaces now backed by shared server logic

