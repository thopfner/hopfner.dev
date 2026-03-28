# Phase 10 Worker Runtime Alignment Fix Prompt

## Status

Manual launch QA exposed a real operational gap:

- the app runtime had been rebuilt and restarted
- the worker service was still running an older `.worker-dist` build from earlier in the day
- natural-language `site_build_draft` jobs therefore executed with stale worker code and failed with the old JSON-only behavior

Immediate live recovery has already been performed outside this prompt:

- `npm run build:worker`
- `sudo systemctl restart hopfner-agent-worker.service`

The user can retry jobs now.

This fix round is to prevent the same drift from happening again.

## Role

You are the coding agent implementing one narrow operational-hardening fix for `hopfner.dev-main`.

Your job is to make worker runtime freshness explicit and operable on the live host, then stop again for QA.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
2. `/var/www/html/hopfner.dev-main/scripts/run-agent-worker-service.sh`
3. `/var/www/html/hopfner.dev-main/scripts/verify-live-agent-worker-service.sh`
4. `/var/www/html/hopfner.dev-main/scripts/install-live-agent-worker-service.sh`
5. `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/23-phase-10-worker-runtime-alignment-fix-prompt.md`

Before changing anything:

1. run `git status --short`
2. inspect the current worker restart/install/verify scripts and runtime notes
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- worker artifact freshness verification
- a repo-managed worker rebuild/restart path for the live systemd host
- truthful runtime notes for operator use

Out of scope:

- app runtime changes
- browser/manual QA
- new feature work
- worker business logic changes

## Hard Rules

- do not weaken the existing worker liveness/config verification
- do not widen scope beyond worker operational freshness
- keep the real live runtime model truthful: app via `hopf.thapi.cc.service`, worker via `hopfner-agent-worker.service`

## Required Fix

Implement the smallest durable fix that makes stale worker code detectable and easy to correct.

The required outcome is:

1. there is a repo-managed live-host path that rebuilds worker artifacts and restarts `hopfner-agent-worker.service`
2. worker verification can detect when the running service is older than the worker artifact on disk, or another equally truthful freshness signal
3. runtime notes clearly tell operators when to use the worker rebuild/restart path

Preferred shape:

- add `scripts/restart-live-agent-worker-service.sh`
- keep `scripts/verify-live-agent-worker-service.sh` as the truth gate, extended if needed to catch stale worker artifacts
- update `agentic-cms-build/31-phase-06-runtime-deploy-notes.md`

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/scripts/verify-live-agent-worker-service.sh`
2. `/var/www/html/hopfner.dev-main/scripts/restart-live-agent-worker-service.sh` (new file if needed)
3. `/var/www/html/hopfner.dev-main/scripts/install-live-agent-worker-service.sh` only if necessary
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
5. tests only if you add script-test coverage

## Required Checks

- `bash -n` on every changed shell script
- run the new/updated worker restart path on the live host
- run `sudo bash scripts/verify-live-agent-worker-service.sh`
- report the service start time and worker artifact mtime after the fix

Do not run unrelated app build/test gates in this fix round unless your changes unexpectedly require them.

## Stop And Report Immediately If

- freshness detection cannot be implemented truthfully without a larger runtime redesign
- the worker rebuild/restart path would break the current systemd model

## Required Reporting

When you stop, report:

- exact files changed
- exact freshness signal used
- exact restart/verify commands run
- confirmation that the worker runtime alignment gap is now closed
- confirmation that no other Phase 10 work was started

## Completion Condition

This fix round is complete only when:

- worker rebuild/restart is available as a repo-managed live-host path
- stale worker artifacts can no longer silently pass as healthy
- runtime notes are truthful
- you have stopped again for QA
