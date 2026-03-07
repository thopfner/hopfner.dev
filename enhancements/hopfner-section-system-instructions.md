# Hopfner.dev Section System Instructions

Date: March 7, 2026

Purpose:
- Guide the implementing coding agent to improve the website skeleton only
- Focus on reusable CMS-driven section cards, layout structure, and presentation logic
- Do not focus on final copywriting yet
- Build a professional section library aligned with leading AI / tech / automation websites

Related references:
- `website-design-brief.md`
- `hopfner-homepage-improvement-plan.md`

## Objective

Upgrade the frontend section system so the website can render professional, benchmark-aligned homepage layouts using reusable CMS card and section types.

The goal is not to finalize content.

The goal is to create:
- stronger section structure
- better card patterns
- more professional layout rhythm
- clearer hierarchy
- reusable presentation blocks that can later be populated with real content from the CMS

## Important Constraint

This site already has a backend CMS and multiple section/card types.

The task is to improve the frontend skeleton and section system, not rebuild the CMS.

The implementing coding agent should:
- work with the existing card/section rendering model where possible
- improve presentation and structure
- add new card/section variants only when necessary
- think in reusable modules, not one-off page hacks

## Core Principle

Design the homepage as a system of professional section primitives.

Each section should feel:
- intentional
- reusable
- benchmark-aligned
- visually distinct in purpose
- easy to populate later with CMS content

## Non-Goals

Do not spend time on:
- polishing final marketing copy
- adding fake proof or invented metrics
- building complex animations first
- designing one-off decorative components with no structural purpose

## Benchmark Alignment

Use the benchmark logic from the research brief.

The section system should borrow from:
- Relevance AI for outcome-led AI consultancy structure
- n8n for workflow/system visualization logic
- Linear for clean hierarchy and spacing
- Vercel for polished modular layout

Avoid:
- generic startup template cards
- repetitive equal-weight white boxes
- sections that all look the same
- visual noise that does not support structure

## What Needs To Improve

The current homepage skeleton has these problems:
- the hero has no proof visual or right-hand structural counterpart
- too many sections use the same generic card style
- section rhythm is flat
- cards do not clearly express different purposes
- there is not enough separation between trust, process, services, proof, and CTA sections
- placeholder content exposes weak card design because the structure itself is not strong enough

## Structural Goal

Create a reusable section library that supports a future homepage like this:

1. Header / Nav
2. Hero with proof visual
3. Trust strip
4. Audience / problem framing
5. Outcomes / value pillars
6. Workflow / system explainer
7. Services / capabilities
8. Process / engagement steps
9. Proof / metrics / case snippets
10. Differentiation section
11. Final CTA
12. Footer

## Required Section Types

The implementing coding agent should ensure the frontend supports strong versions of the following section types.

### 1. Hero Section

Purpose:
- establish category
- establish outcome
- provide primary CTA
- provide a proof surface

Required layout support:
- left/right two-column hero
- text block on one side
- visual block on the other
- support for eyebrow, headline, subcopy, CTA group, trust note

Preferred card capabilities:
- primary CTA
- secondary CTA
- optional small proof items
- optional featured workflow/mockup panel

### 2. Logo / Trust Strip Section

Purpose:
- create early trust without heavy copy

Required layout support:
- horizontal logo row
- compact metrics row
- compact badges row

The frontend should support this as a lightweight structural section, not a generic card grid.

### 3. Audience / Problem Cards Section

Purpose:
- identify who the service is for
- diagnose the operating pain

Required layout support:
- 3-column cards on desktop
- stacked cards on mobile
- optional accordion variant if needed, but cards are preferred over accordions for homepage scanning

Each card should visually support:
- audience title
- short pain statement
- optional icon or tag

### 4. Outcome / Value Pillars Section

Purpose:
- express key business outcomes

Required layout support:
- 3 or 4 high-emphasis cards
- each card with strong heading and short explanation
- optional stat or micro-support line

These should look more important than generic service cards.

### 5. Workflow / System Visualization Section

Purpose:
- show how the consultancy thinks and works
- replace abstraction with a visible system model

Required layout support:
- diagram panel
- process flow row
- before/after comparison
- step-to-step connected visual

This is a priority structural section because it is missing from the current homepage.

### 6. Services / Capability Cards Section

Purpose:
- present major service categories

Required layout support:
- 2-column or 3-column card grid
- each card should support title, short explanation, optional bullet list, and optional CTA

These cards should be visually distinct from:
- audience cards
- value cards
- proof cards

Do not render every card type with the same container styling.

### 7. Process / Steps Section

Purpose:
- explain how engagements work

Required layout support:
- numbered step cards
- horizontal timeline variant
- vertical process stack variant

Each step card should support:
- step number
- short step label
- short description

This section should feel operational and structured, not decorative.

### 8. Proof Section

Purpose:
- support case studies, metrics, or proof snippets

Required layout support:
- metric cards
- quote cards
- case snippet cards
- before/after impact blocks

