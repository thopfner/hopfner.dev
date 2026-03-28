# v7 Rich-Text Contract And Coverage

This is the highest-priority v7 work.

## Problem

The visual rich-text path is directionally correct, but its persistence contract is not aligned to the rest of the CMS.

Current issue:

- `EditableRichTextSlot` saves generated HTML back into `htmlPath`
- built-in editors do not treat `*Html` fields as the canonical write target
- this creates a visual-editor-specific shadow behavior

## Required Correction

The visual editor must follow the same persistence rules as the form editor.

### Rule

For built-in sections that already have a rich-text editor in the form editor:

- persist the structured JSON field as the source of truth
- only update a fallback plain-text field if the form-editor path already does that for the same section
- do not write `*Html` shadow fields as the persistence target

## Implementation Direction

### 1. Refactor `EditableRichTextSlot`

Replace the current `htmlPath` persistence contract with an explicit section-safe contract.

Recommended API:

- `richTextPath`
- optional `fallbackTextPath`
- `html`

Behavior:

- render from current HTML as before
- save to `richTextPath`
- if `fallbackTextPath` is provided, sync it with `richTextDocToPlainText(nextJson)`
- otherwise do not write a side field

Do not:

- persist `content.bodyHtml`
- persist `content.answerHtml`
- persist `content.narrativeHtml`

unless the canonical editor path for that section already does so, which the current built-in editors do not.

### 2. Fix Section Wiring

Update all current rich-text slot usages to the corrected contract.

This affects:

- `components/landing/final-cta-section.tsx`
- `components/landing/faq-section.tsx`
- `components/landing/case-study-split-section.tsx`
- `components/landing/how-it-works-section.tsx`
- `components/landing/workflows-section.tsx`
- `components/landing/what-i-deliver-section.tsx`

### 3. Close `WhyThisApproachSection`

This section must adopt the same rich-text slot.

Required wiring:

- `richTextPath="content.bodyRichText"`
- optional fallback text path only if the existing form-editor contract supports one for this section

## UX Upgrade Requirement

The rich-text editor panel itself still feels a little too compact for an elite product.

Upgrade it in the same pass:

- increase usable width
- increase usable editor height
- keep the save/cancel actions pinned and obvious
- preserve keyboard shortcuts
- avoid covering the rendered block more than necessary

Target feel:

- a precise anchored composer
- not a tiny modal
- not a collapsed utility popover

## Acceptance

This work is complete only when:

- no visual rich-text save writes to `*Html` shadow fields
- `WhyThisApproachSection` body is editable from the canvas
- the rich-text panel feels clearly larger and easier to use than the current version
