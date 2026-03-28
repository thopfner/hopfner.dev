import { describe, expect, it, vi } from "vitest"

import { AGENT_DRAFT_PLANNER_SECTION_TYPE_IDS } from "@/lib/agent/planning/planner-schema"
import { createGeminiDraftPlannerProvider } from "@/lib/agent/planning/providers/gemini"

describe("gemini draft planner provider", () => {
  it("requests structured JSON output and returns the parsed plan", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body))

      expect(body.generationConfig.responseMimeType).toBe("application/json")
      expect(body.generationConfig.responseJsonSchema).toBeDefined()
      expect(body.generationConfig.responseSchema).toBeUndefined()
      expect(body.generationConfig.responseJsonSchema.properties.pages.items.properties.sections.items.properties.sectionType.enum).toEqual(
        [...AGENT_DRAFT_PLANNER_SECTION_TYPE_IDS]
      )
      expect(body.contents[0].parts[0].text).toContain("User brief:")
      expect(body.contents[0].parts[0].text).toContain("Build me a consulting site")
      expect(body.contents[0].parts[0].text).toContain("hero_cta")
      expect(body.contents[0].parts[0].text).toContain("cta_block")
      expect(body.contents[0].parts[0].text).toContain(
        "Do not invent human-readable section labels like Hero, RichText, or CallToAction."
      )

      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      publishIntent: "draft_only",
                      assumptions: ["Assume a conversion-focused landing page."],
                      warnings: ["Some marketing claims were generalized."],
                      pages: [
                        {
                          slug: "home",
                          title: "Home",
                          sections: [{ sectionType: "hero_cta" }],
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as Response
    })

    const provider = createGeminiDraftPlannerProvider({
      apiKey: "test-key",
      model: "gemini-2.5-flash",
      fetch: fetchMock,
    })

    const result = await provider.planDraftSite({
      prompt: "Build me a consulting site",
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      provider: "gemini",
      model: "gemini-2.5-flash",
      structuredPlan: {
        publishIntent: "draft_only",
        assumptions: ["Assume a conversion-focused landing page."],
        warnings: ["Some marketing claims were generalized."],
        pages: [
          {
            slug: "home",
            title: "Home",
            sections: [{ sectionType: "hero_cta" }],
          },
        ],
      },
    })
  })
})
