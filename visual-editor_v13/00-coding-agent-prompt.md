# Coding Agent Prompt

You are correcting two mischaracterized blockers and one contract defect.

The audit conclusion is:

1. the media-library blocker is not a Mantine/provider problem
2. the custom/composed blocker is not a schema-absence problem for current generic editing
3. the visual-editor page settings path currently drifts from the canonical database contract

Execution rules:

1. execute phases in order
2. reuse existing admin infrastructure before writing new UI
3. keep backend UI consistency aligned to MUI and existing `mui-compat` usage
4. stop if a phase gate fails
5. stop and report if you discover a specific unsupported custom block type rather than hand-waving a schema blocker

Anti-drift rules:

1. do not build a new media modal
2. do not build a new composer system
3. do not widen this into a broad visual-editor redesign
4. do not leave import-only tests in place as the main evidence

Required quality bar:

1. media workflows in the visual editor must feel first-class, not pasted-on
2. page backdrop persistence must match the form editor exactly
3. composed-section editing must happen in-context within the visual workspace, not via a dead-end redirect
4. all new UI states must have loading, error, and empty-state handling

Required reporting:

1. name the exact helper or component reused for media library integration
2. state whether `page-visual-editor-media-field.tsx` was replaced, wrapped, or removed
3. state the exact canonical page fields now written on save
4. state which custom block types were exercised during QA
