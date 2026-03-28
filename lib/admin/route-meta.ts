/**
 * Shared admin route metadata resolver.
 *
 * Single source of truth for route classification, titles, and shell constants.
 * Used by AdminShell, WorkspaceHeader, and foundation tests.
 */

// ---------------------------------------------------------------------------
// Shell constants
// ---------------------------------------------------------------------------

/** Height of the fixed admin app bar in pixels. */
export const ADMIN_HEADER_HEIGHT = 56

/** CSS custom property name set on the shell root. */
export const ADMIN_HEADER_HEIGHT_VAR = "--admin-header-height"

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

export type AdminRouteClass = "collection" | "workspace" | "immersive"

export type AdminRouteMeta = {
  /** Layout class: collection (list pages), workspace (tool pages), immersive (visual editor). */
  routeClass: AdminRouteClass
  /** Human-readable page title shown in the shell header. */
  title: string
  /** Nav group this route belongs to. */
  group: "Content" | "Configure"
  /** Parent collection label, present only on deep workspace routes. */
  parentLabel?: string
}

/**
 * Resolve admin route metadata from a pathname.
 *
 * Order matters — more specific patterns must come first.
 */
export function resolveAdminRouteMeta(pathname: string): AdminRouteMeta {
  // Immersive: visual editor
  if (/\/admin\/pages\/[^/]+\/visual/.test(pathname)) {
    return { routeClass: "immersive", title: "Visual Editor", group: "Content", parentLabel: "Pages" }
  }

  // Workspace: page editor
  if (/\/admin\/pages\/[^/]+/.test(pathname)) {
    return { routeClass: "workspace", title: "Page Editor", group: "Content", parentLabel: "Pages" }
  }

  // Workspace: section library
  if (pathname.startsWith("/admin/section-library")) {
    return { routeClass: "workspace", title: "Section Library", group: "Configure" }
  }

  // Workspace: global sections
  if (pathname.startsWith("/admin/global-sections")) {
    return { routeClass: "workspace", title: "Global Sections", group: "Configure" }
  }

  // Workspace: email templates
  if (pathname.startsWith("/admin/email-templates")) {
    return { routeClass: "workspace", title: "Email Templates", group: "Configure" }
  }

  // Workspace: agent
  if (pathname.startsWith("/admin/agent")) {
    return { routeClass: "workspace", title: "Agent", group: "Configure" }
  }

  // Collection: blog
  if (pathname.startsWith("/admin/blog")) {
    return { routeClass: "collection", title: "Blog", group: "Content" }
  }

  // Collection: media
  if (pathname.startsWith("/admin/media")) {
    return { routeClass: "collection", title: "Media", group: "Content" }
  }

  // Collection: bookings
  if (pathname.startsWith("/admin/bookings")) {
    return { routeClass: "collection", title: "Bookings", group: "Content" }
  }

  // Default: pages list
  return { routeClass: "collection", title: "Pages", group: "Content" }
}
