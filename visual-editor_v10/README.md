# Visual Editor v10 Strict Runbook

This package is a coding-agent handoff, not a strategy memo.

Execute it exactly as written.

## Scope

Fix only these four issues:

1. page chooser dropdown readability and layering
2. link picker overflow and horizontal-scroll UX
3. spacing control truthfulness in the visual preview
4. save/publish visibility on narrower admin layouts

## Hard Rules

- Do not change the database schema.
- Do not change the public renderer behavior except for extracting shared logic without changing output.
- Do not fork or rewrite landing-section markup.
- Do not replace the visual editor architecture.
- Do not work on unrelated polish until all four issues are fixed and gated.
- Do not continue to the next phase until the current phase gate passes.

## Execution Order

Read all files first, then execute in this order:

1. [01-audit-findings-and-root-causes.md](/var/www/html/hopfner.dev-main/visual-editor_v10/01-audit-findings-and-root-causes.md)
2. [02-floating-surfaces-and-linking.md](/var/www/html/hopfner.dev-main/visual-editor_v10/02-floating-surfaces-and-linking.md)
3. Run Gate 1 from file 02. If Gate 1 fails, stop and fix.
4. [03-preview-contract-and-spacing-truth.md](/var/www/html/hopfner.dev-main/visual-editor_v10/03-preview-contract-and-spacing-truth.md)
5. Run Gate 2 from file 03. If Gate 2 fails, stop and fix.
6. [04-responsive-actions-and-shell-polish.md](/var/www/html/hopfner.dev-main/visual-editor_v10/04-responsive-actions-and-shell-polish.md)
7. Run Gate 3 from file 04. If Gate 3 fails, stop and fix.
8. [05-qa-acceptance-and-ship-gate.md](/var/www/html/hopfner.dev-main/visual-editor_v10/05-qa-acceptance-and-ship-gate.md)
9. Run the final ship gate. If any item fails, the batch is not complete.

## Required Output From The Coding Agent

At the end of implementation, the coding agent must report:

1. Exact files changed.
2. Which gate failed during implementation, if any, and how it was resolved.
3. Exact test commands run.
4. Manual QA scenarios completed.
5. Remaining risks, if any.

## Definition Of Done

This batch is complete only when:

- page chooser is fully readable over any preview content
- link editing never requires horizontal canvas scrolling
- spacing drags visibly affect the visual preview and match the frontend result after save/publish
- save/publish actions remain visible and usable on narrower admin widths
- targeted tests were added for each fixed area
- `npm test -- tests/visual-editor` passes
- `npm run build` passes
