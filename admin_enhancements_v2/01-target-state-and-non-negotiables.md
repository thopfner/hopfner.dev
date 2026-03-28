# Target State And Non-Negotiables

## Current Admin Problem

The admin already has strong functionality, but it lacks product consistency.

Current issues:

1. some routes use shared admin scaffolds, some do not
2. some routes are list-management screens, some are workspaces, but the UI system does not formalize that distinction
3. action placement, spacing, and visual weighting are inconsistent
4. Bookings and Email Templates are visibly behind the rest of the admin
5. page editor, global sections, and section library are powerful but too dense

## Target State

### Route Class 1: Collection Pages

Collection pages must share:

1. page header
2. optional summary / KPI row
3. filter + search + actions bar
4. single primary content surface
5. consistent mobile fallback
6. consistent empty/loading/error presentation

### Route Class 2: Workspace Pages

Workspace pages must share:

1. sticky or persistent workspace header
2. clear page identity and status
3. persistent primary actions
4. clear split between primary workspace and secondary settings
5. quieter secondary surfaces
6. consistent editor/action semantics

## Explicit Route Intent

### Pages, Blog, Media, Bookings

These are collection pages.
They should feel like management queues or libraries, not editor canvases.

### Page Editor, Visual Editor, Section Library, Global Sections, Email Templates

These are workspace pages.
They should feel like dedicated tools with persistent structure and action placement.

### Login and Setup

These are supporting entry surfaces.
They should be visually aligned, but kept simple.

## What Must Not Change

1. existing data loading logic
2. existing section editing logic
3. existing email template save/publish logic
4. existing booking table/detail data shape
5. existing page editor section operations
6. existing visual editor behavior

## Design Direction

Target a mature CMS/SaaS tone:

- strong hierarchy
- fewer competing panels
- clearer primary/secondary surfaces
- stable action placement
- lower visual noise
- consistent typography and spacing

Do not chase novelty.
Chase calm, clarity, and reliability.
