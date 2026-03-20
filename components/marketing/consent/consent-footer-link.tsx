"use client"

import { useConsent } from "./consent-context"

/**
 * Inline "Cookie settings" link for the footer legal row.
 * Styled to match existing legal link typography.
 * Only renders when consent is required and a choice has been made.
 */
export function ConsentFooterLink() {
  const ctx = useConsent()
  if (!ctx || !ctx.requireConsent || !ctx.hasChoice) return null

  return (
    <button
      type="button"
      onClick={ctx.openPrefs}
      className="transition-colors hover:text-muted-foreground"
    >
      Cookie settings
    </button>
  )
}
