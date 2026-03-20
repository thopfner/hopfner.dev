"use client"

import { useConsent } from "./consent-context"
import { CookieConsentBanner } from "./cookie-consent-banner"
import { CookiePreferencesDialog } from "./cookie-preferences-dialog"

/**
 * Renders the consent banner and preferences dialog.
 * Must be placed inside the themed page wrapper so it inherits
 * the active page theme tokens.
 */
export function ConsentSurfaces() {
  const ctx = useConsent()
  if (!ctx || !ctx.requireConsent) return null

  return (
    <>
      {ctx.bannerOpen && (
        <CookieConsentBanner
          onAcceptAll={ctx.acceptAll}
          onRejectAll={ctx.rejectAll}
          onManage={ctx.openPrefs}
        />
      )}
      {ctx.prefsOpen && (
        <CookiePreferencesDialog
          initialAnalytics={ctx.consent?.analytics ?? false}
          onSave={ctx.savePrefs}
          onCancel={ctx.closePrefs}
        />
      )}
    </>
  )
}
