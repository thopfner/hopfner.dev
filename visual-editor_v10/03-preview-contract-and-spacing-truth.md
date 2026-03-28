# Phase 2: Preview Contract And Spacing Truth

Do not start this phase until Gate 1 passes.

## Goal

Make the visual preview consume the same wrapper/container logic as the public renderer so that spacing controls become truthful.

## Files To Change, In Order

1. Create `lib/cms/section-container-props.ts`
2. Refactor `app/(marketing)/[slug]/page.tsx` to use the extracted helper
3. Update `components/admin/section-preview.tsx` to use the same helper
4. Update `components/admin/visual-editor/page-visual-editor-node.tsx` only if new helper inputs must be threaded through
5. Update `components/admin/visual-editor/page-visual-editor-spacing-handles.tsx` only after wrapper parity is in place
6. Add targeted tests under `tests/visual-editor`

## Step-By-Step Implementation

### Step 1. Extract the public wrapper/container helper

Create:
- `lib/cms/section-container-props.ts`

Move the existing wrapper/container logic out of:
- `app/(marketing)/[slug]/page.tsx`

The helper must produce the same public-render output for:

- `sectionClassName`
- `containerClassName`
- `sectionStyle`
- `containerStyle`
- `panelStyle` if needed
- `sectionId`

The extracted helper must remain public-render truth, not an admin-only approximation.

### Step 2. Rewire the public renderer to the helper

Update:
- `app/(marketing)/[slug]/page.tsx`

Rule:

This is a zero-behavior-change refactor. Output before and after must match.

### Step 3. Rewire `SectionPreview` to the helper

Update:
- `components/admin/section-preview.tsx`

Required changes:

- stop using a partial wrapper model
- pass the already-merged formatting object into the shared helper
- apply the resulting section/container classes and styles in the preview
- preserve current visual-editing provider behavior

### Step 4. Verify `paddingY` now renders in preview

After Step 3, verify that `paddingY` changes now affect the preview without changing the handle logic.

Only if this is true, continue.

### Step 5. Clean up spacing-handle semantics

Update:
- `components/admin/visual-editor/page-visual-editor-spacing-handles.tsx`

Required changes:

- keep current token-snapped behavior
- update preview label copy so it is explicit
  - example: `Section padding: py-10`
- do not expand this control into generic top/bottom spacing editing in this batch unless parity is already proven and time remains

### Step 6. Add parity tests before moving on

Add or extend tests for:

- shared helper parity between public renderer and admin preview
- preview wrapper applies `paddingY`
- preview wrapper applies `spacingTop`, `spacingBottom`, `outerSpacing`
- preview wrapper preserves `maxWidth`, alignment, and custom classes

## Gate 2: Must Pass Before Phase 3

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
```

Manual QA required:

1. Open a section with visible vertical padding.
2. Drag the spacing handle through at least three token states.
3. Confirm the visual preview changes while dragging.
4. Save draft.
5. Publish.
6. Confirm the public page matches the visual preview result.

If preview and frontend do not match, stop here and fix parity before Phase 3.
