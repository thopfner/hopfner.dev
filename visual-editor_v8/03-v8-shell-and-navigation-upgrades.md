# v8 Shell And Navigation Upgrades

The editor now needs stronger page-level ergonomics.

## 1. Add A Real Page Chooser To The Top Bar

## Current problem

The current toolbar shows the current page title and slug, but it does not behave like a real multi-page editor shell.

## Required upgrade

Add a page chooser to the top bar.

It should:

- show the current page clearly
- support quick switching between pages
- support search by title and slug
- route directly to the visual editor for the chosen page

## UX standard

This should feel like a premium command-style page switcher, not a raw select element.

## File touchpoints

- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
- existing page-loading/resource path reused where possible

## 2. Structure Rail Must Prefer Section Titles Over Type Labels

## Current problem

The structure rail still leads with internal type labels via `formatType(...)`.

That is useful for developers.

It is not the right primary label for editors.

## Required upgrade

Each structure item should display:

1. primary label
   the current section title if one exists

2. secondary label
   the section type label in muted text

3. optional tertiary signal
   eyebrow, key, or status only when useful

Fallback order:

- `dirty draft meta.title`
- `draft version meta.title`
- `published version meta.title`
- humanized section type

## File touchpoints

- `components/admin/visual-editor/page-visual-editor-structure.tsx`
- helper extraction if needed for display-label resolution

## 3. Add Section Search / Jump

Once titles are surfaced, add a small search/filter box above the structure rail.

Minimum behavior:

- filter by section title
- filter by type label
- filter by section key if available

This is a high-value upgrade for long pages.

## 4. Upgrade Context In The Top Bar

Improve the top bar so it feels less like a beta utility strip and more like a product shell.

Recommended improvements:

- current page chooser
- “open public page” quick action
- “back to pages” quick action
- cleaner status grouping for saved/published/error states

Remove anything that reads as provisional unless it is still truly provisional.

## Acceptance

This file is complete only when:

- page switching is faster
- the structure rail reads like a real page outline
- long pages are easier to scan and navigate
