# Visual Editor v21

## Scope

This batch fixes one implementation mistake only:

1. visual-editor section chrome is rendered in the wrong coordinate space

The current chrome is already passed through `chromeSlot`, but it is still mounted as an unscaled sibling of the scaled preview surface. That is why the pill still reads like a separate row.

In scope:

1. move section chrome into the same scaled preview surface as the section itself
2. keep the chip fully overlayed on the section surface
3. keep actions fully overlayed on the section surface
4. prove the exact mount point and rendered behavior

Out of scope:

1. new features
2. padding token changes
3. frontend renderer changes
4. footer work

## Hard Rules

1. Do not change `paddingY`, `spacingTop`, `spacingBottom`, or `outerSpacing`.
2. Do not tweak `top-2` / `left-2` values and call it fixed.
3. Do not keep `chromeSlot` rendered outside the scaled preview surface.
4. Do not leave chrome in a different coordinate space from the content it overlays.
5. Do not mark complete until the chip is visually sitting on the section itself in the live editor.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-exact-root-cause.md`.
3. Execute `02-exact-fix-steps.md`.
4. Finish with `03-proof-and-qa-gates.md`.

## Definition Of Done

This batch is complete only if all of the following are true:

1. `chromeSlot` is rendered inside the scaled preview surface wrapper
2. the section-type pill and actions are in the same coordinate space as the preview content
3. the pill no longer reads like a separate top row
4. the false gap effect is gone on real sections like `Card Grid` and `Social Proof Strip`
5. rendered tests prove the new mount point
6. `npm test -- tests/visual-editor` passes
7. `npm run build` passes
