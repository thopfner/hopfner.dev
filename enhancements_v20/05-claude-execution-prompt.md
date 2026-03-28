# Claude Execution Prompt

Work in:

- `/var/www/html/hopfner.dev-main`

Read first:

1. `/var/www/html/hopfner.dev-main/enhancements_v20/01-comprehensive-review.md`
2. `/var/www/html/hopfner.dev-main/enhancements_v20/02-field-coverage-matrix.md`
3. `/var/www/html/hopfner.dev-main/enhancements_v20/03-layout-restructure-plan.md`
4. `/var/www/html/hopfner.dev-main/enhancements_v20/04-meta-contract-and-subtitle-plan.md`

## Objective

Implement the section-editor v20 pass safely.

This is not a performance refactor.
This is not a preview rewrite.
This is a truth-and-layout pass.

Deliver:

1. a logical drawer order with content first and layout/styling second
2. truthful field coverage for all built-in section types
3. a robust built-in shared-meta contract so renderer-backed fields cannot disappear from the drawer again

## Required Rollout Shape

You must land this in **two batches**.

### Batch 1: Admin-only alignment

Deliver all of the following without changing public frontend renderer behavior:

- shell reorder
- per-editor reorder
- missing editor inputs for existing renderer-backed fields
- code-owned built-in shared-field visibility contract in the admin
- admin preview parity only where needed so newly exposed existing fields preview correctly

Batch 1 must avoid changing the public renderer precedence for subtitle/meta fields.

### Batch 2: Subtitle / meta normalization

Only after Batch 1 is stable:

- normalize built-in subtitle source of truth
- align preview and public renderer behavior together
- clean up legacy `content.subtitle` fallback behavior for built-ins

Do not combine Batch 1 and Batch 2 into one implementation pass.

## Non-Negotiable Constraints

- preserve the recent session/performance work
- preserve the recent preview-pane work except where built-in subtitle normalization requires matching renderer and preview changes
- do not rewrite reducer/session architecture
- do not touch unrelated formatting-control behavior
- do not create duplicate subtitle fields
- do not leave any renderer-backed field unreachable

## Exact Work Required

### 1. Reorder the shell

In `components/admin/section-editor/section-editor-drawer-shell.tsx`:

- move section content ahead of `FormattingControls`
- split the current shared-fields area into logical groups
- keep version status first and version history last

### 2. Introduce a built-in editor meta contract

Create a small code-owned contract for built-in section types that decides whether shared fields must be shown:

- `title`
- `subtitle`
- `ctaPrimary`
- `ctaSecondary`
- `backgroundMedia`

Use that contract for built-ins instead of trusting DB capability rows alone.

This is a Batch 1 task.

### 3. Fix subtitle truth properly

This is a Batch 2 task only.

For built-in types that currently render `content.subtitle || meta.subtitle`:

- make the editor expose one subtitle input only
- normalize legacy `content.subtitle` into shared subtitle editing
- update both public renderer and admin preview together if source precedence changes

Do not ship another state where the frontend can render subtitle text that the drawer cannot edit.

### 4. Patch the confirmed missing fields

Implement these exact field gaps:

- `card_grid`
  - section-level `cardDisplay` controls
  - per-card image alt text
- `faq_list`
  - eyebrow
- `rich_text_block`
  - eyebrow
- `nav_links`
  - anchor target support for `anchorId`
- `social_proof_strip`
  - logo href/link
- `case_study_split`
  - rich-text narrative editor for `narrativeRichText`

All of these belong in Batch 1.

### 5. Reorder each built-in editor internally

Within each editor:

- put copy/content first
- put repeaters next
- put layout/display controls last

Do this without changing saved data shape beyond the subtitle normalization required above.

This is a Batch 1 task.

## Suggested File Touch List

### Batch 1

- `components/admin/section-editor/section-editor-drawer-shell.tsx`
- `components/admin/section-editor/common-fields-panel.tsx`
- new shared panel files if needed
- new built-in contract file
- `components/admin/section-editor/editors/card-grid-editor.tsx`
- `components/admin/section-editor/editors/card-grid-row.tsx`
- `components/admin/section-editor/editors/steps-list-editor.tsx`
- `components/admin/section-editor/editors/title-body-list-editor.tsx`
- `components/admin/section-editor/editors/rich-text-block-editor.tsx`
- `components/admin/section-editor/editors/label-value-list-editor.tsx`
- `components/admin/section-editor/editors/faq-list-editor.tsx`
- `components/admin/section-editor/editors/cta-block-editor.tsx`
- `components/admin/section-editor/editors/nav-links-editor.tsx`
- `components/admin/section-editor/editors/social-proof-strip-editor.tsx`
- `components/admin/section-editor/editors/proof-cluster-editor.tsx`
- `components/admin/section-editor/editors/case-study-split-editor.tsx`

Optional in Batch 1:

- `components/admin/section-editor/payload.ts`
- `components/admin/section-preview.tsx`

### Batch 2

- `components/admin/section-editor/payload.ts`
- `components/admin/section-preview.tsx`
- `app/(marketing)/[slug]/page.tsx`

## Required Landing Order

### Batch 1

1. built-in shared-field visibility contract
2. shared shell reorder
3. missing field patching
4. per-editor internal reorder
5. admin preview parity verification

### Batch 2

1. subtitle normalization
2. preview/live parity update
3. built-in subtitle regression QA

## Acceptance Bar

### Batch 1 must satisfy

- every field already read by the built-in live renderer is editable from the drawer
- content appears before styling in the drawer
- each built-in editor feels logically ordered
- no regression to the recent section-editor performance work
- no public frontend behavior change
- `npm run build` passes

### Batch 2 must satisfy

- every field read by the built-in live renderer is editable from the drawer
- no built-in subtitle can render without a visible editor path
- `npm run build` passes
- preview and public frontend match for built-in subtitle behavior
