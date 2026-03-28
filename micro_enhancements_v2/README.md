# Micro Enhancements v2

## Scope

This batch is a narrow cleanup of the CTA system that just landed in `micro_enhancements_v1`.

In scope:
- visual-editor CTA field-state parity with the form editor
- global-section visual-editor CTA field-state parity
- removal of the stale top-level footer subscribe controls from the global visual panel
- rendered proof for the exact UI behavior above

Out of scope:
- any new CTA data model
- any CTA wording, copy, destinations, or frontend layout changes
- any booking CTA changes
- any new visual-editor feature surface beyond the existing CTA controls
- any additional footer subscribe features

## Hard Rules

- Keep the CTA visibility model introduced in `micro_enhancements_v1`.
- Keep `booking_scheduler` submit controls out of scope.
- Do not clear stored CTA labels or links when a CTA is hidden.
- A hidden CTA must remain editable only after the toggle is turned back on.
- Reuse the existing form-editor behavior as the reference for hidden-field treatment.
- Do not add a second footer subscribe editing path. The canonical contract is per-card subscribe data.
- Do not proceed to Sprint 2 until Sprint 1 passes its gate.

## Execution Order

1. Read `00-coding-agent-prompt.md`
2. Read `01-root-cause-and-required-direction.md`
3. Execute `02-sprint-1-visual-editor-cta-field-state-parity.md`
4. Stop and verify Sprint 1 gate
5. Execute `03-sprint-2-footer-global-panel-truth-and-proof.md`
6. Stop and verify final QA in `04-qa-and-stop-gates.md`

## Phase Gates

- Sprint 1 gate:
  - visual inspector CTA inputs are disabled when the CTA is hidden
  - global panel CTA inputs are disabled when the CTA is hidden
  - toggling hidden back on restores the prior values

- Sprint 2 gate:
  - the top-level footer subscribe block is removed from the global visual panel
  - footer subscribe remains editable only at the per-card level
  - rendered tests prove the new UI behavior

## Required Output From The Coding Agent

- exact files changed
- exact tests run
- exact build command run
- explicit statement that no CTA values are cleared by hide/show toggles
- explicit statement that top-level footer subscribe controls no longer render in the global visual panel

## Definition Of Done

This batch is complete only when:
- the visual inspector and global visual panel behave like the form editor for hidden CTA fields
- the global footer panel no longer presents stale top-level subscribe controls
- the affected UI behavior is covered by rendered tests, not only helper or source-string assertions
- `npm test` passes
- `npm run build` passes
