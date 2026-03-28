import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import {
  buildCmsMediaStoragePath,
  finalizeCmsMediaMetadata,
  resolveCmsMediaBucket,
} from "@/lib/cms/commands/media"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_PREFIX = "image/"

function getTrimmedFormValue(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function getNumericFormValue(value: FormDataEntryValue | null): number | undefined {
  const raw = getTrimmedFormValue(value)
  if (!raw) return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const guard = await requireAdmin()
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file. Expected multipart field 'file'." },
        { status: 400 }
      )
    }

    if (!file.type.startsWith(ALLOWED_MIME_PREFIX)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 415 }
      )
    }

    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File size must be between 1 byte and ${MAX_FILE_BYTES} bytes.` },
        { status: 413 }
      )
    }

    const bucket = resolveCmsMediaBucket()
    const path = buildCmsMediaStoragePath(file.name || "upload.bin")

    const bytes = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)

    if (getTrimmedFormValue(formData.get("finalizeMetadata")) === "true") {
      const mimeType = getTrimmedFormValue(formData.get("mimeType")) ?? (file.type || "application/octet-stream")
      try {
        await finalizeCmsMediaMetadata(supabaseAdmin, {
          bucket,
          path,
          mimeType,
          sizeBytes: getNumericFormValue(formData.get("sizeBytes")) ?? file.size,
          width: getNumericFormValue(formData.get("width")) ?? null,
          height: getNumericFormValue(formData.get("height")) ?? null,
          alt: getTrimmedFormValue(formData.get("alt")),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to finalize media metadata."
        console.warn(`[CMS] Media upload metadata finalization failed for ${bucket}/${path}: ${message}`)
      }
    }

    return NextResponse.json({
      bucket,
      path,
      url: publicUrlData.publicUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
