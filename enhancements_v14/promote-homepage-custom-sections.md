# Enhancements v14: Promote Homepage Custom Sections Into Permanent System Sections

## Objective

The homepage sections currently rendered after the main CTA are too important to remain generic custom/composed sections.

They must be promoted into permanent, first-class system sections or permanent variants of existing system sections.

This batch is architectural.

It is **not** the semantic facelift batch.

Do not spend this round polishing visual nuance before the section architecture is corrected.

---

## Why This Batch Exists

The current sections:

- `trust_strip`
- `proof_cluster`
- `split_story`
- `workflow_visual`

are currently registry-driven custom/composed sections defined in:

- `migrations/20260307_custom_section_types.sql`

and rendered through:

- `components/landing/composed-section.tsx`

That is acceptable for prototypes or low-stakes custom content.
It is not the right long-term home for recurring flagship homepage sections.

These sections now need:

- durable frontend ownership
- stable editor models
- stable publish behavior
- durable CMS fields
- section-specific renderer control
- a clean path into the shared design system

---

## Recommendation

Promote them as follows:

### 1. `trust_strip`

Promote to a permanent built-in section:

- `social_proof_strip`

### 2. `proof_cluster`

Promote to a permanent built-in section:

- `proof_cluster`

Keep the name if you want, but it must no longer be a generic custom/composed section.

### 3. `split_story`

Promote to a permanent built-in section:

- `case_study_split`

This better describes the section’s strategic role.

### 4. `workflow_visual`

Do **not** keep this as a separate custom section type.

Absorb it into:

- `steps_list`

as a permanent layout variant:

- `workflow_visual`

This should be a first-class variant of your process system, not an isolated composed type.

---

## Final Permanent Target Map

### Current -> Target

- `trust_strip` -> `social_proof_strip`
- `proof_cluster` -> `proof_cluster` built-in section
- `split_story` -> `case_study_split`
- `workflow_visual` -> `steps_list` with `layoutVariant = workflow_visual`

This is the structurally correct end state.

---

## Design Principle

Anything that is:

- recurring on the homepage
- central to trust / proof / process / case study narrative
- likely to appear again on services or case-study pages

should not live as a generic composed section.

Those belong in the permanent section system.

The composed system should remain available for:

- experiments
- one-off landing pages
- lower-stakes custom layouts
- future R&D blocks

---

## Required Work

## 1. Add permanent section types and typing

Update the CMS/frontend type system to add:

- `social_proof_strip`
- `proof_cluster`
- `case_study_split`

and formalize:

- `steps_list` `layoutVariant = workflow_visual`

This must be reflected wherever section types are defined and normalized.

Likely files include:

- `lib/cms/types.ts`
- page renderer mapping in `app/(marketing)/[slug]/page.tsx`
- admin/editor type handling

Do not leave these represented only in `section_type_registry`.

---

## 2. Build dedicated frontend renderers

Create dedicated section renderers for:

- `social_proof_strip`
- `proof_cluster`
- `case_study_split`

And implement `workflow_visual` as a real variant inside:

- `components/landing/how-it-works-section.tsx`

or the relevant `steps_list` renderer path.

The point is to remove homepage dependence on `ComposedSection` for these specific sections.

These renderers should have dedicated props, not generic `block` arrays.

---

## 3. Create proper CMS/editor models

Each promoted section needs a structured admin experience.

Do not keep them as generic composer blocks.

### `social_proof_strip`

Recommended data model:

- eyebrow
- title
- subtitle
- logos[]
  - label
  - imageUrl
  - alt
  - href optional
- trust badges[]
  - text
  - icon optional
- optional trust note
- layoutVariant if needed

### `proof_cluster`

Recommended data model:

- eyebrow
- title
- subtitle
- metrics[]
  - value
  - label
  - icon optional
- proof card
  - title
  - body
  - stats[]
- testimonial
  - quote
  - author
  - role
  - imageUrl optional
- optional CTA

### `case_study_split`

Recommended data model:

- eyebrow
- title
- subtitle
- narrative rich text
- before label
- after label
- before items[]
- after items[]
- media title
- media image / visual
- supporting stats[]
- optional CTA

### `steps_list` with `workflow_visual`

Recommended to reuse existing steps model where possible:

- eyebrow
- title
- subtitle
- steps[]
  - title
  - body
  - icon optional
  - stat optional

Avoid creating a second competing process data model unless truly required.

---

## 4. Add page renderer support

Update the main page renderer so these sections are rendered through dedicated paths, not through the custom/composed fallback.

Expected result:

- homepage references to these sections resolve to built-in section renderers
- `workflow_visual` resolves through the `steps_list` renderer with a variant

This must be explicit and durable in source.

---

## 5. Migrate existing homepage content

Migrate the current homepage content from the old custom/composed sections into the new permanent section data model.

The migration should preserve:

- current content
- current ordering
- page references
- publish state

Recommended approach:

- write a migration/backfill script or SQL-assisted content move
- map existing composed schema content into the new built-in section payloads
- republish homepage after migration

Do not require manual hand re-entry in admin for production homepage content if it can be avoided.

---

## 6. Deprecate homepage use of the old custom section types

After migration:

- remove those homepage instances from using the custom registry types
- keep the old registry entries only if you still want them for legacy/editor experimentation
- if retained, mark them clearly as legacy or non-homepage types

Do not let the homepage remain dual-wired between permanent and composed versions.

---

## 7. Editor drawer requirements

For these promoted sections, the page-level editor drawer must expose real structured controls.

That means:

- no generic `customBlocks` editing for these homepage sections
- no dependency on the composed block patch flow

The user editing experience must be consistent with the rest of the system sections.

---

## Batch Boundary

This batch stops after:

- permanent section types exist
- data models exist
- renderers exist
- homepage content is migrated
- editor support exists
- homepage is no longer dependent on composed-section for these four sections

Do **not** try to finish the elite semantic facelift in this batch.

Visual parity work belongs in the next batch.

---

## Required Acceptance Criteria

v14 is complete only if all of the following are true:

1. `trust_strip`, `proof_cluster`, and `split_story` are no longer rendered as generic composed sections on the homepage.

2. `workflow_visual` is no longer a generic custom section and instead renders as a built-in `steps_list` variant.

3. The editor drawer exposes dedicated structured fields for the promoted sections.

4. Existing homepage content is migrated and published without manual content loss.

5. The homepage build and live runtime work without relying on the old custom section path for these sections.

6. The implementation is committed and reproducible.

---

## Non-Acceptance Conditions

Do not mark this batch complete if:

- the homepage still renders these sections via `ComposedSection`
- the new permanent sections exist but the homepage still points to the old custom section types
- editor support still relies on generic custom block patching
- `workflow_visual` remains a standalone custom registry section

---

## Deliverable

When finished, provide:

- which permanent section types were added
- how homepage content was migrated
- confirmation that the homepage no longer uses the old composed section path for these sections
- confirmation that the editor drawer supports these sections directly
