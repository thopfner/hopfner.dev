# Acceptance Checklist

Use this before marking the homepage enhancement work complete.

## Backend/Frontend Truth

- `section_control_capabilities` is complete for homepage section types
- capability loading merges DB rows over code fallbacks instead of replacing the full map
- admin only exposes controls that the renderer actually honors
- unsupported semantic tokens are stripped or ignored intentionally

## Accessibility/Semantics

- repeated permanent section renderers no longer reuse fixed heading IDs
- each `aria-labelledby` target is unique on the page
- live DOM region labels match the visible headings

## Public Content Truth

- no `Trust me bro`
- no `Describe the problem or challenge your client faced.`
- no `Media placeholder`
- no `© 2026 Your Company`
- no dead `#` footer links unless intentionally temporary and hidden from public navigation

## Elite UI Standard

- trust/proof stack looks bespoke, not template-like
- social proof has enough visual weight to establish credibility
- proof cluster feels like evidence, not sample content
- case study has a real artifact or a clearly intentional neutral state
- footer closes the page like a premium consultancy, not a default app template

## Responsive QA

- desktop hero, proof stack, and footer all feel coherent
- mobile proof stack remains readable and high-signal
- footer does not collapse into a generic sitemap feel on mobile

## Final Verification

- run the relevant lint/tests if touched
- manually inspect `https://hopfner.dev/home`
- compare admin controls for the modified section types against live output after publish
