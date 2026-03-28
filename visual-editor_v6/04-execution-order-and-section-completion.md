# Execution Order And Section Completion

This order is mandatory.

The coding agent should not jump ahead.

## Phase 0. Foundation First

Finish these before touching more sections:

1. `EditableTextSlot` box sizing fix
2. shared visual link picker extraction
3. structured rich-text visual slot
4. stable visual-editing fallback for counters and marquee surfaces
5. hotspot pattern for hidden text/link metadata

Exit criteria:

- hero title edits at full rendered size
- CTA link editor uses real page/anchor/custom workflow
- one rich-text block can be edited from canvas
- one animated counter edits as stable text
- one marquee surface becomes a stable editable row in visual mode

## Phase 1. Highest-Value Surface Closure

These sections must be completed first because they dominate first impression and navigation.

### `HeroSection`

Files:

- `components/landing/hero-section.tsx`

Implement:

- bullets as editable list items
- hero stats values and labels
- trust items and trust line
- proof-panel headline and item rows
- stable non-animated edit state for stat values

### `SiteHeader`

Files:

- `components/landing/site-header.tsx`

Implement:

- nav label editing stays
- nav destination editing must be added for every link
- support anchor/page/custom routing

### `FooterGridSection`

Files:

- `components/landing/footer-grid-section.tsx`

Implement:

- grouped link destinations
- flat link destinations
- legal link destinations
- subscribe placeholder editing on the real input surface

## Phase 2. Booking And Conversion Closure

### `BookingSchedulerSection`

Files:

- `components/landing/booking-scheduler-section.tsx`
- `components/landing/booking-scheduler-client.tsx`
- `components/landing/booking-intake-form.tsx`

Implement:

- form heading editing in place
- submit button label editing in place
- intake field labels and help text
- success-state headings and copy

Rule:

- do not hide these edits in the right inspector
- the canvas must remain the primary editing surface

### `FinalCtaSection`

Files:

- `components/landing/final-cta-section.tsx`

Implement:

- rich-text body closure through the new structured rich-text surface

## Phase 3. Content Section Completion

### `WhatIDeliverSection`

Files:

- `components/landing/what-i-deliver-section.tsx`

Implement:

- tag
- stat
- `youGet[]`
- `bestFor`
- `bestForList[]`
- rich-text card body when applicable

### `ProofClusterSection`

Files:

- `components/landing/proof-cluster-section.tsx`

Implement:

- top-level metric values as editable stable text

### `TechStackSection`

Files:

- `components/landing/tech-stack-section.tsx`
- `components/landing/logo-ticker.tsx`

Implement:

- metrics-grid values
- marquee edit surface
- hotspot for image-backed hidden labels where needed

### `SocialProofStripSection`

Files:

- `components/landing/social-proof-strip-section.tsx`
- `components/landing/logo-ticker.tsx`

Implement:

- marquee edit surface
- logo destination editing
- hotspot for image-backed logos when the label is not visibly rendered

### `CaseStudySplitSection`

Files:

- `components/landing/case-study-split-section.tsx`

Implement:

- narrative rich-text editing

## Phase 4. Rich-Text Section Closure

These sections are mostly complete except for HTML-backed blocks. Close them as one batch using the new rich-text primitive.

### Files

- `components/landing/how-it-works-section.tsx`
- `components/landing/workflows-section.tsx`
- `components/landing/why-this-approach-section.tsx`
- `components/landing/faq-section.tsx`

Implement:

- rich-text step bodies
- rich-text workflow bodies
- rich-text editorial body
- rich-text FAQ answers

## Phase 5. Final Sweep

Before asking for review, the coding agent must do a final sweep for any remaining visible raw strings in built-in sections.

Required sweep targets:

- repeated array items
- link destinations hidden behind labels
- image-backed metadata
- animated-value surfaces
- success or empty states inside interactive client components

## Implementation Discipline

The coding agent must maintain a completion checklist while working.

The checklist should track three states only:

- `not started`
- `partial`
- `complete`

No section should remain in `partial` when the review request is made.
