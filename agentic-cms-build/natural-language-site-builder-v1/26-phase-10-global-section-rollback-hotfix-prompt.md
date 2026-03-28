# Phase 10 Global-Section Rollback Hotfix Prompt

## Status

Manual MVP QA exposed one real rollback bug after a successful natural-language draft/apply/rollback cycle.

Confirmed user-visible failure:

- rollback restores the page, but attached global sections such as Nav Links and Footer disappear from the Home page afterward

Confirmed root cause from live code review:

- `captureContentSnapshot()` does not persist global-section linkage metadata for page section rows
- `restoreContentSnapshot()` deletes all page sections and recreates them as local sections only
- attached global shells therefore lose:
  - `global_section_id`
  - `formatting_override`
- global attachments also have no local `section_versions`, so recreating them as plain local sections leaves them effectively blank or missing in page/editor views

Relevant current code:

- `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`
- `/var/www/html/hopfner.dev-main/lib/agent/execution/snapshots.ts`
- `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`

This hotfix is only for restoring global-section attachments correctly during rollback.
Do not widen scope into provider work or broader Phase 10 changes.

## Role

You are the coding agent implementing one narrow rollback hotfix for `hopfner.dev-main`.

Your job is to make rollback restore page-level global-section attachments exactly as they existed before apply, while preserving current local-section rollback behavior.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/execution/snapshots.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
4. `/var/www/html/hopfner.dev-main/lib/admin/visual-editor/load-page-visual-state.ts`
5. `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
6. `/var/www/html/hopfner.dev-main/app/admin/api/global-sections/attach/route.ts`
7. `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
8. `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/26-phase-10-global-section-rollback-hotfix-prompt.md`

Before changing anything:

1. run `git status --short`
2. inspect the files above
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- snapshot payload support for page-level global-section attachment metadata
- rollback restore support for global section attachments
- preservation of `formatting_override` on restored attachments
- targeted regression tests proving rollback restores globals
- app/worker restart only if your checks rebuild artifacts

Out of scope:

- planner/provider changes
- image generation changes
- reviewed-plan workflow changes
- global-section authoring behavior changes
- changes to the public rendering model outside snapshot restore

## Hard Rules

- preserve existing local-section snapshot and rollback behavior
- preserve rollback for newly created pages and site formatting
- do not convert attached global sections into local sections during restore
- do not delete or rewrite `global_section_versions`
- keep the fix as narrow as possible

## Required Fix

1. Update the snapshot model in `lib/cms/content-snapshots.ts` so each captured page section preserves:
   - `global_section_id`
   - `formatting_override`

2. Update `captureContentSnapshot()` so the section query actually reads that metadata.

3. Update `restoreContentSnapshot()` so restored section rows preserve:
   - `global_section_id`
   - `formatting_override`

4. Ensure rollback still behaves correctly for:
   - local sections with local versions
   - attached global sections with no local versions
   - pages that did not exist before apply
   - site formatting state

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/cms/content-snapshots.ts`
2. `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
3. `/var/www/html/hopfner.dev-main/tests/helpers/fake-cms-supabase.ts` only if needed for the new snapshot fields

Do not touch unrelated planner/admin workspace/provider files in this round.

## Required Behavior

- if a page had attached global Nav/Footer sections before apply, rollback restores those attachments
- restored section rows keep the original `global_section_id`
- restored section rows keep `formatting_override`
- local section restore still replays local versions as before
- no existing rollback behavior regresses

## Required Tests

- targeted eslint on changed files
- `npx vitest run tests/agent-draft-execution.test.ts`
- `npm test`
- `npm run build`

Add or extend behavior-level tests that prove:

1. snapshot capture includes global attachment metadata
2. rollback restores a page containing both:
   - local sections
   - attached global sections
3. restored global attachment rows keep `global_section_id`
4. restored global attachment rows do not require local `section_versions` to render correctly through the existing page/read model

If your check run updates `.next` or worker artifacts:

- `sudo bash scripts/restart-live-systemd-runtime.sh`
- `sudo bash scripts/verify-live-systemd-runtime.sh`
- `sudo bash scripts/verify-live-agent-worker-service.sh`

## Optional Live Proof

If you can do it without widening scope, reproduce the exact rollback case with a synthetic test fixture rather than browser QA.
Browser/manual QA is not required in this round.

## Stop And Report Immediately If

- restoring globals correctly requires a broader redesign of page/global section relationships
- there is a second independent bug in apply logic that must be fixed first
- fake Supabase coverage cannot model the attached-global rollback case accurately without a larger test harness rewrite

## Required Reporting

When you stop, report:

- exact files changed
- exact snapshot fields added or restored
- exact tests run
- whether any live runtime restart was performed
- confirmation that the fix is limited to rollback/snapshot behavior
- confirmation that no broader Phase 10 or provider work was started

## Completion Condition

This hotfix round is complete only when:

- rollback restores attached global sections correctly in automated proof
- local-section rollback behavior remains intact
- repo test/build gates pass
- you have stopped again for QA
