# Current State

## Product Areas Already Worked Through

### 1. Visual Editor

The visual editor went through many iterative handoff cycles and is now materially stronger.

Important themes from that work:
- direct in-place editing
- CTA visibility controls
- section chrome truthfulness
- parity with form editor
- premium admin UX

This is not the current active focus unless the user redirects there.

### 2. Admin Backend

The admin backend was upgraded through phased `admin_enhancements_v*` work:
- shared scaffolds
- collection/workspace unification
- route-context cleanup
- premiumization of major admin routes

The backend foundation is now much stronger, but not the current active track.

### 3. CTA Visibility / Button System

The app now has:
- shared CTA visibility helpers
- explicit show/hide CTA behavior
- frontend render support for CTA visibility
- form-editor and visual-editor CTA visibility support

This work landed via:
- `micro_enhancements_v1`
- `micro_enhancements_v2`

### 4. Cookie Consent System

This is the current active frontend track.

Implemented already:
- server-readable consent cookie
- jurisdiction detection for EEA / UK / Switzerland
- Google Analytics gating
- minimalist consent banner/preferences UI
- persistent reopen behavior
- production hardening:
  - secure cookie in HTTPS contexts
  - no consent UI when no optional tracker exists
  - parser validation for consent source

Current known product gap:
- consent UI is mounted outside the themed marketing page scope, so it can inherit the wrong visual theme
- the persistent `Cookies` reopen badge is a floating UI element that does not meet the product bar

Those are the reasons `micro_enhancements_v5` exists.
