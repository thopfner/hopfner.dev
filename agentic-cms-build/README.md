# Agentic CMS Build Roadmap

## Scope

This folder is the stable source of truth for the `hopfner.dev-main` agentic CMS rollout.

In scope:
- per-deployment local worker on each customer VPS
- customer-owned model/API keys stored on the VPS
- CMS-native draft site generation using existing page, section, theme, and media contracts
- existing section types only
- existing theme tokens and formatting controls only
- admin job submission, job visibility, rollback, and visual-editor review flow
- strict phased implementation with QA stop gates between phases

Explicitly out of scope:
- auto-publish from agent output
- new custom section type creation or `section_type_registry` mutation
- browser-to-shell or browser-to-Codex-CLI execution
- central control plane / cross-deployment orchestration
- direct database write surfaces for agents
- replacing the current renderer

## Hard Rules

- Use the live server repo at `/var/www/html/hopfner.dev-main` as the implementation target.
- Reuse the existing CMS data model, publish RPCs, theme settings, visual editor, media library, and snapshot patterns.
- Do not bypass the CMS model with raw ad hoc table mutations from prompts.
- Do not proceed to the next phase until the current phase gate is passed and reviewed.
- Keep publish control human-owned in v1.
- Keep existing admin, visual editor, form editor, and published rendering behavior identical unless a phase explicitly changes it.
- Keep v1 constrained to existing section types and existing theme controls.

## Execution Order

1. `03-phase-01-command-layer.md`
2. `04-phase-02-local-worker.md`
3. `05-phase-03-draft-orchestration.md`
4. `06-phase-04-admin-workspace.md`
5. `07-phase-05-media-generation.md`
6. `08-phase-06-hardening-and-ship-gate.md`
7. `09-final-qa-and-review-gates.md`

## Phase Gates

- Phase 1 gate: shared CMS command layer exists, current UI parity is preserved, tests/build pass, stop for review.
- Phase 2 gate: local worker runtime and job lifecycle work with no-op jobs only, deployment/runtime proof is complete, stop for review.
- Phase 3 gate: prompt-to-draft orchestration works against existing section/theme primitives with snapshot and rollback, stop for review.
- Phase 4 gate: admin workspace can submit and inspect jobs and open generated drafts in the visual editor, stop for review.
- Phase 5 gate: generated images land in the media library through the supported path and can be attached to drafts, stop for review.
- Phase 6 gate: hardening, rate limiting, retry/cancel, audit, config, and regression coverage are complete, stop for final review.

## Required Output From The Coding Agent

For every phase the coding agent must report:
- exact files changed
- exact tests run
- exact manual QA performed
- screenshots or browser evidence when a UI surface changed
- blockers encountered
- confirmation that the next phase was not started

## Definition Of Done

The rollout is complete only when all of the following are true:
- a local worker can process admin-created site-build jobs on the customer VPS
- the worker uses customer-owned provider credentials stored locally
- the worker creates draft pages/sections/theme changes only
- generated drafts are visible in the existing visual editor and page overview
- rollback is available for each apply run
- media generation writes through the supported media path and media library
- auto-publish remains out of scope
- section-type creation remains out of scope
- deployment and QA documentation are complete

