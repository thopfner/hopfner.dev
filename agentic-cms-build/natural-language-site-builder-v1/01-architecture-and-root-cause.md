# Architecture And Root Cause

## Product Goal

Deliver an elite-SaaS website builder flow inside the existing CMS:

1. admin enters a natural-language brief in `/admin/agent`
2. the system converts the brief into a constrained internal site plan
3. the system validates that plan against existing CMS capabilities
4. the worker creates draft pages, sections, theme settings, and optional generated images
5. the admin reviews the result in the visual editor
6. the admin decides whether to rollback, refine, or publish later

## Confirmed Live-Code Findings

The live repo already contains most of the CMS-native apply machinery:

- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
  submits a free-text `prompt` for `site_build_draft`
- `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
  routes `site_build_draft` into the existing planning and apply pipeline
- `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
  already performs draft-only CMS apply with rollback support
- `/var/www/html/hopfner.dev-main/lib/agent/media/providers/gemini.ts`
  already supports Gemini-backed image generation

The missing pieces are operational and product-facing:

### 1. No persistent worker service

The repo has a runnable worker entrypoint:

- `/var/www/html/hopfner.dev-main/scripts/agent-worker.ts`
- `/var/www/html/hopfner.dev-main/package.json`

But the live host currently has no managed worker service. Jobs can be enqueued from `/admin/agent`, but there is no always-on runtime processing them.

### 2. The planner is still JSON-only

The admin workspace already sends free text, but the planner still expects embedded JSON:

- `/var/www/html/hopfner.dev-main/lib/agent/planning/build-draft-plan.ts`
  currently throws unless the prompt contains a JSON object

This means the current product surface appears natural-language-ready, but the implementation is still a structured JSON interface hidden behind a text box.

## Architecture Decisions

### Decision 1: Keep the worker local to each deployment

Use a per-deployment local worker service on each customer VPS.

Why:

- customer keeps ownership of their provider key
- no central control plane is required
- the worker can execute against the local deployment's CMS contracts
- the trust boundary remains simple: admin UI -> local worker -> local CMS APIs and DB

### Decision 2: Keep Codex CLI as an implementation tool, not the product runtime

Codex CLI should set up the service and implement the code changes, but the live product runtime should not depend on a browser-to-CLI bridge.

Why:

- browser-to-shell is the wrong production trust boundary
- a managed worker is auditable and restart-safe
- the current CMS job system already fits a worker model

### Decision 3: Use natural language externally and structured plans internally

The correct architecture is:

`natural-language brief -> planner provider structured output -> canonical plan validation -> existing draft apply path`

JSON remains useful only as:

- an internal canonical representation
- an advanced debug and test input path
- a deterministic stored reviewed plan

It must stop being the primary end-user interface.

### Decision 4: Use Gemini text planning for v1

Use the same deployment-owned Google key for:

- text planning
- image generation

Why:

- the customer already needs a Gemini key for generated images
- one provider keeps setup and ownership simple
- this keeps the first version deployable without adding a second provider dependency

The planner must still be provider-abstracted so another provider can be added later without rewriting the planning contract.

### Decision 5: Add truthful worker liveness, not just configuration status

`/admin/agent` must distinguish:

- configured
- online
- stale
- offline

Current config-only status is not sufficient for a product surface.

### Decision 6: Separate "plan" from "apply reviewed plan"

The product needs a deterministic dry-run flow:

1. generate plan from natural-language brief
2. review the plan summary and warnings
3. apply the reviewed stored plan without rerunning the model

This avoids unnecessary cost, drift, and nondeterminism between review and apply.

## Official Guidance Used

Google's official Gemini structured output documentation supports the planning direction above:

- [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output)

Implementation implication:

- the planner should request structured output that maps directly into a constrained draft-plan schema
- the repo should not rely on brittle plain-text parsing for site-plan generation

## Required Sequence

The work must be done in this order:

1. Phase 7: persistent worker service and truthful liveness
2. Phase 8: natural-language planner core
3. Phase 9: review UX and apply reviewed plan
4. Phase 10: hardening and launch gate

Do not start natural-language planning work before the worker is a real managed service.

## Key Risks To Control

- planner output drift outside the allowed CMS schema
- operator confusion if `/admin/agent` reports "configured" while the worker is not actually running
- rerunning the model after a dry-run and getting a different plan
- widening the scope into arbitrary design/code generation instead of constrained CMS-native draft building

