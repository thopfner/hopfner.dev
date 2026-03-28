# Phase 1: Sticky Workspace Chrome And Canvas Scroll

## Goal

Make the visual editor behave like a fixed workspace: the toolbar stays visible, and left-rail section selection scrolls only the canvas intentionally.

## Files To Change, In Order

1. `components/admin-shell.tsx`
2. `components/admin/visual-editor/page-visual-editor.tsx`
3. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
4. `components/admin/visual-editor/page-visual-editor-canvas.tsx`
5. the smallest possible test set needed to prove the behavior

## Source Workflows And Files To Reuse

1. reuse the existing fixed app-bar pattern in `components/admin-shell.tsx`
2. reuse the current visual-editor pane structure in `page-visual-editor.tsx`
3. reuse the current canvas selection concept, but replace the implicit scroll behavior with an explicit canvas scroll path

## Step-By-Step Implementation

1. Correct the workspace height contract between `AdminShell` and `PageVisualEditor`. The visual editor must fill the available admin-shell content area instead of mounting itself as a second full-screen viewport.
2. Once the workspace height is correct, make the visual-editor toolbar sticky inside the workspace with a durable background and z-index appropriate for the editor chrome.
3. Preserve independent scrolling for the canvas and side panels. Do not collapse the workspace back into document-level scrolling.
4. In `page-visual-editor-canvas.tsx`, replace the current selection jump path with an explicit canvas-container scroll routine. Do not rely on `element.scrollIntoView(...)` for this behavior.
5. If needed, extract a small pure helper for container-relative section scrolling so the scroll behavior can be tested directly.
6. Add or update tests that prove the selected-section jump uses the explicit canvas path and that the workspace contract no longer depends on a nested `h-screen` viewport.

## Required Behavior

1. clicking sections in the left rail keeps the visual-editor toolbar visible
2. the canvas scrolls to the selected section without causing the overall page/window to become the active scroller
3. the toolbar remains usable while the canvas scroll position changes
4. existing canvas, structure, and inspector interactions continue to work

## What Must Not Change In This Phase

1. do not redesign the toolbar contents
2. do not change section ordering or selection semantics
3. do not change the admin shell outside the minimum needed to fix the workspace contract
4. do not touch text-overlay behavior in this phase

## Required Tests For The Phase

1. add a test for the explicit canvas-scroll helper or equivalent selection-scroll behavior
2. add a test proving the visual-editor workspace uses the corrected contained layout contract
3. keep the current visual-editor test suite passing

## Gate For Moving Forward

Do not proceed to Phase 2 until all of the following are true:

1. the visual-editor toolbar remains visible during left-rail section navigation
2. selected-section scrolling is explicit and canvas-scoped
3. the phase tests pass
