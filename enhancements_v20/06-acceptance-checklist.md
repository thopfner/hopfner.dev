# Acceptance Checklist

## Batch 1 Gate

- Batch 1 changes are admin-only except for safe admin preview parity updates
- public frontend renderer behavior remains unchanged after Batch 1
- drawer order is improved without touching subtitle source precedence on the public site
- missing renderer-backed editor inputs are added

## Batch 2 Gate

- Batch 2 starts only after Batch 1 is stable
- Batch 2 is limited to subtitle/meta normalization and matching preview/live parity work
- subtitle source precedence is changed intentionally and verified, not incidentally as part of the layout pass

## Drawer Order

- `Version status` remains first
- shared title and subtitle fields appear before section-specific content
- section-specific content appears before formatting controls
- background media appears in the styling/presentation zone, not mixed into top-level copy fields
- `Version history` remains last

## Shared Meta Truth

- built-in shared field visibility is code-truthful
- built-in subtitle visibility does not depend solely on DB capability rows
- no built-in section has both a shared subtitle input and a duplicate local subtitle input
- existing legacy subtitle content still appears correctly after hydrate

Batch note:

- the first three bullets belong in Batch 1
- the last bullet must still be rechecked in Batch 2 after subtitle normalization

## Per-Type Coverage

- `hero_cta`: all current live fields remain editable
- `card_grid`: subtitle path is truthful; global `cardDisplay` is editable; image alt text is editable
- `steps_list`: subtitle path is truthful
- `title_body_list`: subtitle path is truthful
- `rich_text_block`: eyebrow is editable
- `label_value_list`: subtitle path is truthful
- `faq_list`: eyebrow is editable and subtitle path is truthful
- `cta_block`: current shared CTA behavior still works
- `footer_grid`: current card, legal, and subscribe behavior still works
- `nav_links`: anchor targeting works and remains compatible with `href`
- `social_proof_strip`: logo href is editable and subtitle path is truthful
- `proof_cluster`: subtitle and primary CTA are truthfully editable
- `case_study_split`: rich-text narrative is editable; subtitle and primary CTA are truthfully editable

## Layout Order Inside Editors

- built-in editors no longer lead with layout selectors unless the section has no primary content of its own
- repeaters and content blocks are visually above layout/display controls
- card field toggles are clearly separated from card copy fields

## Regression Protection

- `npm run build` passes
- public page renderer and admin preview still match for all built-in types
- recent drawer performance improvements are preserved
- recent preview-pane changes are preserved

Batch note:

- after Batch 1, public page output should be visually unchanged
- after Batch 2, subtitle behavior must match intentionally across drawer, preview, and public frontend

## Manual QA

For each built-in section type:

1. open the drawer
2. confirm the first editable fields are content-oriented
3. change every renderer-backed field once
4. verify preview updates correctly
5. publish or save draft
6. verify the live section reflects the same field from the public renderer
