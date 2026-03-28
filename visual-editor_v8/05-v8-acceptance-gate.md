# v8 Acceptance Gate

This is the approval bar for the next pass.

## Required QA For The Two Core UX Fixes

### Large-text edit proof

Verify on a long hero headline or large paragraph:

- open edit mode
- entire editable content is visible
- the text area is large enough to edit comfortably
- line wrapping remains understandable

### False-dirty proof

Verify:

- click into a text field
- click out without changing anything
- no unsaved state is created
- no save/discard prompt appears when navigating away

Also verify:

- change text
- revert exactly back to original
- dirty state clears

## Required QA For Shell Upgrades

Verify:

- page chooser can switch pages cleanly
- structure rail shows section titles first
- structure search works on long pages
- save status remains clear after shell changes

## Technical Checks

Run and report:

1. `npm test -- tests/visual-editor`
2. `npm run build`

## Product Decision Rule

Approve v8 only if:

- the two core UX complaints are clearly solved
- the structure/navigation shell feels more editor-friendly
- the visual editor feels meaningfully closer to a polished SaaS product even when idle
