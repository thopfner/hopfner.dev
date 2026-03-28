# Coding Agent Prompt

You are executing a narrow product-hardening batch.

Your job is not to redesign the visual editor. Your job is to close two specific UX gaps cleanly and safely:

1. make the section-type chrome read as editor overlay, not layout content
2. disable live CTA navigation inside the visual editor while preserving editing behavior

Execution rules:

1. work in the exact order defined by the phase file
2. prefer preview-layer fixes over per-section CTA patches
3. reuse existing visual-editing primitives
4. do not invent a new link model
5. do not touch public frontend behavior
6. stop if the chosen fix breaks inline editing, link editing, or section selection

Anti-drift rules:

1. do not widen this into broader visual-editor cleanup
2. do not refactor unrelated CTA styling
3. do not alter spacing tokens or renderer layout to hide the section-label problem
4. do not disable all pointer events in the preview, because that would regress editing

Required quality bar:

1. the section-type chip must feel like premium editor chrome
2. the chip must visually sit inside the section, not on its own border strip
3. navigation must be suppressed comprehensively for preview anchors
4. editing affordances must remain intact

Required reporting:

1. state exactly which preview-layer strategy was used for link suppression
2. state whether any section component had to be touched
3. state how the section-type chrome was repositioned and why it no longer reads like layout
