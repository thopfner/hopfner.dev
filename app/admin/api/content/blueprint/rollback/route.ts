import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { restoreFromSnapshot, type SnapshotPayload } from "@/lib/cms/blueprint-apply"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { snapshotId?: string }
    const snapshotId = (body.snapshotId ?? "").trim()

    if (!snapshotId) {
      return NextResponse.json({ error: "snapshotId is required." }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: snapshotRow, error: snapshotErr } = await supabaseAdmin
      .from("cms_content_snapshots")
      .select("id, payload")
      .eq("id", snapshotId)
      .single<{ id: string; payload: SnapshotPayload }>()

    if (snapshotErr) {
      return NextResponse.json({ error: snapshotErr.message }, { status: 404 })
    }

    await restoreFromSnapshot(supabaseAdmin, snapshotRow.payload)

    return NextResponse.json({ ok: true, restoredFromSnapshotId: snapshotRow.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rollback snapshot."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
