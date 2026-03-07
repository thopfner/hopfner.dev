import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { BLUEPRINT_PAGES, BLUEPRINT_SOURCE_PATH } from "@/lib/cms/blueprint-content"
import {
  applyBlueprintContent,
  buildBlueprintPlan,
  captureSnapshot,
} from "@/lib/cms/blueprint-apply"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

const SOURCE_NAME = "hopfner-dev-website-blueprint"

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    return NextResponse.json({
      ok: true,
      mode: "plan",
      sourcePath: BLUEPRINT_SOURCE_PATH,
      plan: buildBlueprintPlan(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build blueprint plan."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { dryRun?: boolean; label?: string }
    const dryRun = Boolean(body?.dryRun)

    const pageSlugs = BLUEPRINT_PAGES.map((p) => p.slug)

    if (dryRun) {
      return NextResponse.json({ ok: true, mode: "dry-run", plan: buildBlueprintPlan(), pageSlugs })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const snapshotPayload = await captureSnapshot(supabaseAdmin, pageSlugs)

    const { data: snapshotInsert, error: snapshotErr } = await supabaseAdmin
      .from("cms_content_snapshots")
      .insert({
        source: SOURCE_NAME,
        label: body?.label?.trim() || "Pre-blueprint apply snapshot",
        target_page_slugs: pageSlugs,
        payload: snapshotPayload,
        created_by: guard.userId,
      })
      .select("id, created_at")
      .single<{ id: string; created_at: string }>()

    if (snapshotErr) {
      throw new Error(`Snapshot failed: ${snapshotErr.message}`)
    }

    await applyBlueprintContent(supabaseAdmin, BLUEPRINT_PAGES)

    return NextResponse.json({
      ok: true,
      mode: "applied",
      snapshotId: snapshotInsert.id,
      snapshotCreatedAt: snapshotInsert.created_at,
      pageSlugs,
      appliedPageCount: BLUEPRINT_PAGES.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply blueprint content."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
