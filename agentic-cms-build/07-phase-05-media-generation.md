# Phase 5: Media Generation

## Goal

Add provider-abstracted image generation and save generated assets into the CMS media library through the supported path.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/blog/gemini-image.ts`
2. new provider abstraction under `lib/agent/media/*`
3. `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
4. `/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts`
5. Phase 1 media finalize command path
6. worker orchestration code for generated media attachment
7. tests for provider failure, storage failure, media row registration, and draft attachment

## Source Workflows / Files To Reuse

- storage upload behavior from `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
- media listing/deletion behavior from `/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts`
- current client media finalize behavior from `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`

## Step-By-Step Implementation

1. Introduce a provider interface for generated images.
2. Add the initial Gemini-backed implementation behind that interface.
3. Move media registration fully server-side for worker use.
4. Let the worker request generated image assets only after content/section planning is stable.
5. Save generated image bytes to storage and register the `media` row through the shared command layer.
6. Attach resulting media URLs/paths to draft sections only.

## Required Behavior

- Generated assets appear in the existing media library.
- Generated assets can be attached to draft sections.
- Provider/storage failures do not leave orphan database state.
- Existing editor media flows continue to work.

## What Must Not Change In The Phase

- Do not publish generated assets automatically to live pages.
- Do not bypass the media library.
- Do not hardwire future providers into the orchestration core.

## Required Tests For The Phase

- provider adapter tests
- storage + metadata finalize tests
- failure/rollback tests for generated media
- manual QA in the media library and visual editor
- `npm run test`
- `npm run build`

## Gate For Moving Forward

Do not proceed until:
- a generated image is visible in the media library
- a generated image can be attached to a draft section
- failure cleanup is verified
- coding agent reports the exact provider/env assumptions used

