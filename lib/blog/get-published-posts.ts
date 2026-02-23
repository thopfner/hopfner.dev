import { getSupabasePublicClient } from "@/lib/cms/supabase"
import type { BlogPublishedPost, BlogTaxonomy } from "@/lib/blog/types"

type ListParams = {
  page: number
  pageSize: number
  q?: string
  tag?: string | string[]
  category?: string | string[]
}

function normalizeToSlugArray(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value : value ? [value] : []

  return Array.from(
    new Set(
      raw
        .flatMap((entry) => entry.split(","))
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

export async function listPublishedBlogPosts(params: ListParams): Promise<{
  items: BlogPublishedPost[]
  total: number
  page: number
  pageSize: number
}> {
  const page = Number.isFinite(params.page) && params.page > 0 ? Math.floor(params.page) : 1
  const pageSize = Number.isFinite(params.pageSize) && params.pageSize > 0 ? Math.min(Math.floor(params.pageSize), 50) : 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const q = (params.q ?? "").trim()
  const tags = normalizeToSlugArray(params.tag)
  const categories = normalizeToSlugArray(params.category)

  const supabase = getSupabasePublicClient()

  let query = supabase
    .from("blog_published_posts")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .range(from, to)

  if (q) {
    query = query.ilike("search_text", `%${q}%`)
  }

  for (const tag of tags) {
    query = query.contains("tag_slugs", [tag])
  }

  for (const category of categories) {
    query = query.contains("category_slugs", [category])
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  return {
    items: (data ?? []) as BlogPublishedPost[],
    total: count ?? 0,
    page,
    pageSize,
  }
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPublishedPost | null> {
  const safeSlug = slug.trim().toLowerCase()
  if (!safeSlug) return null

  const supabase = getSupabasePublicClient()

  const { data, error } = await supabase
    .from("blog_published_posts")
    .select("*")
    .eq("slug", safeSlug)
    .maybeSingle<BlogPublishedPost>()

  if (error) throw new Error(error.message)
  return data ?? null
}

export async function listBlogTags(): Promise<BlogTaxonomy[]> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase
    .from("blog_published_posts")
    .select("tag_slugs, tag_names")

  if (error) throw new Error(error.message)

  const map = new Map<string, string>()

  for (const row of (data ?? []) as Array<{ tag_slugs: string[] | null; tag_names: string[] | null }>) {
    const slugs = Array.isArray(row.tag_slugs) ? row.tag_slugs : []
    const names = Array.isArray(row.tag_names) ? row.tag_names : []

    for (let i = 0; i < slugs.length; i += 1) {
      const slug = (slugs[i] ?? "").trim().toLowerCase()
      if (!slug) continue
      const name = (names[i] ?? slug).trim() || slug
      if (!map.has(slug)) map.set(slug, name)
    }
  }

  return Array.from(map.entries())
    .map(([slug, name]) => ({ id: slug, slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listBlogCategories(): Promise<BlogTaxonomy[]> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase
    .from("blog_published_posts")
    .select("category_slugs, category_names")

  if (error) throw new Error(error.message)

  const map = new Map<string, string>()

  for (const row of (data ?? []) as Array<{ category_slugs: string[] | null; category_names: string[] | null }>) {
    const slugs = Array.isArray(row.category_slugs) ? row.category_slugs : []
    const names = Array.isArray(row.category_names) ? row.category_names : []

    for (let i = 0; i < slugs.length; i += 1) {
      const slug = (slugs[i] ?? "").trim().toLowerCase()
      if (!slug) continue
      const name = (names[i] ?? slug).trim() || slug
      if (!map.has(slug)) map.set(slug, name)
    }
  }

  return Array.from(map.entries())
    .map(([slug, name]) => ({ id: slug, slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
