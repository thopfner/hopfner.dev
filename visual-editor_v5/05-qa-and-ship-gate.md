# 05 QA And Ship Gate

This is the release gate for the corrective pass.

## What Must Be Proven

- built-in section coverage is substantially complete
- large wrapped text edits are readable while editing
- CTA link editing feels integrated and CMS-grade
- the same dirty draft powers canvas and inspector edits
- the public renderer contract remains untouched

## Required Test Coverage

### Primitive Tests

- `SectionHeading` participates in visual editing when field path is present
- `EditableTextSlot` block editor preserves measured width and autosizes height
- single-line editor preserves visible width for short fields
- CTA link surface writes the correct href path

### Section Coverage Tests

Representative assertions:

- `title_body_list` item title/body edit in place
- `label_value_list` item label/value edit in place
- `proof_cluster` proof card title/body and CTA edit in place
- `case_study_split` before/after list items edit in place
- `booking_scheduler` title/subtitle/form text edit in place
- `footer_grid` visible CTA and text labels edit in place
- `nav_links` visible nav labels and CTA edit in place

### State And Interaction Tests

- editing a field disables conflicting drag behavior
- clicking a field does not trigger section reselect loops
- inspector mirrors inline changes immediately
- save and publish preserve edited values

## Manual QA Checklist

Run this in the authenticated visual editor:

1. Edit the home-page hero title.
   The whole title must remain visible and readable while editing.

2. Edit a title/body-list item body in place.
   No inspector fallback.

3. Edit a card-grid card title and description in place.

4. Edit a proof-cluster proof-card title/body and CTA.

5. Edit a case-study before/after list item and CTA.

6. Edit a nav CTA label and destination from the visible button.

7. Edit a footer CTA label and a visible footer link label.

8. Save, reload, and confirm the same fields remain correct.

## Failure Conditions

Do not approve if any of these remain true:

- section titles are still inconsistent across built-ins
- some built-in sections still have no usable in-place text editing
- large wrapped headings collapse into cramped edit fields
- CTA link editing still feels like a raw URL workaround
- visible repeater text remains inspector-only in normal flows

## Final Done Definition

This pass is complete only when the visual editor feels like one system, not a mixture of:

- raw sections
- partially instrumented sections
- one-off editable spots

The correct end state is:

- consistent top-level title editing
- consistent visible text coverage
- premium-sized editing surfaces
- premium CTA editing flow
