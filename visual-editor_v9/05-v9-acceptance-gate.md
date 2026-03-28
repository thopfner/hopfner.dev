# v9 Acceptance Gate

This is the approval bar for the next pass.

## Required QA

### Display-text proof

Verify on a large hero/display heading:

- open edit mode
- top of text is immediately visible
- whole text block is readable without feeling cramped
- edit-mode font size is intentionally reduced for comfort
- overlay still feels visually connected to the original heading

### Dirty-state proof

Verify:

- click into text
- click out unchanged
- no unsaved state
- no save/discard prompt on navigation

Also verify:

- change value
- revert to exact original
- dirty state clears

### Shell proof

Verify:

- structure rail still shows title-first outline
- page chooser still works
- no regressions in section switching

## Technical checks

Run and report:

1. `npm test -- tests/visual-editor`
2. `npm run build`

## Approval rule

Approve v9 only if:

- the large-text edit experience now feels comfortable
- the user’s “last couple words” complaint is clearly resolved
- no-op edits never create false save/discard prompts
- the recent shell improvements remain intact
