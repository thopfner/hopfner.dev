# Phase 6 Checkpoint A Fix Prompt

## QA Outcome

Phase 6 Checkpoint A is not approved yet.

The backend/runtime hardening changes are in place and the live repo passes tests/build, but the new operator-facing hardening state is not actually visible in the admin workspace.

Do not start Checkpoint B.

## Blocking Issue

The status API now exposes the new Phase 6A operator state in:

- `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`

including:

- `providers`
- `controls.draftExecution`
- `retryPolicy`
- `v1Scope`
- `latestActivity.cancellationState`

But the admin workspace in:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`

still uses the older narrower status shape and does not render those fields.

That means an operator using `/admin/agent` still cannot actually see:

- whether generated-image provider config is missing
- whether draft execution is currently serialized/blocked by an active job
- the active job cancellation state
- the retry policy summary
- the enforced v1 scope boundaries

This is a real Checkpoint A contract miss because the handoff required:

- provider/worker config problems to be readable to an operator
- cancellation state to be explicit and operator-readable in the admin workspace/API surface
- v1 scope boundaries to be explicit in the workspace and runtime

Right now the API has the data, but the product surface does not.

## Role

You are fixing Phase 6 Checkpoint A only.

Do not start Checkpoint B.
Do not widen backend/runtime behavior beyond what is already implemented.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/28-phase-06-handoff-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/29-phase-06-checkpoint-a-fix-prompt.md`

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
- `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`

Out of scope:

- worker/runtime logic changes
- API contract redesign
- Checkpoint B deployment work

## Required Fix

Update the admin workspace so the new Phase 6A operator state from `/admin/api/agent/status` is actually visible in `/admin/agent`.

At minimum, render these non-secret operator-facing items in the Status panel:

1. Provider status
   - generated-image provider name
   - configured / not configured
   - model if configured
   - config error if not configured

2. Draft execution control state
   - serialized mode
   - enqueue blocked or not
   - active draft job id/status if present
   - active draft-job cancellation state if present

3. Retry policy summary
   - stale recovery behavior
   - draft-apply protection behavior

4. V1 scope summary
   - no auto-publish
   - no custom section schema creation
   - no public worker ingress
   - publish requires human review

5. Latest activity cancellation state
   - if present, render it alongside the existing latest activity summary

Keep the UI concise and operator-readable. Do not expose secrets or raw env values.

## Required Tests

Update `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx` so it proves the new status fields render in the workspace.

At minimum, add assertions for:

- provider status/config error visibility
- serialized draft-execution state visibility
- active job cancellation state visibility
- retry policy visibility
- v1 scope visibility

## Required Checks

- `npx eslint components/admin/agent-workspace/agent-workspace.tsx tests/admin-agent-workspace.test.tsx`
- `npx vitest run tests/admin-agent-workspace.test.tsx`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact files changed
- exact status fields now rendered in the workspace
- exact tests updated
- exact commands run
- explicit confirmation that Checkpoint B work was not started

## Stop Condition

Stop again for QA as soon as the `/admin/agent` workspace surfaces the new Phase 6A operator state and the build stays green.
