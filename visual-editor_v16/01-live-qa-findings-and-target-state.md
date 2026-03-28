# Live QA Findings And Target State

## Findings

1. the live editor now holds together visually, but section-level chrome is still noisier than an elite editor should be
2. the structure rail is functional but still too dense and low-signal for fast scanning
3. the no-selection page settings state is still competent rather than premium
4. schema-backed composed sections still have a product-trust contradiction

## Why These Issues Exist

### 1. Section-level chrome is still noisier than it should be

`page-visual-editor-node.tsx` currently layers a top-left type chip, a top-right action cluster, edited/locked badges, and selection ring treatment on top of the section preview. Each piece is defensible in isolation, but together they add more chrome than necessary.

### 2. The structure rail is functional but still too dense and low-signal

`page-visual-editor-structure.tsx` now uses title-first rows, which is correct, but the current row design still compresses title, type, drag handle, status dots, and badges into a very tight vertical rhythm. Long titles degrade quickly, and the rail still reads like a sortable list before it reads like a high-value page outline.

### 3. The no-selection page settings state is still competent rather than premium

`page-visual-editor-page-panel.tsx` has the right capabilities, but its current presentation is still slider-and-field oriented. It lacks a stronger summary/header hierarchy and still feels more like an internal control sheet than a polished workspace surface.

### 4. Schema-backed composed sections still have a product-trust contradiction

`page-visual-editor-composed-section-panel.tsx` already mounts a generic in-context editor for schema-backed composed sections, but `page-visual-editor-node.tsx` still overlays a full blocking banner telling the user visual editing is not available. That contradiction weakens trust in the editor.

## Required Direction

1. simplify and consolidate section-node chrome so the preview stays primary
2. make the structure rail scan faster and communicate status with fewer but clearer signals
3. make page settings feel like a premium workspace panel with stronger summary and control grouping
4. remove the composed-section dead-end for supported schema-backed sections while preserving truthful fallback for unsupported ones

## Files Expected To Change

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/visual-editor/page-visual-editor-structure.tsx`
3. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
4. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
5. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
6. the smallest possible test set needed to prove the changed UX paths

## Source Workflows To Reuse

1. reuse the current section selection and action architecture in `page-visual-editor-node.tsx`
2. reuse the current title-first structure-rail model rather than redesigning the rail from zero
3. reuse the current page-settings behavior and persistence path; only productize the surface
4. reuse the existing schema-backed composed-section editor path already mounted in the inspector

## Stop Condition If Assumptions Break

Stop and report if any of the following is true:

1. reducing canvas chrome would hide a workflow that currently has no other safe entry point
2. page settings cannot be productized without touching persistence contracts
3. removing the composed-section canvas block would expose unsupported behavior for schema-backed sections that the current inspector cannot actually handle
