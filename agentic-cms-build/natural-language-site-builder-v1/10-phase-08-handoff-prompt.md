# Phase 8 Handoff Prompt

## Status

Phase 7 has passed QA on the live VPS repo.

Approved baseline from Phase 7:

- the worker now runs as a managed systemd service on this VPS
- worker liveness is durable and truthfully reported
- `/admin/agent` has worker readiness and liveness surfaces
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Phase 7 unless a true blocker is found while implementing Phase 8.

## Role

You are the coding agent implementing Phase 8 only for `hopfner.dev-main`.

Your job is to add the natural-language planner core while keeping the internal plan constrained, validated, and CMS-native.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

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
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/10-phase-08-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/media/providers/gemini.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
3. stop and report if the live repo materially differs from this prompt

## Phase Scope

In scope:

- planner-provider abstraction
- structured-output planner contract
- canonical planner normalization and validation
- planner readiness status surface
- tests for planner output mapping and validation
- live `site_build_draft` wiring only at Checkpoint B

Out of scope:

- workspace redesign beyond planner-readiness text if strictly needed
- reviewed-plan apply flow
- auto-publish
- custom section-schema creation
- public planner endpoints

## Hard Rules

- Natural language is the normal user input. JSON is internal only.
- Keep the existing JSON planner path available as a fallback or advanced path until QA approves the natural-language path.
- Do not let provider output bypass the existing plan validation rules.
- Keep output draft-only.
- Keep v1 limited to existing section types and existing theme controls.
- Do not start Phase 9 reviewed-plan UX work.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
3. new planner-provider modules under `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/*`
4. new planner-schema or structured-output helper modules under `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
5. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
6. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
7. `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
8. `/var/www/html/hopfner.dev-main/.env.example`
9. tests for Phase 8

## Existing Workflows To Reuse

- current planner entrypoint:
  `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
- current draft apply path:
  `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
- current Gemini image provider:
  `/var/www/html/hopfner.dev-main/lib/agent/media/providers/gemini.ts`
- worker/provider status surface:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`

## Checkpoint A

### Goal

The planner-provider layer and canonical planner contract exist, but the live job path still uses the legacy planner.

### Required Before Stopping

- add planner-provider abstraction
- add structured-output schema or equivalent typed contract
- implement planner result normalization into the canonical internal plan
- add environment and status support for planner readiness
- add tests proving:
  - natural-language input can normalize into the canonical plan
  - unsupported asks are rejected or downgraded safely
  - provider output cannot bypass existing validation

### Hard Stop

- stop here and wait for QA approval
- do not wire the live `site_build_draft` path to the new planner yet

## Checkpoint B

### Goal

The live `site_build_draft` path can accept natural-language briefs end to end.

### Required Before Stopping

- wire `site_build_draft` prompt handling to the planner-provider path
- preserve the existing JSON prompt path as a fallback or advanced mode
- ensure plan-only and apply modes both work from natural-language briefs
- record planner assumptions, warnings, and normalized plan summary in the job result
- add end-to-end natural-language planner tests
- run final Phase 8 checks

### Hard Stop

- stop here for full Phase 8 QA
- do not start Phase 9 reviewed-plan work

## Required Checks

At Checkpoint A:

- targeted eslint on changed files
- targeted planner/provider tests

At Checkpoint B:

- targeted planner and job-handler tests
- `npm test`
- `npm run build`

## Stop And Report Immediately If

- the provider cannot produce structured output that maps safely into the canonical plan
- the implementation would require bypassing validation to make natural-language input work
- the live repo conflicts with keeping JSON as fallback during the transition

## Required Reporting At Every Checkpoint

When you stop, report:

- exact files changed
- exact planner provider and env vars added
- exact planner constraints enforced
- exact tests run
- exact open risks or blockers
- confirmation that the next checkpoint or phase was not started

## Completion Condition For Phase 8

Phase 8 is complete only when:

- a plain-English brief can generate a validated canonical plan
- the live worker path can process natural-language briefs without requiring JSON
- JSON remains internal or advanced-only, not the primary user workflow
- you have stopped for QA without starting Phase 9

