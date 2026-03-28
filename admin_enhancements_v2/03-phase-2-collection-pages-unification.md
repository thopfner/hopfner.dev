# Phase 2: Collection Pages Unification

## Goal

Move all collection pages onto one consistent management-screen pattern.

## In Scope

1. `/admin` pages list
2. `/admin/blog`
3. `/admin/media`
4. `/admin/bookings`

## Files To Change, In Order

1. `app/admin/(protected)/pages-list.tsx`
2. `app/admin/(protected)/blog/page-client.tsx`
3. `app/admin/(protected)/media/media-page-client.tsx`
4. `app/admin/(protected)/bookings/page-client.tsx`

## Required Work

### 1. Standardize Header + Summary + Filters + Content

All collection pages must use the same high-level stack:

1. shared page header
2. shared summary/KPI row where appropriate
3. shared filter/action bar
4. single primary data surface

### 2. Normalize Table/Card Behavior

Across collection pages:

1. mobile fallback should feel consistent
2. table density should feel consistent
3. row action placement should feel consistent
4. chips/status badges should feel consistent

### 3. Lift Bookings To The Same Quality Level

Bookings is currently behind the rest of the admin.

Without adding major new functionality:

1. move it onto the same page scaffold
2. give it a proper header and supporting context
3. make the submission list feel like a managed queue, not a raw table
4. improve detail presentation hierarchy

### 4. Preserve Route-Specific Behavior

Do not remove:

- page creation drawer
- publish-all flow
- blog action menu behavior
- media upload/delete/copy actions
- booking row expansion behavior unless replaced by a strictly better presentation with identical information access

## Hard Gate

Do not proceed to workspace pages until:

1. all four collection pages clearly share one scaffold
2. no current collection-page workflow regresses
3. mobile behavior still works
4. build passes
