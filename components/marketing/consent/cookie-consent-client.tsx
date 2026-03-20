"use client"

import { useCallback, useState } from "react"
import { CookieConsentBanner } from "./cookie-consent-banner"
import { CookiePreferencesDialog } from "./cookie-preferences-dialog"
import { CookieSettingsTrigger } from "./cookie-settings-trigger"
import {
  CONSENT_COOKIE_NAME,
  CONSENT_COOKIE_MAX_AGE,
  serializeConsent,
  type ConsentState,
  type ConsentSource,
} from "@/lib/privacy/consent"

function writeConsentCookie(analytics: boolean, source: ConsentSource) {
  const state: ConsentState = {
    version: 1,
    necessary: true,
    analytics,
    timestamp: new Date().toISOString(),
    source,
  }
  document.cookie = `${CONSENT_COOKIE_NAME}=${serializeConsent(state)}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function CookieConsentClient({
  requireConsent,
  initialConsent,
}: {
  requireConsent: boolean
  initialConsent: ConsentState | null
}) {
  const hasExistingChoice = initialConsent !== null
  const [bannerOpen, setBannerOpen] = useState(
    requireConsent && !hasExistingChoice
  )
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [consentGiven, setConsentGiven] = useState(hasExistingChoice)

  const handleAcceptAll = useCallback(() => {
    writeConsentCookie(true, "accept_all")
    setBannerOpen(false)
    setConsentGiven(true)
    // Reload so server-side analytics gating picks up the new cookie
    window.location.reload()
  }, [])

  const handleRejectAll = useCallback(() => {
    writeConsentCookie(false, "reject_all")
    setBannerOpen(false)
    setConsentGiven(true)
    window.location.reload()
  }, [])

  const handleManage = useCallback(() => {
    setBannerOpen(false)
    setPrefsOpen(true)
  }, [])

  const handlePrefsSave = useCallback((analytics: boolean) => {
    writeConsentCookie(analytics, "preferences")
    setPrefsOpen(false)
    setConsentGiven(true)
    window.location.reload()
  }, [])

  const handlePrefsCancel = useCallback(() => {
    setPrefsOpen(false)
    // Reshow banner if no choice was ever made
    if (!consentGiven) {
      setBannerOpen(requireConsent)
    }
  }, [consentGiven, requireConsent])

  const handleReopenPrefs = useCallback(() => {
    setPrefsOpen(true)
  }, [])

  // Don't render anything if consent isn't required
  if (!requireConsent) return null

  return (
    <>
      {bannerOpen && (
        <CookieConsentBanner
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onManage={handleManage}
        />
      )}
      {prefsOpen && (
        <CookiePreferencesDialog
          initialAnalytics={initialConsent?.analytics ?? false}
          onSave={handlePrefsSave}
          onCancel={handlePrefsCancel}
        />
      )}
      {consentGiven && !bannerOpen && !prefsOpen && (
        <CookieSettingsTrigger onOpen={handleReopenPrefs} />
      )}
    </>
  )
}
