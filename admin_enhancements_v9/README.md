# Admin Enhancements v9

## Workspace Premiumization Correction Runbook

This is a narrow correction batch.

Its purpose is to bring the unfinished admin premiumization work up to the standard the previous phases were supposed to hit.

Do not treat this as a new feature phase.
Do not expand scope.
Do not redesign the admin from scratch.

This batch exists because the previous implementation improved the shell and collection routes, but the main workspace routes still do not read as elite SaaS surfaces.

## Objective

Raise the remaining workspace/admin surfaces from:

1. structurally correct
2. visually cleaner than before
3. still somewhat internal-tool-like

to:

1. premium
2. calmer
3. better tiered
4. more intentional
5. clearly part of the same product as the rest of the improved admin

## Scope

This batch is only for the remaining workspace-quality gap in:

1. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
2. `app/admin/(protected)/section-library/page-client.tsx`
3. `app/admin/(protected)/global-sections/page-client.tsx`
4. `app/admin/(protected)/email-templates/page-client.tsx`
5. focused tests for the touched surfaces

## Non-Negotiables

1. no feature regression
2. no route rewrites
3. no persistence changes
4. no auth changes
5. no save/publish behavior changes
6. no visual-editor layout architecture changes beyond presentational hierarchy
7. no conversion of working flows into new workflows
8. no broad Mantine-to-MUI rewrite in this batch

If a change risks feature drift, do not do it.

## What Went Wrong In The Previous Batch

The earlier admin polish work landed well on:

1. shell
2. collection routes
3. auth surfaces

But it underdelivered on the heavy workspace routes.

The main misses were:

1. Visual Editor toolbar still reads like a dense internal utility bar, not a premium workspace identity/control strip.
2. Section Library still feels like a dense admin catalog with old hierarchy habits.
3. Global Sections still feels like a configuration screen under a nicer header, not a premium reusable-content workspace.
4. Email Templates improved, but still needs one pass of presentation discipline around the editor body so the route does not visually drop back into raw-form mode.

This batch corrects exactly those misses.

## Execution Rules

1. execute files in the order listed below
2. finish one surface before moving to the next
3. do not mix unrelated cleanup into the same file
4. keep existing controls and workflows; only improve hierarchy, density, grouping, rhythm, and polish
5. if you need a tiny shared helper or token to support all four surfaces, add it in `components/admin/ui.tsx` and stop there
6. do not continue to the next surface until the current one is visually coherent and locally verified

## File Order

1. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
2. `app/admin/(protected)/section-library/page-client.tsx`
3. `app/admin/(protected)/global-sections/page-client.tsx`
4. `app/admin/(protected)/email-templates/page-client.tsx`
5. `tests/admin-foundation/workspace-pages.test.tsx`
6. any minimal new route-specific admin tests if needed

---

## 1. Visual Editor Toolbar

### Problem

This surface is still the clearest miss.

It has:

1. micro text
2. cramped density
3. weak separation between workspace identity and editing actions
4. utility-bar styling that does not match the improved admin quality

The current toolbar is functional.
It is not premium.

### Required Outcome

The top bar must read as a premium workspace control strip with three clear zones:

1. workspace identity
2. workspace tools
3. section/status actions

### Exact Requirements

1. Keep the current behavior and actions exactly as they are.
2. Increase the perceived scale and calmness of the bar.
3. Remove the “tiny internal utility bar” feel.
4. Make the left zone read as page identity first, controls second.
5. Make the center zone feel like a compact tool cluster, not a random icon row.
6. Make the right zone stable and intentional even when no section is selected.

### Implement Specifically

1. Raise the toolbar height and internal padding modestly.
2. Stop using ultra-tiny text as the default for primary controls.
   Use a more readable baseline for labels and status text.
3. Group the left-side elements into:
   - back
   - page chooser
   - slug/public link
   - mode tabs
4. Keep `Add` in the identity/tool zone only if it visually belongs there.
   If it still competes with identity, move it into the center tool cluster.
5. Turn the center controls into a deliberate tool rail:
   - undo
   - redo
   - viewport switcher
6. Turn the right side into a stable action/status zone:
   - selected section label when present
   - save/publish/discard when dirty
   - order save when relevant
   - status indicator that does not jitter the layout
7. Use quieter dividers and stronger internal grouping.
8. Do not change the three-panel page layout.
9. Do not change page chooser behavior.
10. Do not change save/publish wiring.

### What Must Not Happen

1. no new features
2. no toolbar logic rewrite
3. no replacing current save/publish model
4. no viewport behavior change
5. no section selection behavior change

---

## 2. Section Library

### Problem

This route is cleaner than before, but it still feels dense and operational.
It still reads like:

1. filter form
2. dense table
3. chips
4. actions

instead of a premium library workspace.

### Required Outcome

The route must feel like a curated catalog/editor workspace:

1. stronger route identity
2. calmer catalog controls
3. more premium summary hierarchy
4. less administrative noise

### Exact Requirements

