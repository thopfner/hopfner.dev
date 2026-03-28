# Enhancements v15: Semantic Alignment for Promoted Homepage Sections

## Objective

Once the promoted sections from v14 exist as permanent system sections, bring them fully into the same semantic formatting and elite UI system as the rest of the site.

This batch is about:

- shared semantic controls
- shared design-system token behavior
- section-specific elite UI treatment
- consistency without flattening every section into the same look

This is **not** a patch pass.
This is the formal alignment pass.

---

## Prerequisite

Do not start this batch until v14 is complete.

If these sections are still being rendered through `ComposedSection`, stop.
The semantic alignment batch must operate on permanent section renderers.

---

## Goal

The promoted sections must support the same truthful semantic formatting layer used by the built-in system sections.

That means support, where appropriate, for:

- `sectionRhythm`
- `sectionSurface`
- `cardFamily`
- `cardChrome`
- `contentDensity`
- `gridGap`
- `dividerMode`
- `headingTreatment`
- `labelStyle`
- `accentRule`

But do not expose every control blindly.
Expose only the controls that are meaningful for each section.

Truthful capability gating remains mandatory.

---

## Core Principle

These sections should feel like distinct premium section families within one coherent design system.

That means:

- common semantic contract
- different section personalities
- no generic dark-card sameness
- no bespoke local styling that bypasses the token system

---

## Section-by-Section Direction

## 1. `social_proof_strip`

Role:

- immediate trust reinforcement
- institutional credibility
- light, low-friction proof band

Recommended semantic behavior:

- supports `sectionRhythm`
- supports `sectionSurface`
- supports `headingTreatment`
- supports `labelStyle`
- limited or no `cardFamily` unless logo tiles or proof badges are visually card-like

Visual direction:

- cleaner than the current composed trust strip
- tighter logo discipline
- stronger spacing rhythm
- premium badge treatment
- should read as institutional trust, not filler content

Recommended variants:

- `logo_band`
- `logo_band_with_badges`
- `trust_metrics_band` if needed later

Do not over-card this section.
It should breathe more than the proof sections.

---

## 2. `proof_cluster`

Role:

- flagship proof section
- concentrated metrics + case proof + testimonial

Recommended semantic behavior:

- supports full semantic contract
- especially:
  - `sectionRhythm`
  - `sectionSurface`
  - `cardFamily`
  - `cardChrome`
  - `contentDensity`
  - `gridGap`
  - `headingTreatment`
  - `labelStyle`
  - `accentRule`

Visual direction:

- this should become one of the strongest sections on the page
- metrics should feel sharp and high-confidence
- proof card and testimonial should feel deliberately paired, not like two random boxes

Recommended section personality:

- proof-forward
- strong hierarchy
- more editorial than service cards

Recommended design behavior:

- metrics row should support a distinct metric-family treatment
- testimonial should not look like a generic card-grid item
- proof card should be more narrative and substantial than a small text box

This section must prove the design system can create differentiated roles, not just consistent borders.

---

## 3. `case_study_split`

Role:

- transformation story
- before/after comparison
- evidence-backed narrative

Recommended semantic behavior:

- supports:
  - `sectionRhythm`
  - `sectionSurface`
  - `cardFamily`
  - `cardChrome`
  - `contentDensity`
  - `gridGap`
  - `headingTreatment`
  - `labelStyle`
  - `accentRule`

Visual direction:

- more editorial and narrative than the proof cluster
- strong left/right composition
- before/after should feel clearly differentiated
- media block should feel intentional, not like a generic image placeholder panel

Recommended design behavior:

- before state should feel restrained and slightly colder
- after state should feel cleaner, brighter, more resolved
- supporting stats should reinforce the “after” side rather than float meaninglessly

This section should feel like a real case-study module, not a generic comparison block.

---

## 4. `steps_list` `workflow_visual` variant

Role:

- visual process explanation
- procedural trust
- operator clarity

Recommended semantic behavior:

