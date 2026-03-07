import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

type ArticleRow = {
  id: string
  external_id: string
  slug: string
  current_published_version_id: string | null
  created_at: string
  updated_at: string
}

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
  rejection_reason: string | null
  created_at: string
  approved_at: string | null
  published_at: string | null
  rejected_at: string | null
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function asSearchText(v: VersionRow): string {
  return `${v.title ?? ""} ${v.excerpt ?? ""} ${JSON.stringify(v.content ?? {})}`.toLowerCase()
}

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabase = getSupabaseAdmin()
    const url = new URL(request.url)
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase()
    const status = (url.searchParams.get("status") ?? "").trim().toLowerCase()
    const page = clamp(Number(url.searchParams.get("page") ?? 1) || 1, 1, 10_000)
    const pageSize = clamp(Number(url.searchParams.get("pageSize") ?? 10) || 10, 1, 100)

    const { data: articleRows, error: articleError } = await supabase
      .from("blog_articles")
      .select("id, external_id, slug, current_published_version_id, created_at, updated_at")
      .order("updated_at", { ascending: false })

    if (articleError) {
      return NextResponse.json({ error: articleError.message }, { status: 500 })
    }

    const articles = (articleRows ?? []) as ArticleRow[]
    if (!articles.length) {
      return NextResponse.json({ items: [], total: 0, page, pageSize })
    }

    const articleIds = articles.map((a) => a.id)
    const { data: versionRows, error: versionError } = await supabase
      .from("blog_article_versions")
      .select(
        "id, article_id, version, status, title, excerpt, content, seo_title, seo_description, cover_image_url, rejection_reason, created_at, approved_at, published_at, rejected_at"
      )
      .in("article_id", articleIds)
      .order("article_id", { ascending: true })
      .order("version", { ascending: false })

    if (versionError) {
      return NextResponse.json({ error: versionError.message }, { status: 500 })
    }

    const latestByArticle = new Map<string, VersionRow>()
    for (const row of (versionRows ?? []) as VersionRow[]) {
      if (!latestByArticle.has(row.article_id)) latestByArticle.set(row.article_id, row)
    }

    let merged = articles
      .map((article) => {
        const latest = latestByArticle.get(article.id)
        if (!latest) return null
        return {
          articleId: article.id,
          externalId: article.external_id,
          slug: article.slug,
          currentPublishedVersionId: article.current_published_version_id,
          latest,
          searchText: asSearchText(latest),
          updatedAt: article.updated_at,
          createdAt: article.created_at,
        }
      })
      .filter(Boolean) as Array<{
      articleId: string
      externalId: string
      slug: string
      currentPublishedVersionId: string | null
      latest: VersionRow
      searchText: string
      updatedAt: string
      createdAt: string
    }>

    if (status) {
      merged = merged.filter((item) => item.latest.status === status)
    }
    if (q) {
      merged = merged.filter((item) => item.searchText.includes(q))
    }

    const total = merged.length
    const start = (page - 1) * pageSize
    const paged = merged.slice(start, start + pageSize)

    const versionIds = paged.map((item) => item.latest.id)

    const [categoryJoin, tagJoin] = await Promise.all([
      versionIds.length
        ? supabase
            .from("blog_article_version_categories")
            .select("version_id, blog_categories(name)")
            .in("version_id", versionIds)
        : Promise.resolve({ data: [], error: null }),
      versionIds.length
        ? supabase
            .from("blog_article_version_tags")
            .select("version_id, blog_tags(name)")
            .in("version_id", versionIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (categoryJoin.error) {
      return NextResponse.json({ error: categoryJoin.error.message }, { status: 500 })
    }
    if (tagJoin.error) {
      return NextResponse.json({ error: tagJoin.error.message }, { status: 500 })
    }

    const categoriesByVersion = new Map<string, string[]>()
    for (const row of (categoryJoin.data ?? []) as Array<{ version_id: string; blog_categories: { name: string } | { name: string }[] | null }>) {
      const current = categoriesByVersion.get(row.version_id) ?? []
      const names = Array.isArray(row.blog_categories)
        ? row.blog_categories.map((x) => x.name)
        : row.blog_categories?.name
          ? [row.blog_categories.name]
          : []
      categoriesByVersion.set(row.version_id, [...current, ...names])
    }

    const tagsByVersion = new Map<string, string[]>()
    for (const row of (tagJoin.data ?? []) as Array<{ version_id: string; blog_tags: { name: string } | { name: string }[] | null }>) {
      const current = tagsByVersion.get(row.version_id) ?? []
      const names = Array.isArray(row.blog_tags)
        ? row.blog_tags.map((x) => x.name)
        : row.blog_tags?.name
          ? [row.blog_tags.name]
          : []
      tagsByVersion.set(row.version_id, [...current, ...names])
    }

    const items = paged.map((item) => ({
      articleId: item.articleId,
      externalId: item.externalId,
      slug: item.slug,
      currentPublishedVersionId: item.currentPublishedVersionId,
      versionId: item.latest.id,
      version: item.latest.version,
      status: item.latest.status,
      title: item.latest.title,
      excerpt: item.latest.excerpt,
      content: item.latest.content,
      seoTitle: item.latest.seo_title,
      seoDescription: item.latest.seo_description,
      coverImageUrl: item.latest.cover_image_url,
      rejectionReason: item.latest.rejection_reason,
      createdAt: item.latest.created_at,
      approvedAt: item.latest.approved_at,
      publishedAt: item.latest.published_at,
      rejectedAt: item.latest.rejected_at,
      articleUpdatedAt: item.updatedAt,
      categories: categoriesByVersion.get(item.latest.id) ?? [],
      tags: tagsByVersion.get(item.latest.id) ?? [],
    }))

    return NextResponse.json({ items, total, page, pageSize })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load articles."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
