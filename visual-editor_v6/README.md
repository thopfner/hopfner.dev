# Visual Editor v6 Completion Brief

This package is the next corrective execution brief for the admin visual editor.

v5 moved the architecture forward, but it still did not cross the product bar. The problem is now straightforward:

- the editing model is real
- the rollout is still incomplete
- large-field editing still feels weak
- link editing still is not CMS-grade parity
- several built-in sections still expose partial or dead surfaces

This brief is intentionally narrow and strict. It is not a new visual-editor phase. It is a completion pass to make the current system feel like a replacement-grade SaaS editor rather than a selective demo.

## Product Standard

The admin visual editor must feel trustworthy enough to become the primary editor later.

That means:

- every important visible text field in built-in sections is editable on canvas
- every important link label and destination is editable on canvas
- large wrapped text edits in place at full size, not in a cramped mini-input
- animated or marquee surfaces stop behaving like marketing effects and start behaving like editable authoring surfaces when visual editing is active
- HTML-backed rich-text blocks are not dead zones

## Non-Negotiables

- Do not change the public renderer contract.
- Do not fork landing components just for admin.
- Do not introduce another custom raw-URL popover.
- Do not ship another partial section pass.
- Do not mark this done until the full built-in matrix is complete.

## Files In This Bundle

- `01-v6-ship-bar-and-rules.md`
- `02-built-in-section-gap-matrix.md`
- `03-shared-primitives-and-editor-foundation.md`
- `04-execution-order-and-section-completion.md`
- `05-qa-acceptance-and-ship-gate.md`

## Execution Rule

The coding agent should execute this bundle in order and should not ask for review until the gap matrix is fully closed.
