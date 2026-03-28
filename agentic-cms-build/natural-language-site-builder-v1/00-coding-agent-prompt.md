# Coding Agent Prompt

## Role

You are the coding agent implementing the natural-language site-builder rollout for `hopfner.dev-main`.

You must execute one checkpoint at a time and stop for QA at every checkpoint in the referenced phase document.
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
7. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/01-architecture-and-root-cause.md`
8. the current phase document
9. the current handoff prompt

Before making changes:

1. run `git status --short`
2. inspect the live repo state for the surfaces named in the current phase
3. stop and report if the live repo materially differs from the current handoff

## Hard Rules

- Natural language is the external user input. JSON is internal only.
- Do not remove or break the existing JSON path until the natural-language path is fully validated and approved.
- Reuse the existing Phase 1 to Phase 6 command layer, worker runtime, job lifecycle, rollback, media, and admin workspace surfaces.
- Do not bypass the existing CMS command layer.
- Do not widen scope into multi-tenant orchestration or browser-to-shell execution.
- Keep the output draft-only. Auto-publish remains out of scope.
- Keep v1 limited to existing section types and existing theme controls.
- Preserve existing public rendering, visual editor, admin APIs, and job history behavior unless the current phase explicitly changes them.
- On this host, the live runtime is systemd-driven. Do not assume Docker is the active deploy path.

## Required Reporting At Every Checkpoint

When you stop, report:

- exact files changed
- exact APIs, services, jobs, env vars, and scripts added or modified
- exact tests run
- exact manual or browser QA performed
- exact open risks or blockers
- confirmation that the next checkpoint or phase was not started

## Stop And Report Immediately If

- the live repo materially conflicts with the phase document
- the implementation would require breaking the current draft apply or rollback contracts
- the natural-language planner would require bypassing validation to ship
- a live-systemd worker service cannot be installed safely on this host with the current repo/runtime conventions

