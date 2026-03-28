# v8 Elite Authoring Enhancements

These are the next-level upgrades that move the editor from “good custom tool” toward “premium SaaS editor.”

## 1. Better Editing Context Around Selected Fields

When a field is selected, provide stronger context without clutter.

Recommended:

- subtle field label chip
- current path hidden by default, visible only in advanced/debug mode
- clearer selected-state treatment

Goal:

- editor confidence
- no internal-schema overload

## 2. Better Rich-Text Editing Presence

The current rich-text editor works, but the editing presence can still feel compact.

Improve:

- larger panel
- clearer save/cancel area
- better toolbar spacing
- stronger viewport clamping

## 3. Section-Level Quick Actions

For selected sections, add compact section-level actions in a more polished way.

Candidates:

- duplicate
- hide/show
- open in form editor
- copy section anchor

These should be subtle and local, not inspector-dependent.

## 4. Better Save Confidence

Improve the “what changed” confidence layer.

Recommended:

- cleaner unsaved indicators in the structure rail
- selected section save status that feels local and specific
- no global anxiety for small local edits

## 5. Keyboard Quality

Add or improve shortcuts for expert editors:

- save
- next/previous section
- escape out of edit mode
- jump focus back to structure rail

These do not need to be overbuilt.

They do need to be coherent.

## 6. Remove Beta-Looking Details

Anything that feels like internal tooling instead of product should be reconsidered.

Examples from the current shell:

- overly technical section naming
- toolbar badge language that reads as temporary or internal
- weak hierarchy between page identity, section identity, and save state

## Acceptance

This file is complete only when the editor feels more intentional even when the user is not actively editing text.
