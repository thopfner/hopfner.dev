# Visual Editor v5 Coverage And Editing Quality Plan

This bundle is the corrective execution brief for the current in-place editing rollout.

It exists because the latest implementation is directionally correct but still not elite.

The main problems are now clear:

- the in-place editing architecture exists, but rollout coverage is incomplete
- the shared title primitive is still outside the editing system
- several built-in section renderers still bypass the slot system entirely
- some instrumented sections still leave visible inner text untouched
- CTA link editing still uses a raw URL input instead of the existing CMS-grade link workflow
- the field editor sizing behavior is weak for large wrapped text, especially hero headings

## Executive Decision

Do not start another broad visual-editor phase.

Execute this as a focused correction pass that finishes the in-place editing system to elite quality.

## Required Outcome

After this pass:

- every important visible plain-text field in built-in sections is editable in place
- every important CTA label is editable on the CTA itself
- every important CTA destination is editable from a proper anchored CMS link picker
- the actual edited field remains visually readable while editing
- large wrapped headings edit as large wrapped headings, not as tiny clipped inputs

## Files In This Bundle

- `01-gap-list-and-target-state.md`
- `02-non-negotiable-implementation-order.md`
- `03-built-in-section-coverage-matrix.md`
- `04-field-editor-sizing-and-link-ux-spec.md`
- `05-qa-and-ship-gate.md`

## Approval Standard

Do not approve this pass unless all three are true:

1. `Complete`
   Built-in section coverage is substantially finished, not selective.

2. `Truthful`
   The canvas still uses the shared renderer path and writes the same payload paths.

3. `Premium`
   Editing large visible text feels intentional and readable, not cramped or improvised.
