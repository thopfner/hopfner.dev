# Urgent Fix Brief: Page Editor Drawer Does Not Support New Section Types Properly

## Problem Summary

The recent section-system upgrade added stronger layout patterns and new composed/custom block types, but the page-level admin editor drawer was not completed to the same level.

Current result:

- the frontend can render the new structures
- the section library can define the new composed blocks
- the main page editor drawer cannot fully edit those same structures

This creates a CMS integrity problem:

- editors can create or attach richer section types
- editors cannot reliably edit them later from the normal page workflow
- some content entered through the drawer is also downgraded before render

This is an urgent issue because it breaks the practical usability of the new section system.

## Highest Priority Findings

### 1. Page editor drawer lacks controls for newly added composed block types

Frontend support exists in:

- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

Section library schema authoring exists in:

- `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`

But the page editor drawer only exposes composed-block editing for a limited subset of block types in:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`

Observed gap:

- `heading`
- `subtitle`
- `rich_text`
- `image`
- `cards`
- `faq`
- `list`
- `cta`

are editable, but the new premium-oriented block types are not all exposed there.

Missing or incomplete page-drawer support must be added for:

- `logo_strip`
- `metrics_row`
- `badge_group`
- `proof_card`
- `testimonial`
- `media_panel`
- `workflow_diagram`
- `comparison`
- `stat_chip_row`

### 2. Composed rich text is being flattened

The page editor drawer stores richer content for custom composed blocks, but the frontend renderer still reads plain strings in several places.

This means:

- rich text formatting may be lost
- FAQ answers may be reduced to plain text
- custom block content can be less capable than the editor suggests

### 3. Admin page overview does not correctly account for composed-section publish behavior

Public rendering already treats active composed section types as renderable via schema fallback.

But:

- `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`

only checks section/global published version tables.

Impact:

- pages using composed sections can appear unpublished in admin even when they render publicly

## Required Outcome

The page-level section editor drawer must become the authoritative editing surface for all currently supported section content shapes that are meant to be managed there.

At minimum, after this fix:

- if the frontend can render a composed block type, the page drawer must expose inputs for it
- if the drawer exposes a rich editor, the frontend must render the stored rich content correctly
- if a section type is valid and renderable, admin overview must not incorrectly classify the page as unpublished

## Implementation Instructions

## Part 1: Complete page-drawer support for all composed block types

Target file:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`

Action:

Extend the `isCustomComposedType` editor path so every block type supported by `components/landing/composed-section.tsx` also has a matching editor UI in the page drawer.

Implement explicit editing controls for:

### `logo_strip`

Fields needed:

- optional section/block title
- repeatable `logos[]`
- each item should support:
  - `label`
  - `imageUrl`

Preferred editor pattern:

- repeatable card rows, not raw textarea-only parsing

### `metrics_row`

Fields needed:

- repeatable `metrics[]`
- each item should support:
  - `value`
  - `label`
  - optional `icon`

### `badge_group`

Fields needed:

- repeatable `badges[]`
- each item should support:
  - `text`
  - optional `icon`

### `proof_card`

Fields needed:

- `title`
- `body`
- repeatable `stats[]`
- each stat:
  - `value`
  - `label`

### `testimonial`

Fields needed:

- `quote`
- `author`
- `role`
- `imageUrl`

If avatar/image is supported by renderer, expose it cleanly in the drawer as well.

### `media_panel`

Fields needed:

- `title`
- `body`
- `imageUrl`

Use the same media picker pattern already used elsewhere in the drawer.

### `workflow_diagram`

Fields needed:

- `title`
- repeatable `flowSteps[]`
- each step:
  - `label`
  - optional `description`

### `comparison`

Fields needed:

- `beforeLabel`
- `afterLabel`
- repeatable `beforeItems[]`
- repeatable `afterItems[]`

### `stat_chip_row`

Fields needed:

- repeatable `stats[]`
- each stat:
  - `value`
  - `label`

Implementation note:

- prefer structured repeatable controls over newline-delimited textareas wherever feasible
- mirror the existing card/faq/step editing patterns already present in the drawer
- keep data shape aligned exactly with `composed-section.tsx`

## Part 2: Align drawer data shape with composed renderer

Target files:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

Action:

Audit every composed block type and ensure the drawer writes the exact shape the renderer expects.

Check specifically:

- `quote`, `author`, `role`, `imageUrl` for testimonial
- `logos[]` object shape
- `metrics[]` object shape
- `badges[]` object shape
- `flowSteps[]` object shape
- `stats[]` object shape

No silent shape drift is acceptable.

## Part 3: Restore rich-text parity for composed blocks

Target files:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

Action:

Where the page drawer uses TipTap JSON for composed custom blocks, the frontend renderer should also support that stored rich content rather than flattening everything to plain strings.

Priority cases:

- composed `rich_text`
- composed `faq` answers if rich content is stored

Recommended approach:

- follow the same sanitize/render pipeline already used in the main page renderer for built-in section types
- do not introduce a second inconsistent rich-text pipeline

Expected result:

- lists, links, emphasis, and paragraph structure survive from editor to frontend

## Part 4: Fix admin publish-state logic for composed sections

Target files:

- `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`

Action:

Reintroduce composed-section awareness into the admin overview logic so publish status matches actual public renderability.

Expected behavior:

- if a section type is active in `section_type_registry` and uses `renderer = 'composed'`, it should not be treated as unpublished solely because no traditional section version row exists

The overview should reflect the same rules the public renderer uses.

## Part 5: Validate custom section library and page drawer stay in sync

Target files:

- `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`
- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

Action:

Perform a parity pass:

- every block type creatable in Section Library must be editable in the page drawer
- every editable field in the page drawer must be renderable on the frontend
- every renderable field must either be editable in the page drawer or intentionally schema-only

If any field is intentionally schema-only, document that explicitly in code comments or internal docs.

## Suggested Execution Order

1. Add missing composed block editors in `section-editor-drawer.tsx`
2. Align saved content shape with `composed-section.tsx`
3. Add rich-text rendering parity for composed blocks
4. Fix admin overview publish-state logic
5. Run build and targeted admin workflow verification

## Required Verification

Run at minimum:

```bash
cd /var/www/html/hopfner.dev-main
npm run build
```

Then verify manually in admin:

1. Create or open a page containing a composed/custom section
2. Open the page-level editor drawer
3. Confirm each composed block type listed above is editable
4. Save draft
5. Restore draft
6. Publish
7. Reload page and confirm rendered output matches saved content
8. Confirm admin pages overview shows correct publish state

## Acceptance Criteria

- no composed block type supported by the frontend is missing from the page drawer
- no composed block field is saved in a shape the renderer does not understand
- rich text entered into composed blocks survives to the frontend
- admin publish-status reporting is correct for pages using composed sections
- project builds successfully after the fix

## Non-Goals

- do not redesign the entire section system
- do not replace the section library architecture
- do not introduce unrelated visual changes

This fix is about CMS/editor parity and operational correctness.
