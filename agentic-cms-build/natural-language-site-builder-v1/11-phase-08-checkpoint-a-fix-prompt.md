# Phase 8 Checkpoint A Fix Prompt

## Status

Phase 8 Checkpoint A is not approved yet.

The planner-provider architecture and targeted planner tests look acceptable, but the full repo test gate is red.

You must fix only the issue below and stop again for QA.
Do not start Checkpoint B.

## Confirmed QA Finding

### Full `npm test` is failing because an existing worker-service test was not updated to the expanded provider-status contract

Current behavior:

- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
  now returns both:
  - `imageGeneration`
  - `planner`
- `/var/www/html/hopfner.dev-main/tests/agent-worker-service.test.ts`
  still expects `readAgentWorkerProviderStatus()` to return only `imageGeneration`

Result:

- full `npm test` fails even though the targeted Phase 8A planner suite passes
- the checkpoint cannot pass because the full repo gate is red

This must be fixed.

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/tests/agent-worker-service.test.ts`
- any adjacent planner-status assertions only if strictly needed

Out of scope:

- live `site_build_draft` wiring to the new planner
- planner-provider implementation changes unless a true test-vs-code mismatch is found
- admin workspace redesign
- Checkpoint B work

## Required Fix Outcome

1. full `npm test` passes again
2. the worker-service provider-status test reflects the approved dual-surface contract:
   - `imageGeneration`
   - `planner`
3. Checkpoint A scope remains unchanged

## Required Checks

- targeted Vitest for touched files
- `npm test`
- `npm run build`

## Hard Stop

Stop after this fix round and wait for QA.
Do not start Checkpoint B.

## Required Reporting

When you stop, report:

- exact files changed
- exact assertion changes made
- exact tests run
- confirmation that Checkpoint B was not started

