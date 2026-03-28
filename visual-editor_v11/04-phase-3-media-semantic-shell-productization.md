# Phase 3: Media, Semantic Controls, And Shell Productization

## Goal

Remove the remaining internal-tool feel and close the highest-value authoring gaps without touching the public renderer.

Required outcomes:

1. Common media workflows work inside the visual editor.
2. The inspector becomes semantic-first and advanced-second.
3. The shell becomes more obviously production-grade on smaller screens and dense pages.

## Files To Change, In Order

1. `components/admin/section-editor/use-section-editor-resources.ts`
2. `components/media-library-modal.tsx`
3. `lib/media/upload.ts`
4. `components/admin/visual-editor/page-visual-editor-media-field.tsx`
5. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
6. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
7. `components/admin/visual-editor/page-visual-editor-structure.tsx`
8. `components/admin/visual-editor/page-visual-editor-node.tsx`
9. `components/landing/editable-rich-text-slot.tsx`
10. `tests/visual-editor/...` relevant new or existing files

## Step-By-Step Implementation

1. Reuse the current media upload and media-library paths from the form editor. Do not invent new upload behavior.
2. Add visual-editor media fields for the highest-value cases first:
   1. page backdrop image
   2. section background media
   3. primary section image fields already represented in built-in section content
3. Every media field must support:
   1. choose from library
   2. upload
   3. paste URL when the current CMS contract already allows URL storage
   4. clear value
4. Reorganize the visual inspector so semantic controls come first.
5. Required inspector order:
   1. Content
   2. Actions
   3. Preset
   4. Style
   5. Layout
   6. Advanced
6. In `Style` and `Layout`, show human-meaningful labels first. Keep token-level or class-level controls under `Advanced`.
7. Do not remove raw control compatibility. Hide it behind advanced disclosure rather than making it the default path.
8. Strengthen the structure rail so it supports faster scanning:
   1. title first
   2. type second
   3. clearer draft/published/dirty indicators
   4. visible quick actions for insert and duplicate when selected or hovered
9. Make sure primary save/publish actions remain visible on narrower widths. If the toolbar wraps, add a sticky action treatment rather than allowing the primary actions to disappear below the fold.
10. Improve rich-text ergonomics only if it does not change persistence semantics. Do not rewrite the rich-text model in this phase.

## Required Behavior

1. A user can replace common media without leaving the visual editor.
2. The first visible controls match author intent rather than implementation detail.
3. Save and publish remain easy to reach across tested widths.
4. The structure rail provides enough information to scan a long page quickly.

## What Must Not Change In This Phase

1. Do not add collaboration or comments.
2. Do not add AI generation.
3. Do not redesign the entire visual-editor shell.
4. Do not break existing text, link, or spacing editing.

## Gate For Moving Forward

Do not mark this phase complete until all of the following pass:

1. Page and section media workflows work inside the visual editor.
2. The inspector defaults to semantic-first presentation.
3. Advanced controls still expose the low-level compatibility fields.
4. Primary save/publish actions remain visible and usable across supported widths.
5. Targeted visual-editor tests for media and responsive shell behavior pass.
