import { describe, it, expect } from "vitest"
import fs from "fs"
import {
  resolveAdminRouteMeta,
  ADMIN_HEADER_HEIGHT,
  ADMIN_HEADER_HEIGHT_VAR,
  type AdminRouteClass,
} from "@/lib/admin/route-meta"

// ---------------------------------------------------------------------------
// 1. Route-meta title resolution
// ---------------------------------------------------------------------------

describe("resolveAdminRouteMeta title resolution", () => {
  const cases: [string, string][] = [
    ["/admin", "Pages"],
    ["/admin/pages/abc123", "Page Editor"],
    ["/admin/pages/abc123/visual", "Visual Editor"],
    ["/admin/section-library", "Section Library"],
    ["/admin/global-sections", "Global Sections"],
    ["/admin/email-templates", "Email Templates"],
    ["/admin/blog", "Blog"],
    ["/admin/media", "Media"],
    ["/admin/bookings", "Bookings"],
  ]

  for (const [pathname, expectedTitle] of cases) {
    it(`${pathname} → "${expectedTitle}"`, () => {
      expect(resolveAdminRouteMeta(pathname).title).toBe(expectedTitle)
    })
  }

  it("deep page editor paths still resolve to Page Editor", () => {
    expect(resolveAdminRouteMeta("/admin/pages/xyz-789").title).toBe("Page Editor")
  })

  it("visual editor with trailing content still resolves", () => {
    expect(resolveAdminRouteMeta("/admin/pages/xyz-789/visual").title).toBe("Visual Editor")
  })
})

// ---------------------------------------------------------------------------
// 2. Route-class resolution
// ---------------------------------------------------------------------------

describe("resolveAdminRouteMeta route class", () => {
  const classTests: [string, AdminRouteClass][] = [
    ["/admin", "collection"],
    ["/admin/blog", "collection"],
    ["/admin/media", "collection"],
    ["/admin/bookings", "collection"],
    ["/admin/pages/abc123", "workspace"],
    ["/admin/section-library", "workspace"],
    ["/admin/global-sections", "workspace"],
    ["/admin/email-templates", "workspace"],
    ["/admin/pages/abc123/visual", "immersive"],
  ]

  for (const [pathname, expectedClass] of classTests) {
    it(`${pathname} → ${expectedClass}`, () => {
      expect(resolveAdminRouteMeta(pathname).routeClass).toBe(expectedClass)
    })
  }
})

// ---------------------------------------------------------------------------
// 3. Parent label for deep routes
// ---------------------------------------------------------------------------

