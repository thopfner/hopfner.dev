# Coding Agent Prompt

You are executing a correction batch, not a redesign batch.

The audit conclusion is:

1. the visual editor still has two different plain-text editing systems, which makes small text feel worse than large text
2. page-level settings do not yet preview truthfully before save
3. composed-section editing is no longer a dead end, but it still uses stubbed link/media resources
4. preview link suppression is still incomplete if keyboard activation can navigate

Execution rules:

1. execute phases in order
2. stop if a phase gate fails
3. reuse the current visual-editor architecture and existing admin infrastructure before creating anything new
4. keep this batch narrow; do not widen it into shell polish, layout redesign, or unrelated feature work
5. if an assumption in the brief breaks, stop and report the exact file and contract mismatch

Anti-drift rules:

1. do not invent a second text-edit framework
2. do not preserve the current small-text inline editing path “temporarily”
3. do not create a separate preview-only page-settings store that diverges from the save path
4. do not fake composed-section parity with placeholder resources
5. do not rely on source inspection tests as the main evidence for completion

Required quality bar:

1. editing a body label, eyebrow, CTA label, or section title must feel like one product, not two editor modes
2. page settings must behave like a serious visual editor: the user should see the result before save
3. composed sections must feel integrated enough that link and media operations are not second-class
4. preview interaction safety must be complete enough that authors cannot accidentally leave the editor by interacting with the canvas

Required reporting:

1. state the exact branch or code path removed for the old inline plain-text editor
2. state which page draft values now feed the preview before save
3. state which shared link/media loaders were reused for composed sections
4. state which keyboard interactions are now blocked in the preview
5. list the new behavior tests by filename and scenario
