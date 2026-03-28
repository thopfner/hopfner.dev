# Acceptance And Profiling

This pass is only done when both behavior and interaction cost are verified.

## Required Profiler Scenarios

Capture before and after for each scenario:

1. Hero editor:
   - type 10 characters into the title field
2. Card grid editor:
   - type 10 characters into one card title
3. Card grid editor:
   - edit one rich-text card body
4. Custom composer editor:
   - edit one card body or FAQ answer in a composed section
5. Footer grid editor:
   - edit one grouped link label
6. Formatting controls:
   - switch one formatting preset or semantic control

For each scenario, record:

- which components rerender
- whether sibling rows rerender
- whether `VersionStatusCard`, `CommonFieldsPanel`, or `PreviewPane` rerender unnecessarily
- qualitative input feel:
  - smooth
  - slightly delayed
  - visibly laggy

## Minimum Runtime Acceptance

The following must be true after the pass:

- editing one repeater row does not rerender sibling rows
- editing content does not rerender version history or unrelated shell panels because of unstable callback props
- dirty tracking does not serialize the full `content` object during typing
- preview updates do not block left-column typing
- rich text editing remains stable during unrelated updates

## Structural Acceptance

- `use-section-editor-session.ts` exposes exact path-based content/formatting actions
- `dirty-paths.ts` no longer performs hot-path full-object deep comparison for content or formatting
- `content-editor-router.tsx` adapts session actions into typed slice contracts
- `card-grid-editor.tsx` is row-based
- `custom-composer-editor.tsx` is block-based
- `footer-grid-editor.tsx` and `hero-cta-editor.tsx` are no longer single giant active trees

## Behavioral Regression Checklist

Manually verify:

- load existing section
- edit title/subtitle/CTAs
- save draft
- publish draft
- delete draft
- restore older version to draft
- background image upload / library select
- nav logo library select
- card image upload / library select
- custom block image upload / library select
- rich text media insertion

## Build And Validation

Run at minimum:

- `npm run build`

Also run available lint/tests if present and practical.

## This Does Not Count As Done

- the code is in more files but typing still feels the same
- `dirtyPaths` exists but content edits still deep-compare the full content object
- row components were created but still receive unstable props that rerender them all
- preview was deferred but active editor rows still churn on every keystroke
- no before/after profiler evidence exists
