import { describe, expect, it, vi } from "vitest"

import { createGeminiGeneratedImageProvider } from "@/lib/agent/media/providers/gemini"

describe("Gemini generated image provider", () => {
  it("maps Gemini inline image data into the shared provider contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: Buffer.from("png-bytes").toString("base64"),
                  },
                },
              ],
            },
          },
        ],
      }),
    })

    const provider = createGeminiGeneratedImageProvider({
      apiKey: "test-key",
      model: "gemini-image-test",
      fetch: fetchMock as typeof fetch,
    })

    const result = await provider.generateImage({
      prompt: "Studio-lit hero image",
      alt: "Hero background",
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/gemini-image-test:generateContent?key=test-key"),
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
      })
    )
    expect(result).toMatchObject({
      mimeType: "image/png",
      filename: "generated-image.png",
      alt: "Hero background",
      provider: "gemini",
      model: "gemini-image-test",
    })
    expect(Buffer.from(result.bytes).toString()).toBe("png-bytes")
  })
})
