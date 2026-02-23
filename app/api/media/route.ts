import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

const DEFAULT_LIMIT = 60
const MAX_LIMIT = 200

type MediaRow = {
  id: string
  bucket: string
  path: string
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  alt: string | null
  created_at: string
}

function getPublicUrl(bucket: string, path: string): string {
  const supabaseAdmin = getSupabaseAdmin()
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

function parsePagination(url: URL) {
  const rawLimit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT)
  const rawOffset = Number(url.searchParams.get("offset") ?? 0)

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT
  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0

  return { limit, offset }
}

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const url = new URL(request.url)
    const q = (url.searchParams.get("q") ?? "").trim()
    const { limit, offset } = parsePagination(url)

    let query = supabaseAdmin
      .from("media")
      .select("id, bucket, path, mime_type, size_bytes, width, height, alt, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (q) {
      query = query.ilike("path", `%${q}%`)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = ((data ?? []) as MediaRow[]).map((row) => ({
      ...row,
      url: getPublicUrl(row.bucket, row.path),
    }))

    return NextResponse.json({ items: rows })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list media."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = (await request.json().catch(() => null)) as { id?: string } | null
    const id = (body?.id ?? "").trim()
    if (!id) {
      return NextResponse.json({ error: "Missing media id." }, { status: 400 })
    }

    const { data: row, error: rowError } = await supabaseAdmin
      .from("media")
      .select("id, bucket, path")
      .eq("id", id)
      .maybeSingle<{ id: string; bucket: string; path: string }>()

    if (rowError) {
      return NextResponse.json({ error: rowError.message }, { status: 500 })
    }
    if (!row) {
      return NextResponse.json({ error: "Media not found." }, { status: 404 })
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from(row.bucket)
      .remove([row.path])

    if (storageError && !/not\s+found/i.test(storageError.message)) {
      return NextResponse.json({ error: storageError.message }, { status: 500 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from("media")
      .delete()
      .eq("id", row.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
