# Phase 1: Cross-Cutting Formatting And Editor Primitives

## Goal

Close the global parity gaps that affect many section types before touching more section-specific content.

## Target Gaps

1. `F1` preset selector does not actually apply preset tokens
2. `F2` missing `pb-24`
3. `F3` inner shadow precision mismatch
4. shared visual-editor primitives needed by later content phases:
   - structured link picker reuse instead of raw URL-only fields where applicable
   - reusable image/media field workflow parity where the visual editor still uses plain text inputs

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
2. any small shared helper needed to apply presets the same way as the form editor
3. the smallest visual-editor content helper files needed for later phases
4. targeted tests

## Exact Work

1. Make the visual preset selector apply the same presentation/component tokens that the form editor applies.
2. Add `pb-24` to the visual editor bottom spacing options.
3. Match the form editor inner shadow slider precision.
4. Extract or reuse shared primitives for:
   - structured link selection
   - image/media selection
5. Do not yet wire these primitives into every section. Just create the parity-safe shared path so later phases can reuse it.

## What Must Not Change

1. do not widen into broad shell changes
2. do not rewrite the form editor
3. do not change CMS persistence

## Gate

Do not proceed to Phase 2 until:

1. presets truly apply in the visual editor
2. `pb-24` exists in visual editor
3. inner shadow precision matches form editor
4. the shared link/media primitives for later phases exist or the exact reuse path is established
5. tests and build pass