- supports:
  - `sectionRhythm`
  - `sectionSurface`
  - `cardFamily`
  - `cardChrome`
  - `contentDensity`
  - `gridGap`
  - `dividerMode`
  - `headingTreatment`
  - `labelStyle`
  - `accentRule`

Visual direction:

- cleaner and more premium than the current custom workflow visual
- should feel like an operational system diagram
- stronger step hierarchy
- cleaner connectors

Recommended section personality:

- process/systemic
- orderly
- high-signal, not decorative

This should be one of the clearest examples of the process card family being visually distinct from service/proof families.

---

## Required Implementation Rules

## 1. Use the shared semantic resolver path

These promoted sections must resolve presentation through the same shared design-system layer used by the rest of the site.

Do not create new bespoke token systems for them.

## 2. No local card-style bypasses

Do not hardcode section-local border/shadow/bg systems that ignore:

- family
- chrome
- density
- accent
- surface

If a local visual tweak is needed, it should layer on top of the shared semantic contract, not replace it.

## 3. Capability truthfulness

Only show controls in admin that the section truly honors.

Example:

- if `social_proof_strip` does not meaningfully support `cardFamily`, do not expose it
- if `workflow_visual` does not use `dividerMode` in a meaningful way, do not expose it

## 4. Distinct section roles

Consistency does **not** mean sameness.

The target is:

- same system
- different roles

These sections should feel related, not identical.

---

## UI Standards

These sections must visibly exceed the current composed versions.

### `social_proof_strip`

Must feel:

- tighter
- cleaner
- more institutional
- less generic

### `proof_cluster`

Must feel:

- stronger
- more premium
- more differentiated
- more persuasive

### `case_study_split`

Must feel:

- more editorial
- more intentional
- more evidence-led

### `workflow_visual`

Must feel:

- more systemized
- more precise
- more premium than a generic flow diagram

---

## Suggested Implementation Order

1. wire semantic controls and capabilities for `social_proof_strip`
2. wire semantic controls and capabilities for `proof_cluster`
3. wire semantic controls and capabilities for `case_study_split`
4. wire semantic controls and capabilities for `workflow_visual` variant
5. refine section personalities so they are distinct but system-consistent
6. QA all controls admin -> publish -> live frontend

---

## QA Requirements

For each promoted section, verify live behavior after publish for supported controls.

### Required checks

- changing `sectionSurface` visibly changes the section background/stage treatment
- changing `sectionRhythm` visibly changes vertical pacing
- changing `cardFamily` changes card identity where supported
- changing `cardChrome` changes depth/edge treatment where supported
- changing `contentDensity` changes internal spacing meaningfully
- changing `headingTreatment` changes section hierarchy styling
- changing `labelStyle` changes badge/eyebrow/label treatment

### Section-specific proof checks

- `social_proof_strip` no longer feels like a generic heading + chips stack
- `proof_cluster` no longer feels like generic cards assembled side by side
- `case_study_split` no longer feels like a generic comparison block
- `workflow_visual` no longer feels like a custom mini-diagram detached from the main process system

---

## Acceptance Criteria

v15 is complete only if all of the following are true:

1. The promoted sections use the same semantic design-system contract as the rest of the site.

2. Admin exposes only truthful semantic controls for each section.

3. The live frontend shows clear semantic changes when those controls are edited and published.

4. The four promoted sections feel visually premium and aligned with the rest of the homepage.

5. They are clearly differentiated from each other by role, not flattened into one card style.

6. The implementation builds cleanly and is reproducible.

---

## Non-Acceptance Conditions

Do not mark this batch complete if:

- the sections still depend on bespoke styling that bypasses the semantic system
- the controls are exposed in admin but weak or dead on the frontend
- `proof_cluster` still reads like generic stacked cards
- `case_study_split` still reads like a composed comparison block with media attached
- `workflow_visual` still looks like a custom toy diagram instead of a flagship process section

---

## Deliverable

When finished, provide:

- which semantic controls each promoted section supports
- which controls were intentionally hidden
- screenshots or QA confirmation of live frontend changes
- confirmation that the promoted sections now visually align with the rest of the site
