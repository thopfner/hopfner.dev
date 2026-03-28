# Admin Enhancements v12

## Bookings Detail Drawer Runbook

Opus, this is a focused UX upgrade for the bookings admin route.

Do not expand scope.
Do not add booking-management features.
Do not change the API.
Do not change the data model.
Do not change the list columns or booking statuses.

This batch exists to replace the current inline expanded-detail presentation with a premium, mobile-responsive right-side detail drawer that matches the improved admin system.

## Objective

Keep the current Bookings route functionally identical, but replace the current inline detail expansion with:

1. a polished right-side drawer on desktop
2. a full-width right-anchored sheet on mobile
3. a cleaner, more premium information hierarchy
4. a presentation that fits the rest of the admin backend

This is not a backend feature batch.
It is a detail-presentation and interaction batch only.

## Current Implementation Facts

The current route is here:

- [page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/bookings/page-client.tsx)

The current behavior:

1. desktop rows expand inline inside the table
2. mobile cards expand inline inside the card list
3. detail content is rendered through a simple `Detail` helper
4. all data already comes from the existing `/admin/api/bookings` route

The current API is here:

- [route.ts](/var/www/html/hopfner.dev-main/app/admin/api/bookings/route.ts)

It returns `booking_intakes` rows directly.
Do not change that.

Existing bookings tests are here:

- [bookings.test.tsx](/var/www/html/hopfner.dev-main/tests/admin-collection-pages/bookings.test.tsx)

Existing admin drawer styling reference is here:

- [pages-list.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx#L498)

Shared admin visual tokens are here:

- [ui.tsx](/var/www/html/hopfner.dev-main/components/admin/ui.tsx)

## Non-Negotiables

1. no API changes
2. no schema changes
3. no new booking actions
4. no status-editing features
5. no filtering/sorting changes
6. no route changes
7. no behavior regression in loading, empty, or error states
8. no inline detail expansion remaining after this batch

If a proposed improvement requires changing booking workflow or backend logic, stop.

## Scope

Only these files should change:

1. `app/admin/(protected)/bookings/page-client.tsx`
2. one new focused component file for the drawer, recommended:
   - `components/admin/bookings/booking-detail-drawer.tsx`
3. optionally one small supporting presentational helper file in:
   - `components/admin/bookings/...`
4. `tests/admin-collection-pages/bookings.test.tsx`

Optional shared helper use is allowed from:

1. `components/admin/ui.tsx`

But do not broaden this into a shared drawer system unless it is tiny and clearly reusable immediately.

## Desired UX

### List surface

Keep the current Bookings list surface as the overview:

1. summary count
2. refresh action
3. desktop table
4. mobile cards

But change row/card interaction so:

1. clicking a desktop row opens the drawer
2. clicking a mobile card opens the drawer
3. the selected row/card can receive a subtle active state
4. no inline detail block appears inside the table or card stack anymore

### Drawer behavior

The drawer must:

1. open from the right
2. be full width on small screens
3. be a fixed narrower panel on larger screens
4. close via close button, backdrop click, and Escape
5. preserve the selected booking while open
6. never block the route with navigation changes

Recommended width:

1. `xs`: `100%`
2. `sm`: around `420-480px`
3. `lg`: around `520-560px`

Use the same surface/border/blur language already used in the admin drawers.

## Information Architecture

Do not dump fields in one long flat list.
Present the booking as a clean profile/intake record.

### Drawer structure

#### 1. Header

Sticky header at the top of the drawer.

Must contain:

1. title: `Booking Details`
2. primary identity: `full_name`
3. secondary identity: `work_email`
4. status chip
5. close button

Optional:

1. company as low-emphasis metadata if present

#### 2. Summary strip

Immediately below the header, show the most important quick facts in a calm summary block:

1. submitted at
2. last updated
3. company
4. cal booking UID if present

Rules:

1. do not over-style the UID
2. use monospace or code-like presentation only lightly
3. missing fields should disappear or degrade gracefully

#### 3. Main content sections

Use 3 grouped sections, in this order:

1. `Profile`
2. `Operational context`
3. `Goals`

##### Profile

Include:

1. full name
2. work email
3. company
4. job title
5. team size
6. function area

##### Operational context

Include:

1. current tools
2. main bottleneck

##### Goals

Include:

1. desired outcome (90d)

#### 4. System metadata

Low-emphasis final section:

1. status
2. created_at
3. updated_at
4. cal_booking_uid if present and not already emphasized enough above

This section should feel administrative, not primary.

## Visual Design Rules

This drawer should feel like the rest of the admin backend, not like a random modal.

### Required styling direction

1. use existing admin surface tokens from `components/admin/ui.tsx`
2. use existing drawer treatment from `pages-list.tsx` as the baseline
3. keep borders subtle
4. keep spacing generous
5. use stronger title hierarchy than the current inline details
6. use restrained section dividers
7. do not create a stack of many identical micro-cards

### Preferred composition

Use:

1. one drawer shell
2. one sticky header
3. one scrollable body
4. a small number of clearly separated content groups

Avoid:

1. nested cards inside cards everywhere
2. dense two-column micro-grids on mobile
3. repeating caption/value blocks with weak rhythm

### Responsive rules

On mobile:

1. the drawer is full width
2. content is single column
3. sections stack with comfortable spacing
4. no cramped two-column value grid

On desktop:

1. the drawer stays right-anchored
2. quick facts can use a compact 2-column grid where appropriate
3. major text blocks stay single-column for readability

## Exact Implementation Path

### Step 1 — Extract the detail UI

Create a dedicated drawer component.

Recommended file:

1. `components/admin/bookings/booking-detail-drawer.tsx`

Responsibilities:

1. receive `intake`
2. receive `open`
3. receive `onClose`
4. render all booking detail presentation

Do not fetch data inside the drawer.

### Step 2 — Replace expanded state model

In `page-client.tsx`:

1. replace the current `expanded` string state with a selected booking id or selected booking object
2. remove inline detail rendering from both desktop and mobile list presentations
3. keep row/card click behavior, but map it to opening the drawer

Recommended state shape:

1. `selectedId: string | null`

Resolve the selected intake from `intakes` so refreshes remain safe.

### Step 3 — Add subtle active row/card state

While the drawer is open for a given booking:

1. desktop row should have a subtle selected background/border treatment
2. mobile card should have a subtle selected treatment

Do not make this loud.

### Step 4 — Improve row affordance

Without changing structure too much:

1. make it clearer that clicking a row/card opens details
2. use either:
   - a trailing chevron/action hint, or
   - a stronger hover/selected affordance

Pick the quieter option.
Do not add noisy extra buttons if simple affordance is enough.

### Step 5 — Keep states identical

Loading, empty, and error states must remain exactly as they are functionally.

Do not move them into the drawer.

## Data Mapping Rules

Preserve all current fields.

Known fields in the current route:

1. `full_name`
2. `work_email`
3. `company`
4. `job_title`
5. `team_size`
6. `function_area`
7. `current_tools`
8. `main_bottleneck`
9. `desired_outcome_90d`
10. `status`
11. `cal_booking_uid`
12. `created_at`
13. `updated_at`

Rules:

1. if a field is null, omit its row or section item cleanly
2. do not render empty placeholders for everything
3. preserve `formatDate(...)` unless there is a strong reason to centralize it

## Accessibility Requirements

1. drawer must have dialog semantics
2. header title must be properly associated
3. close button must have explicit accessible label
4. focus must be trapped by the drawer using MUI Drawer defaults

## Test Requirements

Update:

1. `tests/admin-collection-pages/bookings.test.tsx`

Replace the current inline-expansion expectations with drawer expectations.

Required behavior tests:

1. desktop: clicking a row opens the detail drawer
2. desktop: inline detail block is not rendered in-table anymore
3. mobile: clicking a card opens the detail drawer
4. close button closes the drawer
5. loading/empty states still render as before

If useful, add one small isolated test for the drawer component itself.

Do not add source-string tests.

## Verification Commands

Run exactly:

1. `npm test`
2. `rm -rf .next && npm run build`

Do not claim completion if either fails.

## Definition Of Done

This batch is complete only if:

1. desktop bookings no longer expand inline
2. mobile bookings no longer expand inline
3. clicking a booking opens a polished right-side drawer
4. the drawer is full-width on mobile and constrained on desktop
5. the detail layout is meaningfully more premium and readable
6. all current booking data points remain visible
7. `npm test` passes
8. `rm -rf .next && npm run build` passes

## Required Completion Report

Report exactly:

1. files changed
2. old interaction model vs new interaction model
3. drawer width behavior across breakpoints
4. how the detail fields were grouped
5. exact tests run
6. exact build command run

Do not describe this as a new bookings feature.
It is a detail presentation upgrade only.