describe("resolveAdminRouteMeta parent label", () => {
  it("page editor has parentLabel 'Pages'", () => {
    expect(resolveAdminRouteMeta("/admin/pages/abc123").parentLabel).toBe("Pages")
  })

  it("visual editor has parentLabel 'Pages'", () => {
    expect(resolveAdminRouteMeta("/admin/pages/abc123/visual").parentLabel).toBe("Pages")
  })

  it("collection pages have no parentLabel", () => {
    expect(resolveAdminRouteMeta("/admin").parentLabel).toBeUndefined()
    expect(resolveAdminRouteMeta("/admin/blog").parentLabel).toBeUndefined()
    expect(resolveAdminRouteMeta("/admin/media").parentLabel).toBeUndefined()
  })

  it("top-level workspace pages have no parentLabel", () => {
    expect(resolveAdminRouteMeta("/admin/section-library").parentLabel).toBeUndefined()
    expect(resolveAdminRouteMeta("/admin/global-sections").parentLabel).toBeUndefined()
    expect(resolveAdminRouteMeta("/admin/email-templates").parentLabel).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// 4. Group assignment
// ---------------------------------------------------------------------------

describe("resolveAdminRouteMeta group", () => {
  it("collection pages belong to Content", () => {
    expect(resolveAdminRouteMeta("/admin").group).toBe("Content")
    expect(resolveAdminRouteMeta("/admin/blog").group).toBe("Content")
  })

  it("configure workspace pages belong to Configure", () => {
    expect(resolveAdminRouteMeta("/admin/section-library").group).toBe("Configure")
    expect(resolveAdminRouteMeta("/admin/global-sections").group).toBe("Configure")
    expect(resolveAdminRouteMeta("/admin/email-templates").group).toBe("Configure")
  })

  it("page editor belongs to Content", () => {
    expect(resolveAdminRouteMeta("/admin/pages/abc").group).toBe("Content")
  })
})

// ---------------------------------------------------------------------------
// 5. Shell constants
// ---------------------------------------------------------------------------

describe("admin shell constants", () => {
  it("ADMIN_HEADER_HEIGHT is 56", () => {
    expect(ADMIN_HEADER_HEIGHT).toBe(56)
  })

  it("ADMIN_HEADER_HEIGHT_VAR is a valid CSS custom property name", () => {
    expect(ADMIN_HEADER_HEIGHT_VAR).toMatch(/^--[a-z]/)
  })
})

// ---------------------------------------------------------------------------
// 6. WorkspaceHeader uses shell offset contract (not top: 0)
// ---------------------------------------------------------------------------

describe("WorkspaceHeader offset safety", () => {
  const uiSource = fs.readFileSync(
    "components/admin/ui.tsx",
    "utf-8",
  )

  it("imports ADMIN_HEADER_HEIGHT_VAR from route-meta", () => {
    expect(uiSource).toContain("ADMIN_HEADER_HEIGHT_VAR")
    expect(uiSource).toContain("@/lib/admin/route-meta")
  })

  it("WorkspaceHeader uses the CSS variable for top offset", () => {
    expect(uiSource).toContain(`var(\${ADMIN_HEADER_HEIGHT_VAR}`)
  })

  it("WorkspaceHeader does not use a bare top: 0", () => {
    // Extract the WorkspaceHeader function body
    const wsHeaderMatch = uiSource.match(
      /export function WorkspaceHeader[\s\S]*?^}/m,
    )
    expect(wsHeaderMatch).toBeTruthy()
    // Should not contain a raw `top: 0` — it must use the CSS variable
    expect(wsHeaderMatch![0]).not.toMatch(/top:\s*0[^p]/)
  })
})

// ---------------------------------------------------------------------------
// 7. Shell uses route-meta (not inline title logic)
// ---------------------------------------------------------------------------

describe("AdminShell uses route-meta helper", () => {
  const shellSource = fs.readFileSync(
    "components/admin-shell.tsx",
    "utf-8",
  )

  it("imports resolveAdminRouteMeta", () => {
    expect(shellSource).toContain("resolveAdminRouteMeta")
    expect(shellSource).toContain("@/lib/admin/route-meta")
  })

  it("uses routeMeta.title (not a flat NAV_ITEMS lookup for title)", () => {
    expect(shellSource).toContain("routeMeta.title")
    // The old pattern: NAV_ITEMS.find(...)?.label should be gone
    expect(shellSource).not.toMatch(/NAV_ITEMS\.find.*\.label/)
  })

  it("uses routeMeta.routeClass (not a standalone getRouteClass function)", () => {
    expect(shellSource).toContain("routeMeta.routeClass")
    expect(shellSource).not.toMatch(/^function getRouteClass/m)
  })

  it("sets the CSS variable on the shell root", () => {
    // Shell uses the imported constant name, not a hardcoded string
    expect(shellSource).toContain("ADMIN_HEADER_HEIGHT_VAR")
    expect(shellSource).toContain("ADMIN_HEADER_HEIGHT")
  })

  it("applies route-class-driven content styles (not just a data attribute)", () => {
    // CONTENT_STYLES must exist and be used
    expect(shellSource).toContain("CONTENT_STYLES")
    expect(shellSource).toContain("contentSx")
    // Workspace must have a background treatment
    expect(shellSource).toMatch(/workspace.*background/s)
    // Immersive must have transparent background
    expect(shellSource).toMatch(/immersive.*transparent/s)
  })

  it("renders parentLabel for deep routes", () => {
    expect(shellSource).toContain("routeMeta.parentLabel")
  })
})
