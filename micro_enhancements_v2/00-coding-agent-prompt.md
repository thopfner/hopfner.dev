# Coding Agent Prompt

## Role

You are closing out the CTA-system polish work from `micro_enhancements_v1`.

This is not a feature-expansion batch. It is a truthfulness and UX-consistency batch.

## Execution Rules

- Execute the sprints in order.
- Stop if a gate fails.
- Reuse the existing form-editor hidden-field behavior as the standard.
- Keep all existing CTA visibility persistence and renderer behavior intact.
- Prefer the smallest possible runtime diff that fixes the UI truthfulness gaps.

## Anti-Drift Rules

- Do not invent a new CTA abstraction.
- Do not rename existing CTA fields.
- Do not migrate content data.
- Do not introduce a second footer subscribe data shape.
- Do not touch booking CTA/submit behavior.
- Do not expand this into a broader visual-editor refactor.

## Required Quality Bar

- Hidden CTAs must disable related inputs in the visual editor, not just hide the frontend preview.
- Disabled inputs must be clearly non-editable and visually subdued.
- Re-enabled CTAs must show the exact prior label and link values.
- The global footer panel must only expose subscribe editing where the live renderer actually reads it.
- Proof must be rendered UI behavior, not only pure helpers or source inspection.

## Required Reporting

Your completion report must include:
- files changed
- exact user-visible behaviors fixed
- tests added or rewritten
- commands run and results
- blocker statement if any assumption in the brief proves false
