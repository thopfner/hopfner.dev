# Coding Agent Prompt

You are executing a narrow alignment batch, not a new feature sprint.

The audit conclusion is:

1. v16 improved the editor, but composed-section support truth still drifted because canvas and inspector are using different standards
2. the page-workspace panel looks better but still behaves like a conditional form in one key way: the action footer disappears when clean
3. the structure rail got quieter, but it also lost some meaning and still truncates too aggressively
4. proof quality is still below the required bar

Execution rules:

1. execute phases in order
2. stop if a phase gate fails
3. keep this batch narrow and corrective
4. reuse the current architecture and improve it surgically
5. if an assumption in the brief breaks, stop and report the exact file and contract mismatch

Anti-drift rules:

1. do not solve composed support by duplicating the same logic in two places
2. do not hide the page-workspace footer again behind a dirty-state condition
3. do not add more rail badges or micro-labels than you remove
4. do not conflate “global” and “locked” into a single ambiguous signal
5. do not use source-string tests as the primary proof of success

Required quality bar:

1. the editor must tell one consistent story about composed sections
2. the page-workspace must feel persistent and deliberate, even when clean
3. the structure rail must scan faster and communicate meaning more clearly
4. the evidence for the batch must match the sophistication of the UI

Required reporting:

1. state the exact shared composed-support helper or function and where it is used
2. state the exact footer behavior and statuses in the page panel after the change
3. state the exact rail-level changes for truncation, status, and global/locked meaning
4. list the new tests by filename and scenario
