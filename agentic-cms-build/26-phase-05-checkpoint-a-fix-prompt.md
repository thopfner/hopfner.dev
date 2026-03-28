# Phase 5 Checkpoint A Fix Prompt

## QA Outcome

Phase 5 Checkpoint A is not approved yet.

The provider and generated-media tests pass, but the live production build is red.

Do not start Checkpoint B.

## Blocking Issue

`/var/www/html/hopfner.dev-main/lib/cms/commands/media.ts` now imports `node:crypto`.

That file is exported through the shared CMS command layer and is imported by client-reused visual-editor code:

- `/var/www/html/hopfner.dev-main/lib/cms/commands/index.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`

The result is a real live build failure:

- `npm run build` fails with webpack `UnhandledSchemeError`
- import trace leads back to `node:crypto` in `lib/cms/commands/media.ts`

This is not acceptable for Checkpoint A because the new media helper lives in a module that must remain safe for the current client-reuse pattern established in Phase 1.

## Role

You are fixing Phase 5 Checkpoint A only.

Do not start Checkpoint B.
Do not widen the provider/media integration scope.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/25-phase-05-handoff-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/26-phase-05-checkpoint-a-fix-prompt.md`

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/lib/cms/commands/media.ts`
- tests only if needed for the fix

Out of scope:

- provider contract changes
- generated-media worker integration
- Checkpoint B work

## Required Fix

Remove the build-regressing Node-only import from the shared media command path.

Requirements:

- `lib/cms/commands/media.ts` must remain usable from the current shared command layer
- `npm run build` must pass on the live repo
- keep the current storage path contract and upload response contract unchanged
- do not move this helper behind a server-only boundary, because that would regress the approved shared-command structure

Pragmatic fix options are acceptable, for example:

- replace the explicit `node:crypto` import with a runtime-safe UUID/path helper that works in this shared environment

Do not modify the server-only uses of `node:crypto` in unrelated files unless you find a second real build blocker.

## Required Checks

- `npx eslint lib/cms/commands/media.ts`
- `npx vitest run tests/agent-generated-media.test.ts tests/admin-api-media-upload.test.ts`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact lines/files changed
- exact change made to remove the shared-module build regression
- exact commands run
- explicit confirmation that Checkpoint B work was not started

## Stop Condition

Stop again for QA as soon as the build is green and this fix is complete.
