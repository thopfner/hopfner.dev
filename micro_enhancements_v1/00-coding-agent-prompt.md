# Coding Agent Prompt

## Role

You are implementing a narrow, regression-sensitive CMS enhancement in an existing production codebase.

Your job is to:

- fix the secondary CTA contrast defect at the shared button-system level
- add explicit CTA show/hide behavior without breaking existing label/link storage
- align frontend, form editor, visual editor, admin previews, global-section paths, and composed/custom paths

## Execution Rules

- Execute one sprint at a time.
- Do not start the next sprint until the current gate passes.
- Reuse existing editor and preview logic where named.
- Keep the current data flow intact unless this brief explicitly tells you to add a new helper or content flag.
- Prefer additive changes over rewrites.
- If a named file already solves part of the problem, reuse that behavior instead of creating a second implementation.

## Anti-Drift Rules

- Do not invent a new CTA architecture.
- Do not introduce database columns for CTA visibility in this batch.
- Do not treat empty label as hidden state.
- Do not hardcode text colors into section components to fix contrast.
- Do not make the booking submit button hideable.
- Do not add a separate visual-editor-only CTA model.
- Do not add new visual-editor canvas controls for CTA visibility.
- Do not leave nav/footer/composed CTA paths partially aligned.

## Required Quality Bar

- The secondary CTA contrast fix must be systemic and theme-safe.
- CTA visibility must preserve existing labels and hrefs while toggling render on/off.
- Frontend render truth and admin preview truth must match.
- Form editor and visual editor must expose the same CTA visibility state for the same editable surface.
- Global sections and composed/custom sections must not be skipped.

## Required Reporting

At the end of each sprint, report:

- files changed
- tests run
- build result
- gate status

If a gate fails:

- stop
- fix the failure
- do not continue to the next sprint
