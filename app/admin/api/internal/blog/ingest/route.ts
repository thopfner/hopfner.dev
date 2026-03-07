import { NextResponse } from "next/server"

import { ensureTaxonomy, slugify, textOrNull, validateIngestPayload } from "@/lib/blog/admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

async function createUniqueArticleSlug(baseInput: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  const base = slugify(baseInput)

  for (let i = 0; i < 100; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    const { data, error } = await supabase
      .from("blog_articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle<{ id: string }>()

    if (error) throw new Error(error.message)
    if (!data) return candidate
  }

  throw new Error("Unable to generate unique blog slug.")
}

export async function POST(request: Request) {
  const expectedApiKey = (process.env.BLOG_INGEST_API_KEY ?? "").trim()
  const providedApiKey = (request.headers.get("x-api-key") ?? "").trim()

  if (!expectedApiKey || providedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const parsed = validateIngestPayload(await request.json().catch(() => null))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const payload = parsed.payload

  try {
    const supabase = getSupabaseAdmin()

    const { data: existingArticle, error: existingArticleError } = await supabase
      .from("blog_articles")
      .select("id, slug")
      .eq("external_id", payload.id)
      .maybeSingle<{ id: string; slug: string }>()

    if (existingArticleError) {
      return NextResponse.json({ error: existingArticleError.message }, { status: 500 })
    }

    let articleId = existingArticle?.id ?? null
    if (!articleId) {
      const slug = await createUniqueArticleSlug(payload.title)
      const { data: insertedArticle, error: articleInsertError } = await supabase
        .from("blog_articles")
        .insert({
          external_id: payload.id,
          slug,
        })
        .select("id")
        .single<{ id: string }>()

      if (articleInsertError || !insertedArticle) {
        return NextResponse.json({ error: articleInsertError?.message ?? "Failed to create article." }, { status: 500 })
      }

      articleId = insertedArticle.id
    }

    const { data: maxVersionRow, error: maxVersionError } = await supabase
      .from("blog_article_versions")
      .select("version")
      .eq("article_id", articleId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle<{ version: number }>()

    if (maxVersionError) {
      return NextResponse.json({ error: maxVersionError.message }, { status: 500 })
    }

    const nextVersion = (maxVersionRow?.version ?? 0) + 1

    const { data: insertedVersion, error: versionInsertError } = await supabase
      .from("blog_article_versions")
      .insert({
        article_id: articleId,
        version: nextVersion,
        status: "draft",
        title: payload.title,
        excerpt: textOrNull(payload.excerpt),
        content: payload.content,
        seo_title: textOrNull(payload.seoTitle),
        seo_description: textOrNull(payload.seoDescription),
      })
      .select("id")
      .single<{ id: string }>()

    if (versionInsertError || !insertedVersion) {
      return NextResponse.json({ error: versionInsertError?.message ?? "Failed to insert article version." }, { status: 500 })
    }

    const versionId = insertedVersion.id

    const categoryRows = await ensureTaxonomy(supabase, "blog_categories", payload.categories)
    const tagRows = await ensureTaxonomy(supabase, "blog_tags", payload.tags)

    if (categoryRows.length) {
      const { error: categoryJoinError } = await supabase
        .from("blog_article_version_categories")
        .insert(categoryRows.map((c) => ({ version_id: versionId, category_id: c.id })))
      if (categoryJoinError) {
        return NextResponse.json({ error: categoryJoinError.message }, { status: 500 })
      }
    }

    if (tagRows.length) {
      const { error: tagJoinError } = await supabase
        .from("blog_article_version_tags")
        .insert(tagRows.map((t) => ({ version_id: versionId, tag_id: t.id })))
      if (tagJoinError) {
        return NextResponse.json({ error: tagJoinError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      ok: true,
      articleId,
      versionId,
      version: nextVersion,
      status: "draft",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingest failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
