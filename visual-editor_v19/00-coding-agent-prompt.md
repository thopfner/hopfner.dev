# Coding Agent Prompt

You are executing a narrow correction batch, not a feature sprint.

The audit conclusion is:

1. v18 improved semantics and proof, but the section chrome still creates a fake visual gap that is not present in the real frontend
2. this regression is product-critical because it breaks the editor’s visual truthfulness
3. the page footer is better than before, but it is still not fully structurally stable across clean and dirty states
4. the next move is precision work, not more features

Execution rules:

1. execute phases in order
2. stop if a phase gate fails
3. keep this batch narrow and corrective
4. reuse the current architecture and improve it surgically
5. if the correct fix requires a small presentational extraction, do that and stop there

Anti-drift rules:

1. do not patch the fake gap by changing actual section spacing or section content padding
2. do not keep the current full-width chrome row
3. do not reintroduce noisy badge stacks or heavier chrome
4. do not weaken global/locked semantics while fixing placement
5. do not claim success without manual visual QA on the selected-section state

Required quality bar:

1. the visual editor must not visually lie about section spacing
2. section chrome must feel attached to the section edge, not inserted into the page flow
3. the footer must feel like one stable action bar
4. proof must be strong enough to catch this same regression later

Required reporting:

1. state the exact old and new section-chrome anchoring model
2. state the exact clean and dirty footer slot layout after the change
3. list the exact tests added or upgraded and what user scenario each one proves
4. describe the manual visual QA you performed on a selected section such as `Card Grid`
