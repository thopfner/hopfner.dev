import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it, vi } from "vitest"

import {
  applyAgentDraftPlan,
  buildAgentDraftIdempotencyKey,
  buildAgentDraftPlanOnlyResult,
  isAgentDraftApplyResultCurrent,
  isAgentDraftPlanResultCurrent,
} from "@/lib/agent/execution"
import { buildAgentDraftPlanFromPrompt } from "@/lib/agent/planning/build-draft-plan"
import {
  captureContentSnapshot,
  restoreContentSnapshot,
} from "@/lib/cms/content-snapshots"
import { rollbackAgentDraftSnapshot } from "@/lib/agent/execution/snapshots"
import {
  createFakeCmsSupabase,
  type FakeCmsState,
  type FakeSiteFormattingSettingsRow,
} from "./helpers/fake-cms-supabase"
import type { GeneratedImageProvider } from "@/lib/agent/media/types"

function buildPrompt(body: object) {
  return JSON.stringify(body)
}

function buildBaseState(): Partial<FakeCmsState> {
  return {
    pages: [
      {
        id: "page-home",
        slug: "home",
        title: "Home Before",
        updated_at: "2026-03-27T00:00:00.000Z",
      },
      {
        id: "page-about",
        slug: "about",
        title: "About Before",
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
      },
      {
        id: "section-home-old-faq",
        page_id: "page-home",
        key: "old-faq",
        section_type: "faq_list",
        enabled: true,
        position: 1,
        global_section_id: null,
      },
      {
        id: "section-about-proof",
        page_id: "page-about",
        key: "proof",
        section_type: "social_proof_strip",
        enabled: true,
        position: 0,
        global_section_id: null,
      },
    ],
    section_versions: [
      {
        id: "version-home-hero-1",
        section_id: "section-home-hero",
        version: 1,
        status: "draft",
        title: "Home Hero Before",
        subtitle: "Before subtitle",
        cta_primary_label: "Before CTA",
        cta_primary_href: "/before",
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: { paddingY: "py-6" },
        content: { eyebrow: "Before eyebrow" },
        created_at: "2026-03-27T00:00:00.000Z",
        published_at: null,
      },
      {
        id: "version-home-old-faq-1",
        section_id: "section-home-old-faq",
        version: 1,
        status: "draft",
        title: "Old FAQ Before",
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: { items: [{ question: "Old?", answer: "Old answer" }] },
        created_at: "2026-03-27T00:00:01.000Z",
        published_at: null,
      },
      {
        id: "version-about-proof-1",
        section_id: "section-about-proof",
        version: 1,
        status: "draft",
        title: "About Proof Before",
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: { items: ["A", "B"] },
        created_at: "2026-03-27T00:00:02.000Z",
        published_at: null,
      },
    ],
    site_formatting_settings: [
      {
        id: "default",
        settings: {
          tokens: {
            colorMode: "dark",
            accent: "slate",
          },
        },
      } satisfies FakeSiteFormattingSettingsRow,
    ],
    design_theme_presets: [
      {
        id: "preset-light",
        key: "light_agent",
        name: "Light Agent",
        description: null,
        tokens: {
          colorMode: "light",
          accent: "sand",
        },
        is_system: false,
        created_at: "2026-03-27T00:00:03.000Z",
        updated_at: "2026-03-27T00:00:03.000Z",
      },
    ],
    section_type_registry: [
      {
        key: "hero_cta",
        source: "builtin",
        is_active: true,
        renderer: "builtin",
      },
      {
        key: "faq_list",
        source: "builtin",
        is_active: true,
        renderer: "builtin",
      },
      {
        key: "social_proof_strip",
        source: "builtin",
        is_active: true,
        renderer: "builtin",
      },
    ],
    tailwind_class_whitelist: [],
  }
}

