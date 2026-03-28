# Enhancements v13: Elite UI Transformation

## Prerequisite

v12 (sitewide card contract rollout) must be completed first. v13 assumes every card-like surface already resolves through the shared card resolver and that all admin controls are truthful.

## What this brief is

This brief transforms the site from a well-engineered CMS-driven marketing page into a best-in-class AI automation website that competes visually with Linear, Vercel, Stripe, and Runway.

The current system has strong infrastructure (token pipeline, capability matrix, density/rhythm/surface controls) but lacks the visual polish, motion design, and ambient effects that separate elite sites from good ones.

## What this brief is not

This is not a formatting-controls remediation. This is a visual design and interaction engineering upgrade.

## Current state

- No animation library installed
- No scroll-triggered entrance animations
- No gradient text effects
- No ambient background motion
- Cards have basic hover (`interactive-lift`: translateY + shadow) only
- Typography is functional but not dramatic (3 heading treatments, all subtle)
- CTA buttons are standard shadcn variants
- Logo displays are static with basic grayscale
- No number/metric counter animations
- No section-to-section transition effects
- Images use raw `<img>` tags, no Next.js Image optimization
- Background signatures (obsidian-signal, grid-rays, topographic) are static CSS only

## Non-negotiable principles

1. Every enhancement must work within the existing CMS architecture
2. Existing section data models must not break
3. Design tokens remain the single source of truth
4. All motion must respect `prefers-reduced-motion`
5. Performance budget: no animation should cause frame drops below 55fps on mid-tier hardware
6. Each phase must build, deploy, and be visually verifiable before proceeding

---

## Phase 1: CSS Foundation — Ambient Effects, Gradient Text, Card Glow

### Why this phase comes first

These are pure CSS changes with zero new dependencies and the highest visual-impact-per-line-of-code ratio. They establish the visual language that all later phases build on.

### 1A: Gradient text utility

Add reusable gradient text effects for hero headlines and section headings.

#### Required implementation

In `globals.css`, add:

```css
.text-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--foreground)) 30%,
    hsl(var(--foreground) / 0.5) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text-gradient-accent {
  background: linear-gradient(
    135deg,
    hsl(var(--foreground)) 20%,
    hsl(var(--accent-glow, var(--foreground)) / 0.6) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

#### Required integration

- Add `"gradient"` and `"gradient_accent"` to the `HeadingTreatment` type in `tokens.ts`
- Add corresponding entries to `HEADING_TREATMENT_CLASSES` in `presentation.ts`
- `SectionHeading` already applies heading treatment classes — it picks these up automatically
- Admin drawer already shows headingTreatment for supported sections — no admin changes needed

### 1B: Ambient gradient mesh backgrounds

Add new surface types that create living, breathing section backgrounds.

#### Required new surface tokens

- `gradient_mesh` — multi-stop radial gradient with slow CSS animation on background-position
- `accent_glow` — single centered radial glow of accent color behind section content
- `dark_elevated` — slightly lighter dark background with subtle borders (for section rhythm contrast)
- `dot_grid` — subtle geometric dot grid pattern for technical credibility

#### Required CSS implementation

```css
.surface-gradient-mesh {
  background:
    radial-gradient(ellipse 80% 50% at 20% 50%, hsl(var(--accent-glow, 240 60% 60%) / 0.06), transparent 70%),
    radial-gradient(ellipse 60% 40% at 80% 30%, hsl(var(--accent-glow, 280 50% 50%) / 0.04), transparent 60%),
    radial-gradient(ellipse 90% 60% at 50% 100%, hsl(var(--accent-glow, 200 70% 50%) / 0.05), transparent 50%);
  animation: mesh-drift 20s ease-in-out infinite alternate;
}

@keyframes mesh-drift {
  0% { background-position: 0% 0%, 100% 0%, 50% 100%; }
  100% { background-position: 20% 10%, 80% 20%, 40% 90%; }
}

@media (prefers-reduced-motion: reduce) {
  .surface-gradient-mesh { animation: none; }
}

.surface-accent-glow {
  position: relative;
}
.surface-accent-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(600px circle at 50% 30%, hsl(var(--accent-glow, var(--foreground)) / 0.08), transparent 70%);
  pointer-events: none;
}

.surface-dark-elevated {
  background-color: hsl(var(--card) / 0.08);
  border-top: 1px solid hsl(var(--border) / 0.15);
  border-bottom: 1px solid hsl(var(--border) / 0.15);
}

