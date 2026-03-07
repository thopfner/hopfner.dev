import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => null)) as { reason?: string } | null
    const reason = (body?.reason ?? "").trim()

    if (!reason) {
      return NextResponse.json({ error: "Rejection reason is required." }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: version, error: versionError } = await supabase
      .from("blog_article_versions")
      .select("id, status")
      .eq("id", id)
      .maybeSingle<{ id: string; status: "draft" | "approved" | "published" | "rejected" }>()

    if (versionError) return NextResponse.json({ error: versionError.message }, { status: 500 })
    if (!version) return NextResponse.json({ error: "Version not found." }, { status: 404 })

    if (version.status === "published") {
      return NextResponse.json({ error: "Published version cannot be rejected." }, { status: 409 })
    }

    const { error: updateError } = await supabase
      .from("blog_article_versions")
      .update({
        status: "rejected",
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        rejected_by: guard.userId,
      })
      .eq("id", id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ ok: true, status: "rejected" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject version."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
