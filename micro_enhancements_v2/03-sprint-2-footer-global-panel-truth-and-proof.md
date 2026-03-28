# Sprint 2: Footer Global Panel Truth And Proof

## Goal

Remove the misleading top-level footer subscribe controls from the global visual panel and align the visual editor strictly to the live footer contract.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
2. `/var/www/html/hopfner.dev-main/tests/visual-editor/v22-content-parity.test.ts`
3. rendered visual-editor test file(s) under `/var/www/html/hopfner.dev-main/tests/visual-editor`

## Source Workflows / Files To Reuse

Canonical footer subscribe contract:
- `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`

Canonical form-editor editing path:
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/footer-card-row.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/footer-grid-editor.tsx`

## Step-By-Step Implementation

### Step 1

In `page-visual-editor-global-section-panel.tsx`, remove the top-level `Subscribe` collapsible that edits:
- `content.subscribeEnabled`
- `content.subscribePlaceholder`
- `content.subscribeButtonLabel`

This UI must no longer render.

### Step 2

Keep footer subscribe editing only where it is truthful today:
- per-card subscribe fields already handled by the footer card editing path

Do not add a second subscribe abstraction.

### Step 3

Update stale tests in `v22-content-parity.test.ts` so they no longer assert the presence of the removed top-level subscribe block.

If this test file is still source-inspection heavy, reduce it to only the minimal assertions that remain useful after this cleanup.

### Step 4

Add rendered proof that the global footer visual panel does not expose stale top-level subscribe controls anymore.

Also keep the Sprint 1 rendered CTA disable-state tests green.

## Required Behavior

- The global visual panel no longer shows a top-level footer subscribe section.
- Footer subscribe editing remains available only through the truthful per-card path.
- No existing footer CTA visibility controls regress.

## What Must Not Change In This Sprint

- no renderer changes to footer subscribe behavior
- no migration of legacy top-level subscribe data
- no new subscribe UI concepts

If stale top-level subscribe values exist in stored content, leave them untouched. This sprint is about editor truthfulness, not data cleanup.

## Required Tests For This Sprint

- remove or rewrite stale assertions that require the old top-level subscribe UI
- add at least one rendered assertion proving the top-level subscribe controls are gone
- run the full relevant visual-editor suite after the test updates

## Gate For Moving Forward

Do not claim completion until:
- the top-level footer subscribe block is gone from the global visual panel
- rendered tests prove it
- all CTA tests from Sprint 1 remain green
