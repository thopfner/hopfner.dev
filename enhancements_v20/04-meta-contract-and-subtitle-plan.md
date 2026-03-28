# Meta Contract And Subtitle Plan

This is the structural part of v20 that prevents the same problem from returning.

## Batch Split

This file contains work that must be split across the two v20 batches.

### Batch 1

- introduce the built-in shared-meta visibility contract in the admin editor
- make sure subtitle, CTA, and other shared fields appear in the drawer for built-in types that visibly render them

### Batch 2

- normalize the canonical built-in subtitle data path
- update preview and public renderer precedence together
- reduce or remove legacy built-in `content.subtitle` fallback behavior

Do not merge both halves into one rollout.

## Problem

The built-in editors currently rely on two unsafe mechanisms at once:

1. built-in renderers sometimes read shared fields from more than one source
2. shared field visibility is controlled by `defaults.capabilities.fields`

For subtitle specifically, that creates a truth gap:

- the live renderer may read `content.subtitle`
- the shared input edits `meta.subtitle`
- capability metadata may hide the shared subtitle input entirely

That is how a section can render a subtitle without a truthful drawer control.

## Required Structural Fix

Introduce a built-in editor contract in code.

Recommended file:

- `components/admin/section-editor/builtin-editor-contract.ts`

Recommended shape:

```ts
export type BuiltinMetaFieldContract = {
  title: boolean
  subtitle: boolean
  ctaPrimary: boolean
  ctaSecondary: boolean
  backgroundMedia: boolean
}

export const BUILTIN_EDITOR_META_CONTRACT: Record<BuiltinCmsSectionType, BuiltinMetaFieldContract> = {
  hero_cta: { title: true, subtitle: true, ctaPrimary: true, ctaSecondary: true, backgroundMedia: true },
  card_grid: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  steps_list: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  title_body_list: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  rich_text_block: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  label_value_list: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  faq_list: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  cta_block: { title: true, subtitle: false, ctaPrimary: true, ctaSecondary: true, backgroundMedia: false },
  footer_grid: { title: false, subtitle: false, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  nav_links: { title: false, subtitle: false, ctaPrimary: true, ctaSecondary: false, backgroundMedia: false },
  social_proof_strip: { title: true, subtitle: true, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  proof_cluster: { title: true, subtitle: true, ctaPrimary: true, ctaSecondary: false, backgroundMedia: false },
  case_study_split: { title: true, subtitle: true, ctaPrimary: true, ctaSecondary: false, backgroundMedia: false },
}
```

## How To Use It

In `section-editor-drawer-shell.tsx`:

- use the code contract for built-in section types
- only fall back to DB `capabilities.fields` for custom/composed types or for explicitly non-built-in behavior

This prevents a bad capability row from hiding a field the live renderer still uses.

This contract introduction is a **Batch 1** task.

## Subtitle Canonicalization

This section is **Batch 2 only**.

For built-in sections that currently render `content.subtitle || meta.subtitle`:

1. hydrate:
   - if `meta.subtitle` is empty and `content.subtitle` exists, seed the editor `meta.subtitle` from `content.subtitle`
2. edit:
   - expose only one subtitle input to the user
   - that input should be the shared subtitle field
3. save:
   - write subtitle through `meta.subtitle`
   - remove or normalize legacy `content.subtitle` for built-in section types
4. renderer:
   - after normalization, prefer `meta.subtitle`
   - once data is migrated, remove the content-subtitle fallback entirely for built-ins

## Why This Is Better

- one semantic field gets one editor input
- shared subtitle behavior becomes predictable across all built-ins
- future subtitle bugs are blocked by code structure instead of depending on DB rows staying perfect

## Other Shared Field Truth Rules

Apply the same contract discipline to:

- `ctaPrimary` on `hero_cta`, `cta_block`, `nav_links`, `proof_cluster`, `case_study_split`
- `ctaSecondary` on `hero_cta` and `cta_block`
- `backgroundMedia` on `hero_cta`

## DB Capability Rows

If the project also stores built-in field visibility in the database:

- update those rows for parity
- but do not keep the built-in editor shell dependent on those rows for core shared meta fields

The code contract must be the final truth for built-in section types.