1. Keep the single primary create action in the header.
2. Keep current catalog/composer functionality.
3. Make the catalog controls read as one compact control row, not a series of unrelated form inputs.
4. Make the “Section types / counts / source split” summary feel intentional and lightweight.
5. Improve the loading/empty feel inside the catalog panel.
6. Reduce the feeling of repeated boxed regions and micro-dense table chrome.

### Implement Specifically

1. Tighten the relationship between the workspace header and the top filter panel.
2. Reduce visual redundancy between the top filter panel and the main catalog panel.
3. Make the counts and source state read as premium summary indicators, not noisy chips.
4. Improve row hierarchy:
   - name first
   - description/type second
   - status/source tertiary
5. Improve mobile card/table equivalence if both exist.
6. Where the route still shows raw “Loading…” text, replace it with the shared admin loading state.
7. Preserve all table actions and composer flow.

### What Must Not Happen

1. no data-model changes
2. no tab behavior changes
3. no composer schema changes
4. no feature removal

---

## 3. Global Sections

### Problem

This is the heaviest remaining route.
It still feels like a dense configuration surface even though the header is better.

The problem is not missing functionality.
The problem is hierarchy and workload presentation.

### Required Outcome

Make this route feel like a premium reusable-content workspace with three clear responsibilities:

1. create reusable section
2. manage site-wide formatting/template controls
3. inspect and act on existing global sections and their impact

### Exact Requirements

1. Keep the current three-part workspace structure.
2. Do not remove any formatting/template controls.
3. Do not change global-section CRUD or impact workflows.
4. Productize the layout and grouping so it stops feeling like one long settings surface.

### Implement Specifically

1. Strengthen the distinction between the three top-level workspace panels.
2. Inside the site-wide formatting panel, create clearer subgroups:
   - template selection and management
   - typography scales and token controls
   - brand signature controls
   - preview area
3. Use headings, dividers, spacing, and panel rhythm to reduce cognitive overload.
4. Keep the live preview clearly secondary and explanatory, not visually equal to the token controls.
5. In the sections-and-impact area, make each item easier to scan:
   - key/name first
   - status/usage second
   - actions tertiary
6. Keep the mobile view intact, but raise the hierarchy quality to match the improved desktop route.
7. Where raw loading text is still used, use shared state components if that can be done without disturbing route behavior.

### What Must Not Happen

1. no template logic change
2. no formatting token persistence change
3. no impact calculation change
4. no create/edit/delete workflow change
5. no attempt to re-platform this route in this batch

---

## 4. Email Templates

### Problem

This route is closest to acceptable, but it still visually drops into “editor form” mode too quickly.

The route should feel like a premium template workspace even though the body editor remains JSON-based for now.

### Required Outcome

Keep the exact current workflow, but make the editor feel more deliberate and premium.

### Exact Requirements

1. Keep the JSON editor model.
2. Keep the preview model.
3. Keep the branding tab and actions.
4. Improve the presentation of the template editor area so it feels curated instead of raw.

### Implement Specifically

1. Improve the hierarchy around:
   - version/status
   - subject/preview
   - JSON body editor
   - CTA fields
   - available variables
   - preview refresh / iframe preview
2. Make the JSON body area visually intentional.
   It should read as “template source” rather than just a large textarea.
3. Make the variables area feel like a utility aid, not a random chip dump.
4. Preserve the current empty state.

### What Must Not Happen

1. no editor model rewrite
2. no preview behavior change
3. no send/publish behavior change

---

## 5. Proof And Validation

### Problem

The prior workspace proof was still too weak.

This batch does not need a huge new test system, but it does need stronger proof than route-file source inspection.

### Required Outcome

Evidence should support the actual premiumization work.

### Exact Requirements

1. Add rendered tests for the shared or extracted presentation pieces you touch.
2. Do not add fake tests that only grep source code.
3. If needed, extract tiny presentational subcomponents only where that improves testability without changing behavior.
4. Keep tests targeted to the touched surfaces.

### Minimum Proof Required

1. rendered test coverage for any new shared toolbar/header/panel grouping extracted in this batch
2. rendered test coverage for at least one meaningful premiumized state in:
   - visual editor toolbar
   - section library
   - global sections or email templates
3. existing admin and visual-editor suites must stay green

### Required Commands

1. `npm test`
2. `rm -rf .next && npm run build`

If the clean build fails again with a `.next/server/pages-manifest.json` or related manifest error:

1. stop
2. report the exact stack
3. do not claim completion

---

## Completion Gate

Do not call this batch complete unless all of the following are true:

1. the Visual Editor toolbar now feels like a premium workspace strip, not a dense utility bar
2. Section Library reads like a curated workspace, not a dense admin catalog
3. Global Sections feels materially calmer and better tiered without losing any controls
4. Email Templates feels more productized without changing workflow
5. no route lost behavior
6. `npm test` passes
7. `rm -rf .next && npm run build` passes cleanly

## Required Completion Report

Report exactly:

1. files changed
2. what changed in each route
3. what existing behaviors were intentionally preserved
4. exact test commands run
5. exact build command run
6. any remaining premiumization gaps you intentionally left for a later batch

Do not say “all phases complete.”
This is a correction batch only.
