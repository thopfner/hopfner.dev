# Phase 3 Checkpoint B Final Build Fix Prompt

## QA Outcome

Checkpoint B is still not approved yet.

The earlier snapshot-scope regression is fixed and acceptable.

One blocking issue remains on the live VPS repo:

- live `npm run build` still fails in `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts:501`

## Blocking Issue

In `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts`:

- the helper still has a generic table-state assignment that TypeScript rejects during the real Next production build
- current failing site:
  - `state[table] = state[table].filter(...) as FakeCmsState[FakeTableName]`

This is now the only blocker discovered in live QA.

## Role

You are fixing this build blocker only.

Do not reopen the snapshot-scope fix unless required by the build.
Do not start Phase 4.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/18-phase-03-checkpoint-b-handoff-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/19-phase-03-checkpoint-b-fix-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/20-phase-03-checkpoint-b-build-fix-prompt.md`

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts`
- tests only if needed to support the smallest correct typing fix

Out of scope:

- product/runtime behavior changes
- snapshot-scope redesign
- Phase 4 work

## Required Fix

Fix the remaining TypeScript build error in the fake Supabase helper in the smallest correct way.

Requirements:

- preserve current helper runtime behavior
- preserve current test semantics
- keep the fix local to the helper unless a tiny supporting type helper is truly required

Acceptable approaches:

- narrow the `state[table]` assignment through a properly typed helper
- or cast through `unknown` in the specific remaining assignment site if that is the smallest correct fix

Do not refactor the whole helper unless the build forces it.

## Required Checks

- `npx eslint tests/helpers/fake-cms-supabase.ts`
- targeted Vitest if needed
- `npm test`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact lines changed
- exact typing fix applied
- whether any runtime behavior changed
- exact tests run
- explicit confirmation that Phase 4 work was not started

## Stop Condition

Stop again for QA as soon as live `npm run build` passes.
