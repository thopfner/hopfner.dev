import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PagesList } from "@/app/admin/(protected)/pages-list"

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}))

const insertMock = vi.fn()

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    from: () => ({
      insert: insertMock,
    }),
  }),
}))

type OverviewPayload = {
  pages: Array<{
    id: string
    slug: string
    title: string
    updated_at: string
    publish_status: "published" | "unpublished"
    has_draft_changes: boolean
  }>
  counts: {
    total_pages_count: number
    published_pages_count: number
    unpublished_pages_count: number
  }
}

function okJson(data: unknown) {
  return {
    ok: true,
    json: async () => data,
  }
}

describe("PagesList create modal", () => {
  const initialOverview: OverviewPayload = {
    pages: [
      {
        id: "p-1",
        slug: "home",
        title: "Home",
        updated_at: "2026-02-26T00:00:00.000Z",
        publish_status: "published",
        has_draft_changes: false,
      },
    ],
    counts: {
      total_pages_count: 1,
      published_pages_count: 1,
      unpublished_pages_count: 0,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    insertMock.mockResolvedValue({ error: null })
  })

  it("opens and closes the create sidebar modal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(initialOverview)) as any)

    render(<PagesList />)

    await screen.findByText("Total: 1")

    await userEvent.click(screen.getByRole("button", { name: /create page/i }))

    const dialog = await screen.findByRole("dialog", { name: /create page/i })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/slug/i)).toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole("button", { name: /close create page panel/i }))

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /create page/i })).not.toBeInTheDocument()
    })
  })

  it("shows validation errors for invalid slug and missing title", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(initialOverview)) as any)

    render(<PagesList />)
    await screen.findByText("Total: 1")

    await userEvent.click(screen.getByRole("button", { name: /create page/i }))
    const dialog = await screen.findByRole("dialog", { name: /create page/i })

    const slugInput = within(dialog).getByLabelText(/slug/i)
    const titleInput = within(dialog).getByLabelText(/title/i)

    await userEvent.clear(slugInput)
    await userEvent.type(slugInput, "Invalid Slug")
    await userEvent.clear(titleInput)

    await userEvent.click(within(dialog).getByRole("button", { name: /^create page$/i }))

    expect(await within(dialog).findByText(/slug must use only a-z, 0-9, and hyphens/i)).toBeInTheDocument()
    expect(insertMock).not.toHaveBeenCalled()
  })

  it("uses admin edit links for page rows", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(initialOverview)) as any)

    render(<PagesList />)

    await screen.findByText("Total: 1")

    const editLinks = screen.getAllByRole("link", { name: /edit/i })
    expect(editLinks.length).toBeGreaterThan(0)
    for (const link of editLinks) {
      expect(link).toHaveAttribute("href", "/admin/pages/p-1")
    }
  })

  it("submits with keyboard and refreshes list/count chips", async () => {
    const refreshedOverview: OverviewPayload = {
      pages: [
        ...initialOverview.pages,
        {
          id: "p-2",
          slug: "about",
          title: "About",
          updated_at: "2026-02-26T01:00:00.000Z",
          publish_status: "unpublished",
          has_draft_changes: true,
        },
      ],
      counts: {
        total_pages_count: 2,
        published_pages_count: 1,
        unpublished_pages_count: 1,
      },
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson(initialOverview))
      .mockResolvedValueOnce(okJson(refreshedOverview))

    vi.stubGlobal("fetch", fetchMock as any)

    render(<PagesList />)
    await screen.findByText("Total: 1")

    await userEvent.click(screen.getByRole("button", { name: /create page/i }))
    const dialog = await screen.findByRole("dialog", { name: /create page/i })

    await userEvent.clear(within(dialog).getByLabelText(/slug/i))
    await userEvent.type(within(dialog).getByLabelText(/slug/i), "about")
    await userEvent.clear(within(dialog).getByLabelText(/title/i))
    await userEvent.type(within(dialog).getByLabelText(/title/i), "About")

    await userEvent.keyboard("{Enter}")

    await waitFor(() => expect(insertMock).toHaveBeenCalledWith({ slug: "about", title: "About" }))
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /create page/i })).not.toBeInTheDocument()
    })

    expect(await screen.findByText("Total: 2")).toBeInTheDocument()
    expect(screen.getByText("Published: 1")).toBeInTheDocument()
    expect(screen.getByText("Unpublished: 1")).toBeInTheDocument()
    expect(screen.getAllByText("About").length).toBeGreaterThan(0)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
