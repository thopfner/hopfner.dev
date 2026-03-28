# Agent Workspace Empty-State Hotfix Prompt

## Status

This is a narrow blocker hotfix that should be handled before Phase 10 Checkpoint A continues.

Do not start or continue Phase 10 work until this hotfix is complete and QA-approved.

## Confirmed Symptom

Visual QA on the live admin workspace shows that `/admin/agent` is unstable when there are no jobs in the queue:

- the `Recent Jobs` panel repeatedly flips between empty and loading states
- the right column visibly changes size
- `Job Detail` appears to jump with it
- this happens even when no jobs have been initiated

## Likely Root Cause

In the live repo:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`

The current polling behavior keeps re-entering a foreground loading state when the queue is empty:

- `loadJobs()` sets `jobsLoading` back to `true` whenever `jobs.length === 0`
- the polling interval reruns `loadJobs()` every 5 seconds
- the render path uses `jobsLoading && !jobs.length` to show the loading state

Result:

- an empty queue does not stabilize into a durable empty state
- the panel keeps swapping between “Loading jobs…” and the empty-state render
- the stacked right-column layout visibly jumps

This is a UX regression in the core `/admin/agent` surface, not anticipated behavior.

## Role

You are the coding agent executing a narrow UI-state hotfix for `hopfner.dev-main`.

Your job is to make the empty-queue `/admin/agent` workspace stable under polling without widening scope into Phase 10 hardening.

You must stop for QA after this hotfix.
Do not start Phase 10 work during this run.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/project_overview_v1/README.md`
2. `/var/www/html/hopfner.dev-main/project_overview_v1/01-system-overview.md`
3. `/var/www/html/hopfner.dev-main/project_overview_v1/02-cms-and-rendering-model.md`
4. `/var/www/html/hopfner.dev-main/project_overview_v1/03-admin-and-editor-surfaces.md`
5. `/var/www/html/hopfner.dev-main/project_overview_v1/04-working-notes-for-new-sessions.md`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/17-phase-09-checkpoint-b-handoff-prompt.md`
7. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
8. `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/20-agent-workspace-empty-state-hotfix-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- stabilize the empty `Recent Jobs` state under polling
- stop visible right-column layout thrash caused by polling with zero jobs
- keep `Job Detail` stable when no job is selected
- add regression coverage for the empty-queue polling case

Out of scope:

- Phase 10 hardening work
- backend job lifecycle changes
- worker/runtime changes
- broader `/admin/agent` redesign

## Hard Rules

- keep polling enabled
- do not remove the empty-state UX
- do not regress reviewed-plan apply, rollback, or touched-page behavior
- do not widen scope beyond the agent workspace UI state handling

## Required Fix Direction

Use the smallest viable fix that makes the empty queue stable.

Expected solution shape:

- after the first successful empty jobs response, background polling should not push the panel back into a foreground loading state
- the empty queue should remain rendered as a stable empty state while background refresh continues
- the detail pane should remain stable when no job is selected

If you need an explicit state split, prefer a distinction like:

- initial load
- background refresh
- stable empty result

Do not hide real load failures. Error handling must still surface correctly.

## Tests Required

Add or update tests proving:

- with zero jobs returned, the workspace settles into a stable empty state
- background polling does not re-show the foreground `Loading jobs…` state after the initial successful empty load
- the right-column detail pane remains on the empty detail state when no job is selected

## Required Checks

- targeted eslint on changed files
- `npx vitest run tests/admin-agent-workspace.test.tsx`
- `npm test`
- `npm run build`

## Required Reporting

When you stop, report:

- exact files changed
- exact state-handling strategy used
- exact regression tests added or updated
- exact tests run
- confirmation that Phase 10 was not started

## Completion Condition

This hotfix is complete only when:

- `/admin/agent` no longer flickers between loading and empty states when the queue is empty
- the right column remains visually stable during polling
- the live repo passes `npm test` and `npm run build`
- you have stopped for QA without starting Phase 10
