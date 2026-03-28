# Phase 4: Global Nav And Footer Parity In The Visual Workflow

## Goal

Close the largest remaining “out-of-band” gap by making nav/footer content editing available in the visual workflow, not only by redirecting the user away.

## Target Sections

1. `nav_links`
2. `footer_grid`

## Exact Work

### `nav_links`

Bring these controls into the visual workflow:

1. logo media picker/upload/library
2. alt text
3. logo width slider
4. link list editing
5. link reordering
6. structured link selection
7. anchor target

### `footer_grid`

Bring these controls into the visual workflow:

1. footer cards
2. flat/grouped links mode
3. grouped links editing
4. subscribe toggle + placeholder + button label
5. CTA 1 / CTA 2 label + link
6. brand watermark text
7. copyright
8. legal links

## Implementation Constraint

Do not break the current global-section safety model.

If the correct implementation is:

1. richer in-context global section panel, or
2. a visual-global editor path that still respects global locking semantics,

that is acceptable.

What is not acceptable is leaving nav/footer content effectively outside the visual workflow and calling parity complete.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
2. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
3. any shared nav/footer editor fragments needed for safe reuse
4. targeted tests

## What Must Not Change

1. do not remove global section safety warnings
2. do not bypass admin/global-section constraints
3. do not fake parity by linking back out to the form editor again

## Gate

This final phase is complete only when:

1. nav content can be edited from the visual workflow
2. footer content can be edited from the visual workflow
3. global safety semantics remain clear
4. tests and build pass
