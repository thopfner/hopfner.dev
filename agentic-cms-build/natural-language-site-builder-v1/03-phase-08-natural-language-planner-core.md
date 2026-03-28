# Phase 8: Natural Language Planner Core

## Goal

Replace the user-facing JSON prompt requirement with a provider-backed natural-language planner while keeping the internal plan constrained, validated, and CMS-native.

## Product Standard

After this phase, the current `/admin/agent` textarea must accept a plain-English website brief.

The user should not need to know the internal section schema to get a draft plan.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/types.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
3. new planner-provider modules under `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/*`
4. new planner-schema or structured-output helper modules under `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
5. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
6. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
7. `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
8. `/var/www/html/hopfner.dev-main/.env.example`
9. tests for planner output mapping, validation, and handler wiring

## Source Workflows And Files To Reuse

- current planner entrypoint:
  - `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
- existing apply path:
  - `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
- existing Gemini image provider:
  - `/var/www/html/hopfner.dev-main/lib/agent/media/providers/gemini.ts`
- existing worker/provider status surface:
  - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`

## Architecture Requirements

- Introduce a planner-provider abstraction.
- Use structured output from the provider to obtain planner results.
- Map provider output into one canonical internal `AgentDraftPlan`.
- Run the existing validation rules after provider output mapping.
- Keep the current JSON path available as a legacy or advanced path until the new planner is approved.
- Do not let provider output bypass validation.

## Required Planner Capabilities

The planner must be able to infer and emit constrained site plans for:

- page slugs and titles
- ordered sections using existing built-in section types only
- content and formatting payloads required by the existing renderer
- optional theme preset and theme settings within the existing controls
- optional generated background-image requests through the existing media path

The planner must reject or downgrade unsupported requests such as:

- auto-publish
- new section-type invention
- registry mutation
- unsupported theme systems
- arbitrary code generation

## Checkpoint A

### Goal

The planner-provider layer and canonical planner contract exist, but the live job path still stays on the legacy JSON planner.

### Required Before Stopping

- add provider abstraction for planning
- add structured-output schema or equivalent typed contract
- implement planner result normalization into the canonical internal plan
- add environment/config support for planner provider readiness
- extend the status surface to report planner readiness separately from image-provider readiness
- add tests proving:
  - natural-language input can normalize into the canonical internal plan
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
- preserve the existing JSON prompt path as a fallback or advanced input mode
- ensure plan-only and apply modes both work from natural-language briefs
- record planner assumptions, warnings, and normalized plan summary in the job result
- add tests for end-to-end natural-language planning through the worker job handler
- run final Phase 8 checks

### Hard Stop

- stop here for full Phase 8 QA
- do not start review-workspace or "apply reviewed plan" work

## What Must Not Change In This Phase

- do not add public endpoints for the planner provider
- do not remove rollback or idempotency behavior
- do not redesign the admin workspace beyond any status text strictly needed for planner readiness
- do not add free-form HTML or arbitrary code generation

## Required Checks

At Checkpoint A:

- targeted planner/provider tests
- targeted eslint on new planner files

At Checkpoint B:

- targeted planner and job-handler tests
- `npm test`
- `npm run build`

## Gate For Moving Forward

Do not proceed until all of the following are true:

- a plain-English brief can generate a canonical internal plan
- unsupported asks are rejected safely
- the live worker path can process natural-language briefs without requiring JSON
- JSON remains internal or advanced-only, not the primary user path

