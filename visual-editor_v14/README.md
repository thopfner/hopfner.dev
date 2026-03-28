# Visual Editor v14

## Scope

This batch is a focused correction pass. It exists to close the remaining architectural gaps that keep the current visual editor from feeling like one coherent product.

In scope:

1. replace the current split plain-text editing behavior with one anchored overlay editing system for all plain-text fields
2. make page-level settings preview truthfully inside the visual editor before save
3. finish composed-section parity for link and media resources inside the in-context composer panel
4. harden preview interaction safety so visual-editor CTAs and links cannot navigate by mouse or keyboard
5. replace weak proof tests in the touched areas with behavior tests

Out of scope:

1. public frontend renderer changes
2. rich-text editor redesign beyond what is necessary to keep it compatible with the unified plain-text model
3. schema redesign for composed sections
4. global-section workflow redesign
5. broader shell redesign unrelated to the four scoped issues above

## Hard Rules

1. Do not leave two plain-text editing architectures in place. After this batch, plain-text editing must use one overlay system across small and large text.
2. Do not reintroduce inline DOM replacement for small text.
3. Do not change the public renderer contract. The visual editor must stay an admin-only interaction layer over the existing payload and render system.
4. Do not create a second page-settings persistence model. Reuse the current page save path and canonical page fields.
5. Do not leave stubbed resource loaders inside composed-section editing. Reuse the real link/media infrastructure already used by the form editor.
6. Do not claim completion based on source-string checks, import checks, or build-only evidence.
7. Do not proceed to the next phase until the current gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-audit-findings-and-target-state.md`.
3. Execute `02-phase-1-unified-text-editing-system.md`.
4. Execute `03-phase-2-page-preview-truth-composed-parity-and-preview-safety.md`.
5. Finish with `04-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: all plain-text fields use the same anchored overlay editing system, and unchanged focus/blur interactions do not create dirty state.
2. Phase 2 gate: page-level settings preview live before save, composed sections use real link/media resources, and preview links are inert for both mouse and keyboard activation.

Do not mark this batch complete until both phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. exact existing helpers, hooks, and components reused
3. the exact inline text-edit path that was removed
4. the exact page-preview draft path now feeding the canvas
5. the exact composed-section link/media resources now wired in
6. the exact tests added or upgraded
7. the exact test/build commands run and their results
8. any blocker that forced a stop, with the exact file and unsupported path

## Definition Of Done

This batch is complete only if all of the following are true:

1. there is one plain-text editing architecture across small and large text
2. small text no longer swaps into a weaker inline editor while large text uses an overlay
3. page-level visual-editor settings show truthfully in the preview before save
4. composed sections can use real page/anchor/custom-link selection and real media-library flows inside the visual editor
5. preview CTA/link surfaces cannot navigate by mouse click or keyboard activation
6. unchanged text focus/blur does not produce a dirty-state prompt
7. touched areas are covered by behavior tests
8. `npm test -- tests/visual-editor` passes
9. `npm run build` passes
