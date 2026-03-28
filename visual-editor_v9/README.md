# Visual Editor v9 Display-Text Refinement Brief

This bundle is the next focused action plan for the admin visual editor.

The latest implementation made real progress:

- large display text now uses an overlay editor path
- the false dirty-state issue is materially improved
- the shell is better
- section titles and search are present
- page chooser is present
- tests and build are green

The next round should not reopen broad editor architecture.

It should finish the authoring feel of the display-text overlay and harden the new behavior with proper regression coverage.

## Main Decision

The user’s suggestion is valid:

for very large heading/display text, the edit-mode typography should be reduced relative to the live rendered typography.

That is now the recommended v9 direction.

Not as a blanket rule for all text.

As a deliberate edit-mode treatment for oversized display text.

## Files In This Bundle

- `01-v9-qa-read-and-priority.md`
- `02-v9-display-text-overlay-refinement.md`
- `03-v9-dirty-state-regression-lock.md`
- `04-v9-elite-polish-additions.md`
- `05-v9-acceptance-gate.md`
