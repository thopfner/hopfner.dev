# Fine Tuning v1: Consistent Card Height Within Sections

## Objective

Make cards within the same structured section render at consistent height on desktop/tablet multi-column layouts.

This applies to sections like:

- `Core Outcomes`
- `Services` / `Service Snapshot`
- future pricing grids
- future comparison-style offer grids

This does **not** mean every card on the site must always be the same height.

Intentional variable-height layouts are acceptable for:

- bento grids
- editorial storytelling sections
- masonry-like content

But for the current `card_grid` comparison/service sections, the cards should be aligned.

---

## UI Position

For these sections, uneven heights are **not** elite UI.

When cards are meant to be compared side by side, equal heights usually look more premium because they create:

- a cleaner baseline
- stronger rhythm
- easier scanning
- more deliberate hierarchy

Right now the uneven heights make the section feel slightly unresolved.

---

## Current QA Evidence

Live DOM measurements from the public page show that the cards are still not equal height.

### `#service-snapshot`

Measured card heights:

- card 1: `469px`
- card 2: `446px`
- card 3: `469px`

### `#core-outcomes`

Measured card heights:

- card 1: `232px`
- card 2: `232px`
- card 3: `212px`

So this is a real frontend layout issue, not just a subjective visual impression.

---

## Important Diagnosis

The source file already appears to include `h-full` on the cards in:

- `components/landing/what-i-deliver-section.tsx`

But the live DOM class list on `https://hopfner.dev/home` does **not** show `h-full` on the rendered cards.

That strongly suggests one of these is true:

1. the supposed fix was not actually deployed to the running site
2. the site is serving an older build
3. the production process was not restarted after the code change

So the first task is not styling.
The first task is to confirm the live site is serving the intended code.

---

## Non-Negotiable Rule

Do **not** solve this with fixed pixel heights.

Do **not** use arbitrary `min-h-[420px]` style hacks as the primary solution.

Equal card height in these sections must come from layout structure:

- stretched grid item
- full-height card root
- flex column inside the card
- bottom content anchored with layout, not by chance

---

## Required Implementation

## Step 1: Confirm the live app is serving the actual code

Before changing the renderer again:

1. inspect the live DOM for `#service-snapshot [data-slot=card]`
2. inspect the live DOM for `#core-outcomes [data-slot=card]`
3. confirm whether `h-full` or equivalent equal-height class is present on the card root

If the source contains the class but the live DOM does not:

- rebuild the production app
- restart the process that serves `hopfner.dev`
- verify the live DOM again before making more code changes

This must be treated as a release/deployment verification step, not as an optional cleanup.

---

## Step 2: Enforce equal-height at the wrapper level

In `components/landing/what-i-deliver-section.tsx`, do not rely on card height alone.

The direct grid item wrapper created by `StaggerItem` must explicitly stretch.

Required behavior:

- grid item wrapper participates as a stretched grid item
- wrapper becomes a flex container
- card fills that wrapper

Implementation intent:

- `StaggerItem` for card-grid items should use something equivalent to:
  - `className="flex self-stretch"`

If needed, include:

- `h-full`
- `min-h-full`

But the important part is:

- the wrapper must stretch to the row height
- the card must be able to fill it

Do not leave the motion wrapper as a passive block wrapper and assume the child card will sort itself out.

---

## Step 3: Make the card root fill the wrapper

For both branches in `WhatIDeliverSection`:

- service-family cards
- default/other-family cards

the card root must explicitly fill the wrapper and remain a vertical flex layout.

Required behavior:

- card root fills available wrapper height
- card uses `flex-col`
- card can distribute content top-to-bottom predictably

Implementation intent:

- card root should use something equivalent to:
  - `className="flex h-full min-h-full flex-col"`

This must apply to:

- service-family branch around the service card
- default card branch around the standard card

---

## Step 4: Separate top content from bottom detail area

Right now some cards become shorter because the internal content stacks are not consistently structured.

For structured comparison cards, the card should have a stable vertical layout:

1. top block
   - icon / tag / title / main body
2. bottom block
   - separators
   - `You get`
   - `Best for`
   - CTA if applicable later

Required behavior:

- the main descriptive content grows naturally
- the detail block sits at the bottom edge when present
- cards with shorter top copy do not collapse visually

Implementation intent:

- keep the main content container as `flex-1`
- move the details area into a bottom region using `mt-auto` or equivalent

For service-family cards specifically:

- the `CardContent` should remain `flex-1`
- the details block should be wrapped in a bottom-aligned container

For default cards:

- do not let the header area be the only flexible area by accident
- use a clear content wrapper that can grow, and a lower details wrapper that anchors bottom content consistently

---

## Step 5: Make grid sections explicitly stretch items

On the grid container itself, make the stretch behavior explicit.

For the `card_grid` layout in `WhatIDeliverSection`, the grid should use something equivalent to:

- `items-stretch`

This is defensive and makes the intent obvious.

Do not rely on default browser/grid behavior when this has already been missed twice.

---

## Step 6: Scope equal-height behavior correctly

Equal-height enforcement should apply to structured comparison grids, not everything.

Required scope:

- apply to `card_grid` sections like `Core Outcomes` and `Services`
- apply to future pricing/comparison grids

Do not force the same rule globally onto:

- bento layouts
- logo tiles if that creates visual distortion
- editorial custom blocks unless explicitly needed

If needed, make this behavior variant-aware.

---

## Files to Change

Primary file:

- `components/landing/what-i-deliver-section.tsx`

Possible supporting file if you want cleaner reuse:

- `components/landing/motion-primitives.tsx`

If you decide to make `StaggerItem` optionally stretch via a prop, that is acceptable.
If not, keep the equal-height wrapper logic local to `WhatIDeliverSection`.

---

## Do Not Accept These Fake Fixes

Do not mark this complete if any of the following are true:

1. the source has `h-full` but the live DOM still does not
2. the fix depends on hardcoded pixel `min-height` values
3. only one section is fixed while the other `card_grid` section still varies
4. mobile cards are forced to awkward tall heights
5. cards are visually equal only because content was shortened, not because the layout is correct

---

## Required QA

## Code QA

Confirm in source that:

- grid item wrappers explicitly stretch
- card roots explicitly fill wrappers
- content is laid out as a true vertical flex stack
- detail/footer areas are bottom-aligned where appropriate

## Live DOM QA

After deployment/restart, inspect:

- `#service-snapshot [data-slot=card]`
- `#core-outcomes [data-slot=card]`

Verify the live DOM now contains the intended equal-height classes.

## Visual QA

At desktop width, confirm:

- all cards in `Core Outcomes` have matching height
- all cards in `Services` have matching height
- top edges align
- bottom edges align
- separators/details sit consistently

## Measurement QA

Re-measure actual rendered heights in the browser.

Expected outcome:

- `Core Outcomes`: all three cards same height
- `Services`: all three cards same height

There should be no residual `20px+` mismatch.

## Responsive QA

On mobile single-column layouts:

- cards should return to natural height
- no giant empty lower areas
- no fixed-height artifacts

---

## Completion Standard

This fine-tuning round is complete only if:

1. the live site actually serves the new layout
2. cards within each structured comparison section align to the same height
3. the solution is layout-based, not hardcoded-height based
4. mobile rendering remains natural

That is the standard for this issue.
