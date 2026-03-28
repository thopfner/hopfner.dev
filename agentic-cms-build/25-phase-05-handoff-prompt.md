# Phase 5 Handoff Prompt

## Status

Phase 4 is approved on the live VPS repo.

Approved and already in place:

- protected `/admin/agent` workspace exists
- `site_build_draft` jobs can be created, tracked, canceled, reviewed, and rolled back
- draft apply is CMS-native and rollback-capable
- touched pages can open in the existing visual editor
- media upload route already supports server-side metadata finalization through the shared media command
- live repo `npm test` passed
- live repo `npm run build` passed

Do not reopen Phase 4 unless a true blocker is discovered while implementing Phase 5.

## Role

You are the coding agent implementing Phase 5 only for `hopfner.dev-main`.

Your job is to add provider-backed generated image support that saves assets into the CMS media library and lets `site_build_draft` attach those generated assets to draft sections through the existing CMS model.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/07-phase-05-media-generation.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/25-phase-05-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect these live reuse points:
   - `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts`
   - `/var/www/html/hopfner.dev-main/lib/cms/commands/media.ts`
   - `/var/www/html/hopfner.dev-main/lib/media/upload.ts`
   - `/var/www/html/hopfner.dev-main/lib/blog/gemini-image.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/tests/admin-api-media-upload.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
3. stop and report if the live repo materially differs from this prompt

## Phase Scope

In scope:

- provider abstraction for generated images
- initial Gemini-backed generated-image provider
- strict server-side helper for upload + media-library registration of generated assets
- worker integration so `site_build_draft` can attach generated images to draft sections
- tests for provider failure, storage failure, media registration, cleanup, and draft attachment

Out of scope:

- public/customer-facing media generation UI
- arbitrary shell access or CLI bridging
- Phase 6 hardening
- auto-publish
- custom section schema creation
- arbitrary generated-image placement in nested section content fields

## Hard Rules

- Generated assets must land in the existing media library. Do not bypass `media`.
- Keep customer/provider secrets server-side only. Do not expose keys in admin UI or API payloads.
- Keep the human editor upload flow working as-is.
- Keep generated-image support narrow in v1: only attach generated assets to the existing `backgroundMediaUrl` draft field for supported sections.
- Do not create a second media system, a second storage path contract, or a separate asset registry.
- Do not auto-publish generated media to live pages.
- If a provider/model identifier is needed, document the exact env assumption in `.env.example` and in your stop report.

## Structured Prompt Contract For Phase 5

Phase 5 must keep the existing structured JSON prompt model.

Add one narrow optional section-level media instruction surface:

```json
{
  "sectionType": "hero_cta",
  "media": {
    "backgroundImage": {
      "prompt": "Bespoke image prompt",
      "alt": "Accessible alt text"
    }
  },
  "meta": {
    "backgroundMediaUrl": ""
  }
}
```

Rules:

- `media.backgroundImage.prompt` is optional
- `media.backgroundImage.alt` is optional but should be supported
- if `media.backgroundImage.prompt` is present, the worker may generate a background image for that section in apply mode
- if `meta.backgroundMediaUrl` is already non-empty, and `media.backgroundImage.prompt` is also present, treat that as a validation error
- plan-only mode must not call the provider

Do not invent broader asset directives in this phase.

## Checkpoint A

### Goal

Add the generated-image provider foundation and strict server-side media registration path, without changing `site_build_draft` behavior yet.

### Files To Change, In Order

1. new `/var/www/html/hopfner.dev-main/lib/agent/media/types.ts`
2. new `/var/www/html/hopfner.dev-main/lib/agent/media/providers/gemini.ts`
3. new `/var/www/html/hopfner.dev-main/lib/agent/media/register-generated-image.ts`
4. `/var/www/html/hopfner.dev-main/lib/blog/gemini-image.ts`
5. `/var/www/html/hopfner.dev-main/lib/cms/commands/media.ts` only if a tiny shared helper is truly needed
6. `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts` only if a small extraction is needed to reuse upload logic safely
7. `/var/www/html/hopfner.dev-main/.env.example`
8. tests:
   - extend `/var/www/html/hopfner.dev-main/tests/admin-api-media-upload.test.ts`
   - add generated-media/provider tests under `/var/www/html/hopfner.dev-main/tests/`

### Required Behavior

1. Introduce a provider abstraction that returns generated image bytes plus metadata needed for storage registration.
2. Add the initial Gemini-backed implementation behind that abstraction.
3. Add a strict server-side helper for generated images that:
   - uploads bytes to Supabase Storage
   - registers the media row through the shared command layer
   - returns enough information for worker attachment, including public URL
4. Cleanup rules for the strict helper:
   - if storage upload fails, no media row is inserted
   - if media row registration fails after storage upload succeeds, delete the uploaded storage object before surfacing the error
5. Preserve the current editor upload route behavior:
   - current multipart upload response shape must not change
   - current non-fatal metadata-finalization UX for the human upload route must not regress
6. If you refactor `lib/blog/gemini-image.ts`, keep it as a thin consumer of the new provider path or an explicitly documented placeholder. Do not break any future blog-cover usage contract.

### Required Tests

- provider adapter test for the Gemini implementation
- strict generated-media helper tests for:
  - success
  - provider failure
  - storage failure
  - media registration failure with storage cleanup
- preserve/extend `/var/www/html/hopfner.dev-main/tests/admin-api-media-upload.test.ts` so the current route behavior remains covered

### Required Checks

- targeted eslint on all changed Phase 5A files
- targeted Vitest for the new provider/generated-media tests and `tests/admin-api-media-upload.test.ts`

### Hard Stop

- stop here for QA
- do not integrate generated media into `site_build_draft` yet

## Checkpoint B

### Goal

Integrate generated images into `site_build_draft` apply mode so generated assets are saved to the media library and attached to draft sections through `backgroundMediaUrl`.

### Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts` only if needed for a minimal apply-mode hook
5. tests:
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-planning.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-read-paths.test.ts`
   - add generated-media integration tests if cleaner than widening existing files
6. `/var/www/html/hopfner.dev-main/.env.example` only if more env documentation is required

### Required Behavior

1. Extend the plan schema to support the narrow `media.backgroundImage` instruction surface described above.
2. Validation rules:
   - reject `backgroundImage.prompt` when `meta.backgroundMediaUrl` is already set
   - reject malformed `media.backgroundImage` objects
   - keep all existing Phase 3 prompt restrictions intact
3. Apply-mode behavior:
   - generate the image only during apply mode
   - register it into the CMS media library through the strict server-side generated-media helper
   - set the resulting public URL onto the section draft’s existing `meta.backgroundMediaUrl`
   - then persist the section draft through the existing CMS command layer
4. Cleanup behavior:
   - if generated-media creation fails, fail the job cleanly without partial section attachment
   - if a generated-media asset is created during the current apply run but the later apply flow fails before the run completes, clean up the generated asset created in that run rather than leaving orphan media from a failed apply attempt
5. Read-path proof:
   - the resulting draft must still load through the existing visual-editor and pages-overview read paths
   - the generated asset must appear in the existing media library listing path
6. Keep v1 scope narrow:
   - only background image generation for section drafts
   - no arbitrary content-field image generation in this phase

### Required Tests

- planning tests for the new `media.backgroundImage` contract and conflict validation
- execution tests proving:
  - generated media is registered in `media`
  - resulting draft writes the generated public URL into `backgroundMediaUrl`
  - newly generated asset cleanup occurs on later apply failure
- read-path proof that the resulting draft still loads through existing visual-editor/pages-overview readers

### Required Checks

- targeted eslint on all changed Phase 5B files
- targeted Vitest on the updated planning/execution/media tests
- `npm test`
- `npm run build`

### Manual QA

Attempt manual QA if the environment supports it.

Required proof path:

1. run a `site_build_draft` apply job with a section that requests `media.backgroundImage`
2. confirm the generated asset appears in the media library
3. confirm the resulting draft section resolves through the existing visual editor with a populated background image URL

If authenticated browser QA is blocked by environment or session constraints, report that explicitly instead of faking evidence.

### Hard Stop

- stop here for full Phase 5 QA
- do not start Phase 6 work

## Stop And Report Immediately If

- Gemini/provider integration requires exposing secrets to the client
- the chosen Gemini image path cannot return stable image bytes in the current deployment environment
- generated-media registration cannot be made cleanup-safe without breaking the existing human upload route
- the current draft model cannot attach generated background images without widening beyond the agreed `backgroundMediaUrl` field

## Required Reporting At Every Checkpoint

When you stop, report:

- exact files changed
- exact env vars assumed or added
- exact provider contract implemented
- exact generated-media registration and cleanup strategy
- exact prompt-shape changes, if any
- exact tests run
- whether manual QA was performed or exactly why it was blocked
- explicit confirmation that Phase 6 work was not started

## Completion Condition For Phase 5

Phase 5 is complete only when:

- generated images are provider-backed and server-side only
- generated assets land in the existing media library
- `site_build_draft` can attach generated background images to draft sections through `backgroundMediaUrl`
- failure cleanup is verified
- tests and build pass
- you have stopped for QA without starting Phase 6
