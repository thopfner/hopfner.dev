import { NextResponse } from "next/server"

import { ensureTaxonomy, textOrNull } from "@/lib/blog/admin"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

type VersionRow = {
  id: string
  article_id: string
  version: number
  status: "draft" | "approved" | "published" | "rejected"
  title: string
  excerpt: string | null
  content: unknown
  seo_title: string | null
  seo_description: string | null
  cover_image_url: string | null
  cover_image_path: string | null
  cover_image_prompt: string | null
  rejection_reason: string | null
  created_at: string
  approved_at: string | null
  published_at: string | null
  rejected_at: string | null
}

async function loadVersion(versionId: string): Promise<{ version: VersionRow; categories: string[]; tags: string[] } | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("blog_article_versions")
    .select(
      "id, article_id, version, status, title, excerpt, content, seo_title, seo_description, cover_image_url, cover_image_path, cover_image_prompt, rejection_reason, created_at, approved_at, published_at, rejected_at"
    )
    .eq("id", versionId)
    .maybeSingle<VersionRow>()

  if (error) throw new Error(error.message)
  if (!data) return null

  const [categoryJoin, tagJoin] = await Promise.all([
    supabase
      .from("blog_article_version_categories")
      .select("blog_categories(name)")
      .eq("version_id", versionId),
    supabase
      .from("blog_article_version_tags")
      .select("blog_tags(name)")
      .eq("version_id", versionId),
  ])

  if (categoryJoin.error) throw new Error(categoryJoin.error.message)
  if (tagJoin.error) throw new Error(tagJoin.error.message)

  const categories = (categoryJoin.data ?? [])
    .flatMap((row) => {
      const value = (row as { blog_categories: { name: string } | { name: string }[] | null }).blog_categories
      if (!value) return [] as string[]
      return Array.isArray(value) ? value.map((x) => x.name) : [value.name]
    })
    .filter(Boolean)

  const tags = (tagJoin.data ?? [])
    .flatMap((row) => {
      const value = (row as { blog_tags: { name: string } | { name: string }[] | null }).blog_tags
      if (!value) return [] as string[]
      return Array.isArray(value) ? value.map((x) => x.name) : [value.name]
    })
    .filter(Boolean)

  return { version: data, categories, tags }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const { id } = await context.params
    const loaded = await loadVersion(id)
    if (!loaded) return NextResponse.json({ error: "Version not found." }, { status: 404 })

    return NextResponse.json({
      id: loaded.version.id,
      articleId: loaded.version.article_id,
      version: loaded.version.version,
      status: loaded.version.status,
      title: loaded.version.title,
      excerpt: loaded.version.excerpt,
      content: loaded.version.content,
      seoTitle: loaded.version.seo_title,
      seoDescription: loaded.version.seo_description,
      coverImageUrl: loaded.version.cover_image_url,
      coverImagePath: loaded.version.cover_image_path,
      coverImagePrompt: loaded.version.cover_image_prompt,
      rejectionReason: loaded.version.rejection_reason,
      createdAt: loaded.version.created_at,
      approvedAt: loaded.version.approved_at,
      publishedAt: loaded.version.published_at,
      rejectedAt: loaded.version.rejected_at,
      categories: loaded.categories,
      tags: loaded.tags,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load version."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const { id } = await context.params
    const supabase = getSupabaseAdmin()

    const { data: currentVersion, error: currentError } = await supabase
      .from("blog_article_versions")
      .select("id, status")
      .eq("id", id)
      .maybeSingle<{ id: string; status: string }>()

    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 })
    if (!currentVersion) return NextResponse.json({ error: "Version not found." }, { status: 404 })

    if (currentVersion.status === "published") {
      return NextResponse.json({ error: "Published versions are read-only." }, { status: 409 })
    }

    const body = (await request.json().catch(() => null)) as {
      title?: string
      excerpt?: string | null
      content?: unknown
      seoTitle?: string | null
      seoDescription?: string | null
      categories?: string[]
      tags?: string[]
      coverImageUrl?: string | null
    } | null

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const title = typeof body.title === "string" ? body.title.trim() : ""
    if (!title) {
      return NextResponse.json({ error: "title is required." }, { status: 400 })
    }

    const content = body.content
    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "content is required." }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("blog_article_versions")
      .update({
        title,
        excerpt: textOrNull(body.excerpt),
        content,
        seo_title: textOrNull(body.seoTitle),
        seo_description: textOrNull(body.seoDescription),
        cover_image_url: textOrNull(body.coverImageUrl),
      })
      .eq("id", id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    if (Array.isArray(body.categories)) {
      const categoryRows = await ensureTaxonomy(supabase, "blog_categories", body.categories)
      const { error: deleteError } = await supabase
        .from("blog_article_version_categories")
        .delete()
        .eq("version_id", id)
      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

      if (categoryRows.length) {
        const { error: insertError } = await supabase
          .from("blog_article_version_categories")
          .insert(categoryRows.map((c) => ({ version_id: id, category_id: c.id })))
        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    if (Array.isArray(body.tags)) {
      const tagRows = await ensureTaxonomy(supabase, "blog_tags", body.tags)
      const { error: deleteError } = await supabase
        .from("blog_article_version_tags")
        .delete()
        .eq("version_id", id)
      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

      if (tagRows.length) {
        const { error: insertError } = await supabase
          .from("blog_article_version_tags")
          .insert(tagRows.map((t) => ({ version_id: id, tag_id: t.id })))
        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    const loaded = await loadVersion(id)
    return NextResponse.json({ ok: true, version: loaded })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update version."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
