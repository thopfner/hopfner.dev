# Fresh Audit

This review supersedes the deleted prior `v19` pack. It reflects the current server code on `2026-03-09`.

## Findings

### 1. TipTap external sync is still incomplete

Severity: `P1`

Files:

- `components/admin/section-editor/fields/tiptap-json-editor.tsx:68`
- `components/admin/section-editor/fields/tiptap-json-editor.tsx:82`

What is true now:

- the editor is created with `content: value`
- the component stores `onChange` in a ref and guards update loops with `suppressUpdateRef`
- the code comments correctly state that `useEditor` only uses `content` during initial creation

What is still missing:

- there is no follow-up sync effect that compares the incoming `value` prop against the current TipTap document and pushes external changes into the editor instance

Why this matters:

- hydrate, restore, reset, section switch, or server-originated draft replacement can leave the visible rich-text editor stale while canonical state has already changed
- this is a correctness issue, not only a performance issue

### 2. Custom-composer dirty tracking is still coarse and can stick dirty after revert

Severity: `P1`

Files:

- `components/admin/section-editor/use-section-editor-session.ts:152`
- `components/admin/section-editor/use-section-editor-session.ts:169`
- `components/admin/section-editor/dirty-paths.ts:236`

What is true now:

- path-based session writes now exist for normal content and formatting edits
- the custom-composer path still routes through `patch-custom-block`

What is still wrong:

- `patch-custom-block` calls `updateDirtyPathForContent(...)`
- `updateDirtyPathForContent(...)` currently always adds `"content"` whenever a base snapshot exists
- it does not compare the affected custom block back to base and it does not clear the dirty marker when a user reverts a block to its original value

Why this matters:

- the drawer can remain dirty even when the current custom block state matches the published or restored base snapshot
- this weakens trust in the editor and creates avoidable save-state confusion in the most flexible section type

### 3. Custom-composer rerender isolation is still incomplete

Severity: `P2`

Files:

- `components/admin/section-editor/content-editor-router.tsx:72`
- `components/admin/section-editor/editors/custom-composer-editor.tsx:31`

What is true now:

- the large drawer extraction landed
- `CustomBlockEditor` is memoized
- the custom-composer path is much cleaner than before

What is still inefficient:

- `getMergedCustomBlock(block)` creates a fresh merged object for each block
- `CustomComposerEditor` calls that merge for every block on each render
- those fresh `merged` references are then passed into memoized block rows

Why this matters:

- editing one custom block can still invalidate sibling block props
- the remaining lag is likely concentrated in custom-composer sections rather than the entire drawer shell

## Confirmed Improvements

These earlier concerns no longer appear to be active in the current code:

- hot-path full-object dirty checking with `stableStringify()` is no longer present in the edit path; `stableStringify()` now remains in the payload/save path only
- the preview pipeline no longer appears to have the earlier double-debounce layer
- shell-level callback stability is materially improved
- row and block extraction is real for several heavy editors
- buffered field commits are now present in the editor tree
