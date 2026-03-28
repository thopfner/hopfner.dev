# Coding Agent Prompt

## Role

You are finishing the consent system to product level.

This is not a compliance or data-layer sprint. The logic is already acceptable. Your job is to fix presentation truth and product placement so the consent UI feels native to the marketing frontend.

## Execution Rules

- Execute the sprint in the exact file order provided.
- Keep the current consent state model and GA gating behavior intact.
- Reuse the current page theme scope instead of introducing a parallel consent theme.
- Reuse the footer legal row as the primary reopen surface.

## Anti-Drift Rules

- Do not touch jurisdiction lists.
- Do not touch consent cookie shape.
- Do not reintroduce a persistent floating badge on pages that have a footer.
- Do not solve this by copying backend panel styles into the frontend.
- Do not add CMS fields for cookie settings.
- Do not spread consent state across multiple unrelated components without a clear owner.

## Required Quality Bar

- The banner/dialog must look like it belongs to the active page theme.
- The reopen control must feel like a legal/settings affordance, not a random tool badge.
- Footer placement must be visually calm and typographically aligned with the existing legal links.
- Any no-footer fallback must be minimal and exceptional.

## Required Reporting

Your completion report must include:
- exact files changed
- exact owner component for consent UI state after the refactor
- exact footer integration path
- explicit statement whether any no-footer fallback was needed
- test/build results
