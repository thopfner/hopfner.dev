# Phase 3 Checkpoint B Fix Prompt

## QA Outcome

Checkpoint B is not approved yet.

Two blocking issues were found on the live VPS repo QA pass.

## Blocking Issues

### 1. Shared snapshot helper now changes blueprint rollback behavior

In `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`:

- snapshot capture now always includes `siteFormattingState`
- snapshot restore now always restores `site_formatting_settings` when that state exists

This is a regression for the existing blueprint content rollback flow:

- `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/route.ts` captures a snapshot for a set of page slugs only
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-content.ts` applies page content only, not global theme state
- `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts` restores through the shared snapshot helper

Result: a blueprint rollback can now revert unrelated global theme changes, even though the blueprint flow is a page-content operation.

This widens an existing admin rollback surface beyond its intended scope and is not acceptable.

### 2. Live `npm run build` is red

Live build fails in:

- `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts:229`

The new generic cast in the fake query helper is rejected by TypeScript during `next build`.

Checkpoint B cannot pass while the live production build is red.

## Role

You are fixing Checkpoint B only.

Do not start Phase 4.
Do not widen the product scope.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/05-phase-03-draft-orchestration.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/18-phase-03-checkpoint-b-handoff-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/19-phase-03-checkpoint-b-fix-prompt.md`

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`
- `/var/www/html/hopfner.dev-main/lib/agent/execution/snapshots.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts` only if needed
- `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
- `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts`
- any narrowly related test file required to prove blueprint rollback behavior is preserved

Out of scope:

- Phase 4 UI
- provider/model integration
- publish changes
- media generation
- new admin product surfaces

## Required Fix

### A. Keep theme rollback for agent draft jobs only

You must preserve Phase 3 agent rollback behavior:

- agent draft snapshots must still restore site theme/settings when the agent apply path changed them

But you must stop that behavior from leaking into the older blueprint rollback flow.

Acceptable approaches:

- make site-formatting snapshot capture/restore opt-in in the shared snapshot helper, with agent snapshots enabling it and blueprint snapshots leaving it off
- or move theme snapshot/restore responsibility into the agent-specific wrapper layer while leaving the shared page-content snapshot helper page-scoped by default

Requirements:

- agent draft rollback still restores theme
- blueprint rollback restores only what the blueprint flow actually snapshots/applies
- do not break backward compatibility for previously stored agent snapshots if reasonably avoidable
- do not widen rollback side effects for other existing snapshot consumers

### B. Fix the live build break in the test helper

Fix the generic typing in `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts` so live `npm run build` passes.

Do this in the smallest correct way.

If the correct fix is to cast through `unknown`, do that explicitly and keep the helper behavior unchanged.

## Required Tests

You must add or update tests so the two blockers are actually proven fixed.

Required proof:

- agent rollback still restores theme after an apply run
- blueprint/shared page-content snapshot behavior no longer restores theme unless explicitly requested
- live build passes

Do not rely only on mocked assertions.
At least one behavior-level test must prove the snapshot scope difference between:

- agent draft rollback
- non-agent/shared page-content rollback

## Required Checks

- `npx eslint lib/cms/content-snapshots.ts lib/agent/execution/snapshots.ts tests/agent-draft-execution.test.ts tests/helpers/fake-cms-supabase.ts`
- targeted Vitest for the changed Phase 3 snapshot/rollback tests
- `npm test`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact files changed
- exact mechanism used to keep theme rollback agent-only
- whether shared snapshot payload shape changed again
- exact test-helper build fix applied
- exact tests run
- explicit confirmation that Phase 4 work was not started

## Stop Condition

Stop again for QA as soon as these two Checkpoint B blockers are fixed.
