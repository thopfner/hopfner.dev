# Findings

Findings are ordered by priority and categorized by failure mode.

## P0: Capability Mismatch Across Homepage Sections

Category: capability mismatch

The admin prefers DB-backed `section_control_capabilities` when any DB rows exist. It does not merge per-section fallbacks. That means missing or stale DB rows silently hide controls even when renderers already consume those semantics.

Evidence:

- `components/section-editor-drawer.tsx:1278-1285`
- `lib/design-system/loaders.ts:155-176`

Observed homepage sections with missing or stale semantic control truth:

| Homepage section | Live key | Current backend semantic support | Frontend reality |
| --- | --- | --- | --- |
| Header | `nav_links` | none | no semantic/global appearance system; generic header styling |
| Hero | `hero_cta` | DB row exposes none | renderer uses `headingTreatment` and `labelStyle`; published hero formatting stores additional semantic tokens |
| Social proof | `social_proof_strip` | no DB row | renderer accepts `ui`, uses `SectionShell`, `headingTreatment`, `labelStyle`, `density`, `gridGap` |
| Proof cluster | `proof_cluster` | no DB row | renderer accepts `ui`, uses `rhythm`, `surface`, `density`, `gridGap`, `headingTreatment`, `labelStyle`, `card` presentation |
| Case study | `case_study_split` | no DB row | renderer accepts `ui`, uses `rhythm`, `surface`, `density`, `gridGap`, `headingTreatment`, `labelStyle`, `card` presentation |
| Footer | `footer_grid` | none | renderer bypasses `SectionShell`; generic footer cards with fallback template copy |

Additional stale DB rows on homepage:

- `title_body_list`: live `who-its-for` uses `cardFamily`, `cardChrome`, `accentRule`, but DB support does not include them.
- `label_value_list`: live `trust-proof` uses `cardFamily` and `cardChrome`, but DB support does not include them.
- `cta_block`: live final CTA uses `cardFamily` and `cardChrome`, but DB support does not include them.
- `steps_list`: code/defaults support `gridGap`, DB row still lags.

Impact:

- editors cannot truthfully shape the homepage from the backend
- saved styling can exist in published data without being meaningfully editable
- the site cannot be elevated consistently because the strongest premium sections have the weakest admin truth

## P0: Reused Heading IDs Break Repeated Section Semantics

Category: architecture gap

Several permanent section renderers hardcode the same heading ID for every instance. When the component appears more than once, `aria-labelledby` resolves to the first matching ID in the DOM.

Evidence in code:

- `components/landing/what-i-deliver-section.tsx:141,157`
- `components/landing/tech-stack-section.tsx:164,178,212,226,278,292`
- `components/landing/how-it-works-section.tsx:67,83,153,169,260,275,356,370`
- `components/landing/final-cta-section.tsx:57,118,150,221`
- `components/landing/proof-cluster-section.tsx:83,101`
- `components/landing/case-study-split-section.tsx:75,94`

Live DOM evidence:

- the services section is announced as `Core Outcomes`
- the lower `How it works` section is announced as `How Engagements Work`

Impact:

- accessibility semantics are wrong
- QA of repeated section types is misleading
- future analytics/in-page navigation features will inherit incorrect anchors

## P1: Demo Proof Content Is Still Live On The Homepage

Category: renderer truthfulness gap plus content quality gap

The homepage currently presents seeded or placeholder proof as if it were real.

Live examples:

- social proof strip: `Trusted by industry leaders` plus `Trust me bro`
- proof cluster: generic `Enterprise automation` proof card and anonymous `CTO / Enterprise Client`
- case study: `Describe the problem or challenge your client faced.`
- case study media panel: renderer-level `Media placeholder`
- footer: `© 2026 Your Company`

Evidence:

- live homepage audit on 2026-03-08
- `components/landing/case-study-split-section.tsx:187-190`
- `components/landing/footer-grid-section.tsx:144-150`
- seeded defaults in `migrations/20260308_v14_promote_sections.sql`

Impact:

- destroys trust precisely where the homepage is supposed to establish trust
- makes the lower half of the page feel like an unfinished template
- blocks any claim to elite SaaS/UI quality

## P1: Footer Is Generic, Semantically Unstyled, And Partly Non-Truthful

Category: renderer truthfulness gap plus visual quality gap

The footer is currently a generic two-card sitemap/subscription block. It does not use `SectionShell`, has no semantic design-system integration, contains placeholder links, and exposes a subscribe UI with no real interaction model in the renderer.

Evidence:

- `components/landing/footer-grid-section.tsx:22-164`
- published footer content includes multiple `#` links and placeholder copyright

Impact:

- the homepage ends on a template-like block instead of a premium closing surface
- the UI exposes dead affordances and placeholder content
- footer cannot be art-directed through the same semantic system as the body sections

## P1: Lower-Page Visual Hierarchy Falls Off After The Hero

Category: visual quality gap

The hero is the strongest section. After that, the page loses premium hierarchy:

- social proof is too faint and too thin to carry trust
- proof cluster is readable but generic; it feels like a starter theme proof row, not institutional evidence
- case study lacks a real visual artifact and reads like filler copy
- footer reads like a default product sitemap

Desktop and mobile both preserve structure, but not elite differentiation.

## P2: Header Is Usable But Not Premium Enough

Category: visual quality gap

The header is operationally fine, but it lacks brand presence and has no premium signature beyond a thin translucent bar.

Evidence:

- no live logo in the header payload
- `components/landing/site-header.tsx:121-247`

Impact:

- the page opens with strong hero typography but weak brand framing
- the global chrome does not match the ambition of the hero or the intended consultancy positioning
