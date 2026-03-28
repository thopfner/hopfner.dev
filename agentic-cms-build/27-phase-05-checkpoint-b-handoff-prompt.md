# Phase 5 Checkpoint B Handoff Prompt

## Status

Phase 5 Checkpoint A is approved on the live VPS repo.

Approved and already in place:

- generated-image provider abstraction exists under `lib/agent/media/*`
- Gemini-backed generated-image provider exists
- strict generated-media registration helper exists and is cleanup-aware
- existing human media upload flow remains intact
- shared media storage-path helpers are build-safe in the current shared command layer
- `.env.example` already documents:
  - `GEMINI_API_KEY`
  - `GEMINI_IMAGE_MODEL`
- live repo `npm test` passed
- live repo `npm run build` passed

Do not reopen Checkpoint A unless a true blocker is discovered while implementing Checkpoint B.

## Role

You are the coding agent implementing Phase 5 Checkpoint B only for `hopfner.dev-main`.

Your job is to integrate generated background images into `site_build_draft` apply mode through the existing CMS model.

You must stop for QA at the end of this checkpoint.
Do not start Phase 6 work.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/07-phase-05-media-generation.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/25-phase-05-handoff-prompt.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/27-phase-05-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect these approved live reuse points:
   - `/var/www/html/hopfner.dev-main/lib/agent/media/providers/gemini.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/media/register-generated-image.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
   - `/var/www/html/hopfner.dev-main/lib/cms/commands/sections.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-planning.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-read-paths.test.ts`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- narrow section-level prompt support for generated background images
- apply-mode generation through the approved provider/media helper
- draft attachment through the existing `meta.backgroundMediaUrl` field
- cleanup of generated assets when later apply work fails
- planning/execution/read-path tests for the new media flow

Out of scope:

- broader asset schema changes
- media generation UI
- public/customer-facing generation
- arbitrary nested content-field image generation
- Phase 6 work

## Hard Rules

- Keep the new prompt surface narrow: section-level `media.backgroundImage` only.
- Generated assets must still land in the existing media library through the approved helper.
- Only attach generated images through the existing draft `meta.backgroundMediaUrl` field.
- Plan-only mode must not call the provider.
- Do not change the existing human upload route contract.
- Do not auto-publish anything.
- Do not widen beyond section background-image generation in this phase.

## Exact Prompt Contract To Implement

Support this optional section-level shape:

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
- `media.backgroundImage.alt` is optional
- if `media.backgroundImage.prompt` is present, generate only in apply mode
- if `meta.backgroundMediaUrl` is already non-empty and `media.backgroundImage.prompt` is also present, reject the plan
- malformed `media.backgroundImage` objects must be rejected

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts` only if a tiny apply-mode hook is truly needed
5. tests:
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-planning.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-read-paths.test.ts`
   - add one new generated-media integration test file only if cleaner than widening the existing tests

## Required Behavior

1. Extend the draft plan types and parser for `media.backgroundImage`.
2. Keep all existing Phase 3 validation restrictions intact.
3. In apply mode only:
   - generate the image through the approved provider/helper
   - register it into the existing media library
   - write the returned public URL into the section draft’s `meta.backgroundMediaUrl`
   - persist the section draft through the existing CMS command layer
4. Cleanup behavior:
   - if generated-image creation fails, fail the job cleanly without partial section attachment
   - if a generated asset is created during the current apply run but the later apply flow fails before the run completes, clean up that newly created asset instead of leaving orphan media
5. Read-path behavior:
   - resulting draft still loads through existing visual-editor and pages-overview readers
   - generated asset appears in the existing media library listing path

## Required Tests

At minimum:

- planning tests for:
  - valid `media.backgroundImage`
  - conflict with non-empty `meta.backgroundMediaUrl`
  - malformed media instructions
- execution tests for:
  - generated media registration into `media`
  - resulting draft contains the generated public URL in `backgroundMediaUrl`
  - cleanup of generated media on later apply failure
- read-path proof that the resulting draft still loads correctly through the existing visual-editor/pages-overview readers

## Required Checks

- targeted eslint on all changed Phase 5B files
- targeted Vitest on updated planning/execution/read-path/media tests
- `npm test`
- `npm run build`

## Manual QA

Attempt manual QA if the environment supports it.

Required proof path:

1. run a `site_build_draft` apply job with a section that requests `media.backgroundImage`
2. confirm the asset appears in the media library
3. confirm the resulting draft loads in the visual editor with the populated background image URL

If authenticated browser QA is blocked by environment or session constraints, report that explicitly instead of faking evidence.

## Stop And Report Immediately If

- the current draft model cannot support generated background images without widening beyond `backgroundMediaUrl`
- provider usage would require client-side secret exposure
- generated-asset cleanup cannot be made safe without regressing the approved upload/media flow

## Required Reporting At Stop

When you stop for QA, report:

- exact files changed
- exact prompt-shape changes implemented
- exact generation + registration + cleanup flow used during apply
- exact tests run
- manual QA evidence or the exact blocker
- explicit confirmation that Phase 6 work was not started

## Stop Condition

Stop for QA as soon as Checkpoint B is complete.

Do not start Phase 6 work after tests/build pass.
