# v7 Polish Pass And Small Surface Fixes

These are smaller than the v7 contract and booking items, but they still matter for a premium editor.

## 1. `WhatIDeliverSection` Block-Mode Joined Strings

File:

- `components/landing/what-i-deliver-section.tsx`

Current issue:

- block-mode `youGet` still renders as `join(" · ")`
- that leaves a content array without a clean direct-edit surface in that display mode

Required fix:

- keep the visual style
- stop collapsing editability

Recommended approach:

- render each item as its own inline editable chip/span even in block mode
- preserve the visual dot separators through CSS or adjacent punctuation, not by collapsing the field model into one raw string

## 2. Rich-Text Panel Polish

Files:

- `components/landing/editable-rich-text-slot.tsx`
- `components/landing/editable-rich-text-editor.tsx`

Required improvements:

- larger default panel
- stronger toolbar spacing
- clearer save/cancel affordances
- less cramped editing region

This is not a new feature.

It is polish on the already-correct direction.

## 3. Image-Backed Metadata UX

Files:

- `components/landing/social-proof-strip-section.tsx`
- `components/landing/logo-ticker.tsx`
- any shared hotspot helper introduced in the prior phase

Required:

- make hotspots feel deliberate and premium
- keep them hidden until selected or hovered in visual mode
- avoid turning image-driven sections into inspector-like clutter

## 4. Final Sweep Rule

Before asking for review, the coding agent should do one final manual scan for:

- raw visible placeholder text
- repeated-item arrays rendered as one uneditable string
- link labels that edit but destinations that do not
- destination edits that update one field while leaving a second related field stale

## Exit Standard

If a remaining issue is only visible when a section is selected and edited, it still counts.

Do not wave it through as “minor” if it breaks the replacement-grade standard.
