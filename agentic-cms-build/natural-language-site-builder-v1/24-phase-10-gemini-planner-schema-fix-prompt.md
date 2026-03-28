# Phase 10 Gemini Planner Schema Fix Prompt

## Status

Manual launch QA exposed a real planner-provider compatibility bug on the live host.

Confirmed from QA:

- the worker runtime is now fresh and running the current worker build
- `GEMINI_API_KEY` is present on this host
- natural-language `site_build_draft` jobs now reach the Gemini planner provider
- the current failure is no longer the old JSON-only worker issue

Confirmed live failure:

- plan-only natural-language job fails with Gemini REST error:
  - `Invalid JSON payload received. Unknown name "additionalProperties" at 'generation_config.response_schema'`

Confirmed direct repro from the live VPS:

1. `generationConfig.responseSchema` with `additionalProperties` reproduces the same 400 error
2. `generationConfig.responseJsonSchema` with the same minimal schema succeeds on the same model and key

This fix round is only for that provider-compatibility bug.
Do not reopen broader Phase 10 work.

## Role

You are the coding agent implementing one narrow planner-provider compatibility fix for `hopfner.dev-main`.

Your job is to make Gemini natural-language planning work again with the live REST API, preserve all existing plan validation and v1 constraints, then stop again for QA.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/planner-schema.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/gemini.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
4. `/var/www/html/hopfner.dev-main/tests/agent-draft-planner-provider.test.ts`
5. `/var/www/html/hopfner.dev-main/tests/agent-draft-job-handler.test.ts`
6. `/var/www/html/hopfner.dev-main/tests/agent-draft-planning-natural-language.test.ts`
7. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/24-phase-10-gemini-planner-schema-fix-prompt.md`

Before changing anything:

1. run `git status --short`
2. inspect the files above
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- Gemini planner request compatibility with the live REST API
- schema-shape adjustments only if needed for `responseJsonSchema`
- targeted regression tests
- worker rebuild/restart required to put the fix live

Out of scope:

- image-generation provider changes
- worker business-logic changes outside planner compatibility
- app runtime changes
- broader launch-gate work

## Hard Rules

- preserve the current natural-language planner behavior and canonical plan shape
- preserve v1 limits, refusal paths, and reviewed-plan apply behavior
- do not weaken validation by falling back to freeform model text
- do not remove structured output entirely
- keep the fix as narrow as possible

## Confirmed Root Cause

The current provider in `lib/agent/planning/providers/gemini.ts` sends:

- `generationConfig.responseMimeType = "application/json"`
- `generationConfig.responseSchema = AGENT_DRAFT_PLANNER_RESPONSE_SCHEMA`

That request shape is not accepted by the live Gemini REST endpoint for this schema.

Live repro evidence already confirmed:

- `responseSchema` + `additionalProperties` => 400 invalid payload
- `responseJsonSchema` + same minimal schema => success

So the primary fix direction is:

- move the planner request to `responseJsonSchema`

Adjust the schema shape only if the current schema contains fields that are invalid or misleading for `responseJsonSchema`.

## Required Fix

1. Update the Gemini planner provider to use the correct structured-output field for the live REST API.
2. Keep the planner schema as strict as possible while staying compatible with the live API.
3. Update tests so they assert the correct request field and still prove structured planning works.
4. Rebuild the worker artifact and restart `hopfner-agent-worker.service`, because the live worker runs `.worker-dist`, not source TS files.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/gemini.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/planner-schema.ts` only if needed for compatibility
3. `/var/www/html/hopfner.dev-main/tests/agent-draft-planner-provider.test.ts`
4. `/var/www/html/hopfner.dev-main/tests/agent-draft-job-handler.test.ts` only if needed
5. `/var/www/html/hopfner.dev-main/tests/agent-draft-planning-natural-language.test.ts` only if needed

Do not touch unrelated agent/admin/editor files in this fix round.

## Required Checks

- targeted eslint on changed files
- `npx vitest run tests/agent-draft-planner-provider.test.ts tests/agent-draft-job-handler.test.ts tests/agent-draft-planning-natural-language.test.ts`
- `npm test`
- `npm run build`
- `npm run build:worker`
- `sudo systemctl restart hopfner-agent-worker.service`
- `sudo bash scripts/verify-live-agent-worker-service.sh`

After that, run one truthful live proof on the VPS:

- enqueue one natural-language `site_build_draft` plan-only job
- confirm it no longer fails with the old schema payload error

You do not need to complete the whole browser launch flow in this fix round.

## Stop And Report Immediately If

- `responseJsonSchema` still fails with the current planner schema in a way that requires a broader schema redesign
- fixing planner compatibility would require dropping structured outputs entirely
- another provider-layer incompatibility appears that changes scope beyond this planner fix

## Required Reporting

When you stop, report:

- exact files changed
- exact request-field change made
- whether the schema shape changed beyond that field swap
- exact tests run
- exact worker rebuild/restart commands run
- the result of the live natural-language plan-only retry
- confirmation that no broader Phase 10 work was started

## Completion Condition

This fix round is complete only when:

- natural-language plan-only jobs no longer fail with the Gemini `response_schema` payload error
- repo test/build gates pass
- worker artifact is rebuilt and the live worker service is restarted
- you have stopped again for QA
