# Coding Agent Prompt

You are executing a narrow premium-finish batch, not a new feature sprint.

The audit conclusion is:

1. v17 fixed real product issues, but the proof quality still trails the implementation
2. the page-workspace footer is now persistent, but its clean-state behavior still feels passive and form-like instead of productized
3. the structure rail now communicates state better than the canvas node chrome, so the editor still tells two slightly different stories
4. the next step is not more capability, it is better consistency, stronger proof, and better product finish

Execution rules:

1. execute phases in order
2. stop if a phase gate fails
3. keep this batch narrow and corrective
4. reuse the current architecture and improve it surgically
5. if a requirement in this brief cannot be met cleanly, stop and report the exact file and reason

Anti-drift rules:

1. do not add new editing capabilities in this batch
2. do not hide the page-workspace primary action when the page is clean
3. do not use source-string tests as the main proof for touched UI
4. do not introduce new badge clutter while trying to improve state semantics
5. do not make canvas chrome louder than the structure rail

Required quality bar:

1. the page-workspace should feel intentional in both clean and dirty states
2. state semantics should scan consistently across canvas and rail
3. the proof should be strong enough that another reviewer can trust the completion report
4. the editor should feel more like a premium product and less like an admin tool

Required reporting:

1. list the exact tests converted from source inspection to behavior coverage
2. state the exact clean-state footer layout and dirty-state footer layout after the change
3. state the exact canvas chrome semantics changes for global, locked, and unsaved status
4. list the new tests by filename and scenario
