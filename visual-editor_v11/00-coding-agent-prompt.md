# Coding Agent Prompt

Use this brief as a strict execution runbook.

You are not doing exploratory redesign work. You are finishing the current visual editor into a replacement-grade visual page editor without causing frontend regressions.

Follow these rules exactly:

1. Do not change the public renderer contract.
2. Do not invent new storage tables, JSON shapes, or publishing semantics.
3. Reuse proven workflows from the existing form editor wherever they already solve add/duplicate/page-settings/history/media problems.
4. Extract shared helpers when needed. Do not duplicate large chunks of old-editor logic into the visual editor.
5. Keep the form editor fully working.
6. Execute phases in order.
7. Do not proceed if a gate fails.
8. If custom/composed-section editing cannot be implemented safely with the existing schema contract, stop and report the exact schema limitation instead of shipping a broken visual path.

Required quality bar:

1. The visual editor must feel like a premium SaaS product, not an internal admin tool.
2. Every visible control must be truthful to the existing frontend output or existing CMS behavior.
3. New UI must stay consistent with the current visual-editor shell. Do not introduce a second design language.
4. All new actions must have loading, success, and error states.
5. All destructive actions must have confirmation.

Deliver the work phase by phase. At the end of each phase, run the gate. If the gate fails, fix it before continuing.
