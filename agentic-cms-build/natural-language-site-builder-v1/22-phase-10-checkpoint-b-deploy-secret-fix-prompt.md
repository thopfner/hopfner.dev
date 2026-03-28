# Phase 10 Checkpoint B Deploy Secret Fix Prompt

## Status

Phase 10 Checkpoint B launch verification was attempted.

Confirmed from QA:

- full `npm test` passed
- full `npm run build` passed
- `sudo bash scripts/verify-live-agent-worker-service.sh` passed
- `sudo bash scripts/verify-live-systemd-runtime.sh` passed
- the coding agent correctly stopped at the manual-QA gate because the VPS does not have a usable authenticated browser environment

One code-level launch blocker still remains:

- `scripts/deploy-docker.sh` writes fully rendered `docker compose config` output to `/tmp/${APP_NAME}.docker-compose-config.log`
- on a normal shell redirection path, that file is world-readable by default on many hosts
- because `docker compose config` resolves env values, that log can contain live secrets

This fix round is only for that blocker.
Do not start any other Phase 10 work.

## Role

You are the coding agent implementing one narrow launch-blocker fix for `hopfner.dev-main`.

Your job is to remove the deploy-script secret exposure without changing the live runtime model, and then stop again for QA.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/05-phase-10-hardening-and-launch-gate.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/06-final-qa-and-review-gates.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/22-phase-10-checkpoint-b-deploy-secret-fix-prompt.md`

Before changing anything:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
   - `/var/www/html/hopfner.dev-main/.env.example`
   - any test file already covering deploy or worker scripts
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- secret-safe handling of rendered Docker Compose config during deploy verification
- any small script/test updates required to preserve that behavior

Out of scope:

- live systemd runtime changes
- worker-service behavior changes
- browser/manual QA
- any other Phase 10 launch work

## Hard Rules

- do not weaken the existing Docker deploy verification steps
- do not remove `docker compose config` validation
- do not log resolved secrets to predictable world-readable temp files
- do not widen scope beyond this deploy-script fix

## Required Fix

Update `scripts/deploy-docker.sh` so that rendered Compose config is handled safely.

Acceptable solutions include:

- secure temporary file creation with restrictive permissions and cleanup, or
- avoiding persistent logging of the fully rendered config entirely while preserving validation

The result must ensure that resolved secrets are not left in a predictable world-readable file under `/tmp`.

If you keep a temp file:

- use a secure creation path
- set restrictive permissions
- clean it up automatically on exit

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
2. tests only if needed for script safety proof
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md` only if wording must change to stay truthful

## Required Checks

- `bash -n scripts/deploy-docker.sh`
- any targeted test added for the script behavior
- `npm test` only if you touched shared JS/TS or tests

You do not need to run `npm run build` for this script-only fix unless your changes unexpectedly touch app code.

## Stop And Report Immediately If

- fixing this safely would require dropping Compose config validation
- the fix would break the documented Docker deploy workflow
- you discover another secret leak in the same script that materially changes scope

## Required Reporting

When you stop, report:

- exact files changed
- exact secret-handling behavior before vs after
- exact checks run
- confirmation that no other Phase 10 work was started

## Completion Condition

This fix round is complete only when:

- `scripts/deploy-docker.sh` no longer leaves resolved Compose config secrets in a predictable world-readable temp file
- verification behavior is preserved
- you have stopped again for QA