.surface-dot-grid {
  background-image: radial-gradient(circle, hsl(var(--foreground) / 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

#### Required integration

- Add `"gradient_mesh"`, `"accent_glow"`, `"dark_elevated"`, `"dot_grid"` to `Surface` type in `tokens.ts`
- Add corresponding entries to `SURFACE_CLASSES` in `presentation.ts`
- SectionShell already applies surface classes — no renderer changes needed

### 1C: Enhanced card hover and glow chrome

Upgrade from basic `interactive-lift` to multi-layer hover treatment and add a glow chrome variant.

#### Required CSS

```css
/* Strengthen the existing interactive-lift */
.interactive-lift {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out;
}
.interactive-lift:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px -4px hsl(var(--foreground) / 0.12),
    0 0 0 1px hsl(var(--border) / 0.15);
}

/* New: card glow hover for premium card chrome */
.card-glow-hover {
  position: relative;
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card-glow-hover::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    hsl(var(--foreground) / 0.08),
    transparent 50%,
    hsl(var(--foreground) / 0.04)
  );
  opacity: 0;
  transition: opacity 250ms ease-out;
  pointer-events: none;
  z-index: -1;
}
.card-glow-hover:hover::after {
  opacity: 1;
}
.card-glow-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px hsl(var(--foreground) / 0.15);
}
```

#### Required integration

- Add `"glow"` to `CardChrome` type in `tokens.ts`
- Add `glow: "card-glow-hover shadow-lg"` to `CHROME_MODIFIERS` in `component-families.ts`
- The shared card resolver picks this up automatically

### 1D: Section transition gradients

Eliminate hard section boundaries with gradient bleeds.

#### Required CSS

```css
.section-bleed-bottom {
  position: relative;
}
.section-bleed-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, var(--next-section-bg, hsl(var(--background))));
  pointer-events: none;
}
```

`--next-section-bg` is already defined in page.tsx for some sections. Extend it to all section pairs.

### Acceptance criteria — Phase 1

- `headingTreatment: "gradient"` produces visible gradient-to-transparent text on headings
- `headingTreatment: "gradient_accent"` produces a visible accent-tinted gradient
- `surface: "gradient_mesh"` shows a slowly drifting ambient gradient background
- `surface: "accent_glow"` shows a centered radial glow behind content
- `surface: "dot_grid"` shows a subtle repeating dot pattern
- `cardChrome: "glow"` creates visible border glow + lift on card hover
- `interactive-lift` hover now produces a stronger, more refined shadow
- All effects disabled under `prefers-reduced-motion`
- Build passes, deploy succeeds

---

## Phase 2: Framer Motion — Entrance Animations, Stagger, Counters

### Why this phase comes second

Framer Motion is the single highest-impact library addition. It transforms the site from static to alive.

### 2A: Install Framer Motion

```bash
npm install framer-motion
```

### 2B: Create animation primitives

Create `components/landing/motion-primitives.tsx` with reusable animated wrappers.

#### Required components

**FadeIn** — fade up on scroll into view

```typescript
Props: { children, delay?: number, className?: string }
Behavior:
  - initial: { opacity: 0, y: 24 }
  - whileInView: { opacity: 1, y: 0 }
  - viewport: { once: true, margin: "-50px" }
  - transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }
  - If prefers-reduced-motion: render children directly, no wrapper
```

**StaggerContainer** — staggered children container

```typescript
Props: { children, staggerDelay?: number, className?: string }
Behavior:
  - variants: {
      hidden: {},
      show: { transition: { staggerChildren: staggerDelay ?? 0.1 } }
    }
  - initial: "hidden"
  - whileInView: "show"
  - viewport: { once: true, margin: "-50px" }
  - If prefers-reduced-motion: render a plain div
```

**StaggerItem** — individual stagger child

```typescript
Props: { children, className?: string }
Behavior:
  - variants: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    }
  - If prefers-reduced-motion: render a plain div
```

**AnimatedCounter** — number counter that counts up when scrolled into view

```typescript
Props: { target: number, duration?: number, prefix?: string, suffix?: string, className?: string }
Behavior:
  - Uses useMotionValue + useTransform + useInView
  - Animates from 0 to target over duration (default 2s)
  - Only triggers when scrolled into view
  - Displays rounded integer with optional prefix/suffix
  - If prefers-reduced-motion: show final value immediately
```

**ScaleIn** — scale up on scroll

```typescript
Props: { children, delay?: number, className?: string }
Behavior:
  - initial: { opacity: 0, scale: 0.95 }
  - whileInView: { opacity: 1, scale: 1 }
  - viewport: { once: true }
  - transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }
  - If prefers-reduced-motion: render children directly
```

#### Critical implementation note

All motion primitives must be client components (`"use client"`). They wrap server-rendered children. This avoids hydration mismatches.

The `prefers-reduced-motion` check should use `framer-motion`'s `useReducedMotion()` hook.

### 2C: Wire entrance animations into section renderers

Every section renderer should wrap its heading in `FadeIn` and its item grid/list in `StaggerContainer` with each item in `StaggerItem`.

#### Required integration order (by visual impact)

1. **what-i-deliver-section.tsx** — card grid in `StaggerContainer`, each card in `StaggerItem`
2. **how-it-works-section.tsx** — step grid in `StaggerContainer`, each step in `StaggerItem`
3. **tech-stack-section.tsx** — metrics grid in `StaggerContainer`, each metric in `StaggerItem`
4. **workflows-section.tsx** — card layout variant in `StaggerContainer` (accordion layout keeps its own animation)
5. **faq-section.tsx** — `SectionHeading` in `FadeIn` only
6. **final-cta-section.tsx** — entire content block in `FadeIn`
7. **why-this-approach-section.tsx** — card in `FadeIn`

#### Required pattern for all renderers

```tsx
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/landing/motion-primitives"

// Heading:
<FadeIn>
  <SectionHeading ... />
</FadeIn>

// Item grid:
<StaggerContainer className={gridClass}>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card ... />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### 2D: Animated metric counters

Wire `AnimatedCounter` into `tech-stack-section.tsx` for the `metrics_grid` layout variant.

#### Required behavior

When the metric value string contains a parseable number (detect via regex: `/^[^0-9]*(\d[\d,.]*)/`), extract the number and any prefix/suffix, then render with `AnimatedCounter`.

Examples:
- `"99%"` → `AnimatedCounter target={99} suffix="%"`
- `"150+"` → `AnimatedCounter target={150} suffix="+"`
- `"$2.5M"` → `AnimatedCounter target={2.5} prefix="$" suffix="M"`
- `"Enterprise"` → static text (not a number)

### Acceptance criteria — Phase 2

- Cards in card grids stagger in from below when scrolled into view
- Steps in how-it-works stagger in sequentially
- Metric values count up from 0 when scrolled into view
- Section headings fade up when scrolled into view
- CTA sections fade up smoothly
- All animations play once only (do not re-trigger on scroll back)
- `prefers-reduced-motion` disables all animation — content renders immediately
- Build succeeds with no hydration mismatches
- No Lighthouse performance regression beyond 5 points

---

## Phase 3: Typography & Hero Elevation

### Why this phase comes third

With CSS foundation and motion in place, the hero section can receive the full elite treatment. Typography is the single highest-leverage design element.

### 3A: Dramatic type scale

Add larger, tighter heading treatments for hero and statement sections.

#### Required implementation

In `globals.css`:

```css
.text-display-xl {
  font-family: var(--font-sans);
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
  font-weight: 600;
  text-wrap: balance;
}

.text-display-lg {
  font-family: var(--font-sans);
  font-size: clamp(1.875rem, 3vw + 0.5rem, 3rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 600;
  text-wrap: balance;
}
```

#### Required integration

- Add `"display_xl"` and `"display_lg"` to `HeadingTreatment` type in `tokens.ts`
- Add class mappings in `HEADING_TREATMENT_CLASSES`
- Apply `text-display-xl` to hero-section.tsx h1 by default
- Update hero section capabilities to include headingTreatment

### 3B: Hero entrance choreography

Add sequenced entrance animation to the hero section.

#### Required implementation

Hero elements stagger in this order:

| Order | Element | Delay | Animation |
|-------|---------|-------|-----------|
| 1 | Eyebrow | 0ms | opacity 0→1, y 12→0 |
| 2 | Headline | 150ms | opacity 0→1, y 16→0 |
| 3 | Subheadline | 300ms | opacity 0→1, y 16→0 |
| 4 | CTA buttons | 450ms | opacity 0→1, y 12→0 |
| 5 | Trust line | 600ms | opacity 0→1, y 8→0 |
| 6 | Proof panel | 750ms | opacity 0→1, scale 0.97→1 |

Total sequence: under 1s. Duration per element: 500ms. Easing: `[0.16, 1, 0.3, 1]`.

Use `motion.div` with explicit `initial` + `animate` (not `whileInView` — hero is always in view on load).

### 3C: Hero ambient background enhancement

Add a subtle animated gradient layer to the hero when no background image is set.

#### Required implementation

When hero has no background image configured, render an ambient gradient layer:

```tsx
<div
  aria-hidden
  className="pointer-events-none absolute inset-0 surface-gradient-mesh opacity-50"
/>
```

This reuses the `surface-gradient-mesh` class from Phase 1B.

When a background image IS set, the existing overlay system handles visual treatment — no change needed.

### Acceptance criteria — Phase 3

- Hero headline is dramatically larger (4:1+ ratio vs body text) with tight letter-spacing
- Hero elements stagger in smoothly on page load
- `headingTreatment: "display_xl"` and `"display_lg"` produce visibly larger, tighter headings
- Gradient text combined with display_xl on the hero is clearly premium
- Hero has ambient depth even without a background image set

---

## Phase 4: Social Proof Elevation

### Why this phase comes fourth

With motion and typography in place, social proof sections can receive premium treatment.

### 4A: Logo marquee/ticker

Create an infinite scroll logo ticker component for trust strips and logo rows.

#### Required implementation

Create `components/landing/logo-ticker.tsx`:

```typescript
Props: {
  items: Array<{ label: string; imageUrl?: string; icon?: string }>
  speed?: number // seconds for one full cycle, default 30
  pauseOnHover?: boolean // default true
  className?: string
}

Behavior:
  - Renders two copies of the logo row in a flex container
  - CSS animation: translateX(-50%) over `speed` seconds, linear, infinite
  - overflow: hidden on container
  - Pauses on hover via animation-play-state: paused
  - Logos in grayscale (filter: grayscale(1) brightness(0.7)), restore on hover
  - Accessible: role="marquee", aria-label describing the content
  - If prefers-reduced-motion: render static row (no scroll)
```

#### Required integration

- Add `"marquee"` to TechStackSection's `LayoutVariant` type
- When `layoutVariant === "marquee"`, render `LogoTicker` instead of static logo display
- Admin already has layout variant selection for tech-stack sections

### 4B: Enhanced testimonial block

Upgrade the composed section's `testimonial` block type.

#### Required visual treatment

- Large decorative opening quote mark (text-4xl or text-5xl, accent/20 opacity)
- Quote text in text-lg with slightly increased line-height (1.7)
- Left accent border (border-l-2 border-accent/30) on the quote container
- Attribution row: avatar (40px rounded-full) + name (font-semibold) + title/company (text-sm text-muted)
- Compact variant: smaller quote text, inline attribution

### 4C: Enhanced metric cards

Upgrade metric display in tech-stack-section metrics_grid.

#### Required visual treatment

- Value rendered with `text-gradient` class for visual emphasis
- Animated counter from Phase 2D
- Icon container: when icon present, render in 40px rounded-lg container with `bg-accent/[0.08]` and `shadow-[0_0_16px_hsl(var(--accent-glow,var(--foreground))/0.08)]` for ambient glow
- Label in `text-label-mono` style

### Acceptance criteria — Phase 4

- Logo ticker scrolls infinitely at a readable speed, pauses on hover
- Logos are grayscale → partial color on hover
- Testimonial blocks have premium quote presentation with decorative quote mark
- Metric values have gradient text + animated counters
- All social proof sections feel curated and premium, not templated

---

## Phase 5: CTA & Button Elevation

### Why this phase comes fifth

With the visual system premium throughout, CTAs must match the polish level.

### 5A: New button variants

Add premium button variants to `components/ui/button.tsx`.

#### Required new variants

**gradient** — primary conversion button with gradient background and glow shadow:

```
"bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20
 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
```

**glow** — button with ambient glow halo:

```
"relative bg-primary text-primary-foreground
 shadow-[0_0_20px_hsl(var(--primary)/0.3)]
 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]
 hover:-translate-y-0.5 transition-all duration-200"
```

### 5B: CTA arrow animation

Add an animated arrow that translates right on button hover.

#### Required CSS

```css
.cta-arrow {
  display: inline-block;
  transition: transform 200ms ease-out;
}
.group:hover .cta-arrow,
button:hover .cta-arrow {
  transform: translateX(3px);
}
```

#### Required integration

Wrap arrow/chevron icons in CTA buttons with `<span className="cta-arrow">`. Apply to hero CTA and final-cta-section primary buttons.

### 5C: Click micro-interaction

Add tactile button press feedback:

```css
.btn-press:active {
  transform: scale(0.97) !important;
  transition-duration: 100ms;
}
```

Apply to all button variants.

### Acceptance criteria — Phase 5

- Primary CTA buttons in hero and final-cta sections have visible gradient + glow
- Arrow icons on CTAs translate right smoothly on hover
- Buttons have subtle press-down effect on click
- CTA sections feel conversion-ready and premium

---

## Phase 6: Image Optimization & Performance

### Why this phase is last

Optimization after all visual features are in place.

### 6A: Next.js Image migration

Replace raw `<img>` tags with `next/image` in all landing section renderers.

#### Priority order

1. Hero section — background images, proof panel images (`priority` prop for above-fold)
2. What-i-deliver section — card images (`loading="lazy"`)
3. Tech stack section — logo images (`loading="lazy"`)
4. Composed section — image blocks (`loading="lazy"`)

#### Required behavior

- Use `width` and `height` props derived from image metadata where available
- Use `className` for styling (object-fit, border-radius, etc.)
- Hero images: `priority={true}`, `sizes="100vw"`
- Below-fold images: default lazy loading, appropriate `sizes` hints

### 6B: Reduced motion audit

Ensure every animation addition from Phases 1-5 is disabled under `prefers-reduced-motion`:

- CSS animations: `animation: none` in reduced-motion media query
- CSS transitions: keep short duration (allow `transform` transitions for layout, disable decorative ones)
- Framer Motion: all primitives check `useReducedMotion()` and render children directly
- Content must always be visible immediately — no element should depend on animation to appear

### 6C: Performance audit

- Verify Lighthouse performance score >= 90
- Add `content-visibility: auto` to below-fold sections where beneficial
- Ensure `will-change: transform` is only set during active animations
- Verify no layout shift from image loading (CLS < 0.1)
- Verify no scroll jank from multiple scroll observers

### Acceptance criteria — Phase 6

- All images use `next/image` with appropriate loading strategies
- Lighthouse performance score >= 90
- CLS < 0.1
- `prefers-reduced-motion` produces a fully functional, immediately visible page
- No animation causes visible frame drops

---

## Implementation priority if time-constrained

If full execution isn't possible, prioritize in this order for maximum impact:

1. **Phase 1A + 1B + 1C** — gradient text, ambient surfaces, card glow (pure CSS, biggest ROI)
2. **Phase 2A + 2B + 2C** — Framer Motion + entrance animations (transforms the site feel)
3. **Phase 3A + 3B** — dramatic type scale + hero choreography (first impression)
4. **Phase 4A** — logo ticker (instant credibility upgrade)
5. **Phase 5A** — gradient CTA buttons (conversion polish)
6. Everything else

## New dependencies

- `framer-motion` (~40KB gzipped, tree-shakeable) — the only new npm dependency

## Files expected to change

### New files
- `components/landing/motion-primitives.tsx` — animation wrapper components
- `components/landing/logo-ticker.tsx` — infinite scroll logo marquee

### Modified files
- `app/globals.css` — gradient text, ambient surfaces, card glow, transitions, type scale
- `lib/design-system/tokens.ts` — new HeadingTreatment values (gradient, gradient_accent, display_xl, display_lg), new Surface values, new CardChrome value
- `lib/design-system/presentation.ts` — new class mappings for all new tokens
- `lib/design-system/component-families.ts` — glow chrome variant
- `lib/design-system/capabilities.ts` — hero_cta gets headingTreatment, updated capability matrix
- `components/landing/section-primitives.tsx` — SectionHeading supports new heading treatments
- `components/landing/hero-section.tsx` — entrance choreography, ambient background, dramatic type
- `components/landing/what-i-deliver-section.tsx` — stagger animations
- `components/landing/how-it-works-section.tsx` — stagger animations
- `components/landing/tech-stack-section.tsx` — stagger + counter + marquee variant
- `components/landing/workflows-section.tsx` — stagger for card layout
- `components/landing/final-cta-section.tsx` — fade-in + gradient CTA
- `components/landing/faq-section.tsx` — heading fade-in
- `components/landing/why-this-approach-section.tsx` — fade-in
- `components/landing/composed-section.tsx` — testimonial enhancement, stagger where applicable
- `components/ui/button.tsx` — gradient + glow variants, click micro-interaction

### Migration (for DB capability update if needed)
- `migrations/` — updated capability entries if hero_cta or other sections gain new controls

## Required final deliverables

1. Phase-by-phase change summary with files modified
2. Updated control support matrix reflecting new tokens
3. Visual verification that each phase produces obvious premium improvement
4. Performance report (Lighthouse scores before and after)
5. Confirmation that all motion respects `prefers-reduced-motion`
6. Confirmation that CMS data model is unchanged (no breaking migration required)
7. Confirmation that existing section content renders identically unless a new token value is actively selected

## Dependency chain

```
v12 (card contract) → v13 Phase 1 (CSS foundation) → Phase 2 (Framer Motion)
                                                     → Phase 3 (typography/hero)
                                                     → Phase 4 (social proof)
                                                     → Phase 5 (CTAs)
                                                     → Phase 6 (performance)
```

Phases 3, 4, and 5 can run in parallel after Phase 2 is complete. Phase 6 must be last.
