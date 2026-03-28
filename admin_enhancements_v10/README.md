# Admin Enhancements v10

## Final Workspace Finish Runbook

Opus, this is a correction batch.

The previous admin premiumization work is close, but not finished.
Do not broaden scope.
Do not touch unrelated routes.
Do not re-open Global Sections or Email Templates in this batch unless a tiny shared presentational helper is absolutely required.

This runbook exists to close the two remaining gaps that are still keeping the admin from an A-level finish:

1. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
2. `app/admin/(protected)/section-library/page-client.tsx`

And to add real proof for those exact surfaces.

## Objective

Finish the admin track by making the remaining weak workspace surfaces feel:

1. premium
2. calm
3. productized
4. intentional

without changing:

1. workflows
2. route behavior
3. persistence
4. feature scope

## Non-Negotiables

1. no feature regression
2. no route rewrites
3. no data model changes
4. no auth changes
5. no save/publish logic changes
6. no PageChooser behavior changes
7. no visual-editor three-panel layout changes
8. no broad Mantine-to-MUI migration
9. no touching Global Sections or Email Templates unless a tiny shared visual helper is reused by all surfaces

If any change starts to alter workflow instead of presentation/hierarchy, stop and keep the existing behavior.

## Why v9 Was Not Enough

### Visual Editor toolbar

It improved, but it still reads like:

1. a dense utility strip
2. micro-controls with slightly better spacing
3. too much competition between identity and actions

The specific current problem is visible in:

