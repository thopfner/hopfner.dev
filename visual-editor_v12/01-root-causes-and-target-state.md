# Root Causes And Target State

## Issue List

1. The section-type label is currently styled like an edge strip attached to the section border, so it can visually read like a real row between sections.
2. CTA links inside the visual editor still behave like live anchors and can navigate away from the editor.

## Why Each Issue Exists

1. In `components/admin/visual-editor/page-visual-editor-node.tsx`, the current label chrome is pinned flush to the top-left edge with `rounded-br` and border-strip styling. That makes it read like structural layout chrome instead of an inset editor chip.
2. In `components/admin/section-preview.tsx`, pointer events are enabled for the embedded preview whenever `visualEditing` is active. At the same time, many section renderers still emit real `Link` nodes around CTA content, for example in `components/landing/hero-section.tsx` and `components/landing/final-cta-section.tsx`.
3. `EditableLinkSlot` intercepts some editing clicks, but it does not globally neutralize anchor navigation for the entire preview surface.

## Required Direction

1. Fix the section-type chrome in `page-visual-editor-node.tsx`, not by changing actual section spacing but by making the chrome an inset overlay pill.
2. Fix live-link behavior at the embedded preview boundary in `section-preview.tsx`.
3. Use marker attributes in `EditableLinkSlot` only as needed to preserve editor controls while suppressing preview navigation.
4. Do not patch every section CTA individually unless the preview-boundary approach fails.

## Files Expected To Change

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/section-preview.tsx`
3. `components/landing/editable-link-slot.tsx`
4. `tests/visual-editor/...` new or updated tests

## Stop Condition If Assumptions Break

Stop and report before continuing if either of these is true:

1. preview-layer anchor suppression breaks the link-edit button or inline CTA label editing
2. the only way to stop navigation is to patch every section renderer independently
