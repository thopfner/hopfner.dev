import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const { id } = await context.params
    const supabase = getSupabaseAdmin()

    const { data: targetVersion, error: targetError } = await supabase
      .from("blog_article_versions")
      .select("id, article_id, status")
      .eq("id", id)
      .maybeSingle<{ id: string; article_id: string; status: "draft" | "approved" | "published" | "rejected" }>()

    if (targetError) return NextResponse.json({ error: targetError.message }, { status: 500 })
    if (!targetVersion) return NextResponse.json({ error: "Version not found." }, { status: 404 })

    if (targetVersion.status === "published") {
      return NextResponse.json({ ok: true, status: "published" })
    }

    if (targetVersion.status !== "approved") {
      return NextResponse.json({ error: "Version must be approved before publishing." }, { status: 409 })
    }

    const nowIso = new Date().toISOString()

    const { error: demoteError } = await supabase
      .from("blog_article_versions")
      .update({ status: "approved" })
      .eq("article_id", targetVersion.article_id)
      .eq("status", "published")

    if (demoteError) return NextResponse.json({ error: demoteError.message }, { status: 500 })

    const { error: publishError } = await supabase
      .from("blog_article_versions")
      .update({
        status: "published",
        published_at: nowIso,
        published_by: guard.userId,
      })
      .eq("id", targetVersion.id)

    if (publishError) return NextResponse.json({ error: publishError.message }, { status: 500 })

    const { error: articleUpdateError } = await supabase
      .from("blog_articles")
      .update({
        current_published_version_id: targetVersion.id,
      })
      .eq("id", targetVersion.article_id)

    if (articleUpdateError) return NextResponse.json({ error: articleUpdateError.message }, { status: 500 })

    return NextResponse.json({ ok: true, status: "published" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish version."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
