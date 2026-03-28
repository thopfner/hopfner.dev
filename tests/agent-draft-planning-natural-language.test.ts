import { describe, expect, it } from "vitest"

import { AgentJobRefusalError, AgentJobValidationError } from "@/lib/agent/jobs/errors"
import {
  AGENT_DRAFT_MAX_GENERATED_IMAGES,
  AGENT_DRAFT_MAX_PAGES,
  AGENT_DRAFT_MAX_SECTIONS,
  AGENT_DRAFT_PROMPT_MAX_CHARS,
  normalizeAgentDraftPlannerStructuredOutput,
  summarizeAgentDraftPlan,
} from "@/lib/agent/planning/build-draft-plan"

describe("agent draft natural-language planner normalization", () => {
  it("normalizes structured planner output into the canonical draft plan shape", () => {
    const result = normalizeAgentDraftPlannerStructuredOutput({
      assumptions: ["Assume the site should focus on inbound leads."],
      warnings: ["Pricing details were omitted because they were not provided."],
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [
            {
              sectionType: "hero",
              key: "hero-main",
              meta: {
                title: "Automation that ships",
              },
              content: {
                eyebrow: "Hopfner",
              },
            },
            {
              sectionType: "faq_list",
              content: {
                items: [],
              },
            },
          ],
        },
      ],
      theme: {
        presetId: "modern_launch",
      },
    })

    expect(result.assumptions).toEqual(["Assume the site should focus on inbound leads."])
    expect(result.warnings).toEqual(["Pricing details were omitted because they were not provided."])
    expect(result.downgradedRequests).toEqual([])
    expect(summarizeAgentDraftPlan(result.plan)).toEqual({
      pageCount: 1,
      sectionCount: 2,
      touchedPageSlugs: ["home"],
      themePresetId: "modern_launch",
      hasThemeSettings: false,
      sectionsByPage: [
        {
          slug: "home",
          title: "Home",
          sectionCount: 2,
          sectionTypes: ["hero_cta", "faq_list"],
        },
      ],
    })
  })

  it("maps common human-readable section labels to canonical CMS ids", () => {
    const result = normalizeAgentDraftPlannerStructuredOutput({
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [
            { sectionType: "Hero" },
            { sectionType: "RichText" },
            { sectionType: "CallToAction" },
          ],
        },
      ],
    })

    expect(result.plan.pages[0]?.sections.map((section) => section.sectionType)).toEqual([
      "hero_cta",
      "rich_text_block",
      "cta_block",
    ])
  })

  it("downgrades publish-now and soft unsupported requests into warnings", () => {
    const result = normalizeAgentDraftPlannerStructuredOutput({
      publishIntent: "publish_now",
      unsupportedRequests: ["crm_sync"],
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [{ sectionType: "hero_cta" }],
        },
      ],
    })

    expect(result.downgradedRequests).toEqual(["crm_sync", "publish_now"])
    expect(result.warnings).toEqual([
      "Publish-now requests are downgraded to draft-only in v1.",
      "Unsupported request ignored: crm_sync.",
      "Unsupported request ignored: publish_now.",
    ])
    expect(result.plan.autoPublish).toBe(false)
  })

  it("refuses unsupported v1 expansion requests explicitly", () => {
    expect(() =>
      normalizeAgentDraftPlannerStructuredOutput({
        unsupportedRequests: ["custom_section_schema"],
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: [{ sectionType: "hero_cta" }],
          },
        ],
      })
    ).toThrow(AgentJobRefusalError)
  })

  it("preserves canonical validation for unsupported section types", () => {
    expect(() =>
      normalizeAgentDraftPlannerStructuredOutput({
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: [{ sectionType: "custom_magic_block" }],
          },
        ],
      })
    ).toThrow(AgentJobValidationError)
  })

  it("rejects plans that exceed the page cap", () => {
    expect(() =>
      normalizeAgentDraftPlannerStructuredOutput({
        pages: Array.from({ length: AGENT_DRAFT_MAX_PAGES + 1 }, (_, index) => ({
          slug: `page-${index + 1}`,
          title: `Page ${index + 1}`,
          sections: [{ sectionType: "hero_cta" }],
        })),
      })
    ).toThrow(`Prompt plan exceeds the v1 limit of ${AGENT_DRAFT_MAX_PAGES} pages.`)
  })

  it("rejects plans that exceed the section cap", () => {
    expect(() =>
      normalizeAgentDraftPlannerStructuredOutput({
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: Array.from({ length: AGENT_DRAFT_MAX_SECTIONS + 1 }, () => ({
              sectionType: "hero_cta",
            })),
          },
        ],
      })
    ).toThrow(`Prompt plan exceeds the v1 limit of ${AGENT_DRAFT_MAX_SECTIONS} total sections.`)
  })

  it("rejects plans that exceed the generated-image cap", () => {
    expect(() =>
      normalizeAgentDraftPlannerStructuredOutput({
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: Array.from({ length: AGENT_DRAFT_MAX_GENERATED_IMAGES + 1 }, (_, index) => ({
              sectionType: "hero_cta",
              media: {
                backgroundImage: {
                  prompt: `Scene ${index + 1}`,
                },
              },
            })),
          },
        ],
      })
    ).toThrow(
      `Prompt plan exceeds the v1 limit of ${AGENT_DRAFT_MAX_GENERATED_IMAGES} generated background images per run.`
    )
  })

  it("rejects prompts that exceed the prompt-length cap", () => {
    const tooLong = "a".repeat(AGENT_DRAFT_PROMPT_MAX_CHARS + 1)

    expect(() =>
      normalizeAgentDraftPlannerStructuredOutput({
        warnings: [tooLong],
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: [{ sectionType: "hero_cta" }],
          },
        ],
      })
    ).not.toThrow()
  })
})
