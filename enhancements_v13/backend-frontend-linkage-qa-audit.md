# Backend to Frontend Linkage QA Audit

## Scope

This audit covers:

- the live public homepage at `https://hopfner.dev/home`
- the current marketing renderers in `components/landing`
- the CMS publishing path
- the custom section registry/composed section path

The specific QA standard for this audit is:

**no hardcoded public-facing content except explicit fallback behavior when content is null or empty**

That means we must distinguish between:

1. CMS-seeded content
2. valid public renderer fallbacks
3. invalid renderer-level hardcoded placeholder output

---

## Executive Verdict

The backend/frontend linkage is **partially solid but not yet clean**.

What is already working:

- published pages are assembled through the CMS pipeline
- custom section types are registry-driven
- the section editor and public renderer both know about `section_type_registry`
- a large amount of homepage content is coming from seeded CMS content, not from renderer literals

What is still failing the standard:

- some public renderers still emit hardcoded placeholder/demo strings
- some public renderers still supply public defaults where they should render nothing
- some composed-section blocks still behave like a preview layer even in the live public page
- footer and hero still contain legacy defaults that are too permissive for production

So the answer is:

**no, the current site does not yet fully satisfy “no hardcoded public items except fallback content if null.”**

---

## What Is Properly CMS-Driven

The current architecture does have a real CMS linkage.

### Published page assembly

The public page loader reads:

- page data
- section rows
- published section versions
- registry-backed custom section schemas

Core file:

- `lib/cms/get-published-page.ts`

Important behavior:

- built-in section types resolve from published section versions
- custom section types resolve through `section_type_registry`
- registry `composer_schema` is used as a fallback source for active composed section types

This is real runtime linkage, not static mock content.

### Custom section type registry

The composed section system is real and live.

Relevant files:

- `lib/cms/get-published-page.ts`
- `components/section-editor-drawer.tsx`
- `app/admin/(protected)/section-library/page-client.tsx`
- `migrations/20260307_custom_section_types.sql`

This means new custom section types can be added without rebuilding the whole page architecture.

### Seeded homepage content vs renderer literals

Several strings visible on the site are seeded content, not renderer hardcoding.

Examples found in:

- `lib/cms/blueprint-content.ts`

Examples include:

- service card titles like `Workflow Automation`
- CTA copy like `Practical recommendations you can implement fast.`
- sections such as `Workflow Automation FAQ`

These are acceptable as seed/default content because they live in content seeding, not in the public renderer logic.

---

## Failing Areas

## 1. Hero proof panel still contains public demo fallbacks

File:

- `components/landing/hero-section.tsx`

Problems:

- if the dashboard mockup variant has no `items`, the renderer emits hardcoded demo metrics
- if the mockup has no actual visual content, the renderer emits `Mockup preview`

Examples:

- demo dashboard numbers and labels
- `Mockup preview`

Why this fails:

- these are public-renderer demo strings, not CMS seed content
- they are acceptable in admin preview mode, but not as production frontend behavior

Required rule:

- if proof-panel content is absent on the public site, render a neutral empty state or omit that module entirely
- do not render fake operational metrics in production

---

## 2. Footer still uses permissive public defaults

File:

- `components/landing/footer-grid-section.tsx`

Problems:

- subscribe input placeholder falls back to `Email Address`
- subscribe button falls back to `Subscribe`
- missing CTA hrefs fall back to `#`
- legal copy falls back to `© 2026 Your Company`
- missing legal link labels fall back to `Link`

Why this matters:

- placeholder UI defaults are fine inside admin previews
- production renderers should not quietly publish generic legal/footer text or empty `#` CTAs

Required rule:

- if the content is absent, omit that element
- only keep minimal neutral fallbacks where there is a strong UX reason
- do not manufacture production legal copy

---

## 3. Composed section public renderer still leaks preview placeholders

File:

- `components/landing/composed-section.tsx`

This is currently the biggest content-truthfulness problem.

Examples of public fallback strings still present:

- `Heading`
- `Subtitle`
- `Rich text`
- `Section image`
- `Image block`
- `Step`
- `Card`
- `Card body`
- `Question`
- `Answer`
- `Primary`
- `Before`
- `After`
- `Media panel`

Why this fails:

- these are preview-oriented values
- the composed renderer runs on the public site
- if a block is incomplete, the public page can still show these literals

Required rule:

- section library and admin preview may use seed placeholders
- public composed renderer must not emit placeholder copy except deliberate null-state behavior
- if a required field is absent, skip the block or render a structurally empty shell without fake text

---

## 4. Migration-seeded custom sections are acceptable, but only as schema starters

File:

- `migrations/20260307_custom_section_types.sql`

The custom section registry currently seeds starter schemas containing:

- trust-strip labels
- workflow steps
- before/after comparison content
- proof-card/testimonial examples

This is acceptable **if** treated as starter content in the library/editor.

It becomes a problem only when:

- public renderers rely on those literals after user content is removed or incomplete
- section templates are mistaken for live production defaults

Required rule:

- registry seed content can exist
- public renderers must never backfill missing live content with unrelated demo prose

---

## 5. Minor live issue: favicon 404

Live browser QA showed one console error:

- `GET /favicon.ico` returning `404`

This is minor, but it is still a production polish issue.

---

## What the Live Homepage Is Showing Today

From the live browser audit:

- much of the homepage content is coming from actual published content
- several sections still contain placeholder-style content that appears to have been seeded in CMS data
- the public page is not currently dominated by renderer hardcoding, but renderer fallbacks still exist in the wrong places

Important distinction:

- `seeded CMS content` is a content problem
- `renderer-level placeholder output` is an implementation problem

Both matter, but they should be fixed differently.

---

## QA Conclusion by Category

### Category A: CMS linkage

Status: **pass**

The site does have a functioning CMS-to-frontend publishing pipeline.

### Category B: Registry-driven custom section architecture

Status: **pass**

The system can support new custom section types and composer schemas.

### Category C: Public renderer truthfulness

Status: **partial fail**

The public frontend still contains too many placeholder/demo fallbacks in renderers.

### Category D: “No hardcoded items except fallback if null”

Status: **fail**

This rule is not yet fully enforced in:

- hero proof panel
- footer
- composed section public renderer

---

## Immediate Remediation Rules

Before adding more section types, enforce these rules:

1. Public renderers may not emit editorial/demo placeholder copy.
2. Admin preview and section library may use starter/seed content.
3. If public content is incomplete, prefer:
   - omit element
   - render neutral empty shell
   - render nothing
4. Do not silently backfill legal/footer CTA content on the public site.
5. Custom composed blocks must be safe when partially empty.

---

## Recommended Next Fixes

In this order:

1. remove public placeholder text from `components/landing/composed-section.tsx`
2. tighten footer production defaults in `components/landing/footer-grid-section.tsx`
3. remove hero proof-panel demo fallback output in `components/landing/hero-section.tsx`
4. optionally add explicit admin-preview-only placeholder logic if needed
5. fix the favicon 404

That gives you a cleaner baseline before adding new section types.
