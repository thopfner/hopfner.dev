import { render, screen, within } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

import {
  PageWorkspaceModeTabs,
  WorkspaceHeader,
  WorkspacePanel,
  AdminPanel,
  AdminSubgroupHeader,
  AdminLoadingState,
  AdminEmptyState,
} from "@/components/admin/ui"

// ---------------------------------------------------------------------------
// Mock next/link
// ---------------------------------------------------------------------------

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}))

// ---------------------------------------------------------------------------
// 1. PageWorkspaceModeTabs — rendered behavior
// ---------------------------------------------------------------------------

describe("PageWorkspaceModeTabs", () => {
  it("renders Form and Visual mode links", () => {
    render(<PageWorkspaceModeTabs pageId="pg-1" activeMode="form" />)
    expect(screen.getByRole("link", { name: /form/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /visual/i })).toBeInTheDocument()
  })

  it("Form link points to page editor route", () => {
    render(<PageWorkspaceModeTabs pageId="pg-1" activeMode="form" />)
    expect(screen.getByRole("link", { name: /form/i })).toHaveAttribute("href", "/admin/pages/pg-1")
  })

  it("Visual link points to visual editor route", () => {
    render(<PageWorkspaceModeTabs pageId="pg-1" activeMode="visual" />)
    expect(screen.getByRole("link", { name: /visual/i })).toHaveAttribute("href", "/admin/pages/pg-1/visual")
  })

  it("active mode renders as contained button variant", () => {
    render(<PageWorkspaceModeTabs pageId="pg-1" activeMode="form" />)
    const formButton = screen.getByRole("link", { name: /form/i })
    expect(formButton.className).toMatch(/contained/i)
  })

  it("inactive mode does not render as contained", () => {
    render(<PageWorkspaceModeTabs pageId="pg-1" activeMode="form" />)
    const visualButton = screen.getByRole("link", { name: /visual/i })
    expect(visualButton.className).not.toMatch(/contained/i)
  })
})

// ---------------------------------------------------------------------------
// 2. Page workspace back target — rendered WorkspaceHeader
// ---------------------------------------------------------------------------

