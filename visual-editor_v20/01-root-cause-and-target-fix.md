# Root Cause And Target Fix

## Current Root Cause

The current implementation still anchors chrome to the wrong place.

Specifically:

1. `page-visual-editor-node.tsx` places the type pill and actions on the outer node wrapper with `absolute top-0 ... -translate-y-1/2`
2. `section-preview.tsx` still renders the actual section preview inside its own embedded host and inner scaled wrapper
3. that embedded host currently paints `bg-background`
4. the actual section renderer begins inside an inner wrapper that also applies spacing and padding tokens

Result:

1. the chrome is attached to the outer boundary, not the actual visual section surface
2. the preview host can still show a dark band above the rendered section content
3. the user reads that band as real spacing, especially when the pill sits on top of it

This is why the result still looks like a fake row even after the v19 attempt.

## Target Fix

The correct fix is:

1. define one explicit preview surface anchor for embedded visual-editor sections
2. anchor chrome to that preview surface, not to the outer node wrapper
3. ensure the preview host does not paint a synthetic band that reads as layout
4. render the type pill and actions as small inset overlays on that surface

The desired visual result is:

1. chip sits minimally over the top-left of the actual section surface
2. actions sit minimally over the top-right of the actual section surface
3. no separate row is implied
4. no fake gap appears between adjacent sections
