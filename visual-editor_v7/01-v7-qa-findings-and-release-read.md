# v7 QA Findings And Release Read

## Current Read

The implementation is in a much stronger state than the previous pass.

Verified:

- `npm test -- tests/visual-editor` passes
- `npm run build` completes successfully

That means the next round should be tight and intentional, not broad.

## Remaining Issues That Matter

### 1. Rich-text persistence is writing the wrong side field

The new rich-text slot writes back to `htmlPath`, for example:

- `content.bodyHtml`
- `content.answerHtml`
- `content.narrativeHtml`

But the existing built-in editors do not treat those `*Html` fields as canonical write targets.

The form editor continues to write:

- `content.bodyRichText`
- `content.answerRichText`
- `content.narrativeRichText`

This is the most important remaining contract issue.

The visual editor must stop inventing shadow `*Html` persistence behavior and must align to the existing editor contract.

### 2. `WhyThisApproachSection` is still incomplete

The section still renders its main body as raw `dangerouslySetInnerHTML` and has not adopted the new rich-text slot.

This is a visible parity miss because the shell looks finished but the main editorial body is still a dead surface.

### 3. Booking flow internals are still mostly outside the visual editor

The top section title/subtitle are wired, but the actual booking experience still leaves important copy uneditable:

- `formHeading`
- submit button label
- intake field labels
- intake field placeholder/help text
- calendar-step confirmation copy
- success-step heading and body copy

This is still below the product bar because the booking section is not just a decorative block. It is an interaction surface.

### 4. A few metadata and helper surfaces are still incomplete

These are smaller than the booking and rich-text issues, but they are still real:

- footer subscribe placeholder is still raw
- social-proof logos still do not expose destination-link editing
- image-backed social-proof/logo surfaces still do not expose hidden metadata editing cleanly
- header nav link editing updates `href`, but the `anchorId`-based active-state path is still at risk of drift

### 5. One or two content modes still render joined strings instead of editable item surfaces

The clearest example is `WhatIDeliverSection` block-mode `youGet.join(" · ")`.

The field data is now represented in the editor, but the rendered block-mode output still collapses multiple values into one non-direct surface.

## Release Read

Current status:

- strong incremental progress
- acceptable for continued internal iteration
- not yet the final “elite” bar

v7 should be treated as the last-mile stabilization pass.
