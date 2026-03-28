# Phase 4 Handoff Prompt

## Status

Phase 3 is approved on the live VPS repo.

Approved baseline from Phases 1-3:

- shared CMS command layer exists
- local worker runtime exists
- `site_build_draft` exists and can run in plan-only or apply mode
- draft apply is CMS-native and rollback-capable
- touched page slugs and plan summaries are recorded on `result.phase3`
- existing admin job APIs exist:
  - `GET /admin/api/agent/jobs`
  - `POST /admin/api/agent/jobs`
  - `GET /admin/api/agent/jobs/[jobId]`
  - `POST /admin/api/agent/jobs/[jobId]/cancel`
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Phase 3 unless a true blocker is found while implementing Phase 4.

## Role

You are the coding agent implementing Phase 4 only for `hopfner.dev-main`.

Your job is to add the protected admin agent workspace for creating, tracking, reviewing, opening, and rolling back site-build jobs.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/06-phase-04-admin-workspace.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/21-phase-04-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect these existing reuse points:
   - `/var/www/html/hopfner.dev-main/components/admin-shell.tsx`
   - `/var/www/html/hopfner.dev-main/lib/admin/route-meta.ts`
   - `/var/www/html/hopfner.dev-main/components/admin/ui.tsx`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/cancel/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/snapshots.ts`
3. inspect existing admin workspace/collection test patterns:
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/route-meta.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/workspace-pages.test.tsx`
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/collection-pages.test.ts`
4. stop and report if the live repo materially differs from this prompt

## Phase Scope

In scope:

- nav + route-meta wiring for a new protected admin agent workspace
- new protected route under `/admin`
- workspace UI for create/track/review/open/rollback
- non-secret agent status surface
- rollback API surface for completed draft jobs
- tests for route-meta/nav, APIs, and workspace UI

Out of scope:

- provider/model integration
- public/customer-facing agent access
- shell/terminal exposure
- generated media
- Phase 5 work

## Hard Rules

- Admin-only access only. Reuse the existing protected admin app and `requireAdmin`.
- Do not expose any provider key, shell access, or raw server env values.
- Reuse the existing job APIs and job/result model. Do not invent a second job system.
- Reuse `/admin/api/pages/overview` to map touched slugs to page ids for visual-editor links unless a true blocker forces otherwise.
- Keep the workspace honest about current capability: prompt input is still structured JSON text in this phase, not natural-language model generation.
- Do not start Phase 5 media/provider work.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/admin/route-meta.ts`
2. `/var/www/html/hopfner.dev-main/components/admin-shell.tsx`
3. new `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page.tsx`
4. new `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
5. new `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/*`
6. new `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
7. new `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`
8. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts` only if a small helper is truly needed
9. tests:
   - `/var/www/html/hopfner.dev-main/tests/admin-foundation/route-meta.test.ts`
   - new `/var/www/html/hopfner.dev-main/tests/admin-api-agent-status.test.ts`
   - new `/var/www/html/hopfner.dev-main/tests/admin-api-agent-rollback.test.ts`
   - new `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`

## Existing Workflows To Reuse

- admin shell nav structure from `/var/www/html/hopfner.dev-main/components/admin-shell.tsx`
- admin workspace scaffolds from `/var/www/html/hopfner.dev-main/components/admin/ui.tsx`
- collection/workspace route patterns from existing admin pages under `/var/www/html/hopfner.dev-main/app/admin/(protected)`
- agent job list/detail/cancel services from `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
- visual editor deep links under `/admin/pages/[pageId]/visual`
- page lookup/read truth from `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`

## Required Phase 4 Behavior

- admin can open a dedicated `/admin/agent` workspace
- admin can submit a `site_build_draft` job from that workspace
- admin can see job list state and selected job detail
- admin can inspect prompt, plan summary, apply state, logs, and touched pages
- admin can open touched pages in the existing visual editor
- admin can cancel active jobs and rollback completed apply jobs
- workspace shows non-secret status about the local agent capability/runtime

## Checkpoint A

Goal:
- route/nav/meta wiring exists
- backend surfaces needed by the workspace exist
- no full UI review surface yet beyond minimal shell/page scaffolding

Required before stopping:

1. Add a protected `/admin/agent` route and classify it in route-meta as a workspace route.
2. Add an Agent nav item in `components/admin-shell.tsx`.
   - Place it under `Configure`.
   - Keep the label short: `Agent`.
3. Add `GET /admin/api/agent/status`.
   - admin-only
   - non-secret response only
   - include enough data for the workspace to show current capability/runtime status, such as:
     - supported job kinds
     - rollback support
     - latest run or latest worker activity summary if available
4. Add `POST /admin/api/agent/jobs/[jobId]/rollback`.
   - admin-only
   - load the job detail through the existing service layer
   - require a completed apply-mode Phase 3 result with a rollback snapshot id
   - call the existing agent rollback helper
   - return a compact success payload with snapshot id and touched pages
   - reject plan-only jobs or missing rollback state with a 400-class response
5. Add tests for:
   - route-meta classification for `/admin/agent`
   - shell/nav presence for the new Agent route
   - agent status API
   - rollback API

Hard stop:

- stop here and wait for QA approval
- do not build the full workspace UI before approval

## Checkpoint B

Goal:
- full admin agent workspace is complete
- Phase 4 is complete

Required before stopping:

1. Build the page client for `/admin/agent`.
2. Reuse `WorkspaceHeader`, `WorkspacePanel`, `AdminPanel`, `AdminLoadingState`, `AdminEmptyState`, and `AdminErrorState` from `/var/www/html/hopfner.dev-main/components/admin/ui.tsx` unless a true gap forces a very small shared-ui addition.
3. Add these product surfaces:
   - status panel
   - job creation panel
   - job list panel
   - selected job detail panel
4. Job creation panel requirements:
   - prompt textarea for structured JSON prompt input
   - explicit apply toggle or equivalent control, defaulting to apply draft changes
   - submit through existing `POST /admin/api/agent/jobs`
   - no direct DB writes
5. Job list/detail requirements:
   - poll list/detail on an interval while the page is open
   - show queued/running/completed/failed/canceled state clearly
   - show latest run summary where available
   - show prompt text, plan summary, logs, and touched page slugs
6. Touched page link requirements:
   - use `/admin/api/pages/overview` to map touched slugs to page ids
   - link to `/admin/pages/[pageId]/visual`
   - do not create a new page-lookup API unless truly blocked
7. Rollback/cancel requirements:
   - show cancel action only when the job can still be canceled
   - show rollback action only when the job has a rollback-capable apply result
   - use the approved rollback API
8. Add UI tests for:
   - loading/error/empty states
   - job creation request shape
   - selection/detail rendering
   - touched-page link rendering
   - rollback/cancel action wiring
9. Run browser/manual QA if the environment supports an authenticated admin session.
   - required flow: open `/admin/agent` -> submit job -> observe status -> inspect detail -> open touched page in visual editor -> trigger rollback
   - if authenticated browser QA is blocked by environment/session constraints, stop and report the blocker explicitly instead of faking evidence

Hard stop:

- stop here for full Phase 4 QA
- do not start Phase 5 work

## Required Checks

At Checkpoint A:

- targeted API and route-meta/nav tests
- targeted eslint on changed route/nav/API files

At Checkpoint B:

- targeted workspace UI tests
- `npm test`
- `npm run build`

## Stop And Report Immediately If

- the existing job/result model is insufficient and would require a second parallel job system
- touched-page link mapping cannot be done safely through the existing pages overview surface
- rollback from the workspace would require exposing secrets, shell access, or broad new internal APIs
- browser/manual QA is impossible because no authenticated admin session is available

## Required Reporting At Every Checkpoint

When you stop, report:

- exact files changed
- exact new routes and APIs added
- exact existing APIs reused
- exact job-create payload submitted by the workspace
- exact status fields surfaced to the UI
- exact touched-page link strategy used
- exact rollback/cancel conditions enforced in the UI
- exact tests run
- explicit confirmation that Phase 5 work was not started

## Completion Condition For Phase 4

Phase 4 is complete only when:

- `/admin/agent` exists in the protected admin app and nav
- admin can enqueue and inspect `site_build_draft` jobs
- touched pages can be opened in the existing visual editor
- rollback can be triggered from the workspace
- tests and build pass
- you have stopped for QA without starting Phase 5
