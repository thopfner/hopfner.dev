import { beforeEach, describe, expect, it, vi } from "vitest"

const requireAdminMock = vi.fn()
const getSupabaseAdminMock = vi.fn()
const finalizeCmsMediaMetadataMock = vi.fn()

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdminMock(),
}))

vi.mock("@/lib/supabase/server-admin", () => ({
  getSupabaseAdmin: () => getSupabaseAdminMock(),
}))

vi.mock("@/lib/cms/commands/media", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms/commands/media")>(
    "@/lib/cms/commands/media"
  )
  return {
    ...actual,
    finalizeCmsMediaMetadata: (...args: unknown[]) => finalizeCmsMediaMetadataMock(...args),
  }
})

function buildRequest() {
  const formData = new FormData()
  const file = new File(["image-bytes"], "hero.png", { type: "image/png" })
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("image-bytes").buffer,
  })
  formData.set("file", file)
  formData.set("finalizeMetadata", "true")
  formData.set("mimeType", "image/png")
  formData.set("sizeBytes", "11")
  formData.set("width", "1280")
  formData.set("height", "720")
  formData.set("alt", "Homepage hero")

  return {
    formData: async () => formData,
  } as unknown as Request
}

describe("POST /admin/api/media/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    requireAdminMock.mockResolvedValue({ ok: true })
    getSupabaseAdminMock.mockReturnValue({
      storage: {
        from: () => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: "https://cdn.example.com/cms/hero.png" },
          }),
        }),
      },
    })
    finalizeCmsMediaMetadataMock.mockResolvedValue({ id: "media-1" })
  })

  it("routes media metadata finalization through the shared command", async () => {
    const { POST } = await import("@/app/admin/api/media/upload/route")

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      bucket: "cms-media",
      path: expect.stringMatching(/^cms\/\d{4}\/\d{2}\//),
      url: "https://cdn.example.com/cms/hero.png",
    })

    expect(finalizeCmsMediaMetadataMock).toHaveBeenCalledWith(
      getSupabaseAdminMock.mock.results[0]?.value,
      {
        bucket: "cms-media",
        path: json.path,
        mimeType: "image/png",
        sizeBytes: 11,
        width: 1280,
        height: 720,
        alt: "Homepage hero",
      }
    )
  })

  it("keeps upload success non-fatal when metadata finalization fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    finalizeCmsMediaMetadataMock.mockRejectedValueOnce(new Error("metadata insert failed"))

    const { POST } = await import("@/app/admin/api/media/upload/route")

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      bucket: "cms-media",
      path: expect.stringMatching(/^cms\/\d{4}\/\d{2}\//),
      url: "https://cdn.example.com/cms/hero.png",
    })
    expect(finalizeCmsMediaMetadataMock).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Media upload metadata finalization failed")
    )

    warnSpy.mockRestore()
  })

  it("preserves the upload response shape when metadata finalization is not requested", async () => {
    const formData = new FormData()
    const file = new File(["image-bytes"], "hero.png", { type: "image/png" })
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new TextEncoder().encode("image-bytes").buffer,
    })
    formData.set("file", file)

    const { POST } = await import("@/app/admin/api/media/upload/route")

    const response = await POST({
      formData: async () => formData,
    } as unknown as Request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      bucket: "cms-media",
      path: expect.stringMatching(/^cms\/\d{4}\/\d{2}\//),
      url: "https://cdn.example.com/cms/hero.png",
    })
    expect(finalizeCmsMediaMetadataMock).not.toHaveBeenCalled()
  })
})
