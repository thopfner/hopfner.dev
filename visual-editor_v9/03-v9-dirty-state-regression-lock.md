# v9 Dirty-State Regression Lock

The dirty-state fix appears materially improved in code.

v9 should lock that in with explicit regression coverage.

## Current read

The implementation now has:

- a field-level no-op guard
- a draft-level semantic equality guard

That is the correct direction.

## Remaining problem

This behavior is still under-tested relative to its importance.

There is not enough direct regression coverage for:

- click in / click out without change
- change then revert back to original
- selection change after a no-op edit

## Required work

### 1. Add direct tests for no-op editing

Add tests that specifically verify:

- opening a text field and blurring without edits does not dirty the section
- opening a link field and closing it without edits does not dirty the section
- opening a rich-text field and cancelling without edits does not dirty the section

### 2. Add revert-to-original tests

Verify:

- edit field
- change value
- restore exact original value
- dirty state clears

### 3. Add selection-handoff tests

Verify:

- no-op edit does not trigger save/discard prompt on section switch
- actual edit still does trigger the prompt

## File touchpoints

- `tests/visual-editor/v4-inplace-editing.test.ts`
- `tests/visual-editor/store-and-reorder.test.ts`
- add a new focused test file if that is clearer than overloading the existing ones

## Product rule

This is not optional polish.

Dirty-state trust is core product behavior.
