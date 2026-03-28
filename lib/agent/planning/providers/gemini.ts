import {
  AGENT_DRAFT_PLANNER_RESPONSE_SCHEMA,
  AGENT_DRAFT_PLANNER_SECTION_TYPE_IDS,
  DEFAULT_GEMINI_PLANNER_MODEL,
} from "../planner-schema"
import {
  AgentProviderExecutionError,
  AgentProviderUnavailableError,
} from "../../jobs/errors"
import type {
  AgentDraftPlannerProvider,
  AgentDraftPlannerProviderResult,
  AgentDraftPlannerRequest,
  AgentDraftPlannerStructuredOutput,
} from "../types"

const GEMINI_GENERATE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

type GeminiFetch = typeof fetch

type GeminiStructuredResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

function getGeminiPlannerApiKey() {
  return process.env.GEMINI_API_KEY?.trim() ?? ""
}

export function getGeminiPlannerModel() {
  return process.env.GEMINI_PLANNER_MODEL?.trim() || DEFAULT_GEMINI_PLANNER_MODEL
}

export function isGeminiPlannerConfigured() {
  return Boolean(getGeminiPlannerApiKey())
}

function buildPlanningInstruction(prompt: string) {
  const sectionList = AGENT_DRAFT_PLANNER_SECTION_TYPE_IDS.join(", ")

  return [
    "Convert the user's natural-language website brief into a constrained CMS draft plan.",
    "Use only existing built-in section types.",
    `For every section, sectionType must be one of these exact CMS IDs: ${sectionList}.`,
    "Do not invent human-readable section labels like Hero, RichText, or CallToAction. Emit the exact CMS IDs instead.",
    "Never request auto-publish, custom section schema creation, registry mutation, arbitrary code generation, or public worker endpoints.",
    "If the brief asks for unsupported capabilities, record them in unsupportedRequests and keep the plan draft-safe.",
    "Return JSON only.",
    "User brief:",
    prompt,
  ].join("\n\n")
}

function readStructuredText(response: GeminiStructuredResponse): string | null {
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text
      }
    }
  }
  return null
}

export function createGeminiDraftPlannerProvider(options?: {
  apiKey?: string
  model?: string
  fetch?: GeminiFetch
}): AgentDraftPlannerProvider {
  const apiKey = options?.apiKey?.trim() || getGeminiPlannerApiKey()
  const model = options?.model?.trim() || getGeminiPlannerModel()
  const fetchImpl = options?.fetch ?? fetch

  return {
    name: "gemini",
    model,
    async planDraftSite(
      input: AgentDraftPlannerRequest
    ): Promise<AgentDraftPlannerProviderResult> {
      if (!apiKey) {
        throw new AgentProviderUnavailableError(
          "Natural-language planning is unavailable because GEMINI_API_KEY is not configured."
        )
      }

      const response = await fetchImpl(
        `${GEMINI_GENERATE_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: buildPlanningInstruction(input.prompt) }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseJsonSchema: AGENT_DRAFT_PLANNER_RESPONSE_SCHEMA,
            },
          }),
        }
      )

      const json = (await response.json().catch(() => null)) as GeminiStructuredResponse | null
      if (!response.ok) {
        throw new AgentProviderExecutionError(
          json?.error?.message ?? "Gemini planner generation failed."
        )
      }

      const text = json ? readStructuredText(json) : null
      if (!text) {
        throw new AgentProviderExecutionError("Gemini planner returned no structured plan text.")
      }

      let structuredPlan: AgentDraftPlannerStructuredOutput
      try {
        structuredPlan = JSON.parse(text) as AgentDraftPlannerStructuredOutput
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid JSON."
        throw new AgentProviderExecutionError(`Gemini planner returned invalid JSON: ${message}`)
      }

      return {
        provider: "gemini",
        model,
        structuredPlan,
      }
    },
  }
}
