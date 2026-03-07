# Verification Matrix

Use this matrix after implementation.

The work is not complete until every row passes.

| Area | Control / Action | Expected save behavior | Expected frontend behavior | Must publish? | Pass criteria |
|---|---|---|---|---|---|
| Site-wide formatting | change display font | saves to `site_formatting_settings` | live headings change immediately | No | homepage heading font updates after save |
| Site-wide formatting | change body scale | saves to `site_formatting_settings` | body text size changes immediately | No | paragraph/UI copy visibly changes |
| Site-wide formatting | change signature style | saves to `site_formatting_settings` | brand signature changes immediately | No | background identity layer visibly changes |
| Site-wide formatting | change signature noise opacity | saves to `site_formatting_settings` | noise texture changes immediately | No | subtle texture changes, no readability regression |
| Page settings | change page backdrop image | saves to `pages` | backdrop changes immediately | No | page backdrop updates after save |
| Page settings | change page panel opacity | saves to `pages.formatting_override` | surface translucency changes immediately | No | cards/panels become more or less translucent |
| Section drawer | change section title | saves to draft version | no live change until publish | Yes | live page unchanged before publish, updated after publish |
| Section drawer | change `sectionRhythm` | saves to draft version | spacing changes after publish | Yes | published section spacing visibly changes |
| Section drawer | change `sectionSurface` | saves to draft version | surface treatment changes after publish | Yes | published section gains/removes stage treatment |
| `card_grid` | change `cardFamily` | saves to draft version | card treatment changes after publish | Yes | cards visibly switch family |
| `card_grid` | change `cardChrome` | saves to draft version | chrome modifier changes after publish | Yes | cards visibly change chrome even if family is set |
| `steps_list` | change `accentRule` | saves to draft version | step visuals change after publish | Yes | accent placement changes clearly |
| `steps_list` | change `labelStyle` | saves to draft version | step markers/labels change after publish | Yes | marker/label style changes clearly |
| Any supported section | change `dividerMode` | saves to draft version | divider intensity changes after publish | Yes | none/subtle/strong produces distinct result |
| `label_value_list:trust_strip` | change rhythm/surface | saves to draft version | variant responds correctly after publish | Yes | no branch-specific dead control |
| `label_value_list:logo_row` | change rhythm/surface | saves to draft version | variant responds correctly after publish | Yes | no branch-specific dead control |
| CTA section | change rhythm/surface | saves to draft version | all CTA variants respond after publish | Yes | compact/split/high-contrast all obey wrapper semantics |
| Composed section | change grid gap | saves to draft version | composed layout changes after publish | Yes | row/column spacing visibly changes |
| Composed section | change content density | saves to draft version | block padding/density changes after publish | Yes | composed blocks visibly densify/relax |
| Composed section | change heading treatment | saves to draft version | headings change after publish | Yes | heading style visibly changes |

## Final QA rule

If any editor-visible control still cannot be demonstrated through this matrix, it must be:

- fully implemented, or
- removed from the admin UI

Do not leave any ambiguous middle state.
