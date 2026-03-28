# Phase 4: Admin Agent Workspace

## Goal

Add the admin workspace for creating, tracking, reviewing, and rolling back site-build jobs.

## Files To Change, In Order

1. new admin protected route for the agent workspace
2. related admin UI components under `/var/www/html/hopfner.dev-main/components/admin`
3. worker/job detail APIs if needed
4. tests for the workspace UI and job review flow

## Source Workflows / Files To Reuse

- admin shell and workspace patterns already present in the protected admin app
- collection/workspace layout patterns already covered by existing admin tests
- page overview and visual editor route structure for opening generated drafts

## Step-By-Step Implementation

1. Add a protected admin workspace for site-build jobs.
2. Show:
   - config status
   - job form
   - queued/running/completed/failed jobs
   - touched pages
   - rollback action
3. Add direct links from a completed job to the generated pages in the existing visual editor.
4. Show prompt, plan summary, and execution log summaries without exposing secrets.

## Required Behavior

- Admin can create a job from the workspace.
- Admin can inspect job progress and failures.
- Admin can open generated drafts in the visual editor.
- Admin can trigger rollback from the workspace.

## What Must Not Change In The Phase

- Do not expose any shell or terminal interface.
- Do not expose raw provider keys.
- Do not add customer-facing agent access beyond admin users.

## Required Tests For The Phase

- new workspace UI tests
- browser/manual QA for create -> run -> inspect -> open visual editor -> rollback
- `npm run test`
- `npm run build`

## Gate For Moving Forward

Do not proceed until:
- admin workflow is complete end-to-end
- visual editor review entrypoints work
- rollback can be launched from the workspace
- coding agent provides browser QA evidence