describe("agent draft execution", () => {
  it("builds stable idempotency keys and plan-only result scaffolds", () => {
    const prompt = buildPrompt({
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [{ sectionType: "hero_cta" }],
        },
      ],
    })
    const plan = buildAgentDraftPlanFromPrompt(prompt)

    const keyA = buildAgentDraftIdempotencyKey(prompt, plan)
    const keyB = buildAgentDraftIdempotencyKey(prompt, plan)

    expect(keyA).toBe(keyB)

    const result = buildAgentDraftPlanOnlyResult({
      prompt,
      plan,
      applyRequested: false,
      planner: {
        inputMode: "json",
        provider: null,
        model: null,
        assumptions: [],
        warnings: [],
        downgradedRequests: [],
      },
    })

    expect(result).toMatchObject({
      mode: "plan-only",
      applyRequested: false,
      applyState: "not_applied",
      touchedPageSlugs: ["home"],
      rollbackSnapshotId: null,
      snapshotStatus: "not_captured",
    })
    expect(isAgentDraftPlanResultCurrent({ phase3: result }, prompt, plan)).toBe(true)
  })

  it("keeps shared page-content snapshots page-scoped and leaves theme state untouched", async () => {
    const supabase = createFakeCmsSupabase(buildBaseState())

    const snapshot = await captureContentSnapshot(supabase as never, ["home", "launch"])

    expect(snapshot).toMatchObject({
      pages: [
        {
          slug: "home",
          title: "Home Before",
        },
      ],
      targetPageStates: [
        {
          slug: "home",
          existed: true,
        },
        {
          slug: "launch",
          existed: false,
          page: null,
        },
      ],
    })
    expect(snapshot.siteFormattingState).toBeUndefined()

    supabase.__state.pages = [
      {
        id: "page-home",
        slug: "home",
        title: "Home After",
        updated_at: "2026-03-27T00:10:00.000Z",
      },
      {
        id: "page-about",
        slug: "about",
        title: "About After",
        updated_at: "2026-03-27T00:10:00.000Z",
      },
      {
        id: "page-launch",
        slug: "launch",
        title: "Launch After",
        updated_at: "2026-03-27T00:10:00.000Z",
      },
    ]
    supabase.__state.sections = [
      {
        id: "section-home-faq",
        page_id: "page-home",
        key: "faq",
        section_type: "faq_list",
        enabled: true,
        position: 0,
        global_section_id: null,
      },
      {
        id: "section-about-proof",
        page_id: "page-about",
        key: "proof",
        section_type: "social_proof_strip",
        enabled: true,
        position: 0,
        global_section_id: null,
      },
      {
        id: "section-launch-hero",
        page_id: "page-launch",
        key: "hero",
        section_type: "hero_cta",
        enabled: true,
        position: 0,
        global_section_id: null,
      },
    ]
    supabase.__state.section_versions = [
      {
        id: "version-home-faq-1",
        section_id: "section-home-faq",
        version: 1,
        status: "draft",
        title: "Home FAQ After",
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: { items: [{ question: "After?" }] },
        created_at: "2026-03-27T00:10:01.000Z",
        published_at: null,
      },
      {
        id: "version-about-proof-1",
        section_id: "section-about-proof",
        version: 1,
        status: "draft",
        title: "About Proof Before",
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: { items: ["A", "B"] },
        created_at: "2026-03-27T00:00:02.000Z",
        published_at: null,
      },
      {
        id: "version-launch-hero-1",
        section_id: "section-launch-hero",
        version: 1,
        status: "draft",
        title: "Launch Hero After",
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: { eyebrow: "New" },
        created_at: "2026-03-27T00:10:02.000Z",
        published_at: null,
      },
    ]
    supabase.__state.site_formatting_settings = [
      {
        id: "default",
        settings: {
          tokens: {
            colorMode: "light",
            accent: "sand",
          },
          _appliedTemplateId: "preset-light",
        },
      },
    ]

    await restoreContentSnapshot(supabase as never, snapshot)

    expect(supabase.__state.pages.map((page) => ({ slug: page.slug, title: page.title }))).toEqual([
      { slug: "home", title: "Home Before" },
      { slug: "about", title: "About After" },
    ])

    expect(
      supabase.__state.sections
        .filter((section) => section.page_id === "page-home")
        .map((section) => ({
          key: section.key,
          section_type: section.section_type,
          position: section.position,
        }))
    ).toEqual([
      {
        key: "hero",
        section_type: "hero_cta",
        position: 0,
      },
      {
        key: "old-faq",
        section_type: "faq_list",
        position: 1,
      },
    ])

    expect(supabase.__state.pages.some((page) => page.slug === "launch")).toBe(false)
    expect(supabase.__state.site_formatting_settings).toEqual([
      {
        id: "default",
        settings: {
          tokens: {
            colorMode: "light",
            accent: "sand",
          },
          _appliedTemplateId: "preset-light",
        },
      },
    ])
  })

  it("captures and restores attached global sections without converting them into local sections", async () => {
    const supabase = createFakeCmsSupabase({
      ...buildBaseState(),
      sections: [
        {
          id: "section-home-nav",
          page_id: "page-home",
          key: "nav",
          section_type: "nav_links",
          enabled: true,
          position: 0,
          global_section_id: "global-nav",
          formatting_override: { containerClass: "px-6" },
        },
        {
          id: "section-home-hero",
          page_id: "page-home",
          key: "hero",
          section_type: "hero_cta",
          enabled: true,
          position: 1,
          global_section_id: null,
          formatting_override: null,
        },
        {
          id: "section-home-footer",
          page_id: "page-home",
          key: "footer",
          section_type: "footer_grid",
          enabled: true,
          position: 2,
          global_section_id: "global-footer",
          formatting_override: { sectionClass: "border-t" },
        },
      ],
      section_versions: [
        {
          id: "version-home-hero-1",
          section_id: "section-home-hero",
          version: 1,
          status: "draft",
          title: "Home Hero Before",
          subtitle: "Before subtitle",
          cta_primary_label: "Before CTA",
          cta_primary_href: "/before",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: { paddingY: "py-6" },
          content: { eyebrow: "Before eyebrow" },
          created_at: "2026-03-27T00:00:00.000Z",
          published_at: null,
        },
      ],
      global_sections: [
        { id: "global-nav", key: "nav", section_type: "nav_links" },
        { id: "global-footer", key: "footer", section_type: "footer_grid" },
      ],
      global_section_versions: [
        {
          id: "global-nav-v1",
          global_section_id: "global-nav",
          version: 1,
          status: "published",
          title: "Global Nav",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: {},
          content: { links: [{ label: "Home", href: "/" }] },
          created_at: "2026-03-27T00:00:00.000Z",
          published_at: "2026-03-27T00:00:00.000Z",
        },
        {
          id: "global-footer-v1",
          global_section_id: "global-footer",
          version: 1,
          status: "published",
          title: "Global Footer",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: {},
          content: { copyright: "2026" },
          created_at: "2026-03-27T00:00:00.000Z",
          published_at: "2026-03-27T00:00:00.000Z",
        },
      ],
    })

    const snapshot = await captureContentSnapshot(supabase as never, ["home"])

    expect(snapshot.pages[0]?.sections).toEqual([
      expect.objectContaining({
        section_type: "nav_links",
        global_section_id: "global-nav",
        formatting_override: { containerClass: "px-6" },
        versions: [],
      }),
      expect.objectContaining({
        section_type: "hero_cta",
        global_section_id: null,
      }),
      expect.objectContaining({
        section_type: "footer_grid",
        global_section_id: "global-footer",
        formatting_override: { sectionClass: "border-t" },
        versions: [],
      }),
    ])

    supabase.__state.sections = [
      {
        id: "section-home-hero-live",
        page_id: "page-home",
        key: "hero",
        section_type: "hero_cta",
        enabled: true,
        position: 0,
        global_section_id: null,
        formatting_override: null,
      },
    ]
    supabase.__state.section_versions = [
      {
        id: "version-home-hero-live-1",
        section_id: "section-home-hero-live",
        version: 1,
        status: "draft",
        title: "Mutated Hero",
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: { eyebrow: "After" },
        created_at: "2026-03-27T00:10:00.000Z",
        published_at: null,
      },
    ]

    await restoreContentSnapshot(supabase as never, snapshot)

    const restoredHomeSections = supabase.__state.sections
      .filter((section) => section.page_id === "page-home")
      .sort((left, right) => left.position - right.position)
      .map((section) => ({
        key: section.key,
        section_type: section.section_type,
        global_section_id: section.global_section_id ?? null,
        formatting_override: section.formatting_override ?? null,
      }))

    expect(restoredHomeSections).toEqual([
      {
        key: "nav",
        section_type: "nav_links",
        global_section_id: "global-nav",
        formatting_override: { containerClass: "px-6" },
      },
      {
        key: "hero",
        section_type: "hero_cta",
        global_section_id: null,
        formatting_override: null,
      },
      {
        key: "footer",
        section_type: "footer_grid",
        global_section_id: "global-footer",
        formatting_override: { sectionClass: "border-t" },
      },
    ])

    const restoredGlobalSectionIds = supabase.__state.sections
      .filter((section) => section.page_id === "page-home" && section.global_section_id)
      .map((section) => section.id)

    expect(
      supabase.__state.section_versions.filter((version) =>
        restoredGlobalSectionIds.includes(version.section_id)
      )
    ).toEqual([])
    expect(
      supabase.__state.section_versions
        .filter((version) => !restoredGlobalSectionIds.includes(version.section_id))
        .map((version) => ({ section_id: version.section_id, title: version.title }))
    ).toEqual([{ section_id: expect.any(String), title: "Home Hero Before" }])
  })

  it("applies a constrained plan through the command layer and agent rollback restores the pre-run state including theme", async () => {
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
                subtitle: "Built by the worker",
                ctaPrimaryLabel: "Book",
                ctaPrimaryHref: "/book",
              },
              formatting: {
                paddingY: "py-8",
              },
              content: {
                eyebrow: "Agent draft",
              },
            },
            {
              sectionType: "faq_list",
              key: "faq",
              content: {
                items: [
                  { question: "What changed?", answer: "Everything stayed draft-only." },
                ],
              },
            },
          ],
        },
        {
          slug: "launch",
          title: "Launch",
          sections: [
            {
              sectionType: "hero_cta",
              key: "launch-hero",
              meta: {
                title: "Launch Hero",
                subtitle: "Fresh page",
              },
              content: {
                eyebrow: "Launch",
              },
            },
          ],
        },
      ],
      theme: {
        presetId: "preset-light",
        settings: {
          tokens: {
            accent: "sunrise",
          },
        },
      },
    })

    const plan = buildAgentDraftPlanFromPrompt(prompt)
    const supabase = createFakeCmsSupabase(buildBaseState())
    let jobResult: Record<string, unknown> = {}
    const updateJobResult = vi.fn(async (input: {
      result: Record<string, unknown>
      merge?: boolean
    }) => {
      jobResult = input.merge === false ? input.result : { ...jobResult, ...input.result }
      return {
        id: "job-1",
        kind: "site_build_draft",
        result: clone(jobResult),
      }
    })

    const applied = await applyAgentDraftPlan({
      supabase: supabase as never,
      jobId: "job-1",
      prompt,
      plan,
      updateJobResult,
    })

    expect(updateJobResult).toHaveBeenCalledTimes(2)
    expect(applied).toMatchObject({
      mode: "apply",
      applyRequested: true,
      applyState: "applied",
      touchedPageSlugs: ["home", "launch"],
      snapshotStatus: "captured",
      rollbackSnapshotId: "snapshot-1",
      createdPageSlugs: ["launch"],
      updatedPageSlugs: ["home"],
      themeApplied: {
        presetId: "preset-light",
        hasSettings: true,
      },
    })
    expect(isAgentDraftApplyResultCurrent({ phase3: applied }, prompt, plan)).toBe(true)
    expect(jobResult).toEqual({ phase3: applied })
    expect(supabase.__state.cms_content_snapshots).toHaveLength(1)
    expect(supabase.__state.cms_content_snapshots[0]?.payload.siteFormattingState).toEqual({
      existed: true,
      settings: {
        tokens: {
          colorMode: "dark",
          accent: "slate",
        },
      },
    })

    expect(
      supabase.__state.pages.map((page) => ({ slug: page.slug, title: page.title }))
    ).toEqual([
      { slug: "home", title: "Home After" },
      { slug: "about", title: "About Before" },
      { slug: "launch", title: "Launch" },
    ])

    const homePageId = supabase.__state.pages.find((page) => page.slug === "home")?.id
    expect(homePageId).toBe("page-home")
    expect(
      supabase.__state.sections
        .filter((section) => section.page_id === "page-home")
        .sort((left, right) => left.position - right.position)
        .map((section) => ({
          key: section.key,
          section_type: section.section_type,
          enabled: section.enabled,
          position: section.position,
        }))
    ).toEqual([
      {
        key: "hero",
        section_type: "hero_cta",
        enabled: true,
        position: 0,
      },
      {
        key: "faq",
        section_type: "faq_list",
        enabled: true,
        position: 1,
      },
    ])

    const homeHeroVersions = supabase.__state.section_versions
      .filter((version) => version.section_id === "section-home-hero")
      .map((version) => ({
        version: version.version,
        status: version.status,
        title: version.title,
        content: version.content,
      }))
    expect(homeHeroVersions).toEqual([
      {
        version: 1,
        status: "archived",
        title: "Home Hero Before",
        content: { eyebrow: "Before eyebrow" },
      },
      {
        version: 2,
        status: "draft",
        title: "Home Hero After",
        content: { eyebrow: "Agent draft" },
      },
    ])
    expect(
      supabase.__state.sections.some((section) => section.id === "section-home-old-faq")
    ).toBe(false)
    expect(applied.deletedSectionIds).toContain("section-home-old-faq")

    expect(supabase.__state.site_formatting_settings).toEqual([
      {
        id: "default",
        settings: {
          tokens: {
            colorMode: "light",
            accent: "sunrise",
          },
          _appliedTemplateId: "preset-light",
        },
      },
    ])

    await rollbackAgentDraftSnapshot(supabase as never, applied.rollbackSnapshotId)

    expect(
      supabase.__state.pages.map((page) => ({ slug: page.slug, title: page.title }))
    ).toEqual([
      { slug: "home", title: "Home Before" },
      { slug: "about", title: "About Before" },
    ])
    expect(supabase.__state.pages.some((page) => page.slug === "launch")).toBe(false)
    expect(supabase.__state.site_formatting_settings).toEqual([
      {
        id: "default",
        settings: {
          tokens: {
            colorMode: "dark",
            accent: "slate",
          },
        },
      },
    ])
  })

  it("registers generated media and writes the public URL into the section draft backgroundMediaUrl", async () => {
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
                backgroundMediaUrl: "",
              },
              media: {
                backgroundImage: {
                  prompt: "Warm editorial hero background",
                  alt: "Warm editorial background",
                },
              },
              content: {
                eyebrow: "Agent draft",
              },
            },
          ],
        },
      ],
    })
    const plan = buildAgentDraftPlanFromPrompt(prompt)
    const supabase = createFakeCmsSupabase(buildBaseState())
    const generatedImageProvider = {
      name: "test-provider",
      model: "test-model",
      generateImage: vi.fn().mockResolvedValue({
        bytes: Buffer.from("generated-image-bytes"),
        mimeType: "image/png",
        filename: "hero-background.png",
        width: 1600,
        height: 900,
        alt: "Warm editorial background",
        provider: "test-provider",
        model: "test-model",
      }),
    } satisfies GeneratedImageProvider

    await applyAgentDraftPlan({
      supabase: supabase as never,
      jobId: "job-generated-media",
      prompt,
      plan,
      generatedImageProvider,
      updateJobResult: vi.fn(async () => ({ id: "job-generated-media" })),
    })

    expect(generatedImageProvider.generateImage).toHaveBeenCalledWith({
      prompt: "Warm editorial hero background",
      alt: "Warm editorial background",
    })
    expect(supabase.__state.media).toHaveLength(1)
    expect(supabase.__state.media[0]).toMatchObject({
      bucket: "cms-media",
      mime_type: "image/png",
      alt: "Warm editorial background",
      width: 1600,
      height: 900,
    })
    expect(supabase.__storage).toHaveLength(1)

    const latestHeroDraft = supabase.__state.section_versions
      .filter((version) => version.section_id === "section-home-hero" && version.status === "draft")
      .sort((left, right) => right.version - left.version)[0]

    expect(latestHeroDraft?.background_media_url).toBe(
      `https://cdn.example.com/cms-media/${supabase.__state.media[0]?.path}`
    )
  })

  it("cleans up generated media created during the run if a later apply step fails", async () => {
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
                backgroundMediaUrl: "",
              },
              media: {
                backgroundImage: {
                  prompt: "Warm editorial hero background",
                },
              },
            },
          ],
        },
      ],
      theme: {
        presetId: "missing-preset",
      },
    })
    const plan = buildAgentDraftPlanFromPrompt(prompt)
    const supabase = createFakeCmsSupabase(buildBaseState())
    const generatedImageProvider = {
      name: "test-provider",
      model: "test-model",
      generateImage: vi.fn().mockResolvedValue({
        bytes: Buffer.from("generated-image-bytes"),
        mimeType: "image/png",
        filename: "hero-background.png",
        width: 1600,
        height: 900,
        alt: null,
        provider: "test-provider",
        model: "test-model",
      }),
    } satisfies GeneratedImageProvider

    await expect(
      applyAgentDraftPlan({
        supabase: supabase as never,
        jobId: "job-generated-media-fail",
        prompt,
        plan,
        generatedImageProvider,
        updateJobResult: vi.fn(async () => ({ id: "job-generated-media-fail" })),
      })
    ).rejects.toThrow("Theme preset not found.")

    expect(supabase.__state.media).toEqual([])
    expect(supabase.__storage).toEqual([])
  })

  it("keeps the blueprint rollback route pointed at the canonical snapshot type", () => {
    const routeSource = readFileSync(
      join(process.cwd(), "app/admin/api/content/blueprint/rollback/route.ts"),
      "utf8"
    )

    expect(routeSource).toContain('import type { SnapshotPayload } from "@/lib/cms/content-snapshots"')
    expect(routeSource).not.toContain("type SnapshotPayload } from \"@/lib/cms/blueprint-apply\"")
  })

  it("keeps blueprint snapshot helpers explicitly page-scoped", () => {
    const blueprintSource = readFileSync(
      join(process.cwd(), "lib/cms/blueprint-apply.ts"),
      "utf8"
    )

    expect(blueprintSource).toContain("includeSiteFormatting: false")
    expect(blueprintSource).toContain("restoreSiteFormatting: false")
  })
})

function clone<T>(value: T): T {
  return structuredClone(value)
}
