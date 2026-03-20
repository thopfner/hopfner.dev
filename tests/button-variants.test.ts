/**
 * Button variant contract tests.
 *
 * Proves that shared button variants include the required classes
 * for theme-safe rendering (Sprint 1 — secondary CTA contrast).
 */
import { describe, it, expect } from "vitest"
import { buttonVariants } from "@/components/ui/button"

describe("buttonVariants — outline (secondary CTA)", () => {
  const classes = buttonVariants({ variant: "outline" })

  it("includes an explicit resting text-foreground class", () => {
    // The outline variant must set text-foreground so it doesn't inherit
    // an arbitrary parent color across theme/section boundaries.
    expect(classes).toMatch(/(?:^|\s)text-foreground(?:\s|$)/)
  })

  it("includes hover text-accent-foreground", () => {
    expect(classes).toContain("hover:text-accent-foreground")
  })

  it("includes bg-background for resting state", () => {
    expect(classes).toContain("bg-background")
  })
})

describe("buttonVariants — other variants remain unchanged", () => {
  it("default variant has text-primary-foreground", () => {
    const classes = buttonVariants({ variant: "default" })
    expect(classes).toContain("text-primary-foreground")
  })

  it("gradient variant does not include text-foreground", () => {
    const classes = buttonVariants({ variant: "gradient" })
    expect(classes).not.toMatch(/(?:^|\s)text-foreground(?:\s|$)/)
  })

  it("ghost variant does not include text-foreground", () => {
    const classes = buttonVariants({ variant: "ghost" })
    expect(classes).not.toMatch(/(?:^|\s)text-foreground(?:\s|$)/)
  })
})
