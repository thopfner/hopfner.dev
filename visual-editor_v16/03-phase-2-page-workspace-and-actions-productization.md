# Phase 2: Page Workspace And Actions Productization

## Goal

Make the page-level workspace surfaces feel premium, with clearer hierarchy and better action discoverability.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
2. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
3. `components/admin/visual-editor/page-visual-editor-inspector.tsx` only if a minimal supporting adjustment is required
4. the smallest possible test set needed to prove the changed UX paths

## Source Workflows And Files To Reuse

1. reuse the existing page-settings actions and persistence path
2. reuse the current toolbar action model rather than inventing a second save/publish system
3. reuse the current page identity data already loaded into the store

## Step-By-Step Implementation

1. In `page-visual-editor-page-panel.tsx`, strengthen the page summary/header so the no-selection state feels intentional and informative.
2. Keep the existing controls, but regroup them into a clearer hierarchy with stronger labels and visual context.
3. Improve media/panel presentation so the page backdrop controls feel like a visual workspace, not a raw control stack.
4. In `page-visual-editor-toolbar.tsx`, make sure primary action visibility remains strong at common laptop widths.
5. Do not add more toolbar clutter. Improve prioritization, spacing, or responsive behavior instead.
6. If selected-section context and global page context compete visually, rebalance them rather than stacking more labels.

## Required Behavior

1. the no-selection state feels like a premium page workspace
2. page identity and backdrop controls are easier to understand at a glance
3. save/publish and related primary actions remain obvious at common editor sizes
4. the toolbar still feels calm rather than overloaded

## What Must Not Change In This Phase

1. do not change page-settings persistence
2. do not move important actions into hidden menus without a strong reason
3. do not redesign the entire inspector
4. do not widen into new page-builder capabilities

## Required Tests For The Phase

1. add or upgrade tests for any responsive action-visibility logic or helper extracted from the toolbar
2. add proof for any page-panel helper logic extracted to support the new hierarchy
3. keep the current visual-editor suite passing

## Gate For Moving Forward

Do not proceed to Phase 3 until all of the following are true:

1. the page panel feels more premium and less form-like
2. primary action discoverability is preserved or improved
3. the phase tests pass
