# Audit: Gap And Target State

## Primary Gap

The current selected-section chrome still reads like it lives on its own row.

That is not a small aesthetic issue. It is a truthfulness failure:

1. the public page does not have that row
2. the editor makes it look like the section begins lower than it really does
3. the product therefore misrepresents section spacing

The current root cause is architectural, not cosmetic:

1. the chrome is anchored as a full-width absolute row on the outer node wrapper
2. the real section rendering happens inside the embedded preview wrapper
3. for sections with transparent/flat top areas, the chrome row reads like extra layout space instead of overlay chrome

## Secondary Gap

The page footer is better than in v17, but it is still only partially stable:

1. the primary action is stable
2. the secondary slot still appears only when dirty

That means the footer still changes structure between states.

## Target State

At the end of v19:

1. the section type chip and action controls are visually edge-docked overlay chrome
2. selected and hovered sections do not appear to gain artificial spacing
3. the user can still read global, locked, and dirty semantics clearly
4. the page footer keeps one stable slot layout in all states
5. the proof includes rendered behavior and manual visual QA targeted at this exact regression
