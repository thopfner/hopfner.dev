# Backend-to-Frontend Sync Remediation Brief

## Objective

Fix the remaining disconnect between backend editing and frontend rendering.

This is now a CMS product-quality issue, not just a styling issue.

Editors are currently encountering a system where:

- some edits take effect immediately
- some edits require publish
- some edits save successfully but never affect the live site

That ambiguity must be removed.

---

## Executive Summary

There are two different kinds of problems and they must not be mixed together.

### Problem class A: lifecycle / publishing mismatch

Some backend edits are saved only as drafts.

The live frontend renders published versions only.

So users can save changes correctly and still see nothing on the frontend until they publish.

This behavior is technically correct, but the admin experience does not make it explicit enough.

### Problem class B: dead or partially wired controls

Some backend controls persist data correctly but the frontend does not consume them, or only consumes them in some section variants.

This behavior is not acceptable.

If a control is editable, it must either:

- affect the live frontend, or
- be removed/hidden until supported

---

## Confirmed Current State

### 1. Section edits are draft-first and publish-gated

The live renderer reads only published section/global-section versions:

- `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`

The section drawer saves drafts first and only promotes them on publish:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`

This means:

- `Save draft` does not update the live site
- `Publish` is required for section-level changes to appear

This is expected behavior for content/versioned sections.

### 2. Site-wide formatting settings are live-immediate

Global formatting token edits are persisted directly to:

- `site_formatting_settings`

The frontend reads those directly on page render.

This means these should affect the frontend immediately after save:

- typography tokens
- brand signature tokens
- other site-wide token-based formatting settings

### 3. Page backdrop/page-level settings are live-immediate

Page-level backdrop overrides are saved directly to:

- `pages.formatting_override`
- `pages.bg_image_url`

Those should also affect the frontend immediately after save.

### 4. Some formatting controls are still dead or incomplete

These are the confirmed problem areas from code QA.

---

## Required Workstream 1: Make Lifecycle Behavior Explicit In The Admin UI

This work is mandatory even if the current technical behavior is “correct.”

The current workflow is too easy to misread.

An editor can save changes and assume they are live when they are not.

### Required admin behavior changes

#### A. Add explicit save-mode messaging at the point of editing

For section/global-section drawers, clearly state:

- `Save draft` stores an unpublished draft only
- `Publish` is required before the live site changes

This should appear:

- near the primary save/publish controls
- not just as passive badge text elsewhere in the drawer

The language should be direct, not subtle.

Example behavior:

- before save: `Changes here are draft-only until you publish`
- after save draft: `Draft saved. Live site unchanged until publish.`
- after publish: `Published. Live site now reflects this version.`

#### B. Distinguish “live-immediate” settings from “publish-gated” settings

For admin areas that update live immediately, say so explicitly.

Examples:

- global formatting tokens
- page backdrop / page-level formatting overrides

The UI should communicate:

- `These settings apply to the live site immediately when saved.`

This distinction is essential because the current CMS contains both behaviors.

#### C. Add status summary in the page editor section list

For each section row in the page editor, make the state more explicit:

- `Published`
- `Draft exists`
- `Live version differs from draft`

The user should not need to infer this from scattered badges only.

#### D. Prevent false confidence after draft save

Do not present `Save draft` as if it were a live update.

If there is a toast, its wording must reinforce the publish requirement.

Current wording is too easy to mentally collapse into “saved = done.”

---

## Required Workstream 2: Remove Or Fix Dead Controls

This is the highest technical priority.

If a backend control saves but does not render, the system is broken from the editor’s perspective.

### Dead or incomplete controls currently confirmed

#### A. `dividerMode`

Status:

- exposed in types
- exposed in section editor drawer
- persisted in formatting JSON
- not consumed by the frontend renderer

Required action:

- either implement it across the relevant sections
- or remove/hide it until implemented

Do not leave it exposed without frontend behavior.

Recommended implementation:

- support `none | subtle | strong`
- apply to inter-card dividers, section internal separators, or heading/content dividers depending on section type

Minimum targets:

- `card_grid`
- `steps_list`
- `faq_list`
- relevant composed blocks

#### B. `signatureNoiseOpacity`

Status:

- exposed in global formatting admin
- saved in settings
- not read by the frontend
- no CSS implementation uses it

Required action:

- implement a controlled noise/texture layer in the brand-signature system
- or remove the control entirely

Recommended implementation:

- keep the control
- use it as a very subtle texture layer on `obsidian_signal` / `grid_rays` / `topographic_dark`
- ensure it is low-noise and does not reduce text clarity

Required files:

- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`

