# Phase 4 Checkpoint B Handoff Prompt

## Status

Phase 4 Checkpoint A is approved on the live VPS repo.

Approved and already in place:

- `/admin/agent` exists as a protected admin route
- route-meta and admin nav wiring for `Agent` already exist
- `GET /admin/api/agent/status` exists
- `POST /admin/api/agent/jobs/[jobId]/rollback` exists and is approved
- existing job APIs remain the source of truth:
  - `GET /admin/api/agent/jobs`
  - `POST /admin/api/agent/jobs`
  - `GET /admin/api/agent/jobs/[jobId]`
  - `POST /admin/api/agent/jobs/[jobId]/cancel`
- Phase 3 draft apply and rollback behavior are already approved
- live repo `npm test` passed
- live repo `npm run build` passed

Do not reopen Checkpoint A unless a true blocker is discovered while implementing Checkpoint B.

## Role

You are the coding agent implementing Phase 4 Checkpoint B only for `hopfner.dev-main`.

Your job is to complete the admin agent workspace UI on top of the approved backend surfaces.

You must stop for QA at the end of this checkpoint.
Do not start Phase 5 work.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/06-phase-04-admin-workspace.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/21-phase-04-handoff-prompt.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/23-phase-04-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect these approved live reuse points:
   - `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/cancel/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
   - `/var/www/html/hopfner.dev-main/components/admin/ui.tsx`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
3. inspect existing admin page test patterns:
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/workspace-pages.test.tsx`
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/collection-pages.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/route-meta.test.ts`
4. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- complete `/admin/agent` workspace UI
- create job flow for `site_build_draft`
- list/detail polling and state rendering
- touched-page visual-editor links
- cancel and rollback actions in the workspace
- workspace UI tests
- browser/manual QA attempt if an authenticated admin session is available

Out of scope:

- backend API contract changes unless a true blocker forces a minimal fix
- worker/runtime changes
- provider/model integration
- media generation
- public/customer-facing agent access
- Phase 5 work

## Hard Rules

- Reuse the existing admin APIs and job/result model. Do not create a second agent workflow.
- Do not expose secrets, shell access, env values, or provider configuration beyond the approved non-secret status API.
- Keep the workspace honest: the prompt input is still structured JSON text in this phase.
- Use `/admin/api/pages/overview` as the page lookup truth for touched-page links.
- Do not add a new slug-to-page-id API unless the existing pages overview route is truly insufficient.
- Keep rollback available only for completed apply-mode jobs with rollback state.
- Keep cancel available only where the existing cancel API and current job status make sense.
- Do not widen scope into natural-language prompting, image generation, or Phase 5 provider work.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
2. new components under `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/`
3. tests:
   - new `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
   - update any existing admin workspace tests only if needed for route coverage
4. only if a true UI blocker appears:
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`

If you touch any API in step 4, keep the change minimal, explain the blocker, and do not widen the contract.

## Existing Workflows To Reuse

- `WorkspaceHeader`, `WorkspacePanel`, `AdminPanel`, `AdminLoadingState`, `AdminEmptyState`, and `AdminErrorState` from `/var/www/html/hopfner.dev-main/components/admin/ui.tsx`
- existing protected admin page shell under `/var/www/html/hopfner.dev-main/app/admin/(protected)`
- agent job list/detail/cancel APIs under `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs`
- status API under `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
- rollback API under `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`
- page overview lookup under `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
- visual editor route shape `/admin/pages/[pageId]/visual`

## Required Workspace Behavior

The completed `/admin/agent` workspace must provide these surfaces:

1. Status panel
   - show runtime
   - show supported job kinds
   - show rollback support
   - show worker configured/config error
   - show poll/stale timing
   - show latest activity summary

2. Job creation panel
   - structured JSON prompt textarea
   - explicit apply control, default on
   - explicit note that this is CMS-native structured draft generation, not freeform shell/code execution
   - submit through `POST /admin/api/agent/jobs`

3. Job list panel
   - list recent jobs from `GET /admin/api/agent/jobs`
   - show kind, status, created/updated times, latest run summary
   - allow selecting a job into the detail panel

4. Job detail panel
   - show raw submitted prompt text
   - show plan summary when present
   - show apply state when present
   - show failure details when present
   - show job logs when present
   - show touched page slugs when present

5. Touched-page visual-editor links
   - resolve touched slugs by calling `/admin/api/pages/overview`
   - map slug -> page id from that response
   - render links to `/admin/pages/[pageId]/visual`
   - if a touched slug has no current page match, render it as missing/unresolved instead of inventing a link

6. Cancel / rollback actions
   - cancel only for active or cancel-requestable jobs
   - rollback only for completed apply-mode jobs with a rollback snapshot id
   - use the approved APIs only
   - refresh list/detail after action success

7. Polling
   - refresh while the page is open
   - do not hammer the APIs; use a reasonable interval
   - avoid duplicate overlapping requests

## Exact Job-Create Request Shape

The workspace must submit through the existing enqueue API with this contract:

- `kind: "site_build_draft"`
- `payload.prompt: string`
- when apply is on: `payload.apply: true`
- when apply is off: prefer `payload.dryRun: true`

Do not submit raw page/theme objects directly outside the `prompt` string.

## What Must Not Change

- do not change the approved rollback eligibility contract
- do not add shell/terminal capabilities
- do not expose provider keys or internal env values
- do not add public routes
- do not create or mutate custom section schemas
- do not auto-publish anything

## Required Tests

Run at minimum:

- targeted eslint on all changed Phase 4B files
- `npx vitest run tests/admin-agent-workspace.test.tsx`
- add any targeted API tests only if you made a minimal API adjustment
- `npm test`
- `npm run build`

## Browser / Manual QA

Attempt authenticated browser/manual QA if the environment supports it.

Required flow:

1. open `/admin/agent`
2. submit a `site_build_draft` job
3. observe queued/running/completed or failed state changes
4. inspect job detail
5. open a touched page in the visual editor if available
6. trigger rollback for a completed apply-mode job if available

If authenticated browser QA is blocked by environment or session availability, report that explicitly. Do not fake browser evidence.

## Stop And Report Immediately If

- `/admin/api/pages/overview` cannot safely provide enough data to map touched slugs to page ids
- the current job detail payload is missing something essential for the workspace and would require a broad new API contract
- rollback or cancel UX would require exposing secrets or bypassing approved APIs
- browser/manual QA is impossible because no authenticated admin session is available

## Required Reporting At Stop

When you stop for QA, report:

- exact files changed
- exact workspace panels/components added
- exact request payload submitted by the job form
- exact status fields rendered
- exact touched-page link mapping strategy
- exact cancel and rollback eligibility rules enforced in the UI
- exact polling behavior implemented
- exact tests run
- browser/manual QA evidence or the exact blocker
- explicit confirmation that Phase 5 work was not started

## Stop Condition

Stop for QA as soon as Checkpoint B is complete.

Do not start Phase 5 work after tests/build pass.
