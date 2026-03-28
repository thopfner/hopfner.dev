# Spacing Contract Matrix

This matrix is the implementation truth table for the revised v21 pass.

## Section-level spacing controls

| Capability | Public renderer already supports it | Current section drawer exposes it | Action |
| --- | --- | --- | --- |
| `sectionRhythm` | Yes | Yes | Keep as semantic default |
| `outerSpacing` | Yes | Yes | Keep, but move into `Advanced spacing` group |
| `spacingTop` | Yes | No | Add advanced control |
| `spacingBottom` | Yes | No | Add advanced control |

## Intended spacing model

| Layer | Purpose | Behavior |
| --- | --- | --- |
| `sectionRhythm` | semantic/default rhythm | primary spacing choice for most sections |
| `spacingTop` | explicit top margin override | optional override only when set |
| `spacingBottom` | explicit bottom margin override | optional override only when set |
| `outerSpacing` | shorthand block margin override | optional override only when set |

## Non-goals

Do not add:
- new background controls
- new responsive layout controls
- arbitrary spacing class inputs
- content-validation work
- copy/content cleanup work
