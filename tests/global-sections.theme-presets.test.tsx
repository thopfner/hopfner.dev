import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { GlobalSectionsPage } from "@/app/admin/(protected)/global-sections/page-client"

const createDesignThemePresetMock = vi.fn()
const updateDesignThemePresetMock = vi.fn()
const applyDesignThemePresetMock = vi.fn()

let supabaseMock: ReturnType<typeof createSupabaseMock>

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}))

vi.mock("@/components/section-editor-drawer", () => ({
  SectionEditorDrawer: () => null,
}))

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => supabaseMock,
}))

vi.mock("@/lib/cms/commands/themes", () => ({
  createDesignThemePreset: (...args: unknown[]) => createDesignThemePresetMock(...args),
  updateDesignThemePreset: (...args: unknown[]) => updateDesignThemePresetMock(...args),
  applyDesignThemePreset: (...args: unknown[]) => applyDesignThemePresetMock(...args),
}))

function createSupabaseMock() {
  const globalSections = [
    {
      id: "global-1",
      key: "site-hero",
      label: "Site Hero",
      section_type: "hero_cta",
      enabled: true,
      lifecycle_state: "draft",
    },
  ]

  const formattingSettings = {
    _appliedTemplateId: "tpl-1",
    tokens: {
      colorMode: "dark",
      fontFamily: "Inter, system-ui, sans-serif",
      textColor: "#f8fafc",
      mutedTextColor: "#94a3b8",
      accentColor: "#38bdf8",
      backgroundColor: "#020617",
      cardBackgroundColor: "#0f172a",
      radiusScale: 1,
      spaceScale: 1,
      shadowScale: 1,
      innerShadowScale: 0,
      fontScale: 1,
      displayFontFamily: "var(--font-space-grotesk)",
      bodyFontFamily: "var(--font-ibm-plex-sans)",
      monoFontFamily: "var(--font-ibm-plex-mono)",
      displayScale: 1,
      headingScale: 1,
      eyebrowScale: 0.8,
      metricScale: 1,
      displayWeight: 700,
      headingWeight: 600,
      bodyWeight: 400,
      bodyScale: 1,
      metricTracking: "-0.02em",
      signatureStyle: "off",
      signatureIntensity: 0.5,
      signatureColor: "rgba(120,140,255,0.08)",
      signatureGridOpacity: 0.06,
      signatureGlowOpacity: 0.08,
      signatureNoiseOpacity: 0,
    },
  }

  const designThemePresets = [
    {
      id: "tpl-1",
      key: "executive_slate",
      name: "Executive Slate",
      description: "Professional high-contrast dark theme",
      is_system: false,
      tokens: formattingSettings.tokens,
      created_at: "2026-03-01T00:00:00.000Z",
      updated_at: "2026-03-01T00:00:00.000Z",
    },
  ]

  function resolveTable(table: string, single: boolean) {
    switch (table) {
      case "global_sections":
        return { data: globalSections, error: null }
      case "section_type_defaults":
        return {
          data: [
            {
              section_type: "hero_cta",
              label: "Hero CTA",
              description: "Hero block",
              default_title: null,
              default_subtitle: null,
              default_cta_primary_label: null,
              default_cta_primary_href: null,
              default_cta_secondary_label: null,
              default_cta_secondary_href: null,
              default_background_media_url: null,
              default_formatting: {},
              default_content: {},
              capabilities: [],
            },
          ],
          error: null,
        }
      case "section_type_registry":
        return { data: [], error: null }
      case "pages":
        return {
          data: [{ id: "page-1", slug: "home", title: "Home" }],
          error: null,
        }
      case "global_section_where_used":
        return { data: [], error: null }
      case "site_formatting_settings":
        return { data: single ? { settings: formattingSettings } : [{ settings: formattingSettings }], error: null }
      case "design_theme_presets":
        return { data: designThemePresets, error: null }
      default:
        return { data: [], error: null }
    }
  }

  return {
    from(table: string) {
      let single = false
      const builder = {
        select() {
          return builder
        },
        order() {
          return builder
        },
        eq() {
          return builder
        },
        maybeSingle() {
          single = true
          return builder
        },
        single() {
          single = true
          return builder
        },
        insert() {
          return builder
        },
        update() {
          return builder
        },
        delete() {
          return builder
        },
        upsert() {
          return builder
        },
        then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
          return Promise.resolve(resolveTable(table, single)).then(resolve, reject)
        },
      }

      return builder
    },
    rpc() {
      return Promise.resolve({
        data: [{ total_references: 0, enabled_references: 0, distinct_pages: 0 }],
        error: null,
      })
    },
  }
}

async function renderPage() {
  render(<GlobalSectionsPage />)
  await waitFor(() => {
    expect(screen.getByRole("button", { name: /apply template/i })).toBeEnabled()
  })
}

describe("GlobalSectionsPage theme preset commands", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseMock = createSupabaseMock()
    createDesignThemePresetMock.mockResolvedValue({ id: "tpl-1" })
    updateDesignThemePresetMock.mockResolvedValue({ id: "tpl-1" })
    applyDesignThemePresetMock.mockResolvedValue({
      presetId: "tpl-1",
      settings: {},
    })
  })

  it("uses the shared create theme preset command", async () => {
    await renderPage()

    await userEvent.click(screen.getByRole("button", { name: /customize/i }))
    await userEvent.type(screen.getByLabelText(/new template name/i), "Emerald Theme")
    await userEvent.type(
      screen.getByLabelText(/new template description/i),
      "Saved from current global formatting"
    )

    await userEvent.click(screen.getByRole("button", { name: /save current as template/i }))

    await waitFor(() => {
      expect(createDesignThemePresetMock).toHaveBeenCalledWith(
        supabaseMock,
        expect.objectContaining({
          key: "Emerald Theme",
          name: "Emerald Theme",
          description: "Saved from current global formatting",
          settings: expect.any(Object),
        })
      )
    })
  }, 10000)

  it("uses the shared update theme preset command", async () => {
    await renderPage()

    await userEvent.click(screen.getByRole("button", { name: /customize/i }))
    const nameInput = screen.getByLabelText(/selected template name/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Executive Slate Revised")

    await userEvent.click(screen.getByRole("button", { name: /update selected template/i }))

    await waitFor(() => {
      expect(updateDesignThemePresetMock).toHaveBeenCalledWith(
        supabaseMock,
        expect.objectContaining({
          id: "tpl-1",
          name: "Executive Slate Revised",
          description: "Professional high-contrast dark theme",
          settings: expect.any(Object),
        })
      )
    })
  }, 10000)

  it("uses the shared apply theme preset command", async () => {
    await renderPage()

    await userEvent.click(screen.getByRole("button", { name: /apply template/i }))

    const dialog = await screen.findByRole("dialog", {
      name: /apply template to global settings/i,
    })

    await userEvent.click(within(dialog).getByRole("button", { name: /confirm apply/i }))

    await waitFor(() => {
      expect(applyDesignThemePresetMock).toHaveBeenCalledWith(supabaseMock, "tpl-1")
    })
  }, 10000)
})
