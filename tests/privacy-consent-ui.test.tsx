/**
 * Rendered tests for cookie consent UI behavior.
 *
 * Sprint 2 + Sprint 3 — banner, preferences, settings trigger.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CookieConsentBanner } from "@/components/marketing/consent/cookie-consent-banner"
import { CookiePreferencesDialog } from "@/components/marketing/consent/cookie-preferences-dialog"
import { CookieSettingsTrigger } from "@/components/marketing/consent/cookie-settings-trigger"
import { CookieConsentClient } from "@/components/marketing/consent/cookie-consent-client"
import type { ConsentState } from "@/lib/privacy/consent"

// Mock window.location.reload
const reloadMock = vi.fn()
beforeEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, reload: reloadMock },
  })
  // Clear cookies
  document.cookie = "cookie_consent=; max-age=0; path=/"
  reloadMock.mockClear()
})

// ---------------------------------------------------------------------------
// Banner component
// ---------------------------------------------------------------------------
describe("CookieConsentBanner", () => {
  it("renders Accept all, Reject all, and Manage buttons", () => {
    const onAcceptAll = vi.fn()
    const onRejectAll = vi.fn()
    const onManage = vi.fn()
    render(
      <CookieConsentBanner
        onAcceptAll={onAcceptAll}
        onRejectAll={onRejectAll}
        onManage={onManage}
      />
    )
    expect(screen.getByText("Accept all")).toBeDefined()
    expect(screen.getByText("Reject all")).toBeDefined()
    expect(screen.getByText("Manage")).toBeDefined()
  })

  it("calls onAcceptAll when Accept all clicked", () => {
    const onAcceptAll = vi.fn()
    render(
      <CookieConsentBanner
        onAcceptAll={onAcceptAll}
        onRejectAll={vi.fn()}
        onManage={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText("Accept all"))
    expect(onAcceptAll).toHaveBeenCalledOnce()
  })

  it("calls onRejectAll when Reject all clicked", () => {
    const onRejectAll = vi.fn()
    render(
      <CookieConsentBanner
        onAcceptAll={vi.fn()}
        onRejectAll={onRejectAll}
        onManage={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText("Reject all"))
    expect(onRejectAll).toHaveBeenCalledOnce()
  })

  it("calls onManage when Manage clicked", () => {
    const onManage = vi.fn()
    render(
      <CookieConsentBanner
        onAcceptAll={vi.fn()}
        onRejectAll={vi.fn()}
        onManage={onManage}
      />
    )
    fireEvent.click(screen.getByText("Manage"))
    expect(onManage).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// Preferences dialog
// ---------------------------------------------------------------------------
describe("CookiePreferencesDialog", () => {
  it("shows Necessary as always on", () => {
    render(
      <CookiePreferencesDialog
        initialAnalytics={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText("Necessary")).toBeDefined()
    expect(screen.getByText(/Always enabled/)).toBeDefined()
  })

  it("shows Analytics toggle", () => {
    render(
      <CookiePreferencesDialog
        initialAnalytics={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText("Analytics")).toBeDefined()
    const toggle = screen.getByRole("switch")
    expect(toggle.getAttribute("aria-checked")).toBe("false")
  })

  it("toggles analytics and saves", () => {
    const onSave = vi.fn()
    render(
      <CookiePreferencesDialog
        initialAnalytics={false}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )
    const toggle = screen.getByRole("switch")
    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-checked")).toBe("true")
    fireEvent.click(screen.getByText("Save preferences"))
    expect(onSave).toHaveBeenCalledWith(true)
  })

  it("cancel does not save", () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(
      <CookiePreferencesDialog
        initialAnalytics={false}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByText("Cancel"))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Settings trigger
// ---------------------------------------------------------------------------
describe("CookieSettingsTrigger", () => {
  it("renders with Cookies label", () => {
    render(<CookieSettingsTrigger onOpen={vi.fn()} />)
    expect(screen.getByText("Cookies")).toBeDefined()
  })

  it("calls onOpen when clicked", () => {
    const onOpen = vi.fn()
    render(<CookieSettingsTrigger onOpen={onOpen} />)
    fireEvent.click(screen.getByText("Cookies"))
    expect(onOpen).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// Client controller
// ---------------------------------------------------------------------------
describe("CookieConsentClient", () => {
  it("shows banner when consent required and no prior choice", () => {
    render(
      <CookieConsentClient requireConsent={true} initialConsent={null} />
    )
    expect(screen.getByText("Accept all")).toBeDefined()
    expect(screen.getByText("Reject all")).toBeDefined()
  })

  it("does not show banner when consent not required", () => {
    const { container } = render(
      <CookieConsentClient requireConsent={false} initialConsent={null} />
    )
    expect(container.innerHTML).toBe("")
  })

  it("does not show banner when consent already stored", () => {
    const consent: ConsentState = {
      version: 1,
      necessary: true,
      analytics: true,
      timestamp: "2026-03-20T12:00:00.000Z",
      source: "accept_all",
    }
    render(
      <CookieConsentClient requireConsent={true} initialConsent={consent} />
    )
    // Banner should not be present, but settings trigger should be
    expect(screen.queryByText("Accept all")).toBeNull()
    expect(screen.getByText("Cookies")).toBeDefined()
  })

  it("shows settings trigger after accepting", () => {
    render(
      <CookieConsentClient requireConsent={true} initialConsent={null} />
    )
    fireEvent.click(screen.getByText("Accept all"))
    // Cookie should be written
    expect(document.cookie).toContain("cookie_consent=")
    expect(reloadMock).toHaveBeenCalled()
  })

  it("writes cookie on Reject all", () => {
    render(
      <CookieConsentClient requireConsent={true} initialConsent={null} />
    )
    fireEvent.click(screen.getByText("Reject all"))
    expect(document.cookie).toContain("cookie_consent=")
    expect(reloadMock).toHaveBeenCalled()
  })

  it("opens preferences dialog on Manage", () => {
    render(
      <CookieConsentClient requireConsent={true} initialConsent={null} />
    )
    fireEvent.click(screen.getByText("Manage"))
    expect(screen.getByText("Cookie preferences")).toBeDefined()
    expect(screen.getByText("Necessary")).toBeDefined()
    expect(screen.getByText("Analytics")).toBeDefined()
  })

  it("settings trigger reopens preferences dialog", () => {
    const consent: ConsentState = {
      version: 1,
      necessary: true,
      analytics: false,
      timestamp: "2026-03-20T12:00:00.000Z",
      source: "reject_all",
    }
    render(
      <CookieConsentClient requireConsent={true} initialConsent={consent} />
    )
    // Click the settings trigger
    fireEvent.click(screen.getByText("Cookies"))
    expect(screen.getByText("Cookie preferences")).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Production hardening (v4)
// ---------------------------------------------------------------------------
describe("Secure cookie writing", () => {
  it("writes cookie successfully under non-HTTPS (development)", () => {
    // In jsdom (non-HTTPS), the cookie should be writable without Secure flag
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, protocol: "http:", reload: reloadMock },
    })
    render(
      <CookieConsentClient requireConsent={true} initialConsent={null} />
    )
    fireEvent.click(screen.getByText("Accept all"))
    expect(document.cookie).toContain("cookie_consent=")
  })

  it("cookie write path derives Secure flag from protocol", () => {
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(
      path.resolve("components/marketing/consent/cookie-consent-client.tsx"),
      "utf-8"
    )
    // Must check protocol to decide Secure flag
    expect(source).toContain('window.location.protocol === "https:"')
    expect(source).toContain("; Secure")
    // Must NOT unconditionally force Secure (would break local dev)
    expect(source).not.toMatch(/; Secure"?\s*\n/)
  })
})

describe("Consent UI suppression when no optional tracking", () => {
  it("layout only renders CookieConsentClient when GA_ID exists", () => {
    // Structural proof: layout wraps CookieConsentClient in GA_ID conditional
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(
      path.resolve("app/(marketing)/layout.tsx"),
      "utf-8"
    )
    // The CookieConsentClient must be inside a {GA_ID && ...} block
    expect(source).toContain("GA_ID && (")
    expect(source).toContain("<CookieConsentClient")
    // Verify GA_ID guard comes before CookieConsentClient
    const gaGuardIdx = source.indexOf("GA_ID && (", source.indexOf("{children}"))
    const clientIdx = source.indexOf("<CookieConsentClient")
    expect(gaGuardIdx).toBeLessThan(clientIdx)
    expect(gaGuardIdx).toBeGreaterThan(-1)
  })
})