#### C. `cardChrome` on `card_grid` when `cardFamily` is present

Status:

- the editor allows setting both
- the renderer effectively ignores `cardChrome` whenever `cardFamily` is set

That creates a false sense of control.

Required action:

Choose one and implement it clearly:

1. `cardFamily` defines base visual behavior and `cardChrome` modifies it
2. or `cardFamily` supersedes `cardChrome`, and the UI disables/hides `cardChrome` when a family is selected

Recommendation:

- implement compositional behavior
- `cardFamily` = semantic base
- `cardChrome` = chrome modifier

That gives the CMS more useful range without confusion.

#### D. Composed/custom section formatting controls

Status:

- composed sections are still not participating in most of the semantic formatting system
- the CMS may save section-level formatting, but `ComposedSection` does not consume most of it

This is a major source of “I changed it and nothing happened.”

Required action:

Make composed sections obey the same page-level formatting rules as built-in sections wherever those rules are applicable.

At minimum, support:

- `sectionRhythm`
- `sectionSurface`
- `contentDensity`
- `gridGap`
- `headingTreatment`
- `labelStyle`
- `dividerMode`

Optional but recommended:

- `cardFamily`
- `cardChrome`
- `accentRule`

Implementation rule:

Do not just pass the values through props. Make them materially alter layout and styling.

---

## Required Workstream 3: Standardize The Renderer Contract

The frontend renderer contract is still too inconsistent.

Some sections use `SectionShell`.

Some bypass it.

Some accept semantic props but only use half of them.

This inconsistency is a direct cause of backend/frontend mismatch.

### Required rule

Every section renderer must follow one of these two paths:

1. use `SectionShell` and shared semantic helpers
2. if it must custom-render, it must still consume the shared semantic contract intentionally

There must not be a third state where props are accepted but mostly ignored.

### Required shared contract

Define and consistently use shared semantic section props:

- `rhythm`
- `surface`
- `contentDensity`
- `gridGap`
- `cardFamily`
- `cardChrome`
- `accentRule`
- `dividerMode`
- `headingTreatment`
- `labelStyle`

These should flow from:

- section formatting JSON
- through page render normalization
- into section components
- into actual class/style decisions

### Required normalization layer

In the page renderer, create one canonical mapping from stored formatting JSON to renderer props.

Do not let each section component reinterpret raw formatting keys independently.

This normalization layer should define:

- allowed values
- defaults
- fallback behavior
- no-op handling

---

## Required Workstream 4: Fix Variant-Specific Renderer Gaps

Some section variants still bypass the shared layout/styling system.

These are especially dangerous because editors may see formatting controls that only work in some variants.

### A. `TechStackSection`

Current issue:

- `trust_strip` and `logo_row` bypass `SectionShell`
- section-level rhythm/surface behavior is therefore inconsistent

Required action:

- move those variants onto `SectionShell`
- or reproduce `SectionShell` behavior faithfully in those branches

The simplest and safest path is to standardize them on `SectionShell`.

### B. `FinalCtaSection`

Current issue:

- some branches use `surface`
- some still hardcode their own section wrappers and spacing
- `rhythm` is not consistently applied

Required action:

- put all CTA variants on the same semantic section wrapper model
- ensure `rhythm` and `surface` are honored consistently in every branch

### C. `HowItWorksSection`

Current issue:

