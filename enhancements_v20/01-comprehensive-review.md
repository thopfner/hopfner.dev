# Comprehensive Review

This review is based on the current server code in `/var/www/html/hopfner.dev-main` on `2026-03-09`.

## Findings

### 1. The shell still puts styling before content

Severity: `P1`

Files:

- `components/admin/section-editor/section-editor-drawer-shell.tsx:352`
- `components/admin/section-editor/section-editor-drawer-shell.tsx:367`
- `components/admin/section-editor/section-editor-drawer-shell.tsx:381`

What is true now:

- the shell renders `CommonFieldsPanel`
- then it renders `FormattingControls`
- only after that does it render `ContentEditorRouter`

Why this is wrong:

- the user edits section content more often than semantic styling controls
- the current stack forces the editor to read presentation controls before the actual section inputs
- this makes the drawer feel assembled over time instead of intentionally structured

Required change:

- reorder the left-column shell so section content appears before layout/styling controls

### 2. Built-in subtitle truth is structurally unsafe

Severity: `P1`

Files:

- `app/(marketing)/[slug]/page.tsx:737`
- `app/(marketing)/[slug]/page.tsx:763`
- `app/(marketing)/[slug]/page.tsx:785`
- `app/(marketing)/[slug]/page.tsx:822`
- `app/(marketing)/[slug]/page.tsx:842`
- `app/(marketing)/[slug]/page.tsx:965`
- `app/(marketing)/[slug]/page.tsx:1002`
- `app/(marketing)/[slug]/page.tsx:1026`
- `components/admin/section-editor/section-editor-drawer-shell.tsx:141`
- `components/admin/section-editor/common-fields-panel.tsx:61`

What is true now:

- many built-in renderers consume `content.subtitle || version.subtitle`
- the shared subtitle input is rendered only if `capabilities.fields.subtitle !== false`
- none of the built-in editors expose a section-local `content.subtitle` field

Why this is fragile:

- if subtitle is hidden by capability metadata, the live section can still render a subtitle with no corresponding input
- if existing data lives in `content.subtitle`, the shared `meta.subtitle` input is not a truthful editor for the actual rendered value
- this is exactly the class of problem the user reported on `card_grid`

Required change:

- establish a code-owned built-in meta-field contract for shared fields
- normalize built-in subtitle editing to one canonical editor path
- do not allow DB capability rows alone to hide renderer-backed shared fields for built-in section types

### 3. Several live renderer-backed fields still have no editor control

Severity: `P1`

Confirmed gaps:

- `card_grid`
  - live renderer consumes section-level `content.cardDisplay` defaults at `app/(marketing)/[slug]/page.tsx:699`
  - the editor reads `content.cardDisplay` in `components/admin/section-editor/editors/card-grid-editor.tsx:201`
  - but there is no UI to edit those global defaults
- `card_grid`
  - live renderer consumes `cards[].image.alt` at `app/(marketing)/[slug]/page.tsx:706`
  - the row editor only exposes image URL and width at `components/admin/section-editor/editors/card-grid-row.tsx:275`
  - there is no alt-text input
- `faq_list`
  - live renderer consumes `content.eyebrow` at `app/(marketing)/[slug]/page.tsx:843`
  - the editor file `components/admin/section-editor/editors/faq-list-editor.tsx:23` only renders items, questions, and answers
  - there is no eyebrow input
- `rich_text_block`
  - live renderer consumes `content.eyebrow` at `app/(marketing)/[slug]/page.tsx:802`
  - the editor file `components/admin/section-editor/editors/rich-text-block-editor.tsx:7` only renders the rich-text body
  - there is no eyebrow input
- `nav_links`
  - live renderer consumes `links[].anchorId` at `app/(marketing)/[slug]/page.tsx:398`
  - the editor creates `anchorId` in new link objects at `components/admin/section-editor/editors/nav-links-editor.tsx:156`
  - but the visible UI only edits `label` and `href` at `components/admin/section-editor/editors/nav-links-editor.tsx:186`
  - there is no anchor-target control or automatic `anchorId` sync
- `social_proof_strip`
  - live renderer consumes `logos[].href` at `app/(marketing)/[slug]/page.tsx:950`
  - the editor exposes label, image URL, and alt text at `components/admin/section-editor/editors/social-proof-strip-editor.tsx:122`
  - there is no href/link input
- `case_study_split`
  - live renderer prefers `content.narrativeRichText` at `app/(marketing)/[slug]/page.tsx:1013`
  - the editor only exposes plain `content.narrative` at `components/admin/section-editor/editors/case-study-split-editor.tsx:26`
  - there is no rich-text narrative editor

### 4. The internal order of most editors is still backwards

Severity: `P2`

Examples:

- `hero_cta`
  - `Hero layout` appears before actual copy/content at `components/admin/section-editor/editors/hero-cta-editor.tsx:200`
- `card_grid`
  - `Section variant`, `Columns`, and `Card tone` appear before eyebrow and cards at `components/admin/section-editor/editors/card-grid-editor.tsx:205`
- `steps_list`
  - `Layout variant` appears before eyebrow and steps at `components/admin/section-editor/editors/steps-list-editor.tsx:33`
- `title_body_list`
  - `Layout variant` appears before eyebrow and items at `components/admin/section-editor/editors/title-body-list-editor.tsx:33`
- `label_value_list`
  - `Layout variant` and `Compact mode` appear before items at `components/admin/section-editor/editors/label-value-list-editor.tsx:38`
- `cta_block`
  - `Layout variant` appears before body content at `components/admin/section-editor/editors/cta-block-editor.tsx:23`
- `social_proof_strip`
  - `Layout variant` appears before logos and badges at `components/admin/section-editor/editors/social-proof-strip-editor.tsx:64`

Why this matters:

- even when all fields exist, the panel still feels illogical
- the user has to scan past controls that affect presentation before reaching the main content fields they came to edit

## Strategic Conclusion

The correct v20 fix is not just "add a subtitle input."

It is:

1. reorder the shell
2. reorder the per-type editors
3. patch all renderer-backed field gaps
4. make shared built-in field visibility code-truthful so subtitle gaps do not recur
