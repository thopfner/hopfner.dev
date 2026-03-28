# Claude Execution Prompt

You are working in `/var/www/html/hopfner.dev-main`.

Refactor `components/section-editor-drawer.tsx` into a production-grade editor architecture. This is not a cosmetic split. It must fix the structural performance problem without changing the save/publish/restore payload contract.

Current facts from the live file:

- file length: 5,047 lines
- hot dirty-check path: `components/section-editor-drawer.tsx:1395-1409`
- monolithic body render: `components/section-editor-drawer.tsx:1968-4952`
- built-in section editors inline: `components/section-editor-drawer.tsx:2165-3996`
- custom composer editor inline: `components/section-editor-drawer.tsx:3997-4896`
- preview props wired directly to live content/formatting: `components/section-editor-drawer.tsx:4931-4943`
- TipTap wrapper still defined inside this file: `components/section-editor-drawer.tsx:1140-1231`

Required implementation:

1. extract shared field primitives first
2. extract version/common/preview panels
3. isolate resource loading and RPC behavior in `use-section-editor-resources`
4. replace canonical draft `useState` sprawl with a reducer-backed `use-section-editor-session`
5. extract a `content-editor-router` and one file per built-in section editor
6. extract the custom composer editor as its own top-level editor module
7. replace hot-path full-form `stableStringify()` dirty checking with path-based dirty tracking
8. move preview to a deferred snapshot via `useDeferredValue`, optionally with `startTransition`

Non-negotiable constraints:

- do not change payload shape used by save/publish/restore
- do not leave section editor JSX inline in the shell
- do not keep the full content object flowing through unrelated panels
- do not stop at file extraction if parent state ownership remains monolithic
- do not introduce a new state library unless absolutely necessary

Target module layout:

```text
components/
  section-editor-drawer.tsx
  admin/
    section-editor/
      section-editor-drawer-shell.tsx
      use-section-editor-resources.ts
      use-section-editor-session.ts
      types.ts
      dirty-paths.ts
      payload.ts
      preview-pane.tsx
      version-status-card.tsx
      common-fields-panel.tsx
      content-editor-router.tsx
      fields/
        link-menu-field.tsx
        list-editor.tsx
        tiptap-json-editor.tsx
      editors/
        hero-cta-editor.tsx
        card-grid-editor.tsx
        steps-list-editor.tsx
        title-body-list-editor.tsx
        rich-text-block-editor.tsx
        label-value-list-editor.tsx
        faq-list-editor.tsx
        cta-block-editor.tsx
        footer-grid-editor.tsx
        nav-links-editor.tsx
        social-proof-strip-editor.tsx
        proof-cluster-editor.tsx
        case-study-split-editor.tsx
        custom-composer-editor.tsx
```

Execution rules:

- land the refactor in phases
- keep each phase behaviorally safe
- profile before and after
- preserve existing extracted `FormattingControls` and `SectionPreview` where possible
- use the reducer to make dirty state exact and cheap

Definition of done:

- `components/section-editor-drawer.tsx` becomes a thin compatibility export or shell
- only the active content editor re-renders during typing
- preview updates no longer sit on the hot typing path
- no full-form stringify remains in hot edit flow
- save / publish / restore / delete draft still work identically
