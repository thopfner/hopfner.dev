# Audit Alignment Gaps And Target State

## Issue List

1. composed-section support truth is still split between canvas and inspector
2. the page-workspace footer still appears only when dirty
3. the structure rail is quieter, but it still under-communicates meaning
4. current tests still overstate confidence

## Why Each Issue Exists

### 1. Composed-section support truth is still split

`page-visual-editor-node.tsx` currently treats support as “raw schema exists”. The inspector/editor path in `page-visual-editor-composed-section-panel.tsx` treats support as “normalized schema with usable flattened blocks”. That means canvas and inspector can still disagree.

### 2. The page-workspace footer still appears only when dirty

`page-visual-editor-page-panel.tsx` now looks more premium, but the action/footer region still disappears completely when the page is clean. That weakens the sense that this is a persistent page workspace.

### 3. The structure rail is quieter, but it still under-communicates meaning

The current row design is calmer, but titles still truncate aggressively, the secondary line is too low-signal, and the current global indicator no longer clearly communicates the locked nature of reusable sections.

### 4. Current tests still overstate confidence

The existing touched test files still lean on source inspection and importability rather than real behavior verification of the product outcomes.

## Required Direction

1. extract or centralize one composed-support decision and use it in both canvas and inspector
2. make the page-workspace footer persistent with explicit clean/dirty state communication
3. improve the structure rail for scanability and meaning, not more noise
4. add behavior-oriented tests for the corrected surfaces

## Files Expected To Change

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
3. a small shared helper file for composed support if needed
4. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
5. `components/admin/visual-editor/page-visual-editor-structure.tsx`
6. touched visual-editor test files or new focused tests

## Source Workflows To Reuse

1. reuse `normalizeComposerSchema` and `flattenComposerSchemaBlocks` from the current composed-section flow
2. reuse the current page-settings persistence path and visual preview path
3. reuse the current title-first structure-rail model and sharpen it, rather than redesigning the rail

## Stop Condition If Assumptions Break

Stop and report if any of the following is true:

1. a shared composed-support helper cannot be introduced without broader schema contract work
2. keeping a persistent page footer would require a broader inspector layout rewrite
3. restoring explicit locked/global semantics requires a deeper permissions model change
