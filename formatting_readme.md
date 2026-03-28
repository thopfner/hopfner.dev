# Formatting Controls Reference

This document maps every section editor formatting control to its frontend rendering behavior, documents what each option value does visually, and flags controls that are exposed in the admin but do **not** produce visual changes in the current renderer code.

---

## 1. Section Rhythm

**What it does:** Controls vertical padding (top/bottom whitespace) of the entire section.

| Value | CSS Classes | Visual Effect |
|-------|------------|---------------|
| `hero` | `py-12 sm:py-20` | Maximum breathing room — for hero/banner sections |
| `statement` | `py-10 sm:py-14` | Large — for bold statement sections |
| `cta` | `py-10 sm:py-16` | Large — for call-to-action blocks |
| `standard` | `py-8 sm:py-12` | Default comfortable spacing |
| `proof` | `py-6 sm:py-9` | Slightly tighter — for social proof, metrics |
| `footer` | `py-6 sm:py-8` | Compact — for footer areas |
| `compact` | `py-3 sm:py-5` | Minimal — for dense content strips |

**Verdict: WORKS.** Applied via `SectionShell` on every section that receives the `ui` prop. All 7 values produce distinct spacing.

**Renderer coverage:**
- card_grid, steps_list, title_body_list, rich_text_block, label_value_list, faq_list, cta_block, composed — all pass `ui.rhythm` to SectionShell
- hero_cta — gets rhythm via `sectionClassName` from legacy `sectionContainerProps` (paddingY field), NOT from design-system tokens
- footer_grid — gets rhythm via `sectionClassName` from legacy path

---

## 2. Section Surface

**What it does:** Controls the background treatment of the section — adding tints, gradients, or borders to create visual layers on the page.

| Value | CSS Classes | Visual Effect |
|-------|------------|---------------|
| `none` | *(empty)* | Transparent — blends into page background |
| `panel` | `surface-panel` | Subtle card-like panel (uses custom utility class) |
| `soft_band` | `bg-card/[0.05] border-y border-border/25` | Very faint tinted band with thin top/bottom borders |
| `contrast_band` | `bg-card/[0.12] border-y border-border/50` | Stronger tinted band with more visible borders |
| `spotlight_stage` | gradient from-accent/[0.04] + border-accent/[0.10] | Subtle accent-tinted gradient with accent-colored borders |
| `grid_stage` | radial gradient from accent at top | Radial glow emanating from top-center of section |

**Verdict: WORKS.** All 6 values produce distinct backgrounds. `spotlight_stage` and `grid_stage` also trigger special CSS signature classes (`sig-obsidian-signal`, `sig-grid-rays`).

**Renderer coverage:** Same as rhythm — all sections with `ui` prop pass this to SectionShell. Hero and footer use the legacy `sectionClassName` path.

---

## 3. Content Density

**What it does:** Controls internal spacing within cards — padding, gaps between elements, and overall "breathing room" inside card components.

| Value | Card Padding | Internal Gap | Header Padding | Body Padding |
|-------|-------------|-------------|----------------|-------------|
| `tight` | `py-2.5` | `gap-1.5` | `px-3 pt-3 pb-0` | `px-3 pb-3` |
| `standard` | `py-4` | `gap-3` | `px-4 pt-4 pb-0` | `px-4 pb-4` |
| `airy` | `py-6` | `gap-5` | `px-5 pt-5 pb-0` | `px-5 pb-5` |

There is also a section-level gap map (`DENSITY_SECTION_GAP`): tight=`space-y-3`, standard=`space-y-5 sm:space-y-6`, airy=`space-y-6 sm:space-y-8`.

**Verdict: WORKS.** All supported sections consume density tokens. (Fixed in v10.)

| Section Type | Consumes Density? | Details |
|-------------|-------------------|---------|
| card_grid (WhatIDeliverSection) | **YES — full** | Uses all density maps extensively |
| title_body_list (WorkflowsSection) | **YES** | All 4 layouts use DENSITY_COMPACT_PADDING, DENSITY_GAP, DENSITY_ITEM_SPACING |
| steps_list (HowItWorksSection) | **YES** | All 3 layouts use DENSITY_COMPACT_PADDING, DENSITY_GAP, DENSITY_ITEM_SPACING |
| label_value_list (TechStackSection) | **YES** | metrics_grid + default use DENSITY_GAP, DENSITY_COMPACT_PADDING |
| faq_list (FaqSection) | **YES** | Accordion trigger/content padding scales with density |
| composed (ComposedSection) | **Partial** | Checks tight/airy for `space-y` between rows |

---

## 4. Grid Gap

**What it does:** Controls the spacing between cards/items in a grid layout.

| Value | CSS Class | Visual Effect |
|-------|----------|---------------|
| `tight` | `gap-2` | Cards nearly touching |
| `standard` | `gap-4` | Comfortable default spacing |
| `wide` | `gap-6` | Generous space between cards |

