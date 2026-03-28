# v7 Booking And Metadata Closure

This file covers the remaining important coverage gaps outside the core rich-text contract.

## 1. Booking Flow Must Stop Being Half-Editable

Files:

- `components/landing/booking-scheduler-section.tsx`
- `components/landing/booking-scheduler-client.tsx`
- `components/landing/booking-intake-form.tsx`

## Required Coverage

### Form step

Make these visually editable:

- `content.formHeading`
- the submit button label actually shown in the form flow
- each `content.intakeFields.<key>.label`
- each `content.intakeFields.<key>.helpText`

Important rule:

- do not make user-entered values editable
- only template copy belongs to the visual editor

### Calendar step

Make the confirmation copy editable:

- “Thanks, {name}! Now pick a time that works for you.”

The dynamic attendee name remains runtime data, but the surrounding template string must be editor-controlled.

### Success step

Make the success-state copy editable:

- success heading
- success body copy

Again:

- attendee name and email placeholders remain runtime values
- the surrounding template text must be editor-controlled

## Suggested Implementation Shape

Do not hardcode field paths deep inside unrelated components without a pattern.

Use one of these two approaches:

1. pass explicit visual-edit field props from `BookingSchedulerSection` down into client components
2. add a small booking-copy config object with stable field-path mapping

The goal is clarity, not cleverness.

## 2. Footer Placeholder Must Be Editable

File:

- `components/landing/footer-grid-section.tsx`

Required:

- `content.cards[].subscribe.placeholder` must be editable from the rendered input surface

Do not move this back to the inspector.

## 3. Social-Proof Link Metadata Must Be Reachable

Files:

- `components/landing/social-proof-strip-section.tsx`
- `components/landing/logo-ticker.tsx`

Required:

- when a logo has `href`, its destination must be editable from the canvas
- image-backed logos need a compact hotspot or chip so label/link metadata is not trapped behind the image

This does not need to become noisy.

It does need to be discoverable and consistent.

## 4. Header Nav Editing Must Not Drift

File:

- `components/landing/site-header.tsx`

Current risk:

- visual editing updates `href`
- active-section tracking still depends partly on `anchorId`

Required fix:

- either synchronize `anchorId` whenever a same-page anchor is selected
- or remove the stale dual-source behavior by deriving active-anchor tracking from `href` first and `anchorId` only as legacy fallback

Preferred outcome:

- one source of truth for nav-link destination state

## Acceptance

This file is complete only when:

- booking section copy is editable through all visible states
- footer subscribe placeholder is editable on canvas
- social-proof logo destinations are reachable
- header anchor behavior can no longer drift between `href` and `anchorId`
