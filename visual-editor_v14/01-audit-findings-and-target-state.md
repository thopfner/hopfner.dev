# Audit Findings And Target State

## Issue List

1. plain-text editing still uses two architectures
2. page settings are editable but not fully preview-truthful before save
3. composed-section editor wiring is still partial for links and media
4. preview link suppression is likely click-safe but not fully keyboard-safe
5. recent proof tests are still too weak in the newest touched areas

## Why Each Issue Exists

### 1. Plain-text editing still uses two architectures

The current `EditableTextSlot` branches between an anchored overlay path for multiline or large-tag text and a separate inline replacement path for smaller text. This creates inconsistent behavior, sizing, focus handling, and user confidence across the canvas.

### 2. Page settings are editable but not fully preview-truthful before save

The page panel maintains local draft state, but the canvas still renders from the base page state loaded into the visual editor. That means page-level settings behave more like a save form than a true visual editor.

### 3. Composed-section editor wiring is still partial for links and media

The visual editor now mounts the shared composer editor, but the surrounding resource wiring is incomplete. Link resources are still stubbed and custom image-library opening is still not wired through the real media flow.

### 4. Preview link suppression is likely click-safe but not fully keyboard-safe

The preview guard was added at the section-preview layer, but the current protection is shaped around pointer interaction. If keyboard activation can still trigger anchors, the editor is not interaction-safe.

### 5. Recent proof tests are still too weak in the newest touched areas

Several newer tests still rely on source inspection or shallow import coverage. That is not sufficient evidence for UI behavior in a product where interaction correctness is now the main risk area.

## Required Direction

1. unify all plain-text editing behind one overlay controller and remove the inline replacement branch
2. push unsaved page draft values into the live preview path without changing canonical persistence
3. reuse the real form-editor link/media infrastructure for composed sections instead of local stubs
4. make preview anchors inert for both pointer and keyboard activation at the preview boundary
5. replace weak tests with behavior tests focused on the touched surfaces

## Files Expected To Change

1. `components/landing/editable-text-slot.tsx`
2. `components/landing/visual-editing-context.tsx`
3. `components/admin/visual-editor/use-page-settings-actions.ts`
4. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
5. `components/admin/visual-editor/page-visual-editor.tsx`
6. `components/admin/visual-editor/page-visual-editor-canvas.tsx`
7. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
8. `components/admin/section-preview.tsx`
9. `tests/visual-editor/*` in the touched areas

## Source Workflows To Reuse

1. plain-text editing state flow from the current `visual-editing-context` dirty/no-op protections
2. page field save behavior from the existing visual-editor page settings path and the canonical form-editor page save contract
3. link resource behavior from the current section-editor resource loaders and link field workflows
4. media-library behavior from the current MUI-based media picker/modal stack already used elsewhere in admin

## Stop Condition If Assumptions Break

Stop and report if any of the following is true:

1. the existing composed-section editor cannot accept the real link/media resource props without a deeper schema or component contract change
2. page-level draft preview cannot be threaded into the canvas without destabilizing the current section draft model
3. removing the inline plain-text editor would break a field type that is not actually plain text