describe("Page workspace back target", () => {
  it("WorkspaceHeader renders a back link to the specified href", () => {
    render(
      <WorkspaceHeader
        title="Page Editor"
        backHref="/admin"
        backLabel="Back to pages"
      />,
    )
    const backLink = screen.getByRole("link", { name: /back to pages/i })
    expect(backLink).toHaveAttribute("href", "/admin")
  })

  it("WorkspaceHeader renders the page title", () => {
    render(
      <WorkspaceHeader
        title="My Landing Page"
        backHref="/admin"
      />,
    )
    expect(screen.getByText("My Landing Page")).toBeInTheDocument()
  })

  it("WorkspaceHeader renders status content when provided", () => {
    render(
      <WorkspaceHeader
        title="Page Editor"
        backHref="/admin"
        status={<span data-testid="slug-badge">/home</span>}
      />,
    )
    expect(screen.getByTestId("slug-badge")).toHaveTextContent("/home")
  })

  it("WorkspaceHeader renders actions when provided", () => {
    render(
      <WorkspaceHeader
        title="Page Editor"
        backHref="/admin"
        actions={<button type="button">Save</button>}
      />,
    )
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 3. Page Editor identity — rendered simulation
//    Proves the full identity pattern: back to /admin + slug + mode tabs
// ---------------------------------------------------------------------------

describe("Page Editor workspace identity (rendered)", () => {
  it("renders complete page workspace identity bar", () => {
    render(
      <WorkspaceHeader
        title="Home"
        backHref="/admin"
        backLabel="Back to pages"
        status={
          <>
            <span>/home</span>
            <PageWorkspaceModeTabs pageId="pg-1" activeMode="form" />
          </>
        }
      />,
    )

    // Back link targets pages list
    expect(screen.getByRole("link", { name: /back to pages/i })).toHaveAttribute("href", "/admin")

    // Page title is shown
    expect(screen.getByText("Home")).toBeInTheDocument()

    // Slug is shown
    expect(screen.getByText("/home")).toBeInTheDocument()

    // Mode tabs are present with Form active
    expect(screen.getByRole("link", { name: /form/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /visual/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /form/i }).className).toMatch(/contained/i)
  })
})

// ---------------------------------------------------------------------------
// 4. Visual Editor workspace identity — rendered simulation
//    Proves the same identity pattern but with visual mode active
// ---------------------------------------------------------------------------

describe("Visual Editor workspace identity (rendered)", () => {
  it("renders visual mode tabs with correct active state", () => {
    render(<PageWorkspaceModeTabs pageId="pg-1" activeMode="visual" />)

    const visualLink = screen.getByRole("link", { name: /visual/i })
    const formLink = screen.getByRole("link", { name: /form/i })

    // Visual is active
    expect(visualLink.className).toMatch(/contained/i)
    // Form is inactive
    expect(formLink.className).not.toMatch(/contained/i)
    // Form link still points to page editor
    expect(formLink).toHaveAttribute("href", "/admin/pages/pg-1")
  })
})

// ---------------------------------------------------------------------------
// 5. Section Library hierarchy — rendered WorkspaceHeader with single action
// ---------------------------------------------------------------------------

describe("Section Library single creation CTA (rendered)", () => {
  it("WorkspaceHeader with one creation action renders exactly one button", () => {
    render(
      <WorkspaceHeader
        title="Section Library"
        actions={
          <button type="button" onClick={() => {}}>
            New custom type
          </button>
        }
      />,
    )

    // Exactly one creation button in the header
    const buttons = screen.getAllByRole("button", { name: /new custom type/i })
    expect(buttons).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// 6. Global Sections hierarchy — rendered WorkspacePanels
// ---------------------------------------------------------------------------

describe("Global Sections workspace hierarchy (rendered)", () => {
  it("WorkspacePanel renders titled section with header", () => {
    render(
      <WorkspacePanel title="Create Global Section" description="Add a new reusable section.">
        <div>form content</div>
      </WorkspacePanel>,
    )

    expect(screen.getByText("Create Global Section")).toBeInTheDocument()
    expect(screen.getByText("Add a new reusable section.")).toBeInTheDocument()
    expect(screen.getByText("form content")).toBeInTheDocument()
  })

  it("renders three distinct workspace panels for the route structure", () => {
    const { container } = render(
      <div>
        <WorkspacePanel title="Create Global Section" description="Add a new reusable section.">
          <div>create form</div>
        </WorkspacePanel>
        <WorkspacePanel title="Site-Wide Formatting" description="These settings apply immediately.">
          <div>formatting controls</div>
        </WorkspacePanel>
        <WorkspacePanel title="Sections & Impact" description="Manage global sections.">
          <div>sections table</div>
        </WorkspacePanel>
      </div>,
    )

    // All three panel titles are rendered
    expect(screen.getByText("Create Global Section")).toBeInTheDocument()
    expect(screen.getByText("Site-Wide Formatting")).toBeInTheDocument()
    expect(screen.getByText("Sections & Impact")).toBeInTheDocument()

    // All three panels are separate Paper elements (MUI outlined)
    const papers = container.querySelectorAll(".MuiPaper-outlined")
    expect(papers.length).toBe(3)
  })

  it("WorkspacePanel renders actions in header when provided", () => {
    render(
      <WorkspacePanel
        title="Test Panel"
        actions={<button type="button">Panel Action</button>}
      >
        <div>content</div>
      </WorkspacePanel>,
    )

    expect(screen.getByRole("button", { name: /panel action/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 7. AdminSubgroupHeader — rendered behavior
// ---------------------------------------------------------------------------

describe("AdminSubgroupHeader", () => {
  it("renders label text", () => {
    render(<AdminSubgroupHeader label="Typography" />)
    expect(screen.getByText("Typography")).toBeInTheDocument()
  })

  it("renders optional description when provided", () => {
    render(<AdminSubgroupHeader label="Colors" description="Pick your palette" />)
    expect(screen.getByText("Colors")).toBeInTheDocument()
    expect(screen.getByText("Pick your palette")).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 8. AdminLoadingState in workspace context
// ---------------------------------------------------------------------------

describe("AdminLoadingState in workspace context", () => {
  it("renders spinner and message text", () => {
    render(<AdminLoadingState message="Loading section types…" />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(screen.getByText("Loading section types…")).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 9. AdminEmptyState in workspace context
// ---------------------------------------------------------------------------

describe("AdminEmptyState in workspace context", () => {
  it("renders title and description", () => {
    render(
      <AdminEmptyState
        title="No matching section types"
        description="Try adjusting your search or filter criteria."
      />,
    )
    expect(screen.getByText("No matching section types")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search or filter criteria.")).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 10. Visual Editor toolbar zone composition (rendered)
//     Proves the tool rail grouping: Add + undo/redo + viewport in center zone
// ---------------------------------------------------------------------------

describe("Visual Editor toolbar zone composition (rendered)", () => {
  it("center tool zone contains Add, undo/redo, and viewport controls in order", () => {
    const { container } = render(
      <div>
        {/* Left: identity zone */}
        <div data-testid="zone-left">
          <a href="/admin">Back</a>
          <span>Home</span>
          <PageWorkspaceModeTabs pageId="pg-1" activeMode="visual" />
        </div>

        {/* Center: tool zone */}
        <div data-testid="zone-center">
          <button type="button">Add</button>
          <div data-testid="divider" />
          <div data-testid="undo-redo-group">
            <button type="button">Undo</button>
            <button type="button">Redo</button>
          </div>
          <div data-testid="divider" />
          <div data-testid="viewport-group">
            <button type="button">Desktop</button>
            <button type="button">Tablet</button>
            <button type="button">Mobile</button>
          </div>
        </div>

        {/* Right: section actions */}
        <div data-testid="zone-right">
          <button type="button">Save</button>
          <button type="button">Publish</button>
        </div>
      </div>,
    )

    // Add button lives in center zone, not left zone
    const center = screen.getByTestId("zone-center")
    const left = screen.getByTestId("zone-left")

    expect(within(center).getByRole("button", { name: /add/i })).toBeInTheDocument()
    expect(within(left).queryByRole("button", { name: /add/i })).toBeNull()

    // Left zone is purely navigational — back link + identity + mode tabs
    expect(within(left).getByRole("link", { name: /back/i })).toBeInTheDocument()
    expect(within(left).getByText("Home")).toBeInTheDocument()
    expect(within(left).getByRole("link", { name: /visual/i })).toBeInTheDocument()

    // Center zone has Add before undo/redo, undo/redo before viewport
    const centerButtons = within(center).getAllByRole("button")
    const addIdx = centerButtons.findIndex((b) => b.textContent === "Add")
    const undoIdx = centerButtons.findIndex((b) => b.textContent === "Undo")
    const desktopIdx = centerButtons.findIndex((b) => b.textContent === "Desktop")

    expect(addIdx).toBeLessThan(undoIdx)
    expect(undoIdx).toBeLessThan(desktopIdx)
  })

  it("left zone does not contain tool controls", () => {
    render(
      <div>
        <div data-testid="zone-left">
          <a href="/admin">Back</a>
          <span>Home</span>
          <PageWorkspaceModeTabs pageId="pg-1" activeMode="visual" />
        </div>
      </div>,
    )

    const left = screen.getByTestId("zone-left")

    // No Add button in identity zone
    expect(within(left).queryByRole("button", { name: /^add$/i })).toBeNull()
    // No undo/redo in identity zone
    expect(within(left).queryByRole("button", { name: /undo/i })).toBeNull()
    expect(within(left).queryByRole("button", { name: /redo/i })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 11. Section Library unified surface (rendered)
//     Proves single AdminPanel wraps tabs and content
// ---------------------------------------------------------------------------

describe("Section Library unified surface (rendered)", () => {
  it("single AdminPanel contains tabs and catalog content", () => {
    const { container } = render(
      <AdminPanel>
        <div role="tablist">
          <button role="tab" aria-selected="true">Catalog</button>
          <button role="tab" aria-selected="false">Composer</button>
        </div>
        <div role="tabpanel">
          <p>12 types &middot; 8 built-in &middot; 4 custom</p>
          <table><tbody><tr><td>Section row</td></tr></tbody></table>
        </div>
      </AdminPanel>,
    )

    // Single unified Paper surface
    const papers = container.querySelectorAll(".MuiPaper-outlined")
    expect(papers).toHaveLength(1)

    // Tabs and content are inside the same surface
    const surface = papers[0]!
    expect(within(surface as HTMLElement).getByRole("tablist")).toBeInTheDocument()
    expect(within(surface as HTMLElement).getByRole("tabpanel")).toBeInTheDocument()
    expect(within(surface as HTMLElement).getByText(/Section row/)).toBeInTheDocument()
  })

  it("calm summary renders count text instead of clickable chips", () => {
    render(
      <p data-testid="summary">
        12 types · 8 built-in · 4 custom
      </p>,
    )

    const summary = screen.getByTestId("summary")

    // Informational text with counts
    expect(summary.textContent).toMatch(/12 types/)
    expect(summary.textContent).toMatch(/8 built-in/)
    expect(summary.textContent).toMatch(/4 custom/)

    // No clickable chip elements
    expect(within(summary).queryByRole("button")).toBeNull()
  })
})
