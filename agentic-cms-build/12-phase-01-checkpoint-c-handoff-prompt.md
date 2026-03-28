# Phase 1 Checkpoint C Handoff Prompt

## Status

Checkpoint A has passed QA.
Checkpoint B has passed QA.

Approved baseline from Checkpoint B:
- shared payload extraction is approved
- shared CMS command layer is approved
- section editor save/publish rewiring is approved
- visual editor composition and persistence rewiring is approved
- targeted visual-editor tests passed on the live VPS repo
- full `npm test` passed on the live VPS repo
- full `npm run build` passed on the live VPS repo

Do not re-open Checkpoint A or Checkpoint B work unless a true blocker is found while completing the remaining Phase 1 scope.

## Role

You are the coding agent implementing Checkpoint C only for Phase 1.

Your job is to complete the remaining Phase 1 rewires so the current admin surfaces reuse the approved command layer without changing behavior.

You must stop for QA at the end of this checkpoint.
Do not start Phase 2 work.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/03-phase-01-command-layer.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/10-phase-01-handoff-prompt.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/12-phase-01-checkpoint-c-handoff-prompt.md`

Before editing:

1. run `git status --short`
2. inspect the current approved Checkpoint A and B files
3. inspect the remaining Phase 1 surfaces listed below
4. stop and report if the live repo differs materially from this prompt

## Scope

In scope:
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts` only if needed to preserve the media-upload contract after route rewiring
- tests directly required to prove these remaining rewires

Out of scope:
- worker, jobs, orchestration, admin agent workspace, media generation providers
- page publish-all behavior
- global section CRUD extraction
- theme preset delete extraction
- new section-type or theme-schema capabilities
- any Phase 2 runtime or deployment work

## Hard Rules

- Keep current page creation behavior identical.
- Keep current theme preset create, update, and apply behavior identical.
- Follow the live `design_theme_presets` contract, not old `formatting_templates` wording.
- Keep current site-formatting apply behavior identical, including deep-merge semantics and `_appliedTemplateId`.
- Keep current media upload response shape identical: `bucket`, `path`, `url`.
- Preserve the current non-fatal media metadata behavior. Upload success must not turn into a hard failure only because metadata insert/finalize fails.
- Reuse only the approved Phase 1 command layer. Do not invent new runtime architecture here.
- Do not start Phase 2.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
2. `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
3. `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
4. `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts` only if required for upload-path parity
5. tests directly proving these rewires and the shared command behavior

## Existing Behavior To Preserve

- page creation slug validation, title validation, toast behavior, and list refresh behavior from `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
- theme preset save-as-new, update, and apply behavior from `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
- media upload behavior from `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts` and `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`

## Required Rewires

### Step 1: Page Creation

Rewire page creation in `/app/admin/(protected)/pages-list.tsx` to use `createCmsPage()`.

Requirements:
- preserve current validation messages
- preserve current toast behavior
- preserve current drawer-close and list-refresh behavior
- do not change sort/search/list logic

### Step 2: Theme Preset Commands

Rewire only the theme preset command paths in `/app/admin/(protected)/global-sections/page-client.tsx` to use:
- `createDesignThemePreset()`
- `updateDesignThemePreset()`
- `applyDesignThemePreset()`

Requirements:
- preserve live `design_theme_presets` behavior
- preserve current error mapping and uniqueness handling
- preserve current apply semantics into `site_formatting_settings`
- leave theme preset delete on the existing direct path unless a true blocker requires otherwise
- do not broaden into unrelated global-section CRUD work

### Step 3: Media Metadata Finalization

Rewire the upload flow so the approved shared media finalization command is used from the server-side upload path.

Requirements:
- centralize `media` metadata insertion/finalization behind the approved command layer
- preserve current upload response shape
- preserve current non-fatal metadata behavior
- if you need a thin adapter to preserve current UX, keep it thin and explicit
- do not introduce worker/provider logic

### Step 4: Tests

Add or update tests that prove the remaining Phase 1 behavior.

Minimum expectations:
- existing page-list create-modal test still passes
- new or updated tests cover the page creation command reuse
- new or updated tests cover theme preset create/update/apply command reuse
- new or updated tests cover media upload finalization behavior, especially the non-fatal metadata case

Prefer behavior/contract tests over source-inspection-only tests.

### Step 5: Final Phase 1 Checks

Run the full required checks and stop for QA.

## Required Checks

- `npx eslint "app/admin/(protected)/pages-list.tsx" "app/admin/(protected)/global-sections/page-client.tsx" app/admin/api/media/upload/route.ts`
- `npx vitest run tests/pages-list.create-modal.test.tsx`
- `npm test`
- `npm run build`

If you add a new focused test file for theme/media command coverage, run it explicitly and report it.

## Stop And Report Immediately If

- completing these rewires requires new command families outside the approved Phase 1 roadmap
- preserving media non-fatal behavior is impossible through the current route surface without widening scope
- theme preset reuse would force unrelated global-section extraction in this checkpoint
- the live repo has changed in a way that invalidates the approved Checkpoint A or B baseline

## Required Reporting At Stop

When you stop, report:
- exact files changed
- exact tests run
- exact behaviors preserved
- any thin adapters added to preserve current contracts
- any surface intentionally left on a direct path and why
- explicit confirmation that Phase 1 is complete
- explicit confirmation that no Phase 2 work was started

## Completion Condition For Checkpoint C

Checkpoint C is complete only when:
- page creation is rewired to the approved command layer
- theme preset create, update, and apply are rewired to the approved command layer
- media metadata finalization is routed through the approved command layer with current UX preserved
- required tests pass
- `npm test` passes
- `npm run build` passes
- you stop for QA without starting Phase 2
