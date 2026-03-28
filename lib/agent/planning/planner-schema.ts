export const DEFAULT_GEMINI_PLANNER_MODEL = "gemini-2.5-flash"

export const AGENT_DRAFT_PLANNER_SECTION_TYPE_IDS = [
  "nav_links",
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
  "footer_grid",
  "social_proof_strip",
  "proof_cluster",
  "case_study_split",
  "booking_scheduler",
] as const

export const AGENT_DRAFT_PLANNER_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    publishIntent: {
      type: "string",
      enum: ["draft_only", "publish_now"],
    },
    assumptions: {
      type: "array",
      items: { type: "string" },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
    unsupportedRequests: {
      type: "array",
      items: { type: "string" },
    },
    theme: {
      type: "object",
      nullable: true,
      additionalProperties: false,
      properties: {
        presetId: { type: "string", nullable: true },
        settings: { type: "object", nullable: true },
      },
    },
    pages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                sectionType: {
                  type: "string",
                  enum: [...AGENT_DRAFT_PLANNER_SECTION_TYPE_IDS],
                },
                key: { type: "string", nullable: true },
                enabled: { type: "boolean" },
                meta: { type: "object" },
                formatting: { type: "object" },
                content: { type: "object" },
                media: {
                  type: "object",
                  nullable: true,
                  additionalProperties: false,
                  properties: {
                    backgroundImage: {
                      type: "object",
                      nullable: true,
                      additionalProperties: false,
                      properties: {
                        prompt: { type: "string" },
                        alt: { type: "string", nullable: true },
                      },
                    },
                  },
                },
              },
              required: ["sectionType"],
            },
          },
        },
        required: ["slug", "title", "sections"],
      },
    },
  },
  required: ["pages"],
} as const
