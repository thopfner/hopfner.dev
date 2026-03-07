# Implementation Checklist

## Frontend

- load and apply the exact `Obsidian Operator` font system
- add role-based typography CSS variables
- update hero, section headings, eyebrow labels, metric text, and process labels to use the new roles
- add semantic section rhythm handling
- add semantic section surface and card-family handling
- implement `Obsidian Signal` brand signature layer
- refactor repeated card treatments so major homepage sections no longer look visually identical

## Admin / CMS

- extend site-wide formatting admin for:
  - display font
  - body font
  - mono font
  - role scales
  - tracking controls
  - signature style/intensity/color controls
- extend page drawer for:
  - section rhythm
  - content density
  - grid gap
  - heading treatment
  - section surface
  - card family
  - card chrome
  - accent rule
  - divider mode
- hide irrelevant controls for section types that do not need them

## Data / Defaults

- add `Obsidian Operator` formatting template
- add at least two supporting premium templates
- update default formatting for major homepage section types so they do not all inherit the same visual treatment
- keep backwards compatibility with old formatting JSON where practical

## QA

- run `npm run build`
- review homepage at desktop and mobile breakpoints
- verify admin controls save and re-render correctly
- verify templates apply correctly
- verify no section falls back to an obviously generic card treatment unless intentional
