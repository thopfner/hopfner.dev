/**
 * Scaffold smoke tests — lightweight source checks that all 4 collection pages
 * import and reference the shared scaffold components. These do NOT prove behavior;
 * they only guard against accidental scaffold removal during refactors.
 *
 * Behavior proof for Bookings and Blog lives in dedicated rendered test files:
 *   - tests/admin-collection-pages/bookings.test.tsx
 *   - tests/admin-collection-pages/blog.test.tsx
 */

import { describe, it, expect } from "vitest"
import fs from "fs"

const sources = [
  { name: "Pages", path: "app/admin/(protected)/pages-list.tsx" },
  { name: "Blog", path: "app/admin/(protected)/blog/page-client.tsx" },
  { name: "Media", path: "app/admin/(protected)/media/media-page-client.tsx" },
  { name: "Bookings", path: "app/admin/(protected)/bookings/page-client.tsx" },
].map((s) => ({ ...s, source: fs.readFileSync(s.path, "utf-8") }))

describe("collection page scaffold smoke checks", () => {
  for (const { name, source } of sources) {
    it(`${name} imports from @/components/admin/ui`, () => {
      expect(source).toContain("@/components/admin/ui")
    })

    it(`${name} uses CollectionPageHeader`, () => {
      expect(source).toContain("CollectionPageHeader")
    })

    it(`${name} uses CollectionToolbar`, () => {
      expect(source).toContain("CollectionToolbar")
    })

    it(`${name} uses AdminPanel`, () => {
      expect(source).toContain("AdminPanel")
    })
  }
})
