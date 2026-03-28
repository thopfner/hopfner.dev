# Acceptance Checklist

## Structural

- `components/section-editor-drawer.tsx` is no longer the main implementation monolith
- resource loading lives outside the shell
- canonical draft state is reducer-backed
- a dedicated content editor router selects the active editor
- custom composer editing is extracted from the shell

## Performance

- no full-form `stableStringify()` on every keystroke
- typing in large editors no longer stalls the drawer
- preview updates do not block left-column editing
- only the active editor subtree re-renders during typing

## Rich Text Stability

- `TipTapJsonEditor` is moved out of the monolith
- rich text fields remain stable across unrelated panel updates

## Behavior

- loading a section still hydrates correctly
- saving a draft still archives prior drafts and inserts a new draft version
- publish still promotes the latest saved draft
- restore still creates/restores a draft through the existing RPC path
- delete draft still removes active draft state cleanly

## Section Coverage

- all built-in section types work after extraction
- custom composed sections still work after extraction
- media library flows still work for:
  - background image
  - nav logo
  - card image
  - custom block image

## QA

- compare profiler results from before and after
- manually test at least:
  - hero editor
  - card grid editor
  - proof cluster editor
  - custom composer proof card / comparison blocks
  - save / publish / restore
