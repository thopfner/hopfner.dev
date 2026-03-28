import { describe, expect, it, vi } from "vitest"

import { AgentProviderUnavailableError } from "@/lib/agent/jobs/errors"

import {
  buildAgentDraftAppliedResult,
  buildAgentDraftPlanOnlyResult,
} from "@/lib/agent/execution/idempotency"
import {
  executeSiteBuildDraftJob,
  executeSiteBuildDraftPlanOnlyJob,
} from "@/lib/agent/jobs/handlers"
import { buildAgentDraftPlanFromPrompt } from "@/lib/agent/planning/build-draft-plan"
import type {
  AgentDraftPlannerProvider,
  AgentDraftPlannerStructuredOutput,
} from "@/lib/agent/planning/types"
import { createFakeCmsSupabase } from "./helpers/fake-cms-supabase"

function buildPrompt(body: object) {
  return JSON.stringify(body)
}

const JSON_PLANNER = {
  inputMode: "json" as const,
  provider: null,
  model: null,
  assumptions: [],
  warnings: [],
  downgradedRequests: [],
}

function createNaturalLanguagePlannerProvider(
  structuredPlan: AgentDraftPlannerStructuredOutput
): AgentDraftPlannerProvider {
  return {
    name: "gemini",
    model: "gemini-2.5-flash",
    planDraftSite: vi.fn(async () => ({
      provider: "gemini",
      model: "gemini-2.5-flash",
      structuredPlan,
    })),
  }
}

