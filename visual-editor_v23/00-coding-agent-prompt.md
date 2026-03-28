# Coding Agent Prompt

You are fixing one exact parity defect in the visual editor.

## Objective

Make `hero_cta` content-order editing in the visual editor match the existing form editor exactly.

This is not a new feature.
This is not a redesign.
This is parity work.

## Current Problem

The form editor already has the correct workflow for:

- block order across `ctas`, `stats`, `trust`
- constrained valid block keys
- guaranteed inclusion of all three blocks
- up/down movement
- left/right side assignment for split layouts

The visual editor currently does not.
It uses a generic free-text array editor for `heroContentOrder`, which is the wrong abstraction.

## Required Outcome

After this batch:

1. the visual editor must expose the same three hero blocks as the form editor:
   - `CTAs`
   - `Stats`
   - `Trust`
2. the user must be able to reorder those blocks with explicit move up/down actions
3. the user must not be able to add arbitrary block keys
4. the user must not be able to delete required blocks
5. split layouts must expose left/right side assignment for each block
6. both editors must use the same normalization rules for order and side mapping

## Hard Rules

1. Do not keep the generic `ContentArrayEditor` for hero block order.
2. Do not leave any free-text input for block keys.
3. Do not invent new schema keys.
4. Do not touch `components/landing/hero-section.tsx`.
5. Do not broaden scope into other parity areas.

## Reuse Requirement

Extract and reuse shared admin-side hero block-order primitives so the form editor and visual editor cannot drift again.

## Completion Standard

Do not call this done until:

- the visual editor hero block-order UX is functionally equivalent to the form editor
- tests prove the shared normalization behavior
- tests prove the visual editor no longer allows invalid free-form block keys
- `npm test -- tests/visual-editor` passes
- `npm run build` passes
