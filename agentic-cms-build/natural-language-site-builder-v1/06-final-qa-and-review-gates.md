# Final QA And Review Gates

## Reviewer Standard

Every checkpoint requires:

- live repo inspection before approval
- targeted tests for the checkpoint scope
- full `npm test` and `npm run build` before phase approval unless the checkpoint explicitly stops earlier
- clear distinction between confirmed bugs and environment limitations

## Phase 7 Reviewer Gates

Checkpoint A approval requires:

- worker liveness is durable and freshens during runtime
- status API exposes truthful worker state
- `/admin/agent` renders online, stale, and offline states clearly

Checkpoint B approval requires:

- the worker service is installed and enabled on the live host
- heartbeat turns fresh after startup
- the status API and `/admin/agent` show the worker as online
- no natural-language planner work has started

## Phase 8 Reviewer Gates

Checkpoint A approval requires:

- planner-provider abstraction exists
- structured output maps into one canonical internal plan
- unsupported asks are rejected safely
- the live job path still uses the old planner path

Checkpoint B approval requires:

- plain-English briefs work end to end
- JSON is no longer required for normal use
- plan-only and apply modes still preserve validation, rollback, and idempotency

## Phase 9 Reviewer Gates

Checkpoint A approval requires:

- apply reviewed plan is deterministic
- the stored canonical plan is reused
- the model is not rerun during reviewed-plan apply

Checkpoint B approval requires:

- the workspace clearly supports brief -> plan -> apply -> visual-editor review
- touched-page links and rollback actions still work
- browser/manual QA is attempted when login is available

## Phase 10 Reviewer Gates

Checkpoint A approval requires:

- limits, refusal paths, provider readiness, and busy-state rules are clear
- failure states are understandable in the UI and job detail

Checkpoint B approval requires:

- final test and build gates pass
- the worker-service verify path passes on the live host
- manual QA confirms draft generation and rollback from `/admin/agent`
- no v1 scope violations were introduced

## Final Completion Condition

The rollout is complete only when all prior gates are passed and the reviewer confirms:

- systemd worker service is operating on the VPS
- natural-language prompts are the normal operator workflow
- the admin can dry-run and then apply a reviewed plan without rerunning the model
- generated drafts are visible in the existing visual editor
- publish remains human-owned
- the product is still constrained to existing section types and existing theme controls

