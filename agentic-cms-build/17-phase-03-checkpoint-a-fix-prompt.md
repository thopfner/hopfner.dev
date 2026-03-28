# Phase 3 Checkpoint A Fix Prompt

## QA Outcome

Checkpoint A is not approved yet.

Two blocking issues were found in the live VPS repo QA pass.

## Blocking Issues

### 1. Rollback scaffolding does not restore "page did not exist" state

In `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`:

- `captureContentSnapshot()` only serializes pages that currently exist for the requested slugs
- `restoreContentSnapshot()` only iterates `snapshot.pages`
- there is no restore path that deletes a page created after the snapshot when that slug did not exist before capture

This is a Phase 3 blocker.

The Phase 3 draft flow is explicitly allowed to create pages. If a job later creates a new page slug and rollback is triggered, the current scaffolding will not remove that newly created page, so rollback is not correct for one of the core Phase 3 cases.

### 2. Live production build is red

Live `npm run build` fails with:

- `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts:4`
- it imports `type SnapshotPayload` from `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply`
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts` no longer exports that type

This must be fixed before Checkpoint A can pass.

## Role

You are fixing Checkpoint A only.

Do not start Checkpoint B.
Do not enable real draft apply.
Do not widen the Phase 3 scope.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/05-phase-03-draft-orchestration.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/16-phase-03-handoff-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/17-phase-03-checkpoint-a-fix-prompt.md`

## Scope

In scope:
- `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`
- `/var/www/html/hopfner.dev-main/lib/agent/execution/snapshots.ts` if needed
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts`
- Phase 3 tests required to prove the fix

Out of scope:
- real draft apply
- new job kinds
- admin workspace UI
- worker runtime packaging
- Phase 4 work

## Required Fix

### A. Make rollback correct for newly created page slugs

You must preserve enough pre-run state to restore both cases:

- page existed before snapshot
- page did not exist before snapshot

Acceptable implementation directions:

- encode target slug presence/absence in the snapshot payload and make restore delete pages that were absent before capture but exist at rollback time
- or preserve equivalent metadata that lets restore remove newly created pages safely for the targeted slug set

Requirements:

- the restore path must only act on the targeted page slugs
- a slug that existed before capture must be restored with its sections/versions
- a slug that did not exist before capture must be absent after rollback
- do not broaden deletion beyond the targeted slug set

### B. Restore build compatibility for blueprint rollback

Fix the live build break in the smallest correct way.

Acceptable options:

- re-export `SnapshotPayload` from `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
- or change `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts` to import the type from the canonical snapshot module

Preserve current blueprint rollback behavior.

## Test Requirements

Add or update tests so they prove the actual blocker is fixed.

Required coverage:

- snapshot capture/restore covers a slug that did not exist before capture and verifies rollback removes the later-created page
- existing-page restore still works
- live build compatibility for the blueprint rollback surface is preserved

Do not satisfy this only with mocked plumbing assertions. Add at least one behavior-level test around the snapshot payload/restore contract.

## Required Checks

- `npx eslint lib/cms/content-snapshots.ts lib/agent/execution/snapshots.ts lib/cms/blueprint-apply.ts app/admin/api/content/blueprint/rollback/route.ts tests/agent-draft-execution.test.ts`
- `npx vitest run tests/agent-draft-execution.test.ts`
- `npm test`
- `npm run build`

## Required Reporting At Stop

When you stop, report:
- exact files changed
- exact rollback contract change made for "page absent before snapshot"
- whether you changed the snapshot payload shape
- exact build-compatibility fix applied
- exact tests run
- explicit confirmation that Checkpoint B work was not started

## Stop Condition

Stop again for QA as soon as these two Checkpoint A blockers are fixed.
