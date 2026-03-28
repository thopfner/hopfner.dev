# 02 Phase 1 Foundation and Parallel Routing

This phase creates the new visual editor entry point and isolates the new feature from the existing admin editor.

## Phase Goal

Create a new admin route and feature namespace for the visual editor without changing existing editing behavior.

## Outcome

At the end of this phase:

- a dedicated page visual editor route exists
- the current page editor remains unchanged in behavior
- the new route can load page and section data safely
- the visual editor is feature-flagged or hard-gated
- no persistence behavior has changed yet

## Recommended Route Shape

Use a dedicated parallel route:

- `app/admin/(protected)/pages/[pageId]/visual/page.tsx`

Do not overload the current route with query-param mode switching for v1. A separate route is cleaner, easier to test, and lower risk.

## Recommended File Namespace

Create a new additive namespace:

- `components/admin/visual-editor/*`
- `lib/admin/visual-editor/*`

Recommended first files:

- `components/admin/visual-editor/page-visual-editor.tsx`
- `components/admin/visual-editor/page-visual-editor-shell.tsx`
- `components/admin/visual-editor/page-visual-editor-loader.tsx`
- `components/admin/visual-editor/page-visual-editor-types.ts`
- `components/admin/visual-editor/page-visual-editor-store.ts`
- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
- `components/admin/visual-editor/page-visual-editor-canvas.tsx`
- `components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `components/admin/visual-editor/page-visual-editor-selection.tsx`
- `lib/admin/visual-editor/load-page-visual-state.ts`

## Integration Touchpoints

Allowed minimal changes:

- add a button or link in the current page editor header to open the visual editor route
- add a back link from the visual editor to the current page editor
- add a feature-flag guard around the visual editor route

Not allowed in this phase:

- restructuring current page editor logic
- moving current section editor logic into shared services unless strictly necessary
- touching frontend render files

## Data Loading Strategy

Build a dedicated page visual loader that reads the same source of truth the current admin already depends on.

It should load:

- page row
- page sections ordered by position
- section type defaults
- local published/draft versions for page-owned sections
- global published/draft versions for linked global sections when needed for display
- Tailwind whitelist
- site formatting settings
- DB-backed presets
- DB-backed capabilities
- custom section schemas

Implementation guidance:

- prefer a single admin-only client-side loader built on the browser Supabase client first
- keep the loader additive and local to the visual editor namespace
- do not refactor `page-editor.tsx` loader logic in v1

## Feature Flag

Use a hard gate for initial rollout. Recommended options:

- an env-driven admin feature flag
- a small constant in the new visual editor namespace

Behavior:

- if disabled, route returns a controlled "not enabled" state and links back to the existing page editor
- do not hide partial implementation behind silent failures

## Support Matrix For Phase 1

### Must Support

- page load
- section list render
- section selection
- accurate page ordering display
- identification of local vs global sections
- identification of built-in vs custom/composed sections
- accurate preview theme application from `site_formatting_settings`

### Can Be Read-Only In This Phase

- all mutations
- drag/drop
- save
- publish
- delete
- duplicate

The first target is a truthful visual shell, not immediate mutation.

## UX Standard For Phase 1

The route should already feel deliberate and premium:

- full-height canvas
- explicit structure rail
- stable inspector rail
- page metadata in toolbar
- viewport switcher placeholders if not yet implemented
- obvious local/global badges
- obvious unsupported-state banners

Avoid:

- "work in progress" UI clutter
- generic white-box page-builder chrome
- hidden loading spinners with no context

## Dependency Spike

Before building the real canvas, prove the dependency stack in isolation.

Required checks:

- install and pin `@craftjs/core`
- confirm peer compatibility with React 19 in this repo
- confirm the app still builds
- confirm editor route hydration does not break under Next 16 app router

If Craft proves unstable:

- stop the implementation
- document the exact failure
- decide whether to pin a known-good version or swap libraries before proceeding

Do not improvise around a broken editor runtime.

## Acceptance Criteria

- `/admin/pages/[pageId]/visual` exists and is auth-protected
- current `/admin/pages/[pageId]` behavior is unchanged
- the new route loads the page and sections correctly
- global sections are visibly marked
- custom/composed sections are visibly marked
- site theme tokens are applied to the preview environment
- no data mutations occur yet

## Test Requirements

Add at least:

- route render test
- loader normalization test
- section classification test for local/global/custom cases
- feature-flag gating test

## Rollback

Rollback is trivial:

- remove the route exposure
- leave the existing page editor untouched

That simplicity is the reason this phase must stay additive.