- [page-visual-editor-toolbar.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-toolbar.tsx#L174)

The toolbar still has:

1. `Add` competing inside the left identity cluster
2. a weak sense of primary workspace identity
3. a right-side action/status area that is functionally correct but not premium enough

### Section Library

It is still the weakest admin workspace route.

The specific current problem is visible in:

- [page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx#L1398)

The route still has:

1. a top filter panel plus a second catalog panel
2. tabs separated from the main catalog body in a way that feels administrative
3. count chips and source controls that overlap in purpose
4. too much “box inside box” rhythm
5. a catalog that still feels like an internal registry, not a premium library workspace

## Scope

Only these files should be changed in this batch:

1. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
2. `app/admin/(protected)/section-library/page-client.tsx`
3. `tests/admin-foundation/workspace-pages.test.tsx`
4. one additional focused rendered test file if needed
5. `components/admin/ui.tsx` only if a tiny shared presentational helper is necessary for both touched routes

Do not change any other route unless you must make a tiny shared helper reusable across both surfaces.

## Execution Order

1. finish Visual Editor toolbar
2. finish Section Library
3. add route-level proof
4. run full verification

Do not start Section Library until the toolbar is visually complete.

---

## Phase A — Visual Editor Toolbar

### Goal

Turn the toolbar into a premium workspace strip.

It must clearly read as:

1. workspace identity
2. workspace tools
3. contextual actions/status

### Exact Implementation Requirements

1. Keep all existing controls and behavior.
2. Do not add new controls.
3. Increase clarity by changing grouping, spacing, alignment, and emphasis only.

### Required Structural Outcome

The toolbar must have three clear zones:

#### Left: workspace identity

This zone should contain only:

1. back link
2. page chooser
3. slug/public page affordance
4. form/visual mode tabs

Rules:

1. `Add` must not remain inside this cluster unless it visually reads as subordinate to the workspace identity.
2. If there is any doubt, move `Add` into the center tool zone.
3. Page identity must feel primary. Controls must feel secondary.

#### Center: workspace tools

This zone should contain:

1. Add section
2. undo
3. redo
4. viewport switcher

Rules:

1. These controls must read as one compact tool rail.
2. Use shared container styling and consistent internal padding.
3. Do not let any one control visually dominate.

#### Right: contextual actions and status

This zone should contain:

1. selected section label when present
2. save / publish / discard when dirty
3. order save when relevant
4. save/publish/error status

Rules:

1. This lane must not jitter when status changes.
2. Reserve stable width for status text.
3. The selected section label should feel like context, not like a button.
4. Primary actions must visually outrank secondary actions.

### Exact Fixes To Make

1. Increase the toolbar’s visual calmness by slightly increasing horizontal grouping space and reducing unnecessary divider harshness.
2. Use one readable text baseline for all primary toolbar labels.
   Stop mixing tiny utility text with primary controls.
3. Reposition `Add` out of the identity cluster if needed.
4. Make the back + page chooser + slug/public-link + mode tabs feel like one identity block.
5. Make the tool rail visually separate from the right-side action/status lane.
6. Ensure the right-side lane still feels balanced when no section is selected and nothing is dirty.

### What Must Not Change

1. no button behavior changes
2. no save/publish/discard logic changes
3. no page chooser logic changes
4. no route changes
5. no visual-editor layout changes beyond this toolbar

### Toolbar Gate

Do not proceed until the toolbar no longer reads like a utility strip.
It must feel like a premium workspace header.

---

## Phase B — Section Library

### Goal

Turn Section Library from a dense admin catalog into a curated workspace.

### Exact Implementation Requirements

1. Keep current catalog and composer capabilities.
2. Keep the single creation CTA in the workspace header.
3. Do not change the data model or editor behavior.

### Required Structural Outcome

The route must read as:

1. workspace identity
2. one unified control layer
3. one curated catalog surface
4. one composer surface

### Exact Fixes To Make

1. Eliminate the feeling of “top filter box + second catalog box + tab wrapper duplication”.
2. Keep one tab system only.
   Do not visually make tabs feel detached from the surface they control.
3. When `activeTab === "catalog"`, the control layer should feel like one deliberate control strip:
   - search
   - source filter
   - sort
4. The catalog summary should stop using the current chip-heavy pattern as the primary summary mechanism.
   The source filter already exists. The counts should become calmer summary indicators, not the main control mechanism.
5. The catalog panel should feel like one premium list surface:
   - name first
   - description/type second
   - status/source tertiary
   - actions visually quiet until needed
6. Replace any residual raw loading text in the catalog body with the shared loading state.
7. Reduce nested-box repetition and make the page feel less like two admin panels stacked on each other.

### Specific Constraints

1. Keep the current header create CTA as the only primary create action.
2. Do not remove the source filter.
3. Do not remove sort.
4. Do not remove catalog/composer tabs.
5. Do not change which actions are available per row.

### What Must Not Change

1. no schema changes
2. no composer changes
3. no section-type activation logic changes
4. no route behavior changes

### Section Library Gate

Do not proceed until the route feels like a premium library workspace rather than a registry table with filters.

---

## Phase C — Proof

### Goal

Add proof for the actual routes and touched presentation, not only shared primitives.

### Required Test Work

1. Keep existing shared-primitives tests.
2. Add rendered proof that specifically covers the Visual Editor toolbar grouping and readable action/status composition.
3. Add rendered proof that specifically covers the Section Library hierarchy:
   - one primary create action
   - unified control layer for catalog
   - calmer summary treatment
   - catalog/composer separation

If extracting a tiny presentational subcomponent makes this testable without changing behavior, do that.
If not, render the route-level composition pieces directly with minimal mocks.

### Proof Rules

1. no source-string grepping
2. no fake assertions against file contents
3. prove rendered structure and visible hierarchy

---

## Verification Commands

Run exactly:

1. `npm test`
2. `rm -rf .next && npm run build`

Do not claim completion if the clean build fails.

---

## Definition Of Done

This batch is complete only if all of the following are true:

1. Visual Editor toolbar feels like a premium workspace strip
2. `Add` no longer weakens the identity cluster
3. Section Library feels like a curated library workspace rather than stacked admin boxes
4. Section Library summary hierarchy is calmer and clearer
5. all existing behavior is preserved
6. route-level rendered proof exists for the touched surfaces
7. `npm test` passes
8. `rm -rf .next && npm run build` passes

## Required Completion Report

Report exactly:

1. files changed
2. what changed in the Visual Editor toolbar
3. what changed in Section Library
4. which behaviors were intentionally preserved
5. exact tests run
6. exact build command run
7. anything still below A level

Do not say “all admin phases complete.”
This is a final correction batch for the remaining weak surfaces.
