# Phase 10 Natural-Language Section-Type Hotfix Prompt

## Status

Manual launch QA and live VPS repro exposed one remaining blocker in the natural-language planning path.

Confirmed from live QA:

- the Gemini planner transport fix is already in place
- `responseJsonSchema` is now accepted by the live Gemini REST API
- the live planner provider call succeeds with the current `GEMINI_API_KEY`
- app and worker services have both been refreshed and verified

Confirmed remaining failure:

- the real natural-language resolver path still fails after the provider returns structured output
- direct live repro through `resolveAgentDraftPromptPlan()` throws:
  - `Section 2 uses an unknown or unsupported section type.`

Confirmed root cause:

- the planner schema does not currently constrain `sectionType` to canonical CMS section IDs
- the planner instruction does not strongly require exact CMS section IDs
- the live Gemini output can therefore contain human-readable labels such as:
  - `Hero`
  - `RichText`
  - `CallToAction`
- the current alias map in `build-draft-plan.ts` only accepts a narrow internal alias set and rejects those values

This hotfix is only for that natural-language section-type contract failure.
Do not reopen broader provider-agnostic work in this round.

## Role

You are the coding agent implementing one narrow hotfix for `hopfner.dev-main`.

Your job is to make a normal plain-English website brief resolve into a valid canonical draft plan without breaking the existing JSON path, v1 limits, or reviewed-plan flow.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/planner-schema.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/gemini.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
4. `/var/www/html/hopfner.dev-main/lib/cms/payload.ts`
5. `/var/www/html/hopfner.dev-main/tests/agent-draft-planner-provider.test.ts`
6. `/var/www/html/hopfner.dev-main/tests/agent-draft-planning-natural-language.test.ts`
7. `/var/www/html/hopfner.dev-main/tests/agent-draft-job-handler.test.ts`
8. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/24-phase-10-gemini-planner-schema-fix-prompt.md`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/25-phase-10-natural-language-section-type-hotfix-prompt.md`

Before changing anything:

1. run `git status --short`
2. inspect the files above
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- canonical section-type enforcement for natural-language planner output
- planner instruction tightening if needed
- planner schema tightening if needed
- normalization fallback widening for common human-readable section labels
- targeted regression tests
- worker rebuild/restart required to put the fix live
- app runtime restart/verify required if you run `npm run build`

Out of scope:

- new providers
- connection model changes
- image generation changes
- reviewed-plan workflow redesign
- broader Phase 10 launch work

## Hard Rules

- preserve the current JSON prompt path exactly
- preserve existing v1 section-type allowlist and refusal rules
- do not broaden supported section inventory beyond the approved built-in set
- do not accept arbitrary freeform section labels without mapping them to canonical IDs
- keep the planner strict; do not weaken validation to “best effort”
- keep the fix as narrow as possible

## Required Fix Direction

You must address this at both layers:

1. Upstream planner contract:
   - make the planner strongly emit canonical CMS section IDs
   - if the schema can safely enforce canonical `sectionType` values, do that
   - if needed, tighten the planning instruction text to list the exact supported IDs and require those exact strings

2. Downstream normalization safety net:
   - widen normalization enough to accept common human-readable variants that the live model may still return
   - examples to handle safely include values like:
     - `Hero`
     - `RichText`
     - `CallToAction`
   - normalize those to the existing canonical built-in IDs only

The correct target is:

- normal plain-English briefs resolve successfully
- resulting plan contains only canonical section IDs
- JSON path remains unchanged

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/planner-schema.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/providers/gemini.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
4. `/var/www/html/hopfner.dev-main/tests/agent-draft-planner-provider.test.ts`
5. `/var/www/html/hopfner.dev-main/tests/agent-draft-planning-natural-language.test.ts`
6. `/var/www/html/hopfner.dev-main/tests/agent-draft-job-handler.test.ts` only if needed

Do not touch unrelated admin/editor/runtime files in this round.

## Required Behavior

- `resolveAgentDraftPromptPlan()` must succeed for a normal consulting-site brief using the live Gemini planner provider
- resulting plan must use canonical section IDs such as `hero_cta`, `rich_text_block`, `cta_block`
- if the planner still emits a human-readable alias, normalization must map it safely
- unsupported or invented section types must still fail validation

## Required Checks

- targeted eslint on changed files
- `npx vitest run tests/agent-draft-planner-provider.test.ts tests/agent-draft-planning-natural-language.test.ts tests/agent-draft-job-handler.test.ts`
- `npm test`
- `npm run build`
- `npm run build:worker`
- `sudo systemctl restart hopfner-agent-worker.service`
- `sudo bash scripts/verify-live-agent-worker-service.sh`
- `sudo bash scripts/restart-live-systemd-runtime.sh`

After that, run two truthful live proofs on the VPS:

1. direct resolver proof with real env loaded:
   - run `resolveAgentDraftPromptPlan()` with a natural-language consulting-site brief
   - print the normalized canonical section types from the resulting plan
   - confirm no validation error is thrown

2. one real plan-only job proof:
   - enqueue one natural-language `site_build_draft` plan-only job
   - confirm it does not fail with the old unsupported-section-type error

You do not need to complete the whole browser launch flow in this hotfix round.

## Stop And Report Immediately If

- Gemini structured output cannot be constrained tightly enough to emit or normalize into canonical IDs without a broader planner redesign
- fixing this would require accepting arbitrary unknown section labels
- another unrelated launch blocker appears outside natural-language planning

## Required Reporting

When you stop, report:

- exact files changed
- whether you tightened schema, instruction text, normalization, or all three
- exact human-readable aliases newly supported
- exact tests run
- exact worker/app restart commands run
- the direct live resolver proof output
- the result of the real plan-only retry
- confirmation that no broader Phase 10 or provider-agnostic work was started

## Completion Condition

This hotfix round is complete only when:

- a normal natural-language brief resolves successfully into a canonical draft plan
- resulting section types are canonical built-in IDs
- repo test/build gates pass
- worker is rebuilt/restarted
- app runtime is restarted/verified after the build
- you have stopped again for QA
