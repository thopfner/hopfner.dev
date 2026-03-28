# QA, Acceptance, And Stop Gates

## Required Validation Strategy

Validate one phase at a time.

Do not merge multiple unfinished phases into one report.

## Manual QA Requirements

### Shell / Navigation

Check:

1. desktop nav expanded and collapsed
2. mobile drawer
3. route transitions between collection and workspace pages
4. deep routes still preserve context

### Collection Pages

Check:

1. `/admin`
2. `/admin/blog`
3. `/admin/media`
4. `/admin/bookings`

For each:

1. header hierarchy
2. filter/action hierarchy
3. primary content surface
4. mobile fallback
5. loading/empty/error state quality

### Workspace Pages

Check:

1. `/admin/pages/[pageId]`
2. `/admin/pages/[pageId]/visual`
3. `/admin/section-library`
4. `/admin/global-sections`
5. `/admin/email-templates`

For each:

1. persistent page identity
2. primary action placement
3. primary vs secondary surface hierarchy
4. no loss of editing capability

### Auth

Check:

1. `/admin/login`
2. `/admin/setup`

## Required Commands

Run after each phase:

```bash
npm test -- tests/visual-editor
npm run build
```

If non-visual-editor admin tests exist or are added, include them too.

## Required Completion Report Per Phase

The report must include:

1. exact files changed
2. exact routes changed
3. behavior preserved
4. screenshots or live QA notes for changed routes
5. command output summary
6. known follow-ups, if any

## Stop Conditions

Stop immediately if any phase causes:

1. broken auth navigation
2. broken page editor actions
3. broken visual editor actions
4. broken blog/media/email/bookings CRUD flows
5. significant mobile regression
6. shell overflow or layout collapse

## Final Acceptance Standard

This admin enhancement batch is complete only if:

1. the admin reads as one product
2. collection pages feel related
3. workspace pages feel related
4. bookings and email templates no longer feel like internal utilities
5. no existing workflow regresses
6. build passes
