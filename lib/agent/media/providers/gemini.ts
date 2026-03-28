import {
  AgentProviderExecutionError,
  AgentProviderUnavailableError,
} from "@/lib/agent/jobs/errors"

import type {
  GeneratedImageProvider,
  GeneratedImageProviderRequest,
  GeneratedImageProviderResult,
} from "../types"

const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image-preview"
const GEMINI_GENERATE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

type GeminiFetch = typeof fetch

type GeminiInlineData = {
  mimeType?: string
  data?: string
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: GeminiInlineData
      }>
    }
  }>
  error?: {
    message?: string
  }
}

function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    default:
      return "bin"
  }
}

function readInlineData(response: GeminiGenerateResponse): GeminiInlineData | null {
  const candidates = response.candidates ?? []
  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? []
    for (const part of parts) {
      if (part.inlineData?.data && part.inlineData.mimeType) {
        return part.inlineData
      }
    }
  }
  return null
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() ?? ""
}

export function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL
}

export function isGeminiImageGenerationConfigured() {
  return Boolean(getGeminiApiKey())
}

export function createGeminiGeneratedImageProvider(options?: {
  apiKey?: string
  model?: string
  fetch?: GeminiFetch
}): GeneratedImageProvider {
  const apiKey = options?.apiKey?.trim() || getGeminiApiKey()
  const model = options?.model?.trim() || getGeminiImageModel()
  const fetchImpl = options?.fetch ?? fetch

  return {
    name: "gemini",
    model,
    async generateImage(input: GeneratedImageProviderRequest): Promise<GeneratedImageProviderResult> {
      if (!apiKey) {
        throw new AgentProviderUnavailableError(
          "Generated background images are unavailable because GEMINI_API_KEY is not configured."
        )
      }

      const response = await fetchImpl(
        `${GEMINI_GENERATE_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: input.prompt }],
              },
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        }
      )

      const json = (await response.json().catch(() => null)) as GeminiGenerateResponse | null
      if (!response.ok) {
        throw new AgentProviderExecutionError(
          json?.error?.message ?? "Gemini image generation failed."
        )
      }

      const inlineData = json ? readInlineData(json) : null
      if (!inlineData?.data || !inlineData.mimeType) {
        throw new AgentProviderExecutionError(
          "Gemini image generation returned no image bytes."
        )
      }

      return {
        bytes: Buffer.from(inlineData.data, "base64"),
        mimeType: inlineData.mimeType,
        filename: `generated-image.${getFileExtension(inlineData.mimeType)}`,
        width: null,
        height: null,
        alt: input.alt?.trim() || null,
        provider: "gemini",
        model,
      }
    },
  }
}
