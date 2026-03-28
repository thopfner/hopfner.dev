# Phase 3: Card Grid, Social Proof Strip, And Label Value List Parity

## Goal

Close the advanced nested-content parity gaps for the sections that still rely on richer per-item editors in the form editor.

## Target Sections

1. `card_grid`
2. `social_proof_strip`
3. `label_value_list`

## Exact Work By Section

### `card_grid`

Bring the following to parity:

1. per-card image picker/upload/library workflow
2. per-card alt text
3. per-card image width
4. rich text body editing
5. `youGet` items
6. `bestFor` / `bestForList`
7. default card-field visibility controls
8. per-card field visibility controls
9. list/block display modes where the form editor exposes them

This is the most complex phase. Finish it cleanly or stop and report.

### `social_proof_strip`

Bring logo media workflow to parity:

1. image picker/upload/library
2. existing logo metadata continues to work

Reordering is already present in the visual array editor and does not need reinventing.

### `label_value_list`

Bring `compact mode` to parity.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
2. any shared media/item-row helpers established in Phase 1
3. targeted tests

## What Must Not Change

1. do not rebuild the whole content panel architecture
2. do not fork image/media logic unnecessarily
3. do not leave `card_grid` half-complete if this phase is marked done

## Gate

Do not proceed to Phase 4 until:

1. `card_grid` advanced item controls are truly present
2. social-proof logo media workflow is present
3. label-value compact mode is present
4. tests and build pass
