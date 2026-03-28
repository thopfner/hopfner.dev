# Visual Editor v22

## Scope

This bundle is a parity audit and execution runbook.

It focuses on the remaining gap between the current form editor and the visual editor for:

1. formatting controls
2. section-specific content controls
3. shared action/content workflows such as rich text, media, and structured link selection

This is not one implementation batch. It is a phased runbook for Opus to execute **one phase at a time**.

## Execution Model

1. Read `00-coding-agent-prompt.md`.
2. Read `01-audit-formatting-and-content-parity-matrix.md`.
3. Execute exactly one phase file at a time.
4. Stop after each phase, run the QA gate, and report before moving to the next phase.

## Phase Order

1. `02-phase-1-cross-cutting-formatting-and-editor-primitives.md`
2. `03-phase-2-hero-rich-text-booking-proof-case-parity.md`
3. `04-phase-3-card-social-labelvalue-parity.md`
4. `05-phase-4-global-nav-footer-parity.md`
5. `06-qa-acceptance-and-stop-gates.md`

## Hard Rules

1. Do not mix multiple phases into one unchecked implementation burst.
2. Do not claim parity based on high-level capability matrices alone.
3. Do not add new product scope unrelated to parity.
4. Do not regress the current visual-editor shell while filling parity gaps.
5. Do not ship partial parity for a targeted section type and call the phase complete.

## Definition Of Done

This bundle is complete only when:

1. the formatting gaps listed in the audit are closed
2. the content-control gaps listed in the audit are closed for the targeted phase
3. every phase is proven by targeted tests and live QA
4. `npm test -- tests/visual-editor` passes after each phase
5. `npm run build` passes after each phase
