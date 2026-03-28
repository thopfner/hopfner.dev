# Visual Editor v20

## Scope

This batch is a hyper-focused chrome-placement correction.

It exists to fix one problem completely:

1. the section-type pill and top-right actions still create the appearance of a fake row / fake gap above each section

In scope:

1. identify the true visual surface that section chrome should anchor to
2. move the section-type pill and actions onto that surface
3. remove the current boundary-straddling implementation that is still visually wrong
4. add proof and QA that specifically cover this regression

Out of scope:

1. any new visual-editor features
2. changes to public frontend rendering
3. page-footer work unless it is required by a touched test helper
4. unrelated inspector or composer work

## Hard Rules

1. Do not solve this by nudging the current `top-0` / `-translate-y-1/2` chrome a few pixels.
2. Do not solve this by changing real section spacing or padding tokens.
3. Do not keep chrome anchored to the outer node wrapper if that wrapper is not the true visual surface.
4. Do not let the preview host paint a synthetic band that the user reads as real section spacing.
5. Do not proceed unless the selected `Card Grid` / `Social Proof Strip` style case is visually correct.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-root-cause-and-target-fix.md`.
3. Execute `02-exact-implementation-sequence.md`.
4. Finish with `03-proof-and-qa-gates.md`.

## Definition Of Done

This batch is complete only if all of the following are true:

1. the section-type pill reads as a minimal overlay on the section surface
2. the top-right actions also read as overlay chrome, not a separate row
3. there is no false blank band above selected or hovered sections
4. the fix is structural, not a temporary offset tweak
5. the regression is covered by rendered proof and manual visual QA
6. `npm test -- tests/visual-editor` passes
7. `npm run build` passes
