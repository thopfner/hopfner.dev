# v7 Acceptance Gate

This is the release gate for the next pass.

## Required Technical Checks

Run and report:

1. `npm test -- tests/visual-editor`
2. `npm run build`

Both should stay green.

## Required Manual QA

Because the remaining issues are mostly last-mile UX and data-contract items, manual QA matters more than before.

The coding agent must verify:

### Rich-text contract

- edit a rich-text section body
- save
- reload
- confirm the canonical rich-text field changed
- confirm no shadow `*Html` field behavior is required for the edit to persist

### Why section

- open `WhyThisApproachSection`
- edit the body from the canvas
- save and reload

### Booking section

- edit form heading
- edit submit label
- edit at least one intake label
- edit at least one intake placeholder/help text
- move through form state, calendar state, and success state
- confirm all visible template copy is covered

### Metadata surfaces

- edit one footer link destination
- edit the footer subscribe placeholder
- edit one header nav destination
- edit one social-proof logo destination or hotspot-managed metadata field

## Product Gate

Approve v7 only if all are true:

- the remaining contract issue around rich-text persistence is fixed
- `WhyThisApproachSection` no longer has a dead body surface
- booking flow copy is no longer half-covered
- nav/footer/social metadata surfaces feel complete
- no remaining joined-string edit surfaces undermine direct manipulation

## Final Standard

After v7, the visual editor should feel like it is in the final 10 percent of polish work, not still in structural catch-up.
