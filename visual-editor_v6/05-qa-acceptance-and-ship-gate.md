# QA Acceptance And Ship Gate

This is the release bar for v6.

## Required QA Evidence

The coding agent must provide evidence for all of the following:

1. `Hero proof`
   Show the home hero headline editing at full rendered size with no cramped mini-input.

2. `Link proof`
   Show a CTA link and a nav/footer link using the visual link picker with:
   - page selection
   - anchor selection
   - custom URL
   - clear link

3. `Rich-text proof`
   Show one HTML-backed section body being edited from the canvas without falling back to the form editor.

4. `Repeated-item proof`
   Show array-item editing in:
   - hero bullets or stats
   - footer links
   - booking intake fields

5. `Motion-surface proof`
   Show a counter and a marquee surface behaving as stable editable content in visual mode.

## Required Manual QA Pass

The coding agent must manually verify these sections in the logged-in admin visual editor:

- hero
- workflows
- tech stack
- FAQ
- final CTA
- proof cluster
- case study
- booking scheduler
- footer
- site header

For each section verify:

- click visible text and edit directly
- click visible CTA and edit label directly
- edit destination without leaving the canvas
- save draft
- reload visual editor
- confirm edited content persists
- confirm public page rendering still respects the same payload

## Required Regression Checks

### Renderer regression

Verify that when no `VisualEditingProvider` is mounted:

- no edit affordances render
- motion surfaces behave exactly as before
- no admin-only UI leaks to public pages

### Payload regression

Verify:

- edited values write to the same payload paths already used by the form editor
- rich-text writes do not destroy existing structured content
- link edits preserve existing `buildHref` semantics

### Publish regression

Verify:

- draft save works
- publish works
- reload after publish shows the same content in both visual editor and public renderer

## Test Coverage Expectations

At minimum add targeted coverage for:

- `EditableTextSlot` sizing behavior
- visual link picker state and commit behavior
- structured rich-text visual edit commit behavior
- admin-only static fallback mode for animated counters or marquee surfaces

## Final Ship Decision

Approve v6 only if all are true:

- the gap matrix is fully closed
- no built-in section remains partial
- the hero title edit experience is clearly fixed
- link editing now matches CMS semantics
- rich-text blocks are no longer dead surfaces
- the public renderer remains unchanged outside admin visual editing
