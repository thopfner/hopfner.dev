# Claude Execution Prompt

Implement the revised `enhancements_v21` in the repo at `/var/www/html/hopfner.dev-main`.

Read these first:
- `/var/www/html/hopfner.dev-main/enhancements_v21/01-focus-and-findings.md`
- `/var/www/html/hopfner.dev-main/enhancements_v21/02-exact-action-plan.md`
- `/var/www/html/hopfner.dev-main/enhancements_v21/03-control-contract-matrix.md`
- `/var/www/html/hopfner.dev-main/enhancements_v21/06-acceptance-checklist.md`

Execution constraints:
- do not change copy
- do not change CTA text
- do not change dead-link behavior
- do not add publish validation in this batch
- do not redesign the public frontend
- do not reopen the responsive layout system
- do not add background-treatment controls in this batch
- do not add new column-count/mobile layout controls

Required implementation outcome:
1. Add `spacingTop` and `spacingBottom` to the section formatting contract.
2. Expose them in the section drawer under a dedicated `Advanced spacing` group.
3. Keep `sectionRhythm` as the semantic/default spacing layer.
4. Keep `outerSpacing`, but group it with the new advanced spacing controls.
5. Ensure spacing fields round-trip through save, reload, preview, and live render.
6. Remove or isolate the stale `landingContent` static object without changing frontend behavior.

Implementation order:
1. Batch 1: spacing contract alignment
2. Batch 2: safe code cleanup

Quality bar:
- leaving all new spacing fields empty must preserve current frontend output
- explicit spacing controls must only affect section spacing
- no content or copy behavior should change in this pass

Before finishing:
- run `npm run build`
- verify spacing controls manually in the section drawer
- summarize exactly which files changed
- call out any runtime dependency that prevented full cleanup
