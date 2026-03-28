# Section Editor Layout + Coverage Audit v20

Target:

- repo: `/var/www/html/hopfner.dev-main`
- shared shell: `components/admin/section-editor/section-editor-drawer-shell.tsx`
- shared fields panel: `components/admin/section-editor/common-fields-panel.tsx`
- built-in editors: `components/admin/section-editor/editors/*.tsx`
- live renderer source of truth: `app/(marketing)/[slug]/page.tsx`
- admin preview mirror: `components/admin/section-preview.tsx`

Audit date:

- 2026-03-09

Purpose:

- review the section editor across all built-in section types
- identify missing backend editor inputs for fields that are actually consumed by the live frontend
- define a safe restructuring plan so the drawer order becomes logical: content first, layout/styling second
- protect the recent section-editor performance work and the preview-pane changes from accidental regression

This pack is an implementation brief, not a code change. No repository files were modified during this pass.

## Read Order

1. `01-comprehensive-review.md`
2. `02-field-coverage-matrix.md`
3. `03-layout-restructure-plan.md`
4. `04-meta-contract-and-subtitle-plan.md`
5. `05-claude-execution-prompt.md`
6. `06-acceptance-checklist.md`

## Core Decision

The next pass should not be a cosmetic shuffle.

The end state still needs to achieve three things together:

1. make the drawer layout logical
2. make every renderer-backed field editable
3. remove the fragile subtitle / shared-meta truth gap that currently allows live fields to exist without an editor input

## Required Rollout Shape

This should be landed in **two batches**, not one mixed implementation.

### Batch 1: Admin-only alignment

Scope:

- reorder the section drawer and per-type editors
- add missing editor inputs for renderer-backed fields
- introduce a code-owned built-in shared-field visibility contract so the correct shared inputs appear in the drawer
- keep public frontend behavior unchanged

Allowed file areas:

- `components/admin/section-editor/**`
- `components/admin/section-preview.tsx` only where preview parity is needed for newly exposed existing fields

Not allowed in Batch 1:

- changing public renderer precedence for subtitle/meta fields
- changing the public frontend contract for built-in sections

### Batch 2: Subtitle / meta normalization

Scope:

- normalize the built-in subtitle contract
- align preview and public renderer source precedence
- clean up legacy `content.subtitle` fallback behavior for built-in types

Condition:

- only start Batch 2 after Batch 1 is stable and verified

## Non-Negotiable Constraints

- no reducer/session/performance rewrite in this pass
- no broad preview rewrite in this pass
- no payload contract changes except the minimum normalization needed to make shared subtitle truth robust
- no visual redesign of the public site in this pass
- no duplicate subtitle controls
- no leaving renderer-backed fields unreachable in the editor
