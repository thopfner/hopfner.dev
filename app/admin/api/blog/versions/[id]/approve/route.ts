import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { generateBlogCoverImage } from "@/lib/blog/gemini-image"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const { id } = await context.params
    const supabase = getSupabaseAdmin()

    const { data: version, error: versionError } = await supabase
      .from("blog_article_versions")
      .select("id, article_id, status, title, excerpt, cover_image_url")
      .eq("id", id)
      .maybeSingle<{
        id: string
        article_id: string
        status: "draft" | "approved" | "published" | "rejected"
        title: string
        excerpt: string | null
        cover_image_url: string | null
      }>()

    if (versionError) return NextResponse.json({ error: versionError.message }, { status: 500 })
    if (!version) return NextResponse.json({ error: "Version not found." }, { status: 404 })

    if (version.status === "published") {
      return NextResponse.json({ error: "Version already published." }, { status: 409 })
    }

    let coverPatch: Record<string, unknown> = {}
    if (!version.cover_image_url) {
      try {
        const generated = await generateBlogCoverImage({
          title: version.title,
          excerpt: version.excerpt,
          versionId: version.id,
        })
        if (generated) {
          coverPatch = {
            cover_image_url: generated.url,
            cover_image_path: generated.path,
            cover_image_prompt: generated.prompt,
          }
        }
      } catch (e) {
        console.warn("[blog] cover generation failed (non-blocking)", e)
      }
    }

    const { error: updateError } = await supabase
      .from("blog_article_versions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: guard.userId,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
        ...coverPatch,
      })
      .eq("id", id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ ok: true, status: "approved" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve version."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
