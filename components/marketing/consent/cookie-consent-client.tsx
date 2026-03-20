"use client"

/**
 * Cookie consent client — re-exports the context-based provider.
 *
 * The layout mounts ConsentProvider. Themed surfaces (banner/dialog)
 * and footer links render inside the page's themed wrapper via
 * ConsentSurfaces and ConsentFooterLink.
 */
export { ConsentProvider as CookieConsentClient } from "./consent-context"
