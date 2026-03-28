# Micro Enhancements v1

## Scope

This pack covers two tightly related frontend/admin issues:

1. fix secondary CTA contrast across themes
2. add explicit show/hide control for editorial CTA buttons across the CMS stack

In scope:

- marketing/frontend CTA rendering
- admin form editor CTA controls
- admin visual editor CTA controls
- admin preview truthfulness
- global section CTA paths
- composed/custom CTA paths

Out of scope:

- operational submit buttons or flow-critical controls
- new CTA styles beyond what is required to fix contrast and visibility
- unrelated editor redesign
- schema or architecture rewrites unless the brief explicitly names them

Important non-goal for this batch:

- do not make the `booking_scheduler` submit button hideable

That button is the operational submit for the booking flow, not an optional editorial CTA. Hiding it would make the flow unusable and would be a regression.

## Hard Rules

- Execute sprints in order.
- Do not proceed to the next sprint until the current gate passes.
- Keep current label and link values intact when a CTA is hidden.
- Do not implement CTA hide by blanking labels.
- Do not add per-section hardcoded white/black text classes to fix contrast.
- Do not add SQL migrations for CTA visibility in this batch.
- Store new CTA visibility state in additive JSON/content paths exactly as specified in this runbook.
- Keep save/publish semantics unchanged.
- Keep existing link picker workflows unchanged.
- Keep visual editor CTA toggles in inspector/panel UI only.
- Do not add new on-canvas CTA chrome in this batch.

## Execution Order

1. Read `00-coding-agent-prompt.md`
2. Read `01-root-cause-cta-contrast-and-visibility.md`
3. Execute `02-sprint-1-secondary-cta-contrast.md`
4. Stop and verify Sprint 1 gate
5. Execute `03-sprint-2-local-shared-cta-visibility.md`
6. Stop and verify Sprint 2 gate
7. Execute `04-sprint-3-global-and-composed-cta-visibility.md`
8. Stop and verify Sprint 3 gate
9. Run `05-qa-acceptance-and-stop-gates.md`

## Phase Gates

- Sprint 1 gate: secondary CTA contrast is corrected through the shared button system, with no section-specific color hacks
- Sprint 2 gate: local shared CTA toggles exist in form editor and visual editor, values persist, and frontend/admin previews hide/show correctly
- Sprint 3 gate: global/footer/composed CTA paths are aligned, including visual editor special panels and section-library composer surfaces
- Final gate: tests pass, build passes, and manual QA confirms no CTA regression across the named surfaces

## Required Output From The Coding Agent

Provide a completion report with:

- exact files changed
- exact tests run
- exact build command run
- any blockers encountered
- any explicit out-of-scope surface that was intentionally left unchanged

## Definition Of Done

This batch is done only when all of the following are true:

- secondary CTA text is legible and consistent across light/dark/theme token combinations
- editorial CTA buttons can be hidden without clearing their labels or links
- local shared CTA sections support show/hide in both form editor and visual editor
- global CTA paths support show/hide in both admin workflows that currently edit them
- composed/custom CTA blocks support show/hide anywhere those blocks are editable today
- the public renderer and admin previews remain truthful to saved state
- `booking_scheduler` submit remains visible and functional
- no existing publish/save/editor flow regresses