The frontend should support multiple proof formats so the CMS can populate whichever proof assets are available later.

### 9. Differentiation Section

Purpose:
- explain why this consultancy is different

Required layout support:
- side-by-side comparison block
- simple text + visual split
- compact reason cards

This should not be another generic white box with title and body text.

### 10. CTA Section

Purpose:
- create a clear conversion moment near the end of the page

Required layout support:
- centered CTA block
- split CTA block
- headline + subcopy + button group

This section should feel more deliberate and premium than a standard content card.

### 11. Footer Section

Purpose:
- close the page cleanly
- support navigation, brand, legal, and optional contact/newsletter

Required layout support:
- structured multi-column footer
- clean legal row
- optional minimal form input only if truly needed

## Required Card Families

Think in card families, not one card style reused everywhere.

At minimum, the frontend should support these visual families:

### A. Feature / Value Cards

Use for:
- outcomes
- benefits
- value pillars

Characteristics:
- strong heading
- short supporting text
- clean, elevated presentation

### B. Service Cards

Use for:
- capabilities
- offering categories

Characteristics:
- slightly denser than value cards
- room for supporting detail
- optional CTA

### C. Step Cards

Use for:
- process
- workflow stages

Characteristics:
- visible numbering
- operational layout
- sequential feel

### D. Proof Cards

Use for:
- metrics
- testimonials
- case snippets

Characteristics:
- stronger emphasis on evidence
- distinct visual treatment from service and feature cards

### E. Problem / Audience Cards

Use for:
- audience framing
- pain points

Characteristics:
- diagnosis-oriented
- compact and readable
- should scan quickly

### F. CTA Blocks

Use for:
- conversion moments

Characteristics:
- larger spacing
- stronger contrast
- fewer fields
- obvious action hierarchy

## Layout Rules

Improve the section system using these layout rules.

### 1. Vary section density

Not every section should be a uniform padded container with a heading and three white cards.

Use a mix of:
- dense signal sections
- spacious emphasis sections
- full-width visual sections
- compact proof strips

### 2. Create alternating rhythm

The page should alternate between:
- text-led sections
- card-led sections
- visual-led sections
- proof-led sections

This improves pacing and perceived quality.

### 3. Use different max-widths by section purpose

Suggested:
- hero: wide
- proof strip: extra wide
- narrative sections: medium width
- CTA blocks: narrower for focus

### 4. Build stronger internal hierarchy

Each section should support:
- eyebrow or label
- heading
- optional subcopy
- body layout region

This should be systematized so section headers feel consistent without feeling repetitive.

### 5. Support asymmetry where useful

Not every section should be centered.

The best benchmark sites frequently use:
- left-weighted text + right visual
- offset grids
- uneven columns

Use asymmetry where it increases professionalism and visual interest.

## Visual Standards For The Section System

The system should feel:
- premium
- technical
- modern
- restrained

Recommendations:
- larger typography scale
- stronger vertical spacing
- fewer generic shadows
- more deliberate border, radius, and contrast rules
- more distinction between section backgrounds
- more deliberate CTA styling

Avoid:
- flat template sameness
- every card using the same exact border/shadow treatment
- small, timid headings
- crowded cards with weak spacing

## CMS-Friendly Requirements

The frontend should be structured so the CMS can later populate content easily.

Prefer section designs that:
- work with missing optional fields
- degrade gracefully when content is short
- support repeatable arrays cleanly
- avoid requiring overly precise copy length to look good

Recommended content model support:
- title
- subtitle
- description
- badge/eyebrow
- CTA labels and URLs
- icon/media slot
- repeatable items array
- optional note / stat / tag

## Implementation Priorities

### P0

- establish distinct section types instead of one repeated generic card style
- create a real hero layout with proof visual support
- create a trust strip section
- create differentiated value, service, process, proof, and CTA card families

### P1

- improve section spacing and page rhythm
- improve typographic hierarchy
- introduce workflow/system visual section support
- improve footer structure

### P2

- refine background alternation and contrast
- add optional advanced layout variants
- improve responsive behavior across all section families

## Acceptance Criteria

The improved section system should make it possible to build a homepage that:
- looks professional even before final copy is added
- does not rely on placeholder content to feel complete
- clearly separates hero, trust, services, process, proof, and CTA
- feels aligned with top-tier AI and technical websites
- works as a reusable CMS-driven page builder system

## Direct Instructions

1. Treat this as a frontend section-system upgrade, not a copywriting task.
2. Do not just restyle the current cards. Create better structural primitives.
3. Reduce sameness between sections.
4. Add support for a hero proof visual and workflow/system section.
5. Make the homepage skeleton feel premium before content refinement.
6. Build reusable card families that map to actual business page needs.
7. Keep the implementation CMS-friendly and repeatable.

## Deliverable Expected

Output:
- an improved section/card system implementation
- or a concrete section architecture proposal mapped to existing frontend components

It should include:
- section types created or revised
- card families created or revised
- layout rationale
- any new variants needed for the CMS renderer
- notes on how each section maps to benchmark patterns
