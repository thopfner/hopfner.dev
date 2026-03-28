# 02 Non-Negotiable Implementation Order

Follow this order exactly.

## Step 1 Fix The Shared Title Primitive First

Target file:

- `components/landing/section-primitives.tsx`

Required action:

- upgrade `SectionHeading` so it can participate in the visual editing system
- either:
  - accept a `fieldPath` prop and render `EditableTextSlot` internally, or
  - replace it with a shared `EditableSectionHeading`

Recommendation:

- keep one shared primitive
- pass `fieldPath="meta.title"` from all built-in callers

Do not keep manually patching some sections while the shared heading primitive remains raw.

## Step 2 Finish Built-In Coverage By Inventory, Not By Taste

Work through the built-in section list from `SectionPreview` in a fixed order.

Order:

1. `WorkflowsSection`
2. `TechStackSection`
3. `WhyThisApproachSection`
4. `BookingSchedulerSection`
5. `ProofClusterSection`
6. `CaseStudySplitSection`
7. `SocialProofStripSection`
8. `FooterGridSection`
9. `SiteHeader`

Do not skip around based on whichever section is easiest.

## Step 3 Replace Partial Coverage Inside Already-Instrumented Sections

For sections already using `EditableTextSlot` or `EditableLinkSlot`, complete the visible plain-text coverage instead of stopping at headers.

Required rule:

- if the text is visible and maps to a current payload path, instrument it now

Do not stop at:

- eyebrow
- title
- subtitle

when the section visibly renders:

- card copy
- labels
- metrics
- CTA text
- repeated list items

## Step 4 Replace The Raw Link Popover

Target files:

- `components/landing/editable-link-slot.tsx`
- form-editor link resources and components under `components/admin/section-editor`

Required action:

- replace the raw URL input popover with an anchored visual-editor link surface that reuses existing link-menu behavior

The visual editor must not maintain a weaker link-editing model than the form editor.

## Step 5 Fix Field Editor Sizing Before More Coverage Polish

Target file:

- `components/landing/editable-text-slot.tsx`

Required action:

- redesign the edit-mode surface so large wrapped fields remain readable while editing

Do not treat this as a minor CSS tweak.

It is a core product-quality issue.

## Step 6 Only After Coverage And Sizing, Polish The Affordances

After the above is complete:

- refine hover/focus chrome
- refine field-to-field tab flow
- refine CTA link affordance placement

Do not spend time polishing field affordances while half the visible text is still raw.
