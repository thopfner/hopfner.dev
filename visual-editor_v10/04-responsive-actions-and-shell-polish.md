# Phase 3: Responsive Actions And Shell Polish

Do not start this phase until Gate 2 passes.

## Goal

Make save/publish actions visible and usable from the shell at constrained widths without creating a second inconsistent persistence path.

## Files To Change, In Order

1. Create a shared selected-section action hook or utility
2. Update `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
3. Update `components/admin/visual-editor/page-visual-editor-inspector.tsx`
4. Update `components/admin/visual-editor/page-visual-editor.tsx` only if store/context exposure is required
5. Add targeted tests under `tests/visual-editor`

## Step-By-Step Implementation

### Step 1. Extract shared selected-section action logic

Create one shared action path for:

- save selected section draft
- publish selected section
- discard selected section dirty state
- reflect save/publish status consistently

Do not let toolbar and inspector each invent their own persistence flow.

Recommended location:
- `components/admin/visual-editor/use-selected-section-actions.ts`

It must reuse the existing persistence adapter and store state. Do not fork the save/publish contract.

### Step 2. Add primary actions to the toolbar

Update:
- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`

Required behavior when a section is selected:

- show section title first
- show section type second
- show dirty/published status
- show `Save draft`
- show `Publish`
- show `Discard` only when dirty

These actions must remain visible at narrower shell widths.

### Step 3. Make toolbar responsive on purpose

Required layout behavior:

- wide widths: all controls visible in one composed shell
- medium widths: secondary metadata compresses before primary actions
- narrower widths: toolbar may wrap to two rows, but primary actions must stay visible

Demote before hiding:

1. slug text
2. form-editor shortcut
3. non-critical status copy

Do not demote:

1. page chooser
2. selected section context
3. save/publish/discard actions

### Step 4. Keep inspector actions, but make them secondary

Update:
- `components/admin/visual-editor/page-visual-editor-inspector.tsx`

Required changes:

- inspector continues to expose section-local actions
- inspector must use the same shared action hook/path as the toolbar
- inspector and toolbar labels should stay aligned

### Step 5. Shell polish in the same pass

While touching the toolbar:

- strengthen chooser open-state trigger styling
- keep action/status chip language consistent
- do not let the toolbar degrade into unreadable clutter

## Gate 3: Must Pass Before Final QA

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
```

Manual QA required:

1. Open the visual editor at wide desktop width.
2. Narrow the admin window.
3. Confirm save/publish remain visible.
4. Select a dirty section and save it from the toolbar.
5. Select a different dirty section and publish it from the toolbar.
6. Confirm inspector actions still work and use the same behavior.

If primary actions disappear or become ambiguous, stop here and fix before final QA.
