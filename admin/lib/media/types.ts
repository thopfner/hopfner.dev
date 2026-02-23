export type MediaItem = {
  id: string
  bucket: string
  path: string
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  alt: string | null
  created_at: string
  url: string
}
