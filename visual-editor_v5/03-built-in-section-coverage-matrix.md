# 03 Built-In Section Coverage Matrix

This is the required coverage map. Treat it as the implementation checklist.

## Coverage Rule

`Editable now` means it must be in-place editable in this pass.

`Inspector allowed` means it may remain inspector-first for now.

## `hero_cta`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `meta.ctaPrimaryLabel`
- `meta.ctaPrimaryHref`
- `meta.ctaSecondaryLabel`
- `meta.ctaSecondaryHref`

Inspector allowed:

- bullets array
- trust items
- proof panel internals
- hero stats if they remain more complex than plain text

## `card_grid`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.cards[index].title`
- `content.cards[index].text`

Inspector allowed:

- icons
- images
- non-text display flags

## `steps_list`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.steps[index].title`
- `content.steps[index].body`

Inspector allowed:

- icons
- stats

## `title_body_list`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.items[index].title`
- `content.items[index].body`

Do not leave this section partially raw. It is core CMS copy.

## `rich_text_block`

Editable now:

- `content.eyebrow`
- `meta.title`
- visible plain-text heading if it exists as a separate field

Inspector allowed:

- `bodyHtml`
- TipTap/rich-text document fields

## `label_value_list`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.items[index].label`
- `content.items[index].value`

Applies to:

- metrics grid
- tool badges
- logo row
- trust strip
- marquee only where text labels are visibly rendered

## `faq_list`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.items[index].question`
- `content.items[index].answer`

## `cta_block`

Editable now:

- `content.eyebrow`
- `meta.title`
- `content.body`
- `meta.ctaPrimaryLabel`
- `meta.ctaPrimaryHref`
- `meta.ctaSecondaryLabel`
- `meta.ctaSecondaryHref`

## `social_proof_strip`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.trustNote`
- `content.badges[index].text`
- visible logo text labels where logos render as text

Inspector allowed:

- logo image URLs
- alt text

## `proof_cluster`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- `content.metrics[index].value`
- `content.metrics[index].label`
- `content.proofCard.title`
- `content.proofCard.body`
- `content.proofCard.stats[index].value`
- `content.proofCard.stats[index].label`
- `content.testimonial.quote`
- `content.testimonial.author`
- `content.testimonial.role`
- `meta.ctaPrimaryLabel`
- `meta.ctaPrimaryHref`

## `case_study_split`

Editable now:

- `content.eyebrow`
- `meta.title`
- `meta.subtitle`
- plain-text narrative fallback only if not rendering rich HTML
- `content.beforeLabel`
- `content.afterLabel`
- `content.beforeItems[index]`
- `content.afterItems[index]`
- `content.mediaTitle`
- `content.stats[index].value`
- `content.stats[index].label`
- `meta.ctaPrimaryLabel`
- `meta.ctaPrimaryHref`

Inspector allowed:

- narrative rich HTML path
- media image URL

## `booking_scheduler`

Editable now:

- `meta.title`
- `meta.subtitle`
- `meta.ctaPrimaryLabel` if visibly used as submit text
- `content.formHeading`
- `content.submitLabel`

Inspector allowed:

- Cal link
- structured intake-field config unless visibly rendered on canvas

## `footer_grid`

Editable now:

- `content.cards[index].title`
- `content.cards[index].body`
- visible grouped link labels
- visible flat link labels
- subscribe placeholder
- subscribe button label
- visible CTA labels and hrefs
- `content.brandText`
- legal copyright
- legal link labels

Inspector allowed:

- href editing for the footer’s many secondary links may remain anchored-popover based instead of raw text

## `nav_links`

Editable now:

- visible nav link labels
- primary CTA label
- primary CTA href

Inspector allowed:

- logo image source
- anchor wiring details if not surfaced from the CTA link popover flow

## Completion Rule

The coding agent should maintain this matrix as an internal checklist and mark each section complete only when the visible fields above are actually editable in the canvas.
