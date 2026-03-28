# Visual Editor v13

## Scope

This batch addresses the two blockers claimed in v11 and one directly related persistence defect discovered during audit.

In scope:

1. finish media-library integration inside the visual editor using the current backend UI stack
2. correct page backdrop persistence so the visual editor writes the same canonical page fields as the form editor
3. replace the custom/composed-section dead-end with an in-context schema-driven editor using existing composer-editor infrastructure
4. replace weak import-only test coverage with behavior coverage for these surfaces

Out of scope:

1. public frontend renderer changes
2. full on-canvas direct manipulation for custom/composed sections
3. schema redesign for `section_type_registry`
4. global-section workflow redesign
5. broader visual-editor shell polish outside the touched surfaces

## Hard Rules

1. Do not reintroduce Mantine. For admin modal, picker, and editor surfaces, the current backend UI direction is MUI plus existing `mui-compat` wrappers where already used.
2. Do not create a second media-library system. Reuse the existing `MediaLibraryModal`, `MediaPickerMenu`, `ImageFieldPicker`, and `uploadMedia` pipeline.
3. Do not store page backdrop URL in `formatting_override` as the canonical value. Keep `pages.bg_image_url` as the source of truth, matching the form editor and frontend renderer.
4. Do not invent a new custom/composed editor model. Reuse the existing `normalizeComposerSchema`, `flattenComposerSchemaBlocks`, `CustomComposerEditor`, and related block editors.
5. Do not claim completion based on import-only tests.
6. Do not proceed to the next phase until the current phase gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-audit-findings-and-target-state.md`.
3. Execute `02-phase-1-media-library-and-page-settings-contract.md`.
4. Execute `03-phase-2-composed-section-in-context-editor.md`.
5. Finish with `04-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: media library works in the visual editor and page backdrop settings persist through the canonical DB path.
2. Phase 2 gate: custom/composed sections no longer dead-end to the old editor and can be edited in-context through the generic composer editor.

Do not mark the batch complete until both phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. exact shared helpers extracted or reused
3. exact tests added or replaced
4. exact test/build commands run and results
5. manual QA results for every required scenario
6. any remaining blockers, with exact unsupported surface or block type

## Definition Of Done

This batch is complete only if all of the following are true:

1. page backdrop editing in the visual editor uses `pages.bg_image_url` and `pages.formatting_override` exactly like the form editor
2. the visual editor can open the existing media library and select/upload media for the currently wired visual-editor media fields
3. the backend UI remains MUI-consistent for these media flows
4. custom/composed sections can be edited in-context through the existing generic composer editor
5. the custom/composed path no longer hard-stops with a “use the form editor” message when a valid composer schema exists
6. tests for these behaviors are real behavior tests, not import-only checks
7. `npm test -- tests/visual-editor` passes
8. `npm run build` passes
