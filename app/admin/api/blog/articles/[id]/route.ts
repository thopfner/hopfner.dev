import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

type ArticleRow = {
  id: string
  slug: string
  current_published_version_id: string | null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const { id } = await context.params
    const articleId = (id ?? "").trim()

    if (!UUID_RE.test(articleId)) {
      return NextResponse.json({ error: "Invalid article id." }, { status: 400 })
    }

    const body = (await request.json().catch(() => null)) as { confirmSlug?: string } | null
    const confirmSlug = typeof body?.confirmSlug === "string" ? body.confirmSlug.trim() : ""

    if (!confirmSlug) {
      return NextResponse.json({ error: "confirmSlug is required." }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: article, error: articleError } = await supabase
      .from("blog_articles")
      .select("id, slug, current_published_version_id")
      .eq("id", articleId)
      .maybeSingle<ArticleRow>()

    if (articleError) {
      return NextResponse.json({ error: articleError.message }, { status: 500 })
    }

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 })
    }

    if (confirmSlug !== article.slug) {
      return NextResponse.json({ error: "Confirmation slug does not match this article." }, { status: 409 })
    }

    const { error: deleteError } = await supabase.from("blog_articles").delete().eq("id", articleId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      articleId: article.id,
      slug: article.slug,
      wasPublished: Boolean(article.current_published_version_id),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete article."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
