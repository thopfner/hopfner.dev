# 01 Gap List And Target State

This document defines the exact current gaps and the required corrected state.

## Current Gap 1 Shared Titles Are Still Inconsistent

Many sections now have editable eyebrow and subtitle text, but the actual title remains non-editable because `SectionHeading` still renders raw text.

This is currently visible in sections that call `SectionHeading` directly without wrapping the title in an editable slot.

## Required State

Every built-in section title must be editable in place through the same shared title primitive.

## Current Gap 2 Several Built-In Sections Still Bypass The Slot System

The current rollout did not finish built-in coverage.

Built-in renderers still needing substantial work include:

- `WorkflowsSection`
- `WhyThisApproachSection`
- `TechStackSection`
- `BookingSchedulerSection`
- `FooterGridSection`
- `SiteHeader`

## Required State

No built-in section rendered by `SectionPreview` should remain outside the visual editing system for its visible plain-text fields and CTA/link fields.

## Current Gap 3 Partial Instrumentation Inside "Covered" Sections

Some sections adopted editable shell fields but still leave important inner text raw.

Examples:

- `SocialProofStripSection`
  logo labels and badge text
- `ProofClusterSection`
  proof card title/body, metric values, CTA
- `CaseStudySplitSection`
  comparison list items, CTA, media title, stat values

## Required State

If text is visibly rendered and plain-text backed, it should be editable in place unless there is an explicit exception.

## Current Gap 4 Link Editing Is Still Not CMS-Grade

The current `EditableLinkSlot` uses a raw URL input popover.

That is not good enough for an elite CMS editor and it is below parity with the form editor.

## Required State

CTA destination editing must reuse the same page/anchor/external link workflow the form editor already supports.

## Current Gap 5 The In-Place Field Editor Is Too Small For Large Wrapped Text

The current `EditableTextSlot` swaps large text into generic inputs/textarea surfaces with insufficient sizing logic.

On the home hero title, this causes the editing surface to feel clipped and cramped.

## Required State

Large headings and wrapped paragraph fields must keep their visual footprint while editing.

That means:

- width comes from the rendered text box, not a tiny implicit input width
- height expands with the content
- line wrapping remains legible
- the user can see the full field while editing

## Product Standard

This pass is successful only when the editor stops feeling like:

- a clever demo
- a partial retrofit
- a collection of one-off editable spots

and starts feeling like:

- a coherent editing system
- one that can carry the built-in section inventory end to end
