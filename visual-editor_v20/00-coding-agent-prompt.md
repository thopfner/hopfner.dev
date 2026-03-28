# Coding Agent Prompt

You are fixing one visual-editor defect only.

The defect is:

1. section chrome still creates the appearance of a separate top row
2. that row looks like real spacing between sections
3. this breaks the visual editor’s truthfulness and premium feel

The current failed approach was:

1. keep chrome on the outer node wrapper
2. straddle the top boundary with `top-0` and `-translate-y-1/2`

That was directionally reasonable but still wrong.

Execution rules:

1. do not widen scope
2. do not tweak the current offsets and call it done
3. fix the anchoring model, not just the numbers
4. stop if the true visual surface cannot be identified cleanly

Anti-drift rules:

1. do not change section spacing tokens
2. do not change public page layout
3. do not keep a full-width or boundary-straddling chrome row
4. do not reintroduce noisy chrome

Required reporting:

1. state the exact current root cause
2. state the exact new anchor surface used for chrome
3. state whether any preview-host background was changed to remove the fake band
4. include the exact manual QA performed on a selected section
