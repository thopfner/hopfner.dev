# Field Coverage Matrix

Source of truth for live rendering:

- `app/(marketing)/[slug]/page.tsx`

Legend:

- `complete`: current editor coverage is functionally present
- `capability-gated`: field is shared and likely controlled through `CommonFieldsPanel`, but its visibility is unsafe because built-in renderers still consume it regardless
- `missing`: live renderer consumes a field that has no functional editor control right now

| Section type | Live shared fields | Live content fields | Current status | Exact gaps | Layout reorder need |
| --- | --- | --- | --- | --- | --- |
| `hero_cta` | `title`, `subtitle`, `ctaPrimary`, `ctaSecondary`, `backgroundMedia` | `eyebrow`, `bullets`, `trustLine`, `trustItems[]`, `heroStats[]`, `layoutVariant`, `proofPanel.*` | `complete` | none confirmed | yes |
| `card_grid` | `title`, `subtitle` | `eyebrow`, `cards[]`, `sectionVariant`, `columns`, `cardTone`, `cardDisplay.*` | `incomplete` | `subtitle` truth is capability-gated; `cardDisplay.*` has no UI; `cards[].image.alt` has no UI | yes |
| `steps_list` | `title`, `subtitle` | `eyebrow`, `steps[]`, `layoutVariant` | `capability-gated` | shared subtitle must be guaranteed visible for built-ins | yes |
| `title_body_list` | `title`, `subtitle` | `eyebrow`, `items[]`, `layoutVariant` | `capability-gated` | shared subtitle must be guaranteed visible for built-ins | yes |
| `rich_text_block` | `title`, `subtitle` | `eyebrow`, `bodyRichText` | `incomplete` | `eyebrow` missing | low |
| `label_value_list` | `title`, `subtitle` | `eyebrow`, `items[]`, `compact`, `layoutVariant` | `capability-gated` | shared subtitle must be guaranteed visible for built-ins | yes |
| `faq_list` | `title`, `subtitle` | `eyebrow`, `items[]` | `incomplete` | `eyebrow` missing; shared subtitle truth still unsafe | low |
| `cta_block` | `title`, `ctaPrimary`, `ctaSecondary` | `eyebrow`, `bodyRichText`, `layoutVariant` | `complete` | none confirmed | yes |
| `footer_grid` | none | `cards[]`, `brandText`, `legal.*` | `complete` | none confirmed | low |
| `nav_links` | `ctaPrimary` | `logo.*`, `links[].label`, `links[].href`, `links[].anchorId` | `incomplete` | `links[].anchorId` has no functional control or sync path | medium |
| `social_proof_strip` | `title`, `subtitle` | `eyebrow`, `trustNote`, `logos[]`, `badges[]`, `layoutVariant` | `incomplete` | shared subtitle truth still unsafe; `logos[].href` missing | yes |
| `proof_cluster` | `title`, `subtitle`, `ctaPrimary` | `eyebrow`, `metrics[]`, `proofCard.*`, `testimonial.*` | `capability-gated` | shared subtitle and CTA visibility should be code-truthful | low |
| `case_study_split` | `title`, `subtitle`, `ctaPrimary` | `eyebrow`, `narrativeRichText`, `narrative`, `before*`, `after*`, `media*`, `stats[]` | `incomplete` | `narrativeRichText` missing; shared subtitle and CTA visibility should be code-truthful | low |
| `custom / composed` | schema-dependent | schema block fields | `separate` | do not broaden v20 into a composer rewrite; preserve current block coverage and only apply shell/order primitives where safe | only if touched |

## Built-In Shared Meta Contract Recommended For v20

These fields are renderer-backed and should be code-owned for built-in section types:

| Section type | Title | Subtitle | CTA primary | CTA secondary | Background media |
| --- | --- | --- | --- | --- | --- |
| `hero_cta` | yes | yes | yes | yes | yes |
| `card_grid` | yes | yes | no | no | no |
| `steps_list` | yes | yes | no | no | no |
| `title_body_list` | yes | yes | no | no | no |
| `rich_text_block` | yes | yes | no | no | no |
| `label_value_list` | yes | yes | no | no | no |
| `faq_list` | yes | yes | no | no | no |
| `cta_block` | yes | no | yes | yes | no |
| `footer_grid` | no | no | no | no | no |
| `nav_links` | no | no | yes | no | no |
| `social_proof_strip` | yes | yes | no | no | no |
| `proof_cluster` | yes | yes | yes | no | no |
| `case_study_split` | yes | yes | yes | no | no |

## Subtitle-Specific Note

For built-in section types, `content.subtitle` should not remain an invisible secondary source of truth.

Affected live renderer cases:

- `card_grid`
- `steps_list`
- `title_body_list`
- `label_value_list`
- `faq_list`
- `social_proof_strip`
- `proof_cluster`
- `case_study_split`

The v20 implementation should normalize these to one editor-owned path so the user never sees a subtitle on the frontend that cannot be edited from the drawer.