describe("agent draft job handler", () => {
  it("stores a validated plan on the job result in plan-only mode", async () => {
    const updateJobResult = vi.fn().mockResolvedValue({
      id: "job-1",
      kind: "site_build_draft",
      result: {},
    })

    await executeSiteBuildDraftPlanOnlyJob(
      {
        id: "job-1",
        kind: "site_build_draft",
        payload: {
          prompt: buildPrompt({
            pages: [
              {
                slug: "home",
                title: "Home",
                sections: [{ sectionType: "hero_cta" }],
              },
            ],
          }),
          dryRun: true,
        },
        result: {},
      },
      {
        updateJobResult,
      }
    )

    expect(updateJobResult).toHaveBeenCalledTimes(1)
    expect(updateJobResult).toHaveBeenCalledWith({
      jobId: "job-1",
      merge: true,
      result: {
        phase3: expect.objectContaining({
          mode: "plan-only",
          applyRequested: false,
          applyState: "not_applied",
          planner: JSON_PLANNER,
          touchedPageSlugs: ["home"],
          rollbackSnapshotId: null,
          snapshotStatus: "not_captured",
          planSummary: expect.objectContaining({
            pageCount: 1,
            sectionCount: 1,
          }),
        }),
      },
    })
  })

  it("stores an applied phase3 result when apply is requested", async () => {
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
              },
              content: {
                eyebrow: "Agent draft",
              },
            },
          ],
        },
      ],
    })

    const supabase = createFakeCmsSupabase({
      pages: [
        {
          id: "page-home",
          slug: "home",
          title: "Home Before",
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
        },
      ],
      site_formatting_settings: [{ id: "default", settings: { tokens: { colorMode: "dark" } } }],
      tailwind_class_whitelist: [],
    })

    let jobResult: Record<string, unknown> = {}
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

    await executeSiteBuildDraftJob(
      {
        id: "job-1",
        kind: "site_build_draft",
        payload: {
          prompt,
          apply: true,
        },
        result: {},
      },
      {
        getSupabaseClient: () => supabase as never,
        updateJobResult,
      }
    )

    expect(updateJobResult).toHaveBeenCalledTimes(2)
    expect(jobResult).toEqual({
      phase3: expect.objectContaining({
        mode: "apply",
        applyRequested: true,
        applyState: "applied",
        planner: JSON_PLANNER,
        reviewedSourceJobId: null,
        touchedPageSlugs: ["home"],
        rollbackSnapshotId: "snapshot-1",
        snapshotStatus: "captured",
      }),
    })
  })

  it("stores a normalized plan for a plain-English brief in plan-only mode", async () => {
    const plannerProvider = createNaturalLanguagePlannerProvider({
      assumptions: ["Assume a solo consultancy offer."],
      warnings: ["Pricing was omitted because it was not provided."],
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [
            { sectionType: "hero", meta: { title: "Automation systems for operators" } },
            { sectionType: "faq_list", content: { items: [] } },
          ],
        },
      ],
      theme: { presetId: "modern_launch" },
    })
    const updateJobResult = vi.fn().mockResolvedValue({
      id: "job-brief",
      kind: "site_build_draft",
      result: {},
    })

    await executeSiteBuildDraftPlanOnlyJob(
      {
        id: "job-brief",
        kind: "site_build_draft",
        payload: {
          prompt: "Build a one-page consultancy site for workflow automation with a strong hero and FAQ.",
          dryRun: true,
        },
        result: {},
      },
      { updateJobResult },
      { plannerProvider }
    )

    expect(plannerProvider.planDraftSite).toHaveBeenCalledWith({
      prompt: "Build a one-page consultancy site for workflow automation with a strong hero and FAQ.",
    })
    expect(updateJobResult).toHaveBeenCalledWith({
      jobId: "job-brief",
      merge: true,
      result: {
        phase3: expect.objectContaining({
          mode: "plan-only",
          applyRequested: false,
          applyState: "not_applied",
          planner: {
            inputMode: "natural-language",
            provider: "gemini",
            model: "gemini-2.5-flash",
            assumptions: ["Assume a solo consultancy offer."],
            warnings: ["Pricing was omitted because it was not provided."],
            downgradedRequests: [],
          },
          planSummary: expect.objectContaining({
            pageCount: 1,
            sectionCount: 2,
            themePresetId: "modern_launch",
          }),
          touchedPageSlugs: ["home"],
        }),
      },
    })
  })

  it("refuses unsupported natural-language asks that exceed v1 scope", async () => {
    const plannerProvider = createNaturalLanguagePlannerProvider({
      publishIntent: "publish_now",
      unsupportedRequests: ["custom_section_schema"],
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [{ sectionType: "hero_cta" }],
        },
      ],
    })
    const updateJobResult = vi.fn()

    await expect(() =>
      executeSiteBuildDraftPlanOnlyJob(
        {
          id: "job-downgrade",
          kind: "site_build_draft",
          payload: {
            prompt: "Build the site and publish it immediately, plus invent a custom section schema.",
            dryRun: true,
          },
          result: {},
        },
        { updateJobResult },
        { plannerProvider }
      )
    ).rejects.toThrow(
      "This brief requests unsupported v1 capabilities: custom_section_schema. Use only existing section types, existing theme controls, and the draft-only review workflow."
    )

    expect(updateJobResult).not.toHaveBeenCalled()
  })


  it("fails natural-language plan-only jobs clearly when the planner provider is unavailable", async () => {
    const updateJobResult = vi.fn()

    await expect(() =>
      executeSiteBuildDraftPlanOnlyJob(
        {
          id: "job-no-provider",
          kind: "site_build_draft",
          payload: {
            prompt: "Build a one-page consultancy site from a plain-English brief.",
            dryRun: true,
          },
          result: {},
        },
        { updateJobResult },
        {
          plannerProvider: {
            name: "gemini",
            model: "gemini-2.5-flash",
            planDraftSite: vi.fn(async () => {
              throw new AgentProviderUnavailableError(
                "Natural-language planning is unavailable because GEMINI_API_KEY is not configured."
              )
            }),
          },
        }
      )
    ).rejects.toThrow("Natural-language planning is unavailable because GEMINI_API_KEY is not configured.")

    expect(updateJobResult).not.toHaveBeenCalled()
  })

  it("stores an applied phase3 result for a plain-English brief when apply is requested", async () => {
    const plannerProvider = createNaturalLanguagePlannerProvider({
      assumptions: ["Assume the existing home page should be refreshed in place."],
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
              },
              content: {
                eyebrow: "Agent draft",
              },
            },
          ],
        },
      ],
    })

    const supabase = createFakeCmsSupabase({
      pages: [
        {
          id: "page-home",
          slug: "home",
          title: "Home Before",
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
        },
      ],
      site_formatting_settings: [{ id: "default", settings: { tokens: { colorMode: "dark" } } }],
      tailwind_class_whitelist: [],
    })

    let jobResult: Record<string, unknown> = {}
    const updateJobResult = vi.fn(async (input: {
      result: Record<string, unknown>
      merge?: boolean
    }) => {
      jobResult = input.merge === false ? input.result : { ...jobResult, ...input.result }
      return {
        id: "job-brief-apply",
        kind: "site_build_draft",
        result: structuredClone(jobResult),
      }
    })

    await executeSiteBuildDraftJob(
      {
        id: "job-brief-apply",
        kind: "site_build_draft",
        payload: {
          prompt: "Refresh the home page hero for an automation consultancy and apply the draft.",
          apply: true,
        },
        result: {},
      },
      {
        getSupabaseClient: () => supabase as never,
        updateJobResult,
      },
      { plannerProvider }
    )

    expect(jobResult).toEqual({
      phase3: expect.objectContaining({
        mode: "apply",
        applyRequested: true,
        applyState: "applied",
        planner: {
          inputMode: "natural-language",
          provider: "gemini",
          model: "gemini-2.5-flash",
          assumptions: ["Assume the existing home page should be refreshed in place."],
          warnings: [],
          downgradedRequests: [],
        },
        reviewedSourceJobId: null,
        touchedPageSlugs: ["home"],
        rollbackSnapshotId: "snapshot-1",
      }),
    })
  })

  it("applies a reviewed stored plan without calling the planner provider again", async () => {
    const plannerProvider = {
      name: "gemini" as const,
      model: "gemini-2.5-flash",
      planDraftSite: vi.fn(async () => {
        throw new Error("planner provider should not run for reviewed-plan apply")
      }),
    }
    const supabase = createFakeCmsSupabase({
      pages: [
        {
          id: "page-home",
          slug: "home",
          title: "Home Before",
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
        },
      ],
      site_formatting_settings: [{ id: "default", settings: { tokens: { colorMode: "dark" } } }],
      tailwind_class_whitelist: [],
    })

    let jobResult: Record<string, unknown> = {}
    const updateJobResult = vi.fn(async (input: {
      result: Record<string, unknown>
      merge?: boolean
    }) => {
      jobResult = input.merge === false ? input.result : { ...jobResult, ...input.result }
      return {
        id: "job-review-apply",
        kind: "site_build_draft",
        result: structuredClone(jobResult),
      }
    })

    await executeSiteBuildDraftJob(
      {
        id: "job-review-apply",
        kind: "site_build_draft",
        payload: {
          prompt: "Build a one-page consultancy site.",
          apply: true,
          reviewedSourceJobId: "job-plan-1",
          reviewedSourcePromptHash: "prompt-hash-1",
          reviewedSourceIdempotencyKey: "plan-key-1",
          reviewedPlan: {
            version: "phase3.v1",
            autoPublish: false,
            pages: [
              {
                slug: "home",
                title: "Home After",
                sections: [
                  {
                    order: 0,
                    sectionType: "hero_cta",
                    key: "hero",
                    enabled: true,
                    draft: {
                      meta: {
                        title: "Home Hero After",
                        subtitle: "",
                        ctaPrimaryLabel: "",
                        ctaPrimaryHref: "",
                        ctaSecondaryLabel: "",
                        ctaSecondaryHref: "",
                        backgroundMediaUrl: "",
                      },
                      formatting: {},
                      content: {
                        eyebrow: "Reviewed plan",
                      },
                    },
                    media: null,
                  },
                ],
              },
            ],
            theme: null,
          },
          reviewedPlanner: {
            inputMode: "natural-language",
            provider: "gemini",
            model: "gemini-2.5-flash",
            assumptions: ["Assume a services-led homepage."],
            warnings: [],
            downgradedRequests: [],
          },
        },
        result: {},
      },
      {
        getSupabaseClient: () => supabase as never,
        updateJobResult,
      },
      { plannerProvider }
    )

    expect(plannerProvider.planDraftSite).not.toHaveBeenCalled()
    expect(jobResult).toEqual({
      phase3: expect.objectContaining({
        mode: "apply",
        applyRequested: true,
        applyState: "applied",
        reviewedSourceJobId: "job-plan-1",
        planner: {
          inputMode: "natural-language",
          provider: "gemini",
          model: "gemini-2.5-flash",
          assumptions: ["Assume a services-led homepage."],
          warnings: [],
          downgradedRequests: [],
        },
        touchedPageSlugs: ["home"],
        rollbackSnapshotId: "snapshot-1",
        snapshotStatus: "captured",
      }),
    })
  })

  it("skips plan-only updates when the same plan has already been stored", async () => {
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
    const existingResult = buildAgentDraftPlanOnlyResult({
      prompt,
      plan,
      applyRequested: false,
      planner: JSON_PLANNER,
    })

    const updateJobResult = vi.fn()

    await executeSiteBuildDraftPlanOnlyJob(
      {
        id: "job-1",
        kind: "site_build_draft",
        payload: { prompt },
      result: {
        phase3: existingResult,
      },
      },
      {
        updateJobResult,
      }
    )

    expect(updateJobResult).not.toHaveBeenCalled()
  })

  it("skips apply work when the same apply result has already completed", async () => {
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
    const existingResult = buildAgentDraftAppliedResult({
      prompt,
      plan,
      rollbackSnapshotId: "snapshot-1",
      planner: JSON_PLANNER,
      reviewedSourceJobId: null,
      appliedAt: "2026-03-27T00:00:00.000Z",
      createdPageSlugs: [],
      updatedPageSlugs: ["home"],
      deletedSectionIds: [],
      themeApplied: null,
    })

    const updateJobResult = vi.fn()
    const getSupabaseClient = vi.fn(() => {
      throw new Error("Supabase should not be requested for an idempotent apply rerun.")
    })

    await executeSiteBuildDraftJob(
      {
        id: "job-1",
        kind: "site_build_draft",
        payload: {
          prompt,
          apply: true,
        },
        result: {
          phase3: existingResult,
        },
      },
      {
        getSupabaseClient,
        updateJobResult,
      }
    )

    expect(getSupabaseClient).not.toHaveBeenCalled()
    expect(updateJobResult).not.toHaveBeenCalled()
  })
})
