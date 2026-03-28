# Coding Agent Prompt

You are executing a narrow UX hardening batch, not a redesign batch.

The audit conclusion is:

1. the visual-editor toolbar is still vulnerable to disappearing because the workspace is using the wrong height/overflow contract inside the admin shell
2. section selection from the left rail still uses a canvas jump path that is too browser-dependent
3. the plain-text overlay architecture is now unified, but the single-line treatment still reuses live display styling too literally and feels worse than the large-text editor

Execution rules:

1. execute phases in order
2. stop if a phase gate fails
3. reuse the current visual-editor architecture and improve it surgically
4. keep this batch narrow; do not widen it into a general shell redesign or another content-parity pass
5. if an assumption in the brief breaks, stop and report the exact file and contract mismatch

Anti-drift rules:

1. do not solve the header issue by adding random sticky classes without fixing the layout contract
2. do not keep `scrollIntoView` if the selected-section jump can still target the wrong scroll container
3. do not revert to inline editing for small text
4. do not degrade the large-text overlay while fixing the single-line overlay
5. do not use source inspection as the main proof of completion

Required quality bar:

1. the workspace must feel like a fixed, professional editing shell, not a page inside a page
2. selecting sections from the left rail must feel precise and deliberate
3. small text editing must be as comfortable and legible as the strong large-text editing path

Required reporting:

1. state the exact layout/overflow contract before and after the fix
2. state the exact code path removed or replaced for section auto-scroll
3. state the exact single-line overlay readability rules now used
4. list the new tests by filename and scenario
