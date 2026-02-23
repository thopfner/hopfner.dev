type DeleteMediaResponse = {
  ok?: boolean
  error?: string
}

export async function deleteMedia(id: string): Promise<void> {
  const response = await fetch("/admin/api/media", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  })

  const contentType = response.headers.get("content-type") ?? ""
  const rawBody = await response.text()
  const json = contentType.includes("application/json")
    ? (JSON.parse(rawBody) as DeleteMediaResponse)
    : null

  if (!response.ok) {
    const message = json?.error || rawBody || `Failed to delete media (${response.status})`
    throw new Error(message)
  }
}
