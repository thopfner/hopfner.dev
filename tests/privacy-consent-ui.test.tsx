/**
 * Rendered tests for cookie consent UI behavior.
 *
 * Tests banner, preferences dialog, footer link, and consent surfaces.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CookieConsentBanner } from "@/components/marketing/consent/cookie-consent-banner"
import { CookiePreferencesDialog } from "@/components/marketing/consent/cookie-preferences-dialog"
import { CookieSettingsTrigger } from "@/components/marketing/consent/cookie-settings-trigger"
import { ConsentProvider } from "@/components/marketing/consent/consent-context"
import { ConsentSurfaces } from "@/components/marketing/consent/consent-surfaces"
import { ConsentFooterLink } from "@/components/marketing/consent/consent-footer-link"
import type { ConsentState } from "@/lib/privacy/consent"

// Mock window.location.reload
const reloadMock = vi.fn()
beforeEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, protocol: "http:", reload: reloadMock },
  })
  document.cookie = "cookie_consent=; max-age=0; path=/"
  reloadMock.mockClear()
})

// Helper to render with consent context
function renderWithConsent(
  ui: React.ReactNode,
  opts: { requireConsent: boolean; initialConsent: ConsentState | null }
) {
  return render(
    <ConsentProvider requireConsent={opts.requireConsent} initialConsent={opts.initialConsent}>
      {ui}
    </ConsentProvider>
  )
}

// ---------------------------------------------------------------------------
// Banner component
// ---------------------------------------------------------------------------
describe("CookieConsentBanner", () => {
  it("renders Accept all, Reject all, and Manage buttons", () => {
    render(
      <CookieConsentBanner onAcceptAll={vi.fn()} onRejectAll={vi.fn()} onManage={vi.fn()} />
    )
    expect(screen.getByText("Accept all")).toBeDefined()
    expect(screen.getByText("Reject all")).toBeDefined()
    expect(screen.getByText("Manage")).toBeDefined()
  })

  it("calls onAcceptAll when Accept all clicked", () => {
    const onAcceptAll = vi.fn()
    render(
      <CookieConsentBanner onAcceptAll={onAcceptAll} onRejectAll={vi.fn()} onManage={vi.fn()} />
    )
    fireEvent.click(screen.getByText("Accept all"))
    expect(onAcceptAll).toHaveBeenCalledOnce()
  })

  it("calls onRejectAll when Reject all clicked", () => {
    const onRejectAll = vi.fn()
    render(
      <CookieConsentBanner onAcceptAll={vi.fn()} onRejectAll={onRejectAll} onManage={vi.fn()} />
    )
    fireEvent.click(screen.getByText("Reject all"))
    expect(onRejectAll).toHaveBeenCalledOnce()
  })

  it("calls onManage when Manage clicked", () => {
    const onManage = vi.fn()
    render(
      <CookieConsentBanner onAcceptAll={vi.fn()} onRejectAll={vi.fn()} onManage={onManage} />
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
    render(<CookiePreferencesDialog initialAnalytics={false} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText("Necessary")).toBeDefined()
    expect(screen.getByText(/Always enabled/)).toBeDefined()
  })

  it("shows Analytics toggle", () => {
    render(<CookiePreferencesDialog initialAnalytics={false} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText("Analytics")).toBeDefined()
    const toggle = screen.getByRole("switch")
    expect(toggle.getAttribute("aria-checked")).toBe("false")
  })

  it("toggles analytics and saves", () => {
    const onSave = vi.fn()
    render(<CookiePreferencesDialog initialAnalytics={false} onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole("switch"))
    fireEvent.click(screen.getByText("Save preferences"))
    expect(onSave).toHaveBeenCalledWith(true)
  })

  it("cancel does not save", () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(<CookiePreferencesDialog initialAnalytics={false} onSave={onSave} onCancel={onCancel} />)
    fireEvent.click(screen.getByText("Cancel"))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Settings trigger (legacy floating — still usable as fallback)
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
// ConsentSurfaces (rendered inside themed wrapper)
// ---------------------------------------------------------------------------
describe("ConsentSurfaces", () => {
  it("shows banner when consent required and no prior choice", () => {
    renderWithConsent(<ConsentSurfaces />, { requireConsent: true, initialConsent: null })
    expect(screen.getByText("Accept all")).toBeDefined()
    expect(screen.getByText("Reject all")).toBeDefined()
  })

  it("does not show banner when consent not required", () => {
    const { container } = renderWithConsent(<ConsentSurfaces />, { requireConsent: false, initialConsent: null })
    expect(container.innerHTML).toBe("")
  })

  it("does not show banner when consent already stored", () => {
    const consent: ConsentState = {
      version: 1, necessary: true, analytics: true,
      timestamp: "2026-03-20T12:00:00.000Z", source: "accept_all",
    }
    renderWithConsent(<ConsentSurfaces />, { requireConsent: true, initialConsent: consent })
    expect(screen.queryByText("Accept all")).toBeNull()
  })

  it("opens preferences dialog via Manage", () => {
    renderWithConsent(<ConsentSurfaces />, { requireConsent: true, initialConsent: null })
    fireEvent.click(screen.getByText("Manage"))
    expect(screen.getByText("Cookie preferences")).toBeDefined()
    expect(screen.getByText("Necessary")).toBeDefined()
  })

  it("writes cookie on Accept all", () => {
    renderWithConsent(<ConsentSurfaces />, { requireConsent: true, initialConsent: null })
    fireEvent.click(screen.getByText("Accept all"))
    expect(document.cookie).toContain("cookie_consent=")
    expect(reloadMock).toHaveBeenCalled()
  })

  it("writes cookie on Reject all", () => {
    renderWithConsent(<ConsentSurfaces />, { requireConsent: true, initialConsent: null })
    fireEvent.click(screen.getByText("Reject all"))
    expect(document.cookie).toContain("cookie_consent=")
    expect(reloadMock).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// ConsentFooterLink
// ---------------------------------------------------------------------------
describe("ConsentFooterLink", () => {
  it("renders Cookie settings when consent is required and choice exists", () => {
    const consent: ConsentState = {
      version: 1, necessary: true, analytics: false,
      timestamp: "2026-03-20T12:00:00.000Z", source: "reject_all",
    }
    renderWithConsent(<ConsentFooterLink />, { requireConsent: true, initialConsent: consent })
    expect(screen.getByText("Cookie settings")).toBeDefined()
  })

  it("does not render when consent is not required", () => {
    const { container } = renderWithConsent(<ConsentFooterLink />, { requireConsent: false, initialConsent: null })
    expect(container.innerHTML).toBe("")
  })

  it("does not render when no choice has been made yet", () => {
    const { container } = renderWithConsent(<ConsentFooterLink />, { requireConsent: true, initialConsent: null })
    expect(container.querySelector("button")).toBeNull()
  })

  it("opens preferences dialog when clicked", () => {
    const consent: ConsentState = {
      version: 1, necessary: true, analytics: false,
      timestamp: "2026-03-20T12:00:00.000Z", source: "reject_all",
    }
    renderWithConsent(
      <>
        <ConsentFooterLink />
        <ConsentSurfaces />
      </>,
      { requireConsent: true, initialConsent: consent }
    )
    fireEvent.click(screen.getByText("Cookie settings"))
    expect(screen.getByText("Cookie preferences")).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Production hardening (v4) — retained
// ---------------------------------------------------------------------------
describe("Secure cookie writing", () => {
  it("writes cookie successfully under non-HTTPS (development)", () => {
    renderWithConsent(<ConsentSurfaces />, { requireConsent: true, initialConsent: null })
    fireEvent.click(screen.getByText("Accept all"))
    expect(document.cookie).toContain("cookie_consent=")
  })

  it("cookie write path derives Secure flag from protocol", () => {
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(
      path.resolve("components/marketing/consent/consent-context.tsx"),
      "utf-8"
    )
    expect(source).toContain('window.location.protocol === "https:"')
    expect(source).toContain("; Secure")
  })
})

describe("Consent UI suppression when no optional tracking", () => {
  it("layout only renders ConsentProvider when GA_ID exists", () => {
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(path.resolve("app/(marketing)/layout.tsx"), "utf-8")
    expect(source).toContain("GA_ID ? (")
    expect(source).toContain("<ConsentProvider")
  })
})

// ---------------------------------------------------------------------------
// Theme-scoped rendering (v5) — consent surfaces inside themed page wrapper
// ---------------------------------------------------------------------------
describe("Theme-scoped consent rendering", () => {
  it("ConsentSurfaces is rendered from within the themed page.tsx wrapper", () => {
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(path.resolve("app/(marketing)/[slug]/page.tsx"), "utf-8")
    // ConsentSurfaces must appear inside the themed div, before the closing </div>
    expect(source).toContain("<ConsentSurfaces />")
    // It must appear after the main content and TopBackdrop
    const mainIdx = source.indexOf("</main>")
    const surfacesIdx = source.indexOf("<ConsentSurfaces />")
    expect(surfacesIdx).toBeGreaterThan(mainIdx)
  })

  it("footer legal row receives ConsentFooterLink", () => {
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(path.resolve("app/(marketing)/[slug]/page.tsx"), "utf-8")
    expect(source).toContain("legalAction={<ConsentFooterLink />}")
  })

  it("footer-grid-section accepts and renders legalAction", () => {
    const fs = require("fs")
    const path = require("path")
    const source = fs.readFileSync(path.resolve("components/landing/footer-grid-section.tsx"), "utf-8")
    expect(source).toContain("legalAction?: React.ReactNode")
    expect(source).toContain("{legalAction}")
  })
})
