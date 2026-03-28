# Phase 3: Workspace Pages Unification

## Goal

Bring the heavy editor routes onto a more coherent premium workspace model.

## In Scope

1. `/admin/pages/[pageId]`
2. `/admin/pages/[pageId]/visual`
3. `/admin/section-library`
4. `/admin/global-sections`
5. `/admin/email-templates`

## Files To Change, In Order

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/visual-editor/page-visual-editor.tsx`
3. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
4. `app/admin/(protected)/section-library/page-client.tsx`
5. `app/admin/(protected)/global-sections/page-client.tsx`
6. `app/admin/(protected)/email-templates/page-client.tsx`

## Required Work

### 1. Align Page Editor And Visual Editor As Two Modes Of One Workspace

The page editor and visual editor should feel like sibling workspaces, not unrelated screens.

Required improvements:

1. clearer persistent page identity
2. clearer action/status zone
3. stronger distinction between primary editing surface and secondary settings
4. reduced visual noise from repeated equal-weight panels

Do not change editor behavior.

### 2. Productize Section Library And Global Sections

These routes are powerful but too dense.

Required improvements:

1. clearer mode separation
2. clearer primary vs secondary surfaces
3. better organization of controls
4. reduced “internal tool” feel

Do not remove advanced capabilities.
Reorganize them.

### 3. Bring Email Templates Up To Workspace Standard

This route should stop feeling like a raw admin form.

Without changing its underlying logic:

1. move it onto the shared workspace scaffold
2. establish a stable left-rail / editor / preview hierarchy
3. create a persistent action zone for save/publish
4. make branding mode feel like part of the same product

## Special Caution

The visual editor already has strong product quality.
This phase should align it with the admin system, not flatten it.

## Hard Gate

Do not proceed to the final polish phase until:

1. workspace pages have a visibly coherent structure
2. email templates no longer feels like a one-off screen
3. page editor and visual editor feel like related tools
4. build passes
