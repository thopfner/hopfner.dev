import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { BlogPageClient } from "@/app/admin/(protected)/blog/page-client"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}))

// Desktop by default
vi.mock("@mui/material/useMediaQuery", () => ({
  default: () => false,
}))

vi.mock("@/components/blog/blog-content-preview", () => ({
  BlogContentPreview: () => <div data-testid="blog-content-preview" />,
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ARTICLE = {
  articleId: "art-1",
  externalId: "ext-1",
  slug: "test-article",
  versionId: "ver-1",
  version: 1,
  status: "draft" as const,
  title: "Test Article Title",
  excerpt: "An excerpt",
  content: { blocks: [] },
  seoTitle: null,
  seoDescription: null,
  coverImageUrl: null,
  rejectionReason: null,
  createdAt: "2026-03-10T12:00:00Z",
  approvedAt: null,
  publishedAt: null,
  rejectedAt: null,
  categories: ["tech"],
  tags: ["testing"],
}

function okJson(data: unknown) {
  return { ok: true, json: async () => data }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlogPageClient loading state", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading state while fetching", async () => {
    let resolveFetch!: (v: unknown) => void
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(new Promise((r) => { resolveFetch = r })) as any,
    )

    render(<BlogPageClient />)

    // Loading indicator should be visible
    expect(screen.getByText("Loading articles…")).toBeInTheDocument()

    // Resolve
    resolveFetch(okJson({ items: [ARTICLE] }))
    await waitFor(() => expect(screen.queryByText("Loading articles…")).not.toBeInTheDocument())
  })

  it("does not show empty state while still loading", async () => {
    let resolveFetch!: (v: unknown) => void
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(new Promise((r) => { resolveFetch = r })) as any,
    )

    render(<BlogPageClient />)

    // Loading is shown
    expect(screen.getByText("Loading articles…")).toBeInTheDocument()

    // Empty state must NOT be shown during loading
    expect(screen.queryByText("No articles found")).not.toBeInTheDocument()

    // Resolve
    resolveFetch(okJson({ items: [] }))
    await waitFor(() => expect(screen.queryByText("Loading articles…")).not.toBeInTheDocument())
  })

  it("renders article content after successful populated response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(okJson({ items: [ARTICLE] })) as any,
    )

    render(<BlogPageClient />)

    // Article title should appear after loading
    expect(await screen.findByText("Test Article Title")).toBeInTheDocument()

    // Loading should be gone
    expect(screen.queryByText("Loading articles…")).not.toBeInTheDocument()
  })

  it("renders empty state after successful empty response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(okJson({ items: [] })) as any,
    )

    render(<BlogPageClient />)

    // Empty state should appear
    expect(await screen.findByText("No articles found")).toBeInTheDocument()

    // Loading should be gone
    expect(screen.queryByText("Loading articles…")).not.toBeInTheDocument()
  })
})
