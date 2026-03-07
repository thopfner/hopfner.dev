export type UploadMediaResult = {
  bucket: string
  path: string
  url: string | null
}

type UploadMediaResponse = UploadMediaResult & {
  error?: string
}

export async function uploadMedia(file: File): Promise<UploadMediaResult> {
  const formData = new FormData()
  formData.set("file", file)

  const response = await fetch("/admin/api/media/upload", {
    method: "POST",
    body: formData,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const rawBody = await response.text()
  let json: UploadMediaResponse | null = null

  if (contentType.includes("application/json")) {
    try {
      json = JSON.parse(rawBody) as UploadMediaResponse
    } catch {
      json = null
    }
  }

  if (!response.ok) {
    const jsonError = json?.error?.trim()
    if (jsonError) {
      throw new Error(jsonError)
    }

    const snippet = rawBody.trim().replace(/\s+/g, " ").slice(0, 200)
    throw new Error(`Upload failed (${response.status})${snippet ? `: ${snippet}` : ""}`)
  }

  if (!json) {
    throw new Error("Upload failed: server returned a non-JSON response.")
  }

  if (!json.bucket || !json.path) {
    throw new Error("Upload failed: malformed response from server.")
  }

  return {
    bucket: json.bucket,
    path: json.path,
    url: json.url ?? null,
  }
}
