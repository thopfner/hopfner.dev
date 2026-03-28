# 04 QA And Acceptance

This is the release gate for the in-place editing work.

## QA Questions The Build Must Pass

### Truthfulness

- does the text become editable where it actually renders
- does the edited field keep the same visual footprint and typography
- does the CTA label edit on the CTA itself
- does CTA destination editing stay attached to that CTA

### State Correctness

- does in-place editing update the same dirty draft the inspector uses
- does the inspector reflect the change immediately
- does save/publish persist the same payload paths as before
- does cancel leave the draft unchanged

### Interaction Stability

- can the user edit without triggering section drag
- can the user edit without spacing handles stealing pointer events
- do keyboard shortcuts behave correctly
- does focus move cleanly between fields

## Required Test Coverage

### Unit/Component Tests

- slot component renders plain text without provider
- slot component enters edit mode with provider
- commit updates correct field path
- cancel restores original value
- multiline autosize behavior
- CTA link popover updates correct href path
- section-level drag is disabled during field edit

### Integration Tests

Use representative built-ins:

- hero
- card grid
- steps
- FAQ
- CTA block

Required flows:

- edit title in place
- edit subtitle in place
- edit CTA label in place
- edit CTA href from anchored popover
- edit repeater text field in place
- save draft after inline edits
- publish after inline edits

## Manual Browser QA

Run authenticated QA on real pages that include:

- local sections only
- local plus global sections
- at least one page with card/step/FAQ repeaters

Manual checks:

- click visible title and edit in place
- edit subtitle in place
- edit CTA label on the actual CTA
- open CTA destination popover from the CTA
- confirm inspector mirrors the change
- save and reload page
- publish and confirm preview still matches frontend behavior

## Failure Conditions

Do not approve if any of these remain true:

- text editing still happens in a bottom bar or detached panel
- link editing still requires hunting in the inspector
- input styling visibly breaks the section layout while editing
- array-item editing only works in inspector
- editing a field causes accidental section selection or drag conflicts

## Final Acceptance Standard

Approve only if all are true:

1. `In-place`
   The user edits the actual visible text in its actual location.

2. `Linked`
   CTA label and destination are editable from the CTA itself.

3. `Truthful`
   The canvas still uses the same section rendering logic and stored payload paths.

4. `Stable`
   Editing does not fight drag, selection, spacing handles, save, or publish.
