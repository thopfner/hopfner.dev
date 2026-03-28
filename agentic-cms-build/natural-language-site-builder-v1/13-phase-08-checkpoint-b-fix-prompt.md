# Phase 8 Checkpoint B Fix Prompt

## Status

Phase 8 Checkpoint B is not approved yet.

The backend natural-language planner path appears to work and the tests/build gates are green, but QA found one product-facing requirement failure in the admin workspace.

You must fix only the issue below and stop again for QA.
Do not start Phase 9.

## Confirmed QA Finding

### JSON is still the primary operator workflow in `/admin/agent`

Current behavior:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
  still seeds the job form with a JSON scaffold via `DEFAULT_PROMPT`
- the textarea still uses a JSON-oriented empty state instead of a natural-language brief starting point

Result:

- despite the new natural-language backend path, the operator is still dropped into a JSON-first experience
- that violates the approved Checkpoint B contract:
  - plain-English should be the normal path
  - JSON should remain fallback or advanced mode only

This must be fixed.

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
- `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`

Out of scope:

- planner backend changes unless a true UI/backend mismatch is discovered
- Phase 9 reviewed-plan work
- broader workspace redesign

## Required Fix Outcome

1. the job form defaults to a natural-language brief workflow, not a JSON scaffold
2. JSON remains available only as fallback or advanced input, not the default starting state
3. tests cover the new default operator path

## Acceptable Directions

Choose the smallest change that satisfies the requirement. For example:

- make the default textarea content a natural-language sample brief, or
- make the textarea empty with natural-language placeholder/help text, and
- keep JSON only as an explicit fallback path

Do not widen into a major Phase 9 UX redesign.

## Required Checks

- targeted Vitest for workspace tests
- `npm test`
- `npm run build`

## Hard Stop

Stop after this fix round and wait for QA.
Do not start Phase 9.

## Required Reporting

When you stop, report:

- exact files changed
- exact workspace default behavior changed
- exact tests run
- confirmation that Phase 9 was not started

