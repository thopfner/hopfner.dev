# Visual Editor v11

## Scope

Turn the current visual editor from a strong section editor into a replacement-grade visual page editor for the existing CMS.

This batch is in scope:

1. Visual page composition inside the visual editor.
2. Page-level settings inside the visual editor.
3. In-editor history and restore workflows.
4. In-context handling for global sections and custom/composed sections.
5. Media workflows inside the visual editor.
6. Semantic-first inspector and shell productization.

This batch is out of scope:

1. Public frontend renderer changes.
2. Database redesign or new persistence model.
3. Replacing the legacy form editor.
4. Real-time collaboration, comments, approvals, or AI generation.

## Hard Rules

1. Do not change the public rendering contract. `app/(marketing)/[slug]/page.tsx`, `lib/cms/get-published-page.ts`, and the existing section renderers remain the frontend truth.
2. Do not create a parallel persistence model. Continue to use `pages`, `sections`, `section_versions`, `global_sections`, `global_section_versions`, and the existing RPCs.
3. Do not fork landing-section markup into separate admin-only implementations. Keep admin editing behavior layered through existing visual-editing primitives, wrappers, and admin shell components.
4. Do not remove or weaken the current form editor. This batch must be additive and safe.
5. Do not proceed to a later phase until the current phase gate passes.
6. If a phase assumption breaks, stop and document the blocker instead of improvising a new architecture.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-root-causes-and-target-state.md`.
3. Execute `02-phase-1-visual-page-composition.md`.
4. Execute `03-phase-2-page-workspace-history-and-coverage.md`.
5. Execute `04-phase-3-media-semantic-shell-productization.md`.
6. Finish with `05-qa-acceptance-and-stop-gates.md`.

## Required Output From The Coding Agent

Return a completion report with:

1. Files changed.
2. Which phase gates passed.
3. Test commands run and exact results.
4. Manual QA flows completed.
5. Any blockers or deferred items.

## Definition Of Done

The batch is done only if all of the following are true:

1. A user can add, insert, duplicate, delete, reorder, save, and publish sections from the visual editor without leaving it.
2. A user can edit page-level backdrop/layout settings from the visual editor.
3. A user can view version history and restore a version from the visual editor.
4. Global sections and custom/composed sections no longer present dead-end blockers.
5. Common media workflows can be completed from the visual editor.
6. Primary actions remain visible and usable across supported screen sizes.
7. `npm test -- tests/visual-editor` passes.
8. `npm run build` passes.
