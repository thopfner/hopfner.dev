# Capability Truth Plan

This is the first implementation batch. Do not start the visual redesign before this is fixed or folded into the same branch.

## Objective

Make the backend control surface truthful:

- if the renderer consumes a semantic control, admin must be able to expose it intentionally
- if admin cannot expose a control, the public renderer should not depend on it
- if a section has no real support for a token, strip it instead of storing phantom styling

## Core Repairs

### 1. Fix Capability Loading Fallback Behavior

Current problem:

- `loadCapabilitiesFromClient()` returns only DB rows when any rows exist.
- `isControlSupportedActive()` then trusts that partial map and returns `false` for missing section types.

Required change:

- merge DB capability rows over `SECTION_CAPABILITIES` instead of replacing the entire map
- optionally merge `section_type_defaults.capabilities.supported` as an additional fallback for promoted/builtin types

Target files:

- `lib/design-system/loaders.ts`
- `components/section-editor-drawer.tsx`
- optionally `lib/design-system/capabilities.ts`

Recommended behavior:

1. Start from `SECTION_CAPABILITIES`.
2. Overlay DB rows where present.
3. For any promoted builtin section type missing from DB, fall back to code constants or defaults capability JSON.
4. Log or surface missing capability rows during development so drift becomes obvious.

### 2. Backfill And Align `section_control_capabilities`

Add a migration that seeds or updates rows for homepage-relevant permanent sections.

Recommended target matrix:

| Section type | Target semantic controls |
| --- | --- |
| `hero_cta` | `headingTreatment`, `labelStyle` |
| `social_proof_strip` | `sectionRhythm`, `sectionSurface`, `contentDensity`, `gridGap`, `headingTreatment`, `labelStyle` |
| `proof_cluster` | `sectionRhythm`, `sectionSurface`, `contentDensity`, `gridGap`, `headingTreatment`, `labelStyle`, `cardFamily`, `cardChrome`, `accentRule` |
| `case_study_split` | `sectionRhythm`, `sectionSurface`, `contentDensity`, `gridGap`, `headingTreatment`, `labelStyle`, `cardFamily`, `cardChrome`, `accentRule` |
| `steps_list` | include `gridGap` |
| `title_body_list` | include `gridGap`, `labelStyle`, `cardFamily`, `cardChrome`, `accentRule` if those remain renderer-truthful |
| `label_value_list` | include `gridGap`, `cardFamily`, `cardChrome`, `accentRule` if those remain renderer-truthful |
| `cta_block` | include `labelStyle`, `cardFamily`, `cardChrome`, `accentRule` if those remain renderer-truthful |

Do not give `nav_links` and `footer_grid` fake parity through this table unless their renderers are first upgraded to a real semantic contract.

### 3. Normalize Or Strip Unsupported Stored Tokens

The homepage already has semantic formatting stored for sections whose DB rows deny those controls.

Required rule:

- if a token is not truly supported, strip it on save/publish or migrate it out
- if a token is meaningful in the renderer, expose it in admin and keep it

Nuance:

- for `hero_cta`, only keep the semantic tokens that produce a real hero difference
- do not preserve extra semantic values merely because they already exist in `section_versions.formatting`

### 4. Fix Repeated Heading IDs

Introduce a shared pattern for unique section heading IDs.

Recommended approach:

- derive a `headingId` from `sectionId` when available
- fall back to a slugified section title plus a stable suffix
- pass `headingId` into `SectionShell` and `SectionHeading`
- stop hardcoding IDs like `services-title`, `tech-title`, `how-it-works-title`, `final-cta-title`, `case-study-title`, `proof-cluster-title`

Target files:

- `components/landing/section-primitives.tsx`
- repeated permanent section renderers listed in `01-findings.md`

### 5. Public Null-State Rules For Proof Sections

On public pages:

- never render `Media placeholder`
- never render placeholder copyright
- never render fake proof defaults unless the section is explicitly in preview/admin mode

Recommended behavior:

- if `case_study_split` has no real media, either hide the media panel entirely or render a neutral abstract decorative panel that is clearly not pretending to be proof
- if proof/testimonial/logos are incomplete, hide the section or switch to a draft-safe neutral state

## Acceptance Criteria

- every homepage permanent section has a truthful capability definition
- the admin visibly exposes the controls each renderer actually honors
- missing DB rows no longer zero out semantic controls
- repeated homepage sections have unique `aria-labelledby` targets
- no public placeholder/demo proof survives after publish
