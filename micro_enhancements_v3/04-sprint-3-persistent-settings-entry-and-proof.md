# Sprint 3: Persistent Settings Entry And Proof

## Goal

Add a minimal persistent way to reopen cookie settings and finish proof for the full feature.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-settings-trigger.tsx` (new)
2. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx`
3. `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`
4. test files under `/var/www/html/hopfner.dev-main/tests`

## Source Workflows / Files To Reuse

Use the same tone and button system as:
- `/var/www/html/hopfner.dev-main/components/ui/button.tsx`

Keep the trigger layout-scoped instead of coupling it to footer CMS content.

## Step-By-Step Implementation

### Step 1

Create `cookie-settings-trigger.tsx`.

Required behavior:
- renders only after a consent choice exists
- reopens the preferences dialog
- is minimal and unobtrusive

Required placement:
- fixed, low-noise position that works across all marketing pages
- desktop: bottom-left or bottom-right, away from the primary CTA zone
- mobile: bottom-center or just above the safe-area edge

Do not depend on footer presence for this batch.

### Step 2

Integrate the trigger into `cookie-consent-client.tsx` so it controls the same preferences dialog state.

### Step 3

Mount the trigger through the same layout-scoped consent controller in `app/(marketing)/layout.tsx`.

### Step 4

Finish proof with rendered tests that cover:
- settings trigger appears only after a consent choice exists
- reopening preferences updates the existing cookie
- server gating helper continues to respect the updated cookie state

## Required Behavior

- Users can reopen settings after initial choice.
- Changing consent later updates the cookie and the analytics load decision.
- The trigger remains visually minimal and theme-aware.

## What Must Not Change In This Sprint

- do not add footer CMS fields for cookie settings
- do not add a legal-policy CMS editor
- do not add more consent categories

## Required Tests For This Sprint

- rendered test for persistent trigger visibility rules
- rendered test for reopening preferences and changing consent
- integration-level assertion that analytics gating respects updated consent state

## Gate For Moving Forward

Do not claim completion until:
- the trigger works
- the preferences modal can be reopened
- tests prove the updated behavior
