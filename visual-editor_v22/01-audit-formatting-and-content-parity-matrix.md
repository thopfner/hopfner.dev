# Audit: Formatting And Content Parity Matrix

## Summary

Formatting parity is substantially better than content parity.

The remaining formatting gaps are cross-cutting.
The remaining content gaps are section-specific and significant.

## Formatting Parity: Cross-Cutting Findings

| Gap ID | Control | Form Editor | Visual Editor | Status | Source |
|---|---|---|---|---|---|
| `F1` | Section preset applies tokens | Preset selector writes the actual presentation/component tokens | Preset selector only writes `sectionPresetKey` | Missing | [formatting-controls.tsx](/var/www/html/hopfner.dev-main/components/admin/formatting-controls.tsx#L513), [page-visual-editor-inspector.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx#L620) |
| `F2` | Bottom spacing `pb-24` | Available | Missing | Missing | [formatting-controls.tsx](/var/www/html/hopfner.dev-main/components/admin/formatting-controls.tsx#L205), [page-visual-editor-inspector.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx#L106) |
| `F3` | Inner shadow strength precision | `0.05` step | `0.1` step | Partial | [formatting-controls.tsx](/var/www/html/hopfner.dev-main/components/admin/formatting-controls.tsx#L442), [page-visual-editor-inspector.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx#L681) |
| `F4` | Global nav/footer formatting in page visual workspace | Full form/global editing path exists | Locked/out-of-band from page visual editor | Partial | [page-visual-editor-inspector.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx#L547) |

## Content Parity: Section Matrix

Legend:

- `Full` = core form-editor content workflow is present in visual editor
- `Partial` = some controls exist, but meaningful form-editor workflows are still missing
- `Missing` = visual editor lacks the real content workflow
- `Out-of-band` = not editable in the page visual editor because it is routed away or locked

| Section Type | Form Editor Content Surface | Visual Editor Content Surface | Status | Missing / Mismatched Controls |
|---|---|---|---|---|
| `hero_cta` | Eyebrow, bullets, trust line, trust items, hero stats, proof panel, hero layout, content block order, block side assignment | Eyebrow, layout variant only | Partial | `heroContentOrder`, `heroContentSides`, bullets, trust line, trust items, hero stats, proof panel fields |
| `card_grid` | Eyebrow, columns, full per-card editing, card image picker/upload/library, alt text, width slider, rich text body, you-get/best-for lists, default card display, per-card display toggles, list/block modes | Eyebrow, columns, basic card title/text/icon/stat/tag | Partial | card image/media controls, rich text body, `youGet`, `bestFor`, display toggles, card image width, default card field visibility |
| `steps_list` | Eyebrow, steps, layout variant | Eyebrow, steps, layout variant | Full | None found in core content workflow |
| `title_body_list` | Eyebrow, items, layout variant | Eyebrow, items, layout variant | Full | None found in core content workflow |
| `rich_text_block` | Eyebrow + rich text body editor | “Best edited in form editor” message | Missing | rich text body editor absent |
| `label_value_list` | Eyebrow, items, layout variant, compact mode | Eyebrow, items, layout variant | Partial | `compact` toggle absent |
| `faq_list` | Eyebrow, FAQ items | Eyebrow, FAQ items | Full | None found in core content workflow |
| `cta_block` | Eyebrow, body, layout variant | Eyebrow, body, layout variant | Full | None found in core content workflow |
| `social_proof_strip` | Eyebrow, trust note, layout variant, logos with image picker/upload/library, alt text, href, reordering, badges with reordering | Eyebrow, trust note, layout variant, logos basic fields, badges basic fields | Partial | image picker/upload/library parity for logos |
| `proof_cluster` | Eyebrow, metrics, proof card title/body/stats, testimonial quote/author/role/image | Eyebrow, metrics, testimonial quote/author/role | Partial | proof card block absent, testimonial `imageUrl` absent |
| `case_study_split` | Eyebrow, narrative, before/after labels, before/after items, stats, media title, media image URL | Eyebrow, narrative, before/after labels, before/after items, stats | Partial | `mediaTitle`, `mediaImageUrl` absent |
| `booking_scheduler` | Cal link, form heading, submit label, intake field labels/help text for all intake fields | Cal link, form heading, submit label | Partial | intake field label/help text editing absent |
| `nav_links` | Logo image picker/upload/library, alt text, width slider, full link list with reorder + structured link menu + anchor target | Not editable in page visual editor | Out-of-band | all page-visual content controls absent |
| `footer_grid` | Footer cards, links mode, grouped/flat links, subscribe controls, CTA1/CTA2, brand text, copyright, legal links | Not editable in page visual editor | Out-of-band | all page-visual content controls absent |

## Highest-Impact Missing Controls

These are the first things users are likely to notice:

1. `hero_cta > Content block order`
2. `rich_text_block > rich text body editor`
3. `booking_scheduler > intake field labels/help text`
4. `proof_cluster > proof card`
5. `card_grid > image/rich-text/display controls`
6. `nav_links` and `footer_grid` not editable in the page visual workspace

## Recommended Execution Strategy

Do not try to finish all parity in one pass.

Use these batches:

1. cross-cutting formatting and shared editor primitives
2. high-impact content parity for hero, rich text, booking, proof cluster, case study
3. card/social/label-value advanced content parity
4. global nav/footer parity in the page visual workflow
