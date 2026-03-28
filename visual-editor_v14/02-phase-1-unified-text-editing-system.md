# Phase 1: Unified Text Editing System

## Goal

Make all plain-text editing in the visual editor use one anchored overlay editing system so small text and large text behave like one product.

## Files To Change, In Order

1. `components/landing/editable-text-slot.tsx`
2. `components/landing/visual-editing-context.tsx`
3. `components/admin/visual-editor/page-visual-editor-node.tsx` if the plain-text draft handoff requires a small adjustment
4. the smallest possible set of visual-editor tests needed to cover the new behavior

## Source Workflows And Files To Reuse

1. reuse the current overlay positioning path in `components/landing/editable-text-slot.tsx`
2. reuse the current no-op commit protection in `components/landing/editable-text-slot.tsx` and the semantic dirty guard already present in the visual-editor node/store path
3. keep the current overlay typography-scaling logic as the starting point, but make it work for all plain-text fields instead of only the large-text branch

## Step-By-Step Implementation

1. In `editable-text-slot.tsx`, remove the architecture split between overlay editing and inline replacement for plain-text fields.
2. Keep one edit entry point for all plain-text fields. Single-line and multiline fields may still use different HTML controls if necessary, but both must live inside the same overlay system.
3. Preserve the current anchored overlay positioning behavior. Do not move editing into a global detached modal.
4. Make overlay typography scale from the measured/computed display text style, not from the current large-tag heuristic alone.
5. Keep oversized display text readable by preserving the existing downshift behavior for very large display text, but make the scaling rules explicit so smaller text also uses an intentionally sized overlay.
6. Force overlay open state to start at the beginning of the value for both single-line and multiline text when appropriate.
7. Preserve the current “unchanged value should not dirty” behavior. If the current no-op guard is incomplete after the refactor, fix it inside this phase.
8. Remove the old inline replacement branch entirely once the unified overlay path is working.
9. Add or update behavior tests that prove both a small text field and a large text field now use the same overlay architecture and that focus/blur with no value change does not dirty the section.

## Required Behavior

1. clicking a small body label, eyebrow, CTA label, or similar plain-text field opens the same overlay editing system used by larger text
2. clicking a large heading or display title still opens an appropriately scaled overlay that is easy to edit
3. plain-text editing does not visually jump between two different interaction models based on font size
4. unchanged focus/blur on a plain-text field does not create dirty state
5. changed text still updates the existing draft/save/publish path exactly as before

## What Must Not Change In This Phase

1. do not change rich-text editing architecture beyond compatibility adjustments required by the shared plain-text overlay
2. do not change the public section renderers beyond the admin-only editing wrappers already in use
3. do not change section persistence, publish, or history behavior
4. do not widen this into inspector or shell redesign work

## Required Tests For The Phase

1. add a behavior test proving a small plain-text field opens the overlay editor
2. add a behavior test proving a large plain-text field opens the overlay editor
3. add a behavior test proving unchanged focus/blur does not mark the section dirty
4. add a behavior test proving changed plain-text content still updates the draft path correctly

## Gate For Moving Forward

Do not proceed to Phase 2 until all of the following are true:

1. the inline plain-text editing branch has been removed
2. both small and large plain-text fields use the anchored overlay system
3. unchanged focus/blur does not create dirty state
4. the phase behavior tests pass
