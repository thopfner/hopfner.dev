# Enhancements v21

Focused optimization pass for the CMS-driven marketing site after the v20 editor/layout work.

This revised pack is intentionally narrow.

Primary goals:
- expose the remaining section-spacing controls already supported by the public renderer
- clean up spacing-control redundancy in the section drawer so spacing is easier to reason about
- remove stale legacy code that no longer serves the CMS architecture

Out of scope for v21:
- no copy changes
- no CTA text changes
- no proof/testimonial/content cleanup
- no dead-link behavior changes
- no publish-validation changes
- no redesign of the public frontend
- no reopening of the responsive layout system
- no new column-count/mobile layout controls

Required reading order:
1. `01-focus-and-findings.md`
2. `02-exact-action-plan.md`
3. `03-control-contract-matrix.md`
4. `04-batch-and-file-plan.md`
5. `05-claude-execution-prompt.md`
6. `06-acceptance-checklist.md`

Success definition:
- `spacingTop` and `spacingBottom` round-trip through the section editor, preview, save/load, and live render
- spacing controls are grouped logically in the drawer without changing current frontend output when left empty
- stale legacy landing-content code is removed or isolated cleanly
- no public copy or content behavior changes are introduced in this batch
