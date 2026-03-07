# Hopfner Backend-to-Frontend Sync Remediation Pack (v6)

Start with:

- `backend-frontend-sync-remediation-brief.md`

Then use:

- `verification-matrix.md`

## Purpose

This pack addresses the remaining mismatch between:

- backend/admin settings
- saved CMS data
- live frontend rendering on `https://hopfner.dev`

The objective is not cosmetic refinement.

The objective is to make backend edits reliably produce the expected frontend result.

## Core diagnosis

The current system has three different behaviors:

1. settings that save and immediately affect the frontend
2. settings that save but require publish before the frontend changes
3. settings that save but are not actually consumed by the frontend

The confusion comes from the fact that the UI does not make those categories clear enough, and some controls still belong to category 3.

## Required posture for implementation

- do not add more controls without wiring them through
- do not leave “saved but dead” controls in the admin UI
- do not assume users understand draft vs published semantics
- make renderer behavior deterministic and testable

## Expected outcome

After this remediation:

- an editor should know whether a change is live immediately or publish-gated
- every visible admin formatting control should either work or be removed
- section edits should have a predictable path from drawer -> save -> publish -> live site
- composed/custom sections should no longer be second-class citizens in the formatting system

