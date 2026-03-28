# Phase 2: Single-Line Overlay Readability

## Goal

Keep the unified plain-text overlay system, but make single-line editing feel as readable and comfortable as the current large-text overlay.

## Files To Change, In Order

1. `components/landing/editable-text-slot.tsx`
2. any minimal helper extracted from `editable-text-slot.tsx` to keep the logic testable
3. the smallest possible test set needed to prove the behavior

## Source Workflows And Files To Reuse

1. reuse the current unified overlay architecture in `editable-text-slot.tsx`
2. reuse the current large-text overlay as the quality bar for spacing, visibility, and focus behavior
3. preserve the current no-op dirty-state protection and commit/cancel behavior

## Step-By-Step Implementation

1. Keep one overlay architecture for all plain-text editing. Do not split single-line text back out into a different editor system.
2. Decouple single-line edit rendering from raw display classes where those classes harm readability. The editor should inherit useful typography signals, but it must not blindly preserve truncation, overly tight width, or display-oriented styling that hurts editing.
3. Introduce an editor-safe treatment for single-line fields:
   - use a generous minimum overlay width
   - clamp or normalize font sizing for readability
   - avoid truncation-oriented behavior in edit mode
   - keep the text fully visible at the start of editing
4. Preserve the current strong large-text overlay behavior. Do not degrade the display-heading experience while improving smaller fields.
5. If needed, extract a small pure helper that computes overlay width and edit-mode typography treatment so the behavior can be tested directly.
6. Add or update tests that prove single-line fields are no longer using the cramped/truncation-prone treatment and that large-text overlay behavior remains intact.

## Required Behavior

1. single-line text editing is easy to read and does not feel visually cramped
2. long single-line values are not effectively reduced to a tiny visible fragment on open
3. the overlay still opens at the beginning of the value
4. large headings and display text still use the strong current overlay treatment
5. unchanged focus/blur still does not create dirty state

## What Must Not Change In This Phase

1. do not reintroduce inline editing
2. do not move text editing into the inspector
3. do not change save/publish semantics
4. do not widen this into a rich-text rewrite

## Required Tests For The Phase

1. add a test proving single-line overlay width/treatment uses the new editor-safe rules
2. add a test proving large-text overlay treatment still behaves as expected
3. keep the no-op dirty-state behavior covered

## Gate For Moving Forward

Do not mark this phase complete until all of the following are true:

1. single-line plain-text editing is no longer cramped or truncation-prone
2. large-text overlay behavior remains strong
3. no-op focus/blur still does not dirty the section
4. the phase tests pass
