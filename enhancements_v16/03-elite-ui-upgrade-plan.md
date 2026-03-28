# Elite UI Upgrade Plan

This is the second implementation batch, after capability truth is repaired.

## Design Direction

Target the feel of an operator-grade, institutional consultancy:

- dark, restrained, and surgical
- stronger contrast hierarchy than the current lower-page sections
- fewer but more deliberate accents
- proof presented as evidence, not as “marketing section components”
- typography that feels authored, not theme-generated

The hero already points in the right direction. The rest of the homepage needs to catch up.

## Highest-Priority Enhancements

### 1. Rebuild The Proof Stack As A Cohesive Conversion Sequence

Current order:

- social proof strip
- proof cluster
- case study
- workflow visual
- footer

Recommended sequence:

1. institutional trust rail
2. outcomes proof matrix
3. signature case study snapshot
4. methodology/process visual
5. premium closing surface

### 2. Social Proof Strip: Upgrade From Thin Logo Row To Trust Rail

Current issue:

- logos are too faint
- trust note is embarrassing on the live site
- no real section hierarchy
- admin cannot currently art-direct it truthfully

Target behavior:

- strong eyebrow plus short trust claim
- consistent monochrome or muted-color logo lockups
- optional accreditation or tool badges with real meaning
- more deliberate spacing and surface treatment
- if there are fewer than 4 credible logos, prefer a compact trust rail instead of a marquee

Admin implications:

- expose `sectionRhythm`, `sectionSurface`, `contentDensity`, `gridGap`, `headingTreatment`, `labelStyle`
- keep logo-tile family internal unless you also design a truthful logo-card API

### 3. Proof Cluster: Make It Feel Like Evidence, Not Placeholder Cards

Current issue:

- generic metrics
- anonymous enterprise proof
- testimonial lacks institutional specificity
- visual treatment is serviceable but not premium

Target behavior:

- one dominant lead metric
- secondary outcome cards with clearer hierarchy
- proof card with sharper narrative framing
- testimonial with stronger attribution and optional company mark
- asymmetry and pacing, not a flat grid of similar-weight cards

Recommended UI moves:

- larger lead metric or staggered metric scale
- more deliberate card role differentiation
- stronger separator between proof narrative and testimonial
- tighter copy, fewer words, higher signal

### 4. Case Study Section: Replace Placeholder Storytelling With A Signature Snapshot

Current issue:

- filler narrative
- missing media artifact
- before/after treatment is structurally okay but visually thin

Target behavior:

- rename or retitle the section to something more concrete than `The challenge` when real content exists
- include an actual workflow diagram, annotated dashboard, process map, or outcome artifact
- if the client must stay anonymous, be specific about context: company size, workflow type, tools, baseline, outcome
- present before/after as operational state change, not as generic marketing bullets

Recommended UI moves:

- stronger media panel framing
- more visual weight on the “after” state
- optional metric delta chips tied directly to the story
- stronger editorial heading and subheading relationship

Critical rule:

- no public placeholder media

### 5. Header/Footer: Upgrade The Global Chrome

#### Header

Target changes:

- require or strongly encourage a real brand lockup
- refine the sticky surface so it feels intentional, not just transparent
- sharpen active-state styling
- keep the CTA visible but better integrated with the global visual language

#### Footer

Target changes:

- convert from default sitemap/subscription block into a premium closing surface
- remove dead links and dead subscribe affordances
- if subscribe is real, wire it to a real capture flow; otherwise replace with a contact or booking close
- reduce the sense of “template footer”

Recommended footer structure:

- left: brand, positioning, one sharp sentence
- right: curated contact / booking / core navigation
- bottom: legal and understated watermark

## Section-Specific Priority Order

1. social proof strip
2. proof cluster
3. case study
4. footer
5. header
6. optional hero refinement after the lower-page proof stack is fixed

## Mobile Requirements

- maintain strong hierarchy when proof sections stack
- before/after cards must remain readable without looking cramped
- proof metrics should not feel like tiny utility pills
- footer close should feel deliberate, not like a collapsed desktop sitemap

## Content Rules

- if there is no verified proof, hide the proof
- every public proof item should be attributable, anonymized-but-specific, or removed
- do not substitute vibe for evidence
