# Phase 6: Hardening And Ship Gate

## Goal

Harden the local worker product surface for real deployment and lock the v1 scope.

## Files To Change, In Order

1. worker/job runtime files from earlier phases
2. admin APIs and workspace files where rate limit, cancel, retry, and audit are enforced
3. deployment/runtime docs and env validation surfaces
4. final regression tests and QA docs

## Source Workflows / Files To Reuse

- existing admin guard and current deployment model
- rollback/snapshot patterns introduced earlier
- existing publish model and page overview for draft visibility

## Step-By-Step Implementation

1. Add concurrency and rate-limit controls for local jobs.
2. Add retry and cancel semantics that are safe with snapshots and idempotency.
3. Add audit summaries and operator-readable failure taxonomy.
4. Add config validation for required provider keys and worker env.
5. Add deployment documentation for app + worker.
6. Run the final QA pack and stop for final review.

## Required Behavior

- Worker cannot run uncontrolled parallel site-build jobs.
- Job retries are safe.
- Cancellation is explicit and visible.
- Config errors are operator-readable.
- v1 scope boundaries remain enforced.

## What Must Not Change In The Phase

- Do not add auto-publish.
- Do not add custom section schema creation.
- Do not add public worker ingress.
- Do not replace the current human publish workflow.

## Required Tests For The Phase

- retry/cancel/concurrency tests
- env/config validation tests
- regression suite across commands, worker, workspace, and media generation
- `npm run test`
- `npm run build`
- deployment verification for app + worker

## Gate For Moving Forward

Do not claim ship readiness until:
- all prior phase gates remain satisfied
- hardening tests pass
- deployment/runtime proof is complete
- coding agent provides final risk list and confirms v1 non-goals remain out of scope