- it partially honors `cardFamily`
- but `accentRule` and `labelStyle` are not meaningfully realized

Required action:

- make `accentRule` visibly affect step-card treatment
- make `labelStyle` affect step badge / step label rendering
- keep process sections visually distinct from generic cards

### D. `WhatIDeliverSection`

Current issue:

- this is better wired than before
- but the relationship between `cardFamily`, `cardChrome`, and variant defaults is still not fully coherent

Required action:

- formalize precedence rules
- document them in code comments
- reflect them in the admin UI if controls become mutually dependent

### E. `ComposedSection`

Current issue:

- only schema spacing and width mode are currently driving layout
- page-level semantic formatting mostly stops at the component boundary

Required action:

- extend composed rows/blocks to respond to the shared section semantics
- especially `gridGap`, `contentDensity`, `headingTreatment`, and `dividerMode`

This is essential because composed sections are a growing part of the system.

---

## Required Workstream 5: Add A Control Capability Matrix In Code

Right now the CMS allows too much ambiguity about what a control is supposed to affect.

Add a capability map so each section type and variant explicitly declares which controls are supported.

### Required behavior

If a control is unsupported for a given section or variant:

- hide it in the drawer
- or disable it with explanatory help text

Do not expose controls that are known to do nothing.

### Example

`card_grid`

- supports: `cardFamily`, `cardChrome`, `gridGap`, `contentDensity`, `dividerMode`

`steps_list`

- supports: `cardFamily=process`, `accentRule`, `labelStyle`, `dividerMode`

`label_value_list:logo_row`

- supports: `rhythm`, `surface`, possibly `labelStyle`
- should not expose controls that have no effect

`composed`

- only expose the controls that are actually wired for composed rendering

This will reduce editor confusion immediately.

---

## Required Workstream 6: Add Regression QA For The Setting Pipeline

Do not close this work on visual inspection alone.

Add explicit QA steps covering:

1. save draft only
2. publish draft
3. save immediate-live setting
4. variant-specific formatting change
5. composed section formatting change

At minimum, the team should be able to verify:

- what writes to drafts
- what writes directly to live settings
- what the frontend actually reads

---

## Concrete Fix Instructions By Layer

## Layer A: Admin UX

Required files:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages/[pageId]/page-editor.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`

Required changes:

- improve live/draft messaging
- improve toast copy
- surface publish requirement more clearly
- hide or disable unsupported controls per section/variant
- label immediate-live settings clearly in site-wide/page-wide editors

## Layer B: Shared data/typing

Required files:

- `/var/www/html/hopfner.dev-main/lib/cms/types.ts`
- any section capability/config definitions used by admin and renderers

Required changes:

- formalize shared semantic props
- formalize supported control matrix
- avoid freeform drift between editor and renderer

## Layer C: Frontend normalization

Required files:

- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`

Required changes:

- centralize formatting normalization
- ensure every supported control is mapped intentionally
- make unsupported values impossible or safely ignored

## Layer D: Frontend renderers

Required files:

- `/var/www/html/hopfner.dev-main/components/landing/section-primitives.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/what-i-deliver-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/how-it-works-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/tech-stack-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`

Required changes:

- make every supported control materially affect output
- remove dead semantic props
- implement missing signature noise layer or remove its control
- standardize section wrapper behavior across variants

---

## Acceptance Criteria

This work is complete only when all of the following are true.

### Editor clarity

- editors can tell whether a setting is immediate-live or publish-gated
- editors are not shown controls that do nothing

### Technical correctness

- every visible control is either supported or intentionally hidden
- composed sections obey the declared formatting controls
- section variants no longer silently bypass the shared styling system

### Live behavior

- saving a site-wide token visibly updates the live frontend
- saving a page backdrop setting visibly updates the live frontend
- saving a section draft does not update the live frontend
- publishing that draft does update the live frontend
- changing a supported section formatting control visibly affects the correct section

### Quality bar

- no more “backend changed, frontend unchanged” cases caused by dead wiring
- no more ambiguity between draft state and live state

