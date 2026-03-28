# Safe Follow-Up Focus

If a coding agent acts on this audit, the next pass should be tightly scoped to avoid regressing the user's recent editor and preview work.

## Do Change

- add an explicit external-value synchronization effect to `components/admin/section-editor/fields/tiptap-json-editor.tsx`
- replace coarse custom-composer dirty marking with exact block-aware dirty-path updates in `components/admin/section-editor/use-section-editor-session.ts` and `components/admin/section-editor/dirty-paths.ts`
- stop recreating merged custom-block props for unaffected siblings in the custom-composer path

## Do Not Change Without Fresh Evidence

- do not re-open the old preview double-debounce work; it does not appear to still exist in the current source
- do not broaden this into another shell extraction pass
- do not change save, publish, restore, or delete-draft payload contracts unless a new bug is proven
- do not perform broad preview-pane rewrites just because the earlier audit mentioned them

## Recommended Acceptance Checks

- restoring a section with rich-text content visibly updates every TipTap field without remount hacks
- switching between sections with different rich-text bodies never leaves stale editor content on screen
- editing a custom block and then reverting it to the original base state clears dirty state correctly
- editing one custom block does not visibly jank sibling custom blocks
- `npm run build` still passes
