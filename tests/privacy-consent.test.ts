/**
 * Cookie consent + jurisdiction + analytics gating tests.
 */
import { describe, it, expect } from "vitest"
import {
  parseConsent,
  serializeConsent,
  defaultConsentState,
  shouldLoadAnalytics,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  type ConsentState,
} from "@/lib/privacy/consent"
import { detectJurisdiction } from "@/lib/privacy/jurisdiction"

// ---------------------------------------------------------------------------
// Consent cookie parse / serialize
// ---------------------------------------------------------------------------

describe("consent cookie serialization", () => {
  it("round-trips through serialize and parse", () => {
    const state: ConsentState = {
      version: 1,
      necessary: true,
      analytics: true,
      timestamp: "2026-03-20T12:00:00.000Z",
      source: "accept_all",
    }
    const serialized = serializeConsent(state)
    const parsed = parseConsent(serialized)
    expect(parsed).toEqual(state)
  })

  it("returns null for empty input", () => {
    expect(parseConsent(null)).toBeNull()
    expect(parseConsent(undefined)).toBeNull()
    expect(parseConsent("")).toBeNull()
  })

  it("returns null for invalid JSON", () => {
    expect(parseConsent("not-json")).toBeNull()
    expect(parseConsent("%7Bbad")).toBeNull()
  })

  it("returns null for wrong version", () => {
    const bad = encodeURIComponent(JSON.stringify({ version: 99, necessary: true, analytics: true, timestamp: "x", source: "accept_all" }))
    expect(parseConsent(bad)).toBeNull()
  })

  it("returns null for missing required fields", () => {
    const bad = encodeURIComponent(JSON.stringify({ version: 1, necessary: true }))
    expect(parseConsent(bad)).toBeNull()
  })

  it("defaultConsentState has analytics false", () => {
    const d = defaultConsentState()
    expect(d.version).toBe(CONSENT_VERSION)
    expect(d.necessary).toBe(true)
    expect(d.analytics).toBe(false)
  })

  it("cookie name is defined", () => {
    expect(CONSENT_COOKIE_NAME).toBe("cookie_consent")
  })
})

// ---------------------------------------------------------------------------
// Jurisdiction detection
// ---------------------------------------------------------------------------

describe("jurisdiction detection", () => {
  it("requires consent for Germany (EEA)", () => {
    const result = detectJurisdiction((name) => name === "cf-ipcountry" ? "DE" : null)
    expect(result.requireConsent).toBe(true)
    expect(result.countryCode).toBe("DE")
  })

  it("requires consent for UK", () => {
    const result = detectJurisdiction((name) => name === "x-vercel-ip-country" ? "GB" : null)
    expect(result.requireConsent).toBe(true)
    expect(result.countryCode).toBe("GB")
  })

  it("requires consent for Switzerland", () => {
    const result = detectJurisdiction((name) => name === "x-country-code" ? "CH" : null)
    expect(result.requireConsent).toBe(true)
  })

  it("requires consent for France (EEA)", () => {
    const result = detectJurisdiction((name) => name === "cf-ipcountry" ? "FR" : null)
    expect(result.requireConsent).toBe(true)
  })

  it("does not require consent for US", () => {
    const result = detectJurisdiction((name) => name === "x-vercel-ip-country" ? "US" : null)
    expect(result.requireConsent).toBe(false)
    expect(result.countryCode).toBe("US")
  })

  it("does not require consent for Japan", () => {
    const result = detectJurisdiction((name) => name === "cf-ipcountry" ? "JP" : null)
    expect(result.requireConsent).toBe(false)
  })

  it("defaults to requiring consent when no header present", () => {
    const result = detectJurisdiction(() => null)
    expect(result.requireConsent).toBe(true)
    expect(result.countryCode).toBeNull()
  })

  it("checks headers in priority order", () => {
    const result = detectJurisdiction((name) => {
      if (name === "x-vercel-ip-country") return "US"
      if (name === "cf-ipcountry") return "DE"
      return null
    })
    // x-vercel-ip-country takes priority
    expect(result.countryCode).toBe("US")
    expect(result.requireConsent).toBe(false)
  })

  it("handles case-insensitive country codes", () => {
    const result = detectJurisdiction((name) => name === "cf-ipcountry" ? "de" : null)
    expect(result.requireConsent).toBe(true)
    expect(result.countryCode).toBe("DE")
  })

  it("covers all 30 EEA countries", () => {
    const eea = [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
      "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
      "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO",
    ]
    for (const code of eea) {
      const result = detectJurisdiction((name) => name === "cf-ipcountry" ? code : null)
      expect(result.requireConsent).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Analytics gating decision
// ---------------------------------------------------------------------------

describe("shouldLoadAnalytics", () => {
  it("returns false when no GA ID", () => {
    expect(shouldLoadAnalytics(undefined, false, null)).toBe(false)
    expect(shouldLoadAnalytics("", false, null)).toBe(false)
  })

  it("returns true when consent not required", () => {
    expect(shouldLoadAnalytics("G-TEST", false, null)).toBe(true)
  })

  it("returns false when consent required and no cookie", () => {
    expect(shouldLoadAnalytics("G-TEST", true, null)).toBe(false)
  })

  it("returns false when consent required and analytics denied", () => {
    const consent: ConsentState = { version: 1, necessary: true, analytics: false, timestamp: "x", source: "reject_all" }
    expect(shouldLoadAnalytics("G-TEST", true, consent)).toBe(false)
  })

  it("returns true when consent required and analytics granted", () => {
    const consent: ConsentState = { version: 1, necessary: true, analytics: true, timestamp: "x", source: "accept_all" }
    expect(shouldLoadAnalytics("G-TEST", true, consent)).toBe(true)
  })
})