**Verdict: WORKS where supported.**

| Section Type | Consumes gridGap? |
|-------------|-------------------|
| card_grid (WhatIDeliverSection) | **YES** — applied to card grid |
| composed (ComposedSection) | **YES** — applied to row grid |
| All others | **NO** — grids use hardcoded gap values |

Grid gap is only exposed for card_grid in the capability matrix, which is correct. No mismatches here.

---

## 5. Heading Treatment

**What it does:** Changes the typographic style of section headings (`<h2>`) and sometimes sub-headings (`<h3>`).

| Value | CSS Classes | Visual Effect |
|-------|------------|---------------|
| `default` | *(none)* | Standard heading font/weight |
| `display` | `text-display` | Uses the display typeface (Space Grotesk or configured display font) |
| `mono` | `text-label-mono uppercase tracking-widest` | Monospaced, uppercase, wide letter-spacing |

**Verdict: WORKS where supported.**

| Section Type | Consumes headingTreatment? | Details |
|-------------|---------------------------|---------|
| cta_block (FinalCtaSection) | **YES** | Applied to headlines in all 4 layout variants |
| rich_text_block (WhyThisApproachSection) | **YES** | Applied to `<h2>` and `<h3>` |
| composed (ComposedSection) | **YES** | Passed via semantic context to block renderers |
| title_body_list (WorkflowsSection) | **YES** | Applied to SectionHeading (fixed in v10) |
| steps_list (HowItWorksSection) | **YES** | Applied to SectionHeading in all 3 layouts (added in v10) |
| faq_list (FaqSection) | **YES** | Applied to SectionHeading (added in v10) |
| label_value_list (TechStackSection) | **YES** | Applied to SectionHeading (added in v10) |
| hero_cta | **NO** | Hero does not receive `ui` prop (intentional — specialized layout) |

---

## 6. Label Style

**What it does:** Controls how tags, badges, step numbers, and eyebrow text are styled.

| Value | Visual Effect |
|-------|---------------|
| `default` | Rounded pill border, mono font, muted color — the standard tag look |
| `mono` | Plain monospaced text, no border/background |
| `pill` | Accent-tinted pill — colored border, subtle accent background, uppercase tracking |
| `micro` | Extremely small (9px), bold uppercase with extra-wide tracking, faded color |

**Verdict: WORKS where supported.**

| Section Type | Consumes labelStyle? | Details |
|-------------|---------------------|---------|
| card_grid (WhatIDeliverSection) | **YES** | Applied to card tags via `LABEL_STYLE_CLASSES` |
| steps_list (HowItWorksSection) | **YES** | Applied to step numbers with per-style rendering |
| composed (ComposedSection) | **YES** | Passed to block renderers for badges/eyebrows |
| label_value_list (TechStackSection) | **YES** | Applied to metric labels in metrics_grid layout (fixed in v10) |

---

## 7. Card Family

**What it does:** Defines the fundamental visual identity of cards — each family has a unique combination of borders, backgrounds, gradients, and shapes.

| Value | Visual Identity |
|-------|----------------|
| `quiet` | Minimal — subtle border, faint bg, rounded-xl |
| `service` | Premium — accent-tinted gradient, shadow, ring, rounded-xl |
| `metric` | Centered text — moderate border, slightly more bg opacity, rounded-xl |
| `process` | Directional — thick 3px left accent border, no rounding on left side |
| `proof` | Editorial — gradient from card/15 to card/5, moderate border |
| `logo_tile` | Logo display — very faint border/bg, flex centered, rounded-lg |
| `cta` | Action-oriented — accent border, accent-tinted bg, shadow |

**Verdict: WORKS where supported.**

| Section Type | Consumes componentFamily? | Details |
|-------------|--------------------------|---------|
| card_grid (WhatIDeliverSection) | **YES — full** | Uses `resolveCardClasses()`, also has service-family specific internal layout |
| steps_list (HowItWorksSection) | **Partial** | Checks for `process` family in grid layout to apply directional border; doesn't use `resolveCardClasses()` |
| All others | **NO** | Not applicable or not wired |

Card family is correctly limited in capabilities to card_grid and steps_list only.

---

## 8. Card Chrome

**What it does:** Modifies the "physicality" of cards — layered on top of the family's base identity. When a family is set, chrome is a modifier; without a family, chrome applies standalone styles.

| Value | As Modifier (with family) | Standalone (no family) |
|-------|--------------------------|----------------------|
| `flat` | Remove border, remove shadow | Transparent border, faint bg |
| `outlined` | Add ring-1 ring-border/20 | Border + ring + faint bg |
| `elevated` | Add shadow-md | Border + bg + shadow-md |
| `inset` | Inset shadow, darker bg | Border + inset shadow |

**Verdict: WORKS, but only via one renderer.**

| Section Type | Consumes componentChrome? |
|-------------|--------------------------|
| card_grid (WhatIDeliverSection) | **YES** — passed through `resolveCardClasses()` |
| All others | **NO** |

