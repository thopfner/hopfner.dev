/**
 * Jurisdiction detection for cookie consent requirements.
 *
 * Reads deployment headers to determine the visitor's country,
 * then classifies whether prior consent is required before
 * loading analytics scripts.
 *
 * Header check order:
 * 1. x-vercel-ip-country
 * 2. cf-ipcountry
 * 3. cloudfront-viewer-country
 * 4. x-country-code
 *
 * If no trusted header is available, defaults to requiring consent.
 */

// EEA member states (EU 27 + Iceland, Liechtenstein, Norway)
const EEA_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO",
])

// Additional consent-required jurisdictions
const OTHER_CONSENT_REQUIRED = new Set([
  "GB", // United Kingdom
  "CH", // Switzerland
])

const HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
] as const

export type JurisdictionResult = {
  requireConsent: boolean
  countryCode: string | null
}

function isConsentRequired(countryCode: string): boolean {
  const code = countryCode.toUpperCase().trim()
  return EEA_COUNTRIES.has(code) || OTHER_CONSENT_REQUIRED.has(code)
}

/**
 * Detect jurisdiction from request headers.
 *
 * @param getHeader - Function to read a header value (e.g. from Next.js headers())
 */
export function detectJurisdiction(
  getHeader: (name: string) => string | null | undefined
): JurisdictionResult {
  for (const key of HEADER_KEYS) {
    const value = getHeader(key)
    if (value && typeof value === "string" && value.trim().length >= 2) {
      const code = value.trim().toUpperCase()
      return {
        requireConsent: isConsentRequired(code),
        countryCode: code,
      }
    }
  }
  // No trusted header → fail safe to requiring consent
  return { requireConsent: true, countryCode: null }
}
