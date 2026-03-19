import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { BookingsPageClient } from "@/app/admin/(protected)/bookings/page-client"

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

// Control useMediaQuery to toggle desktop / mobile
let mobileOverride = false

vi.mock("@mui/material/useMediaQuery", () => ({
  default: () => mobileOverride,
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const INTAKE = {
  id: "int-1",
  full_name: "Alice Smith",
  work_email: "alice@example.com",
  company: "Acme Corp",
  job_title: "VP Eng",
  team_size: "20-50",
  function_area: "Engineering",
  current_tools: "Jira, Slack",
  main_bottleneck: "Slow deploys",
  desired_outcome_90d: "Ship 2x faster",
  status: "submitted",
  cal_booking_uid: null,
  created_at: "2026-03-10T12:00:00Z",
  updated_at: "2026-03-10T13:00:00Z",
}

function okJson(data: unknown) {
  return { ok: true, json: async () => data }
}

function emptyResponse() {
  return okJson({ intakes: [] })
}

function populatedResponse() {
  return okJson({ intakes: [INTAKE] })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BookingsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mobileOverride = false
  })

  // ── Loading state ──

  it("shows loading state with message while fetching", async () => {
    let resolveFetch!: (v: unknown) => void
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(new Promise((r) => { resolveFetch = r })) as any,
    )

    render(<BookingsPageClient />)

    expect(screen.getByText("Loading submissions…")).toBeInTheDocument()

    // Resolve to avoid act warnings
    resolveFetch(populatedResponse())
    await waitFor(() => expect(screen.queryByText("Loading submissions…")).not.toBeInTheDocument())
  })

  // ── Empty state ──

  it("shows empty state when no data returns", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(emptyResponse()) as any)

    render(<BookingsPageClient />)

    expect(await screen.findByText("No submissions yet")).toBeInTheDocument()
  })

  // ── Desktop view ──

  describe("desktop view", () => {
    beforeEach(() => {
      mobileOverride = false // breakpoints.down("sm") = false → desktop
    })

    it("renders table headers", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      render(<BookingsPageClient />)

      await screen.findByText("Alice Smith")

      expect(screen.getByText("Name")).toBeInTheDocument()
      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByText("Company")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
      expect(screen.getByText("Submitted")).toBeInTheDocument()
    })

    it("renders summary row with intake data", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      render(<BookingsPageClient />)

      expect(await screen.findByText("Alice Smith")).toBeInTheDocument()
      expect(screen.getByText("alice@example.com")).toBeInTheDocument()
      expect(screen.getByText("Acme Corp")).toBeInTheDocument()
      expect(screen.getByText("submitted")).toBeInTheDocument()
    })

    it("clicking a row opens the detail drawer", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      render(<BookingsPageClient />)

      const nameCell = await screen.findByText("Alice Smith")

      // Detail not visible initially
      expect(screen.queryByText("Booking Details")).not.toBeInTheDocument()

      // Click the row
      await userEvent.click(nameCell)

      // Drawer opens with detail fields
      expect(await screen.findByText("Booking Details")).toBeInTheDocument()
      expect(screen.getByText("VP Eng")).toBeInTheDocument()
      expect(screen.getByText("Slow deploys")).toBeInTheDocument()
      expect(screen.getByText("Ship 2x faster")).toBeInTheDocument()
    })

    it("no inline detail block renders in the table", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      const { container } = render(<BookingsPageClient />)

      const nameCell = await screen.findByText("Alice Smith")
      await userEvent.click(nameCell)

      // The table should have no expanded detail row (colSpan cell)
      const table = container.querySelector("table")!
      const cells = table.querySelectorAll("td[colspan]")
      expect(cells).toHaveLength(0)
    })

    it("close button closes the drawer", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      render(<BookingsPageClient />)

      const nameCell = await screen.findByText("Alice Smith")
      await userEvent.click(nameCell)

      expect(await screen.findByText("Booking Details")).toBeInTheDocument()

      // Close
      const closeBtn = screen.getByRole("button", { name: /close booking details/i })
      await userEvent.click(closeBtn)

      await waitFor(() => expect(screen.queryByText("Booking Details")).not.toBeInTheDocument())
    })
  })

  // ── Mobile view ──

  describe("mobile view", () => {
    beforeEach(() => {
      mobileOverride = true // breakpoints.down("sm") = true → mobile
    })

    it("renders cards instead of table", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      render(<BookingsPageClient />)

      // Name should be visible in a card
      expect(await screen.findByText("Alice Smith")).toBeInTheDocument()
      expect(screen.getByText("alice@example.com")).toBeInTheDocument()
      expect(screen.getByText("submitted")).toBeInTheDocument()

      // Table headers should NOT be present in mobile view
      expect(screen.queryByText("Email")).not.toBeInTheDocument()
    })

    it("tapping a card opens the detail drawer", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(populatedResponse()) as any)

      render(<BookingsPageClient />)

      const nameEl = await screen.findByText("Alice Smith")

      // Drawer not open
      expect(screen.queryByText("Booking Details")).not.toBeInTheDocument()

      // Tap the card
      await userEvent.click(nameEl)

      // Drawer opens
      expect(await screen.findByText("Booking Details")).toBeInTheDocument()
      expect(screen.getByText("VP Eng")).toBeInTheDocument()
      expect(screen.getByText("Slow deploys")).toBeInTheDocument()
      expect(screen.getByText("Ship 2x faster")).toBeInTheDocument()
    })
  })
})