Chrome is correctly limited in capabilities to card_grid only. The `flat` modifier actively strips family borders/shadows, `outlined` adds a ring, `elevated` adds depth, `inset` creates a pressed-in look.

---

## 9. Accent Rule

**What it does:** Adds a colored accent element to cards — either as a border or as a rendered bar inside the card.

| Value | Visual Effect |
|-------|---------------|
| `none` | No accent decoration |
| `left` | 3px accent-colored left border |
| `top` | 3px accent-colored top border |
| `inline` | Rendered as a visible accent bar inside the card (no CSS class — handled in JSX) |

**Verdict: WORKS where supported.**

| Section Type | Consumes accentRule? | Details |
|-------------|---------------------|---------|
| card_grid (WhatIDeliverSection) | **YES** | Via `resolveCardClasses()` + inline accent rendering |
| steps_list (HowItWorksSection) | **YES** | Applied to step cards + affects timeline line intensity |
| All others | **NO** | Not applicable or not wired |

Correctly limited in capabilities to card_grid and steps_list.

---

## 10. Divider Mode

**What it does:** Adds horizontal divider lines between items/cards.

| Value | CSS Classes | Visual Effect |
|-------|------------|---------------|
| `none` | *(empty)* | No dividers |
| `subtle` | `divide-y divide-border/30` | Faint horizontal lines between items |
| `strong` | `divide-y divide-border/70` | More visible horizontal lines |

**Verdict: WORKS.** All supported sections consume divider tokens. (Fixed in v10.)

| Section Type | Consumes dividerMode? | Details |
|-------------|----------------------|---------|
| card_grid (WhatIDeliverSection) | **YES** | Controls card-internal separator styling |
| faq_list (FaqSection) | **YES** | Applied to accordion container |
| composed (ComposedSection) | **YES** | Applied between row sections |
| title_body_list (WorkflowsSection) | **YES** | Applied to stacked items and accordion (fixed in v10) |
| steps_list (HowItWorksSection) | **YES** | Applied to timeline list and grid layout (fixed in v10) |

---

## Summary: All Flagged Issues Resolved (v10)

All 5 previously flagged dead controls have been wired into their renderers:

| Section Type | Control | Renderer | Status |
|-------------|---------|---------|--------|
| `title_body_list` | contentDensity | WorkflowsSection | **FIXED** — all 4 layouts use density maps |
| `title_body_list` | headingTreatment | WorkflowsSection | **FIXED** — SectionHeading receives headingTreatment |
| `title_body_list` | dividerMode | WorkflowsSection | **FIXED** — stacked + accordion use DIVIDER_CLASSES |
| `steps_list` | dividerMode | HowItWorksSection | **FIXED** — timeline + grid use DIVIDER_CLASSES |
| `label_value_list` | labelStyle | TechStackSection | **FIXED** — metrics labels use LABEL_STYLE_CLASSES |

**No dead controls remain.** Every exposed admin control produces a visible frontend change.

---

## Sections NOT Using Design System Tokens

These sections receive formatting through the legacy `sectionContainerProps` path (paddingY, sectionClass) rather than the `ResolvedSectionUi` object:

| Section | Gets `ui` prop? | How it gets rhythm/surface |
|---------|----------------|---------------------------|
| `hero_cta` (HeroSection) | **NO** | Via `sectionClassName` from `sectionContainerProps` |
| `footer_grid` (FooterGridSection) | **NO** | Via `sectionClassName` from `sectionContainerProps` |

These sections have custom formatting paths (e.g., `heroMinHeight`, `heroImageOverlayColor`) that don't map to design system tokens, which is intentional — they have specialized needs that the token system doesn't cover.

---

## Quick Reference: What Works End-to-End (v10)

| Control | card_grid | steps_list | title_body_list | rich_text | label_value_list | faq_list | cta_block | composed |
|---------|-----------|-----------|-----------------|-----------|------------------|----------|-----------|----------|
| rhythm | via shell | via shell | via shell | via shell | via shell | via shell | via shell | via shell |
| surface | via shell | via shell | via shell | via shell | via shell | via shell | via shell | via shell |
| density | **FULL** | **YES** | **YES** | — | **YES** | **YES** | — | partial |
| gridGap | **YES** | — | — | — | — | — | — | **YES** |
| headingTreatment | — | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** |
| labelStyle | **YES** | **YES** | — | — | **YES** | — | — | **YES** |
| dividerMode | **YES** | **YES** | **YES** | — | — | **YES** | — | **YES** |
| cardFamily | **YES** | partial | — | — | — | — | — | — |
| cardChrome | **YES** | — | — | — | — | — | — | — |
| accentRule | **YES** | **YES** | — | — | — | — | — | — |

**Legend:** **YES** = fully wired and working, **FULL** = uses all sub-maps, partial = limited consumption, via shell = handled by SectionShell wrapper, — = not in capability list (control not exposed in admin for this section type)
