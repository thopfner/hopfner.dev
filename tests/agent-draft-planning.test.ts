import { describe, expect, it } from "vitest"

import {
  AGENT_DRAFT_PROMPT_MAX_CHARS,
  buildAgentDraftPlanFromPrompt,
  summarizeAgentDraftPlan,
} from "@/lib/agent/planning/build-draft-plan"
import { AgentJobValidationError } from "@/lib/agent/jobs/errors"

function buildPrompt(body: object) {
  return `Create a draft site from this plan.\n\`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\``
}

describe("agent draft planning", () => {
  it("builds a constrained plan and summary from prompt JSON", () => {
    const plan = buildAgentDraftPlanFromPrompt(
      buildPrompt({
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: [
              {
                sectionType: "hero",
                key: "hero-main",
                meta: {
                  title: "Build faster",
                  subtitle: "Launch with confidence",
                },
                formatting: {
                  maxWidth: "max-w-5xl",
                },
                content: {
                  eyebrow: "Acme",
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
    )

    expect(plan).toEqual({
      version: "phase3.v1",
      autoPublish: false,
      pages: [
        {
          slug: "home",
          title: "Home",
          sections: [
            {
              order: 0,
              sectionType: "hero_cta",
              key: "hero-main",
              enabled: true,
              draft: {
                meta: {
                  title: "Build faster",
                  subtitle: "Launch with confidence",
                  ctaPrimaryLabel: "",
                  ctaPrimaryHref: "",
                  ctaSecondaryLabel: "",
                  ctaSecondaryHref: "",
                  backgroundMediaUrl: "",
                },
                formatting: {
                  maxWidth: "max-w-5xl",
                },
                content: {
                  eyebrow: "Acme",
                },
              },
              media: null,
            },
            {
              order: 1,
              sectionType: "faq_list",
              key: null,
              enabled: true,
              draft: {
                meta: {
                  title: "",
                  subtitle: "",
                  ctaPrimaryLabel: "",
                  ctaPrimaryHref: "",
                  ctaSecondaryLabel: "",
                  ctaSecondaryHref: "",
                  backgroundMediaUrl: "",
                },
                formatting: {},
                content: {
                  items: [],
                },
              },
              media: null,
            },
          ],
        },
      ],
      theme: {
        presetId: "modern_launch",
        settings: null,
      },
    })

    expect(summarizeAgentDraftPlan(plan)).toEqual({
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

  it("rejects unknown section types", () => {
    expect(() =>
      buildAgentDraftPlanFromPrompt(
        buildPrompt({
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [{ sectionType: "custom_magic_block" }],
            },
          ],
        })
      )
    ).toThrow(AgentJobValidationError)
  })

  it("rejects prompt text that exceeds the v1 character cap", () => {
    const tooLong = "a".repeat(AGENT_DRAFT_PROMPT_MAX_CHARS + 1)

    expect(() => buildAgentDraftPlanFromPrompt(tooLong)).toThrow(
      `Prompt text exceeds the ${AGENT_DRAFT_PROMPT_MAX_CHARS.toLocaleString()} character limit for v1 draft jobs.`
    )
  })

  it("rejects auto-publish requests", () => {
    expect(() =>
      buildAgentDraftPlanFromPrompt(
        buildPrompt({
          autoPublish: true,
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [{ sectionType: "hero_cta" }],
            },
          ],
        })
      )
    ).toThrow("Phase 3 draft plans may not enable auto-publish.")
  })

  it("rejects custom schema creation attempts", () => {
    expect(() =>
      buildAgentDraftPlanFromPrompt(
        buildPrompt({
          customSectionSchemas: {
            custom_magic_block: {},
          },
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [{ sectionType: "hero_cta" }],
            },
          ],
        })
      )
    ).toThrow("Prompt plan may not define customSectionSchemas.")

    expect(() =>
      buildAgentDraftPlanFromPrompt(
        buildPrompt({
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [
                {
                  sectionType: "hero_cta",
                  schema: { fields: [] },
                },
              ],
            },
          ],
        })
      )
    ).toThrow("Section 1 may not define schema.")
  })

  it("accepts valid media.backgroundImage instructions", () => {
    const plan = buildAgentDraftPlanFromPrompt(
      buildPrompt({
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: [
              {
                sectionType: "hero_cta",
                meta: {
                  backgroundMediaUrl: "",
                },
                media: {
                  backgroundImage: {
                    prompt: "Golden sunrise behind a clean product hero",
                    alt: "Sunrise hero background",
                  },
                },
              },
            ],
          },
        ],
      })
    )

    expect(plan.pages[0]?.sections[0]?.media).toEqual({
      backgroundImage: {
        prompt: "Golden sunrise behind a clean product hero",
        alt: "Sunrise hero background",
      },
    })
  })

  it("rejects background image prompts when backgroundMediaUrl is already set", () => {
    expect(() =>
      buildAgentDraftPlanFromPrompt(
        buildPrompt({
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [
                {
                  sectionType: "hero_cta",
                  meta: {
                    backgroundMediaUrl: "https://cdn.example.com/existing.png",
                  },
                  media: {
                    backgroundImage: {
                      prompt: "Another background image",
                    },
                  },
                },
              ],
            },
          ],
        })
      )
    ).toThrow(
      "Section 1 may not define media.backgroundImage.prompt when meta.backgroundMediaUrl is already set."
    )
  })

  it("rejects malformed media instructions", () => {
    expect(() =>
      buildAgentDraftPlanFromPrompt(
        buildPrompt({
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [
                {
                  sectionType: "hero_cta",
                  media: {
                    backgroundImage: "bad",
                  },
                },
              ],
            },
          ],
        })
      )
    ).toThrow("Section 1 media backgroundImage must be an object.")
  })
})
