# Quick QA Findings And Target State

## Findings

1. the visual-editor toolbar is not yet structurally guaranteed to stay visible
2. left-rail section selection still depends on a browser-level scrolling behavior that is too implicit
3. the single-line overlay editor is using the right architecture but the wrong edit-mode treatment

## Why These Issues Exist

### 1. The visual-editor toolbar is not yet structurally guaranteed to stay visible

`AdminShell` already owns the main application viewport under a fixed app bar. Inside that shell, `PageVisualEditor` still mounts its own `h-screen` workspace. That creates nested viewport math and makes it too easy for the browser window to scroll instead of keeping the visual editor as a contained workspace.

### 2. Left-rail section selection still depends on implicit scrolling

`VisualEditorCanvas` still uses `element.scrollIntoView(...)` when the left rail changes selection. That is convenient, but it leaves too much behavior to the browser’s scroll-container resolution instead of explicitly scrolling the canvas container.

### 3. The single-line overlay editor is using the right architecture but the wrong edit-mode treatment

The plain-text editor is now unified around one overlay, which is correct. The remaining problem is that single-line inputs still inherit live display classes too literally and keep the overlay width too close to the rendered text width. That makes small text feel tighter, less readable, and occasionally truncated compared with the now-good large-text overlay.

## Required Direction

1. fix the visual-editor workspace so it fills the available admin-shell content area instead of creating nested full-screen math
2. make the toolbar sticky within the visual-editor workspace only after the height/overflow contract is corrected
3. replace the current selected-section jump with an explicit canvas-container scroll path
4. keep one overlay architecture for all plain text, but give single-line editing an editor-safe readability treatment rather than raw display styling

## Files Expected To Change

1. `components/admin-shell.tsx`
2. `components/admin/visual-editor/page-visual-editor.tsx`
3. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
4. `components/admin/visual-editor/page-visual-editor-canvas.tsx`
5. `components/landing/editable-text-slot.tsx`
6. the smallest possible test set needed to prove the behavior

## Source Workflows To Reuse

1. reuse the current fixed admin app bar contract from `components/admin-shell.tsx`
2. reuse the current visual-editor three-pane structure; do not redesign the workspace
3. reuse the current large-text overlay behavior as the quality bar for the single-line treatment
4. reuse the unified plain-text overlay architecture already in `components/landing/editable-text-slot.tsx`

## Stop Condition If Assumptions Break

Stop and report if any of the following is true:

1. fixing the visual-editor height/overflow contract requires a broader admin-shell routing/layout split
2. explicit canvas scrolling cannot be added without breaking current viewport or selection behavior
3. improving single-line readability would require reintroducing a second text-edit architecture
