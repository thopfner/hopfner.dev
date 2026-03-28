import { beforeEach, describe, expect, it, vi } from "vitest"

import type { GeneratedImageProvider } from "@/lib/agent/media/types"

const finalizeCmsMediaMetadataMock = vi.fn()

vi.mock("@/lib/cms/commands/media", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms/commands/media")>(
    "@/lib/cms/commands/media"
  )
  return {
    ...actual,
    finalizeCmsMediaMetadata: (...args: unknown[]) => finalizeCmsMediaMetadataMock(...args),
  }
})

function createStorageMock(options?: {
  uploadError?: string | null
  removeError?: string | null
}) {
  const upload = vi.fn().mockResolvedValue({
    error: options?.uploadError ? { message: options.uploadError } : null,
  })
  const remove = vi.fn().mockResolvedValue({
    error: options?.removeError ? { message: options.removeError } : null,
  })
  const getPublicUrl = vi.fn().mockReturnValue({
    data: { publicUrl: "https://cdn.example.com/cms/generated.png" },
  })

  return {
    upload,
    remove,
    getPublicUrl,
  }
}

function createSupabaseMock(storageMethods: ReturnType<typeof createStorageMock>) {
  return {
    storage: {
      from: vi.fn().mockReturnValue(storageMethods),
    },
  }
}

function createProvider(overrides?: Partial<Awaited<ReturnType<GeneratedImageProvider["generateImage"]>>>) {
  return {
    name: "test-provider",
    model: "test-model",
    generateImage: vi.fn().mockResolvedValue({
      bytes: Buffer.from("generated-bytes"),
      mimeType: "image/png",
      filename: "generated-image.png",
      width: 1280,
      height: 720,
      alt: "Generated hero",
      provider: "test-provider",
      model: "test-model",
      ...overrides,
    }),
  } satisfies GeneratedImageProvider
}

describe("registerGeneratedImage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uploads bytes, registers media, and returns the library-facing asset info", async () => {
    const { registerGeneratedImage } = await import("@/lib/agent/media/register-generated-image")

    const storage = createStorageMock()
    const supabase = createSupabaseMock(storage)
    const provider = createProvider()
    finalizeCmsMediaMetadataMock.mockResolvedValue({
      id: "media-1",
      bucket: "cms-media",
      path: "cms/2026/03/generated-image.png",
      mime_type: "image/png",
      size_bytes: 15,
      width: 1280,
      height: 720,
      alt: "Generated hero",
    })

    const result = await registerGeneratedImage(supabase as never, {
      prompt: "Generate a launch page hero image",
      alt: "Generated hero",
      provider,
    })

    expect(provider.generateImage).toHaveBeenCalledWith({
      prompt: "Generate a launch page hero image",
      alt: "Generated hero",
    })
    expect(storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^cms\/\d{4}\/\d{2}\//),
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "image/png",
        upsert: false,
      })
    )
    expect(finalizeCmsMediaMetadataMock).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bucket: "cms-media",
        mimeType: "image/png",
        sizeBytes: Buffer.from("generated-bytes").byteLength,
        width: 1280,
        height: 720,
        alt: "Generated hero",
      })
    )
    expect(result).toMatchObject({
      id: "media-1",
      bucket: "cms-media",
      url: "https://cdn.example.com/cms/generated.png",
      mimeType: "image/png",
      provider: "test-provider",
      model: "test-model",
    })
  })

  it("surfaces provider failures before any storage upload occurs", async () => {
    const { registerGeneratedImage } = await import("@/lib/agent/media/register-generated-image")

    const storage = createStorageMock()
    const supabase = createSupabaseMock(storage)
    const provider = {
      name: "test-provider",
      model: "test-model",
      generateImage: vi.fn().mockRejectedValue(new Error("provider exploded")),
    } satisfies GeneratedImageProvider

    await expect(
      registerGeneratedImage(supabase as never, {
        prompt: "Generate image",
        provider,
      })
    ).rejects.toThrow("provider exploded")

    expect(storage.upload).not.toHaveBeenCalled()
    expect(finalizeCmsMediaMetadataMock).not.toHaveBeenCalled()
  })

  it("does not insert media rows when storage upload fails", async () => {
    const { registerGeneratedImage } = await import("@/lib/agent/media/register-generated-image")

    const storage = createStorageMock({ uploadError: "storage failed" })
    const supabase = createSupabaseMock(storage)
    const provider = createProvider()

    await expect(
      registerGeneratedImage(supabase as never, {
        prompt: "Generate image",
        provider,
      })
    ).rejects.toThrow("storage failed")

    expect(finalizeCmsMediaMetadataMock).not.toHaveBeenCalled()
    expect(storage.remove).not.toHaveBeenCalled()
  })

  it("cleans up the uploaded object when media registration fails", async () => {
    const { registerGeneratedImage } = await import("@/lib/agent/media/register-generated-image")

    const storage = createStorageMock()
    const supabase = createSupabaseMock(storage)
    const provider = createProvider()
    finalizeCmsMediaMetadataMock.mockRejectedValue(new Error("media insert failed"))

    await expect(
      registerGeneratedImage(supabase as never, {
        prompt: "Generate image",
        provider,
      })
    ).rejects.toThrow("media insert failed")

    expect(storage.remove).toHaveBeenCalledWith([
      expect.stringMatching(/^cms\/\d{4}\/\d{2}\//),
    ])
  })
})
