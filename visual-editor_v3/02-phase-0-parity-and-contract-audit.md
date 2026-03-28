# 02 Phase 0 Parity and Contract Audit

This is the mandatory first implementation phase.

The agent should not jump straight into polishing UI. The current risk is not styling. The current risk is incomplete contract coverage.

## Phase Goal

Build a complete, testable parity map between:

- current form editor controls
- current visual editor controls
- stored payload/formatting fields
- actual frontend renderer usage

## Required Deliverable

Create an internal parity matrix before adding new UI.

The matrix should cover, per section type:

- text-bearing fields
- CTA label fields
- CTA link fields
- background media fields
- section preset support
- design-token controls
- advanced spacing controls
- low-level override controls
- section-specific content arrays or repeaters
- direct-edit eligibility
- direct-manipulation eligibility

This can live as an internal dev artifact, test fixture, or typed registry, but it must exist.

## Immediate Contract Corrections

The agent must verify and, where still needed, correct:

- loader field names against the real schema
- preview merge order against the public renderer
- hydration of `sections.formatting_override`
- publish argument shape against the actual RPC signature
- dirty-state behavior when saving and switching
- feature flag default behavior

These are release blockers, not polish items.

## Shared Registry Recommendation

Introduce a typed visual-editor registry that answers:

- which fields are editable for a section type
- which fields are text-editable inline
- which fields require inspector editing
- which fields support link-picking UI
- which formatting controls are supported
- which manipulation handles are allowed

This registry should be derived from existing capability helpers where possible, not maintained as a disconnected second truth.

## Required File/Area Review

The coding agent should explicitly audit:

- current visual editor inspector and node components
- form editor formatting controls
- shared/common fields panels
- section-specific editor panels
- payload helpers
- preview/render helpers
- Supabase loader/persistence adapters

## Key Design Rule

If a field exists in the current form editor and affects the live renderer, the visual editor must either:

- expose it directly now, or
- explicitly classify it as intentionally deferred with a reason

For this cycle, defer only truly exceptional edge cases. Common authoring fields should not be deferred.

## Acceptance Criteria

- a complete parity matrix exists
- all current gaps are enumerated before UI work proceeds
- contract mismatches are identified early instead of discovered during polish
- visual-editor work can be measured against an explicit coverage target

## Risk Control

Do not let new visual affordances get ahead of actual field coverage.

An editor that feels premium but cannot edit the real content model is not shippable.
