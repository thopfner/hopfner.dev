/**
 * Cookie consent persistence layer.
 *
 * Uses a first-party cookie (URL-encoded JSON) readable on both
 * server and client. No database dependency.
 */

export const CONSENT_COOKIE_NAME = "cookie_consent"
export const CONSENT_VERSION = 1
export const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

export type ConsentSource = "accept_all" | "reject_all" | "preferences"

export type ConsentState = {
  version: 1
  necessary: true
  analytics: boolean
  timestamp: string
  source: ConsentSource
}

export function defaultConsentState(): ConsentState {
  return {
    version: 1,
    necessary: true,
    analytics: false,
    timestamp: new Date().toISOString(),
    source: "reject_all",
  }
}

export function serializeConsent(state: ConsentState): string {
  return encodeURIComponent(JSON.stringify(state))
}

export function parseConsent(cookieValue: string | undefined | null): ConsentState | null {
  if (!cookieValue) return null
  try {
    const decoded = decodeURIComponent(cookieValue)
    const parsed = JSON.parse(decoded)
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.version === CONSENT_VERSION &&
      parsed.necessary === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.timestamp === "string"
    ) {
      return parsed as ConsentState
    }
    return null
  } catch {
    return null
  }
}

/**
 * Determine whether analytics scripts should load.
 *
 * - No GA ID → false
 * - Consent not required → true
 * - Consent required + analytics granted → true
 * - Otherwise → false
 */
export function shouldLoadAnalytics(
  gaId: string | undefined,
  requireConsent: boolean,
  consent: ConsentState | null
): boolean {
  if (!gaId) return false
  if (!requireConsent) return true
  return consent?.analytics === true
}
