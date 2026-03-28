# Natural Language Site Builder V1

## Scope

This folder is the stable source of truth for the next `hopfner.dev-main` rollout:

- persistent per-deployment local worker on each customer VPS
- customer-owned Gemini key stored only on the VPS
- natural-language website briefs from `/admin/agent`
- internal structured plan generation and validation
- draft-only CMS apply with visual-editor review
- generated background images through the existing media-library path
- strict phased implementation with QA stop gates between checkpoints

Explicitly out of scope:

- auto-publish from agent output
- new section schema creation or `section_type_registry` mutation
- browser-to-shell execution
- browser-to-Codex-CLI execution
- multi-tenant control plane
- direct prompt-to-database write paths
- replacing the existing CMS renderer or visual editor

## Confirmed Current State

Verified on the live VPS repo at `/var/www/html/hopfner.dev-main`:

- `/admin/agent` already submits a free-text `prompt`
- `site_build_draft` already exists and can apply drafts
- Gemini image generation support already exists
- no persistent worker service is currently installed or running
- the planner still requires JSON embedded in the prompt text

The immediate gap is not the CMS renderer. The immediate gaps are:

1. there is no always-on worker service
2. the planner surface is text-shaped but the implementation is still JSON-only

## Hard Rules

- Use the live server repo at `/var/www/html/hopfner.dev-main` as the implementation target.
- Keep natural language as the user-facing input and keep JSON as an internal canonical plan only.
- Reuse the existing Phase 1 to Phase 6 command layer, worker, draft apply, rollback, media, and admin workspace surfaces.
- Do not bypass the existing CMS model with raw ad hoc table mutations.
- Do not proceed to the next checkpoint or phase until the current gate is passed and reviewed.
- Keep publish control human-owned.
- Keep v1 constrained to existing section types and existing theme controls.
- Use the real live systemd runtime path on this host. Do not treat Docker as the live path unless the runtime model is explicitly changed later.

## Execution Order

1. `01-architecture-and-root-cause.md`
2. `02-phase-07-worker-service-and-liveness.md`
3. `03-phase-08-natural-language-planner-core.md`
4. `04-phase-09-review-ux-and-apply-reviewed-plan.md`
5. `05-phase-10-hardening-and-launch-gate.md`
6. `06-final-qa-and-review-gates.md`
7. `07-phase-07-handoff-prompt.md`

## Phase Gates

- Phase 7 gate: a persistent worker service is installed, supervised, and truthfully reported as online or offline in `/admin/agent`; stop for QA.
- Phase 8 gate: natural-language briefs produce validated internal draft plans through a provider-backed planner; stop for QA.
- Phase 9 gate: the admin workspace supports plan review and deterministic "apply reviewed plan" without rerunning the model; stop for QA.
- Phase 10 gate: hardening, ops controls, retry and cancellation clarity, launch safeguards, and final regression proof are complete; stop for final QA.

## Definition Of Done

The rollout is complete only when all of the following are true:

- the worker runs as a managed service on the VPS
- `/admin/agent` can truthfully show worker readiness and liveness
- the admin can submit a natural-language brief instead of JSON
- the system converts the brief into an internal validated plan
- the admin can dry-run, review, and then create drafts without publish
- drafts appear in the existing visual editor and page overview
- Gemini-generated images can be requested from the brief and land in the media library
- rollback remains available for each applied draft run
- the v1 scope remains limited to existing section types and existing theme controls

