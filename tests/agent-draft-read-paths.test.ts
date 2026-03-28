import { beforeEach, describe, expect, it, vi } from "vitest"

import { applyAgentDraftPlan } from "@/lib/agent/execution"
import { buildAgentDraftPlanFromPrompt } from "@/lib/agent/planning/build-draft-plan"
import { createFakeCmsSupabase } from "./helpers/fake-cms-supabase"
import type { GeneratedImageProvider } from "@/lib/agent/media/types"

const createClientMock = vi.fn()
const requireAdminMock = vi.fn()
const getSupabaseAdminMock = vi.fn()
const loadSectionPresetsFromClientMock = vi.fn()
const loadCapabilitiesFromClientMock = vi.fn()

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => createClientMock(),
}))

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdminMock(),
}))

vi.mock("@/lib/supabase/server-admin", () => ({
  getSupabaseAdmin: () => getSupabaseAdminMock(),
}))

vi.mock("@/lib/design-system/loaders", () => ({
  loadSectionPresetsFromClient: (...args: unknown[]) => loadSectionPresetsFromClientMock(...args),
  loadCapabilitiesFromClient: (...args: unknown[]) => loadCapabilitiesFromClientMock(...args),
}))

function buildPrompt(body: object) {
  return JSON.stringify(body)
}

describe("agent draft read paths", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminMock.mockResolvedValue({ ok: true, userId: "user-1" })
    loadSectionPresetsFromClientMock.mockResolvedValue({})
    loadCapabilitiesFromClientMock.mockResolvedValue({})
  })

  it("loads applied drafts through the visual-editor loader and pages overview route", async () => {
    const prompt = buildPrompt({
      pages: [
        {
          slug: "home",
          title: "Home After",
          sections: [
            {
              sectionType: "hero_cta",
              key: "hero",
              meta: {
                title: "Home Hero After",
                subtitle: "Visible to the visual editor",
                backgroundMediaUrl: "",
              },
              media: {
                backgroundImage: {
                  prompt: "Bright product launch background",
                  alt: "Bright product launch background",
                },
              },
              content: {
                eyebrow: "Agent draft",
              },
            },
            {
              sectionType: "faq_list",
              key: "faq",
              content: {
                items: [{ question: "Is this published?", answer: "No, still draft-only." }],
              },
            },
          ],
        },
      ],
      theme: {
        settings: {
          tokens: {
            colorMode: "light",
            accent: "sunrise",
          },
        },
      },
    })
    const plan = buildAgentDraftPlanFromPrompt(prompt)
    const supabase = createFakeCmsSupabase({
      pages: [
        {
          id: "page-home",
          slug: "home",
          title: "Home Before",
          bg_image_url: null,
          formatting_override: {},
          updated_at: "2026-03-27T00:00:00.000Z",
        },
      ],
      sections: [
        {
          id: "section-home-hero",
          page_id: "page-home",
          key: "hero",
          section_type: "hero_cta",
          enabled: true,
          position: 0,
          global_section_id: null,
          formatting_override: {},
        },
      ],
      section_versions: [
        {
          id: "version-home-hero-1",
          section_id: "section-home-hero",
          version: 1,
          status: "draft",
          title: "Home Hero Before",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: {},
          content: {},
          created_at: "2026-03-27T00:00:00.000Z",
          published_at: null,
        },
      ],
      section_type_defaults: [],
      section_type_registry: [
        {
          key: "hero_cta",
          source: "builtin",
          composer_schema: null,
          is_active: true,
          renderer: "builtin",
        },
        {
          key: "faq_list",
          source: "builtin",
          composer_schema: null,
          is_active: true,
          renderer: "builtin",
        },
      ],
      global_sections: [],
      global_section_versions: [],
      tailwind_class_whitelist: [],
      site_formatting_settings: [{ id: "default", settings: { tokens: { colorMode: "dark" } } }],
    })

    let jobResult: Record<string, unknown> = {}
    const generatedImageProvider = {
      name: "test-provider",
      model: "test-model",
      generateImage: vi.fn().mockResolvedValue({
        bytes: Buffer.from("generated-image-bytes"),
        mimeType: "image/png",
        filename: "hero-background.png",
        width: 1600,
        height: 900,
        alt: "Bright product launch background",
        provider: "test-provider",
        model: "test-model",
      }),
    } satisfies GeneratedImageProvider
    const updateJobResult = vi.fn(async (input: {
      result: Record<string, unknown>
      merge?: boolean
    }) => {
      jobResult = input.merge === false ? input.result : { ...jobResult, ...input.result }
      return {
        id: "job-1",
        kind: "site_build_draft",
        result: structuredClone(jobResult),
      }
    })

    await applyAgentDraftPlan({
      supabase: supabase as never,
      jobId: "job-1",
      prompt,
      plan,
      generatedImageProvider,
      updateJobResult,
    })

    createClientMock.mockReturnValue(supabase)
    getSupabaseAdminMock.mockReturnValue(supabase)

    const { loadPageVisualState } = await import("@/lib/admin/visual-editor/load-page-visual-state")
    const visualState = await loadPageVisualState("page-home")

    expect(visualState.pageTitle).toBe("Home After")
    expect(visualState.sections.map((section) => section.key)).toEqual(["hero", "faq"])
    expect(visualState.sections[0]?.draftVersion?.title).toBe("Home Hero After")
    expect(visualState.sections[0]?.draftVersion?.background_media_url).toBe(
      `https://cdn.example.com/cms-media/${supabase.__state.media[0]?.path}`
    )
    expect(visualState.sections[1]?.draftVersion?.content).toEqual({
      items: [{ question: "Is this published?", answer: "No, still draft-only." }],
    })
    expect(visualState.siteFormattingSettings).toEqual({
      tokens: {
        colorMode: "light",
        accent: "sunrise",
      },
    })

    const { GET } = await import("@/app/admin/api/pages/overview/route")
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.pages).toEqual([
      expect.objectContaining({
        id: "page-home",
        slug: "home",
        title: "Home After",
        publish_status: "unpublished",
        has_draft_changes: true,
      }),
    ])
    expect(json.counts).toEqual({
      total_pages_count: 1,
      published_pages_count: 0,
      unpublished_pages_count: 1,
    })

    const { GET: getMedia } = await import("@/app/admin/api/media/route")
    const mediaResponse = await getMedia(new Request("https://example.com/admin/api/media"))
    const mediaJson = await mediaResponse.json()

    expect(mediaResponse.status).toBe(200)
    expect(mediaJson.items).toEqual([
      expect.objectContaining({
        bucket: "cms-media",
        alt: "Bright product launch background",
        url: `https://cdn.example.com/cms-media/${supabase.__state.media[0]?.path}`,
      }),
    ])
  })
})
