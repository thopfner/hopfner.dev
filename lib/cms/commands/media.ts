import type { SupabaseClient } from "@supabase/supabase-js"

const DEFAULT_CMS_MEDIA_BUCKET = "cms-media"

export function sanitizeCmsMediaFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export function getCmsMediaYearMonthParts(date = new Date()): { year: string; month: string } {
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return { year, month }
}

export function resolveCmsMediaBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_CMS_MEDIA_BUCKET
}

function buildMediaUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }

  return `media-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function buildCmsMediaStoragePath(filename: string, date = new Date()): string {
  const { year, month } = getCmsMediaYearMonthParts(date)
  const safeFilename = sanitizeCmsMediaFilename(filename || "upload.bin")
  return `cms/${year}/${month}/${buildMediaUuid()}-${safeFilename}`
}

export type FinalizeCmsMediaMetadataInput = {
  bucket: string
  path: string
  mimeType: string
  sizeBytes: number
  width?: number | null
  height?: number | null
  alt?: string | null
}

export type FinalizeCmsMediaMetadataResult = {
  id: string
  bucket: string
  path: string
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  alt: string | null
}

export async function finalizeCmsMediaMetadata(
  supabase: SupabaseClient,
  input: FinalizeCmsMediaMetadataInput
): Promise<FinalizeCmsMediaMetadataResult> {
  const { data, error } = await supabase
    .from("media")
    .insert({
      bucket: input.bucket,
      path: input.path,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
      alt: input.alt ?? null,
    })
    .select("id, bucket, path, mime_type, size_bytes, width, height, alt")
    .single<FinalizeCmsMediaMetadataResult>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to finalize media metadata.")
  }

  return data
}
