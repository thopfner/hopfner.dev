"use client"

import { createContext, useCallback, useContext, useState } from "react"
import {
  CONSENT_COOKIE_NAME,
  CONSENT_COOKIE_MAX_AGE,
  serializeConsent,
  type ConsentState,
  type ConsentSource,
} from "@/lib/privacy/consent"

type ConsentContextValue = {
  /** Whether the jurisdiction requires consent */
  requireConsent: boolean
  /** Current stored consent (null if no choice made yet) */
  consent: ConsentState | null
  /** Whether the initial banner should be showing */
  bannerOpen: boolean
  /** Whether the preferences dialog should be showing */
  prefsOpen: boolean
  /** Whether the user has made any consent choice (including prior session) */
  hasChoice: boolean
  /** Accept all cookies */
  acceptAll: () => void
  /** Reject all optional cookies */
  rejectAll: () => void
  /** Open the preferences dialog */
  openPrefs: () => void
  /** Close the preferences dialog (and reshow banner if no prior choice) */
  closePrefs: () => void
  /** Save preferences from the dialog */
  savePrefs: (analytics: boolean) => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

function writeConsentCookie(analytics: boolean, source: ConsentSource) {
  const state: ConsentState = {
    version: 1,
    necessary: true,
    analytics,
    timestamp: new Date().toISOString(),
    source,
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE_NAME}=${serializeConsent(state)}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function ConsentProvider({
  requireConsent,
  initialConsent,
  children,
}: {
  requireConsent: boolean
  initialConsent: ConsentState | null
  children: React.ReactNode
}) {
  const hasExistingChoice = initialConsent !== null
  const [bannerOpen, setBannerOpen] = useState(requireConsent && !hasExistingChoice)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [hasChoice, setHasChoice] = useState(hasExistingChoice)

  const acceptAll = useCallback(() => {
    writeConsentCookie(true, "accept_all")
    setBannerOpen(false)
    setHasChoice(true)
    window.location.reload()
  }, [])

  const rejectAll = useCallback(() => {
    writeConsentCookie(false, "reject_all")
    setBannerOpen(false)
    setHasChoice(true)
    window.location.reload()
  }, [])

  const openPrefs = useCallback(() => {
    setBannerOpen(false)
    setPrefsOpen(true)
  }, [])

  const closePrefs = useCallback(() => {
    setPrefsOpen(false)
    if (!hasChoice) {
      setBannerOpen(requireConsent)
    }
  }, [hasChoice, requireConsent])

  const savePrefs = useCallback((analytics: boolean) => {
    writeConsentCookie(analytics, "preferences")
    setPrefsOpen(false)
    setHasChoice(true)
    window.location.reload()
  }, [])

  return (
    <ConsentContext.Provider
      value={{
        requireConsent,
        consent: initialConsent,
        bannerOpen,
        prefsOpen,
        hasChoice,
        acceptAll,
        rejectAll,
        openPrefs,
        closePrefs,
        savePrefs,
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent(): ConsentContextValue | null {
  return useContext(ConsentContext)
}
