# Built-In Section Gap Matrix

This is the authoritative closure list for v6.

A section is not complete until every item in its block is complete.

## Fully Built-In Scope

The current built-in preview surface includes:

- `HeroSection`
- `WhatIDeliverSection`
- `HowItWorksSection`
- `WorkflowsSection`
- `WhyThisApproachSection`
- `TechStackSection`
- `FaqSection`
- `FinalCtaSection`
- `SocialProofStripSection`
- `ProofClusterSection`
- `CaseStudySplitSection`
- `BookingSchedulerSection`
- `FooterGridSection`
- `SiteHeader`

## Section Matrix

### 1. `HeroSection`

Current state:

- title, subtitle, eyebrow, primary CTA label, secondary CTA label are wired

Remaining gaps:

- `content.bullets[]`
- `content.heroStats[].value`
- `content.heroStats[].label`
- `content.trustItems[].text`
- `content.trustLine`
- `content.proofPanel.headline`
- `content.proofPanel.items[].label`
- `content.proofPanel.items[].value`

Required end state:

- every bullet edits in place on its real bullet line
- hero stat values edit in place without animated counter behavior during edit mode
- hero stat labels edit in place
- trust items and trust line edit in place
- proof-panel headline and proof-panel item rows edit in place

### 2. `WhatIDeliverSection`

Current state:

- title, subtitle, eyebrow, card title, card body are wired

Remaining gaps:

- `content.cards[].tag`
- `content.cards[].stat`
- `content.cards[].youGet[]`
- `content.cards[].bestFor`
- `content.cards[].bestForList[]`
- `content.cards[].textRichText` or HTML-backed card body when rich text is present

Required end state:

- service-card top metadata edits in place
- list entries edit individually, not as one joined string
- rich-text card bodies use anchored rich-text editing when HTML-backed

### 3. `HowItWorksSection`

Current state:

- title, subtitle, eyebrow, step title, plain-text step body are wired across variants

Remaining gaps:

- `content.steps[].bodyRichText` / HTML-backed step bodies

Required end state:

- any step body rendered from rich text has an anchored visual rich-text editor

### 4. `WorkflowsSection`

Current state:

- title, subtitle, eyebrow, item title, plain-text item body are wired

Remaining gaps:

- `content.items[].bodyRichText` / HTML-backed item bodies

Required end state:

- all workflow item bodies are editable whether stored as plain text or rich text

### 5. `WhyThisApproachSection`

Current state:

- title, eyebrow, subtitle-heading are wired

Remaining gaps:

- `content.bodyRichText` / `content.bodyHtml`

Required end state:

- the main editorial body is editable from the canvas through an anchored rich-text editor

### 6. `TechStackSection`

Current state:

- title, subtitle, eyebrow are mostly wired
- default layout labels and values are mostly wired
- tool-badge and trust-strip text labels are mostly wired

Remaining gaps:

- `content.items[].value` in `metrics_grid`
- marquee variant labels inside `LogoTicker`
- image-backed logo/item variants where label text is not visibly rendered

Required end state:

- `metrics_grid` values edit in place as stable text
- when visual editing is active, marquee mode degrades to a stable editable row
- image-backed items expose a visible hotspot for hidden text metadata when the text is not visibly rendered

### 7. `FaqSection`

Current state:

- title, subtitle, eyebrow, plain-text question, plain-text answer are wired

Remaining gaps:

- `content.items[].answerRichText` / `content.items[].answerHtml`

Required end state:

- rich-text FAQ answers are editable from the canvas through an anchored editor

### 8. `FinalCtaSection`

Current state:

- headline, eyebrow, CTA labels are wired
- plain-text body is wired

Remaining gaps:

- `content.bodyRichText` / `content.bodyHtml`

Required end state:

- CTA body content is editable whether plain-text or rich-text backed

### 9. `SocialProofStripSection`

Current state:

- eyebrow, title, subtitle, badge text, trust note are wired
- non-image logo labels are wired in grid and inline layouts

Remaining gaps:

- marquee variant logo labels inside `LogoTicker`
- image-backed logo label metadata when no visible text is rendered
- logo destination links when `content.logos[].href` is present

Required end state:

- marquee mode becomes a stable editable surface in visual mode
- image-backed logos expose a compact hotspot for label and link editing
- logo destinations are editable from the canvas

### 10. `ProofClusterSection`

Current state:

- title, subtitle, eyebrow, proof-card title/body/stats, testimonial fields, CTA label are wired

Remaining gaps:

- `content.metrics[].value`

Required end state:

- top-level metric values edit in place as stable text

### 11. `CaseStudySplitSection`

Current state:

- eyebrow, title, subtitle, before/after labels, before/after list items, CTA label, media title, stats are wired

Remaining gaps:

- `content.narrativeRichText` / `content.narrativeHtml`

Required end state:

- narrative body is editable from the canvas through an anchored rich-text editor

### 12. `BookingSchedulerSection`

Current state:

- title and subtitle are wired

Remaining gaps:

- `content.formHeading`
- `meta.ctaPrimaryLabel` when used as submit label in booking flow
- `content.submitLabel`
- `content.intakeFields.*.label`
- `content.intakeFields.*.helpText`
- success-state visible copy inside `BookingSchedulerClient`

Required end state:

- form heading edits in place
- submit CTA label edits directly on the button
- intake labels and placeholders are editable from the canvas
- success-state copy is editable where it is rendered

### 13. `FooterGridSection`

Current state:

- card title, card body, group titles, link labels, CTA labels, legal copyright, legal link labels, brand text are wired

Remaining gaps:

- `content.cards[].groups[].links[].href`
- `content.cards[].links[].href`
- `content.legal.links[].href`
- `content.cards[].subscribe.placeholder`

Required end state:

- every footer link destination is editable from the canvas
- subscribe placeholder text is editable from the input surface itself

### 14. `SiteHeader`

Current state:

- nav labels and primary CTA label are wired

Remaining gaps:

- `content.links[].href`
- `content.links[].anchorId`

Required end state:

- each nav item supports canvas-based label editing and CMS-grade destination editing
- anchor/page/custom distinctions are preserved

## Explicit Exclusions

These are not v6 completion blockers unless the preview surface is expanded to include them:

- `components/landing/contact-section.tsx`
- `components/landing/composed-section.tsx`
- media-only fields with no visible text surface unless they need a compact hotspot for associated text or link metadata
