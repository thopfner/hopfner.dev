import type { MediaItem } from "@/lib/media/types"

type ListMediaResponse = {
  items?: MediaItem[]
  error?: string
}

export async function listMedia(params?: {
  q?: string
  limit?: number
  offset?: number
}): Promise<MediaItem[]> {
  const query = new URLSearchParams()
  if (params?.q) query.set("q", params.q)
  if (typeof params?.limit === "number") query.set("limit", String(params.limit))
  if (typeof params?.offset === "number") query.set("offset", String(params.offset))

  const suffix = query.toString() ? `?${query}` : ""
  const response = await fetch(`/admin/api/media${suffix}`, {
    method: "GET",
    cache: "no-store",
  })

  const contentType = response.headers.get("content-type") ?? ""
  const rawBody = await response.text()
  const json = contentType.includes("application/json")
    ? (JSON.parse(rawBody) as ListMediaResponse)
    : null

  if (!response.ok) {
    const message = json?.error || rawBody || `Failed to list media (${response.status})`
    throw new Error(message)
  }

  return json?.items ?? []
}
