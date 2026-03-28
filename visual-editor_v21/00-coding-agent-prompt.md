# Coding Agent Prompt

You are fixing one concrete implementation error.

The error is:

1. `SectionPreview` embedded mode already has a `chromeSlot`
2. but that slot is mounted **after** the scaled `embeddedRef` wrapper
3. so the chrome is unscaled while the preview content is scaled
4. this is why the chip/actions still read like a separate row instead of true overlay chrome

This batch is not about finding a design direction. The direction is already decided.

Execution rules:

1. do not widen scope
2. do not change spacing tokens
3. do not experiment with more offset tweaks
4. move the mount point to the correct layer and stop there

Anti-drift rules:

1. do not keep `chromeSlot` as a sibling of the scaled preview wrapper
2. do not move chrome back to the outer node wrapper
3. do not introduce a new abstraction unless it is the smallest possible wrapper for the correct mount point

Required reporting:

1. state the old `chromeSlot` mount point
2. state the new `chromeSlot` mount point
3. state whether the chrome now scales with the preview surface
4. describe the live QA result on `Card Grid`, `Social Proof Strip`, and `Title/Body List`
