import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      globalSectionId?: string
      pageIds?: string[]
    } | null

    const globalSectionId = (body?.globalSectionId ?? "").trim()
    const pageIds = Array.isArray(body?.pageIds)
      ? [...new Set(body?.pageIds.map((v) => String(v ?? "").trim()).filter(Boolean))]
      : []

    if (!globalSectionId || !pageIds.length) {
      return NextResponse.json({ error: "globalSectionId and pageIds are required." }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: globalSection, error: globalError } = await supabase
      .from("global_sections")
      .select("id, key, section_type")
      .eq("id", globalSectionId)
      .maybeSingle<{ id: string; key: string; section_type: string }>()

    if (globalError) return NextResponse.json({ error: globalError.message }, { status: 500 })
    if (!globalSection) return NextResponse.json({ error: "Global section not found." }, { status: 404 })

    let inserted = 0
    let skipped = 0
    let failed = 0

    for (const pageId of pageIds) {
      try {
        const { data: existing, error: existingError } = await supabase
          .from("sections")
          .select("id")
          .eq("page_id", pageId)
          .eq("global_section_id", globalSectionId)
          .maybeSingle<{ id: string }>()

        if (existingError) throw new Error(existingError.message)
        if (existing) {
          skipped += 1
          continue
        }

        const { data: maxPosRow, error: maxPosError } = await supabase
          .from("sections")
          .select("position")
          .eq("page_id", pageId)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle<{ position: number }>()

        if (maxPosError) throw new Error(maxPosError.message)

        const nextPosition = (maxPosRow?.position ?? -1) + 1

        const { error: insertError } = await supabase.from("sections").insert({
          page_id: pageId,
          section_type: globalSection.section_type,
          key: globalSection.key || null,
          enabled: true,
          position: nextPosition,
          global_section_id: globalSectionId,
          formatting_override: {},
        })

        if (insertError) throw new Error(insertError.message)
        inserted += 1
      } catch {
        failed += 1
      }
    }

    return NextResponse.json({ ok: true, inserted, skipped, failed })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to attach global section."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
