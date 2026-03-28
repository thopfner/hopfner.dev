# Phase 8 Checkpoint B Handoff Prompt

## Status

Phase 8 Checkpoint A has passed QA on the live VPS repo.

Approved baseline from Checkpoint A:

- planner-provider abstraction exists
- Gemini structured-output planner provider exists
- canonical planner normalization and validation exist
- planner readiness is surfaced in worker status
- the live `site_build_draft` path still uses the legacy JSON planner
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Checkpoint A unless a true blocker is found while implementing Checkpoint B.

## Role

You are the coding agent implementing Phase 8 Checkpoint B only for `hopfner.dev-main`.

Your job is to wire the live `site_build_draft` path so plain-English briefs work end to end while keeping the existing JSON path as a fallback or advanced mode.

You must stop for QA when Checkpoint B is complete.
Do not start Phase 9 reviewed-plan work.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/project_overview_v1/README.md`
2. `/var/www/html/hopfner.dev-main/project_overview_v1/01-system-overview.md`
3. `/var/www/html/hopfner.dev-main/project_overview_v1/02-cms-and-rendering-model.md`
4. `/var/www/html/hopfner.dev-main/project_overview_v1/03-admin-and-editor-surfaces.md`
5. `/var/www/html/hopfner.dev-main/project_overview_v1/04-working-notes-for-new-sessions.md`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/README.md`
7. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/00-coding-agent-prompt.md`
8. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/01-architecture-and-root-cause.md`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/03-phase-08-natural-language-planner-core.md`
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/12-phase-08-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/gemini.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- live `site_build_draft` prompt handling wired to the planner-provider path
- preserved JSON fallback or advanced mode
- plan-only and apply-mode support from natural-language briefs
- planner assumptions, warnings, downgraded requests, and normalized plan summary in job results
- tests for end-to-end natural-language planner behavior through the worker job handler

Out of scope:

- reviewed-plan apply workflow
- broad admin workspace redesign
- auto-publish
- custom section-schema creation
- Phase 9 work

## Hard Rules

- Natural language is the normal user input.
- JSON must remain available as a fallback or advanced path until a later phase intentionally hides it.
- Do not let provider output bypass the canonical validation rules.
- Keep output draft-only.
- Keep v1 limited to existing section types and existing theme controls.
- Do not start Phase 9 reviewed-plan work.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
3. any adjacent planner support files under `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
4. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx` only if strictly needed for copy or fallback labeling
5. tests for Checkpoint B

## Existing Workflows To Reuse

- current draft apply path:
  `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
- current job result and idempotency path:
  `/var/www/html/hopfner.dev-main/lib/agent/execution/idempotency.ts`
- planner provider:
  `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/gemini.ts`

## Required Before Stopping

- detect whether a prompt should use:
  - legacy JSON path
  - natural-language planner path
- wire natural-language prompts through the planner-provider path
- preserve plan-only and apply-mode behavior
- record planner assumptions, warnings, downgraded requests, provider, model, and normalized plan summary in the job result
- keep rollback and idempotency behavior intact
- add tests proving:
  - plain-English brief works end to end
  - JSON fallback still works
  - unsupported asks are downgraded safely
  - plan-only and apply-requested modes both work from natural-language input
- run final Phase 8 checks

## Required Checks

- targeted eslint on changed files
- targeted planner and job-handler tests
- `npm test`
- `npm run build`

## Stop And Report Immediately If

- the provider cannot reliably distinguish natural language from legacy JSON input without breaking existing behavior
- idempotency or rollback would be weakened by the natural-language path
- the implementation would require bypassing canonical validation to make natural-language input work

## Required Reporting

When you stop, report:

- exact files changed
- exact prompt-path detection strategy used
- exact planner result fields added to job output
- exact tests run
- exact blockers or caveats
- confirmation that Phase 9 was not started

## Completion Condition

Checkpoint B is complete only when:

- the live worker path can process plain-English briefs without requiring JSON
- JSON remains available as fallback or advanced mode
- plan-only and apply modes still preserve validation, rollback, and idempotency
- you have stopped for QA without starting Phase 9

