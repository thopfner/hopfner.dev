import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_PREFIX = "image/"

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

function getYearMonthParts(date = new Date()): { year: string; month: string } {
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return { year, month }
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

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "cms-media"
    const { year, month } = getYearMonthParts()
    const safeFilename = sanitizeFilename(file.name || "upload.bin")
    const path = `cms/${year}/${month}/${crypto.randomUUID()}-${safeFilename}`

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
