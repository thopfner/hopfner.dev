# Phase 4 Checkpoint B Fix Prompt

## QA Outcome

Phase 4 Checkpoint B is not approved yet.

The live VPS repo passes tests and build, but two real workspace behavior bugs were found in the new `/admin/agent` UI.

Do not start Phase 5.

## Blocking Issues

### 1. Selected-job detail can lag behind the current selection and keep actions bound to the previous job

In `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`:

- `selectedJob` currently resolves as `detail?.job ?? jobs.find(...)`
- `detail` is not cleared when `selectedJobId` changes
- `loadDetail()` also skips new requests while another detail request is in flight

This creates a stale-selection window:

1. user clicks a different job in the Recent Jobs list
2. `selectedJobId` changes immediately
3. old `detail.job` still wins the `selectedJob` calculation until the new detail request finishes
4. the Job Detail panel and Cancel/Rollback actions can still reflect the previously selected job

That is a real correctness bug. On a slow response, the user can inspect or act on the wrong job.

### 2. Touched-page visual-editor links do not refresh for newly created pages

Also in `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`:

- `/admin/api/pages/overview` is loaded only on mount
- and again only after rollback

It is not refreshed during normal polling or after a successful apply job completes.

So if a `site_build_draft` job creates a brand-new page slug:

- the job detail can show that slug in `touchedPageSlugs`
- but the workspace keeps the old slug -> pageId map
- so the link stays unresolved until a full page reload or rollback

That breaks a core Phase 4 requirement: opening generated drafts in the existing visual editor.

## Role

You are fixing Phase 4 Checkpoint B only.

Do not start Phase 5.
Do not widen the backend/API contract unless a tiny targeted adjustment is truly required.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/23-phase-04-checkpoint-b-handoff-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/24-phase-04-checkpoint-b-fix-prompt.md`

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
- `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`

Out of scope:

- Phase 5 work
- worker/runtime changes
- broader API redesign

## Required Fixes

### Fix 1: keep selected detail/actions aligned with the current selected job

Update the workspace so that:

- changing `selectedJobId` cannot leave the previous job detail as the active detail surface
- Cancel and Rollback actions always target the currently selected job
- if detail for the newly selected job is still loading, the UI must not keep showing actionable stale detail for the old job

Acceptable approaches include:

- keying detail state by job id and ignoring mismatched detail
- clearing detail immediately on selection change
- allowing the new detail request to supersede the old one safely

Do not leave a window where old job detail drives actions after a new selection.

### Fix 2: refresh slug -> pageId mapping after apply results can create new pages

Update the workspace so that touched-page links can resolve newly created page slugs without requiring a full page reload.

At minimum, ensure the pages overview mapping is refreshed in the normal workspace lifecycle when it becomes relevant, such as:

- after successful job creation follow-up loads
- during polling while jobs are changing
- or when the selected job’s touched-page slugs change

The exact trigger can be pragmatic, but the result must be:

- a newly created page from an apply job becomes linkable from the workspace once the page exists in `/admin/api/pages/overview`
- no reload/rollback is required

## Required Tests

Update `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx` so it proves both fixes.

Add or update tests to prove:

1. Selecting a different job does not keep the previous job’s actionable detail active while the new detail is loading.
   - prove the detail surface and action eligibility switch to the newly selected job context
   - do not rely on instant fetch resolution

2. A newly created touched page slug can become a visual-editor link after the workspace refreshes page overview data.
   - the test should model an initially unresolved slug
   - then a later pages-overview response that contains the new page
   - then assert the workspace renders the correct `/admin/pages/[pageId]/visual` link

## Required Checks

- `npx eslint components/admin/agent-workspace/agent-workspace.tsx tests/admin-agent-workspace.test.tsx`
- `npx vitest run tests/admin-agent-workspace.test.tsx`
- `npm test`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact lines/files changed
- exact strategy used to prevent stale selected-job detail/actions
- exact strategy used to refresh touched-page link resolution
- exact tests added or updated
- exact commands run
- explicit confirmation that Phase 5 work was not started

## Stop Condition

Stop again for QA as soon as these two fixes are in and the full test/build gates pass.
