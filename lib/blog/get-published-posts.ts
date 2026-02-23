import { getSupabasePublicClient } from "@/lib/cms/supabase"
import type { BlogPublishedPost, BlogTaxonomy } from "@/lib/blog/types"

type ListParams = {
  page: number
  pageSize: number
  q?: string
  tag?: string
  category?: string
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
  const tag = (params.tag ?? "").trim().toLowerCase()
  const category = (params.category ?? "").trim().toLowerCase()

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

  if (tag) {
    query = query.contains("tag_slugs", [tag])
  }

  if (category) {
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
    .from("blog_tags")
    .select("id, slug, name")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as BlogTaxonomy[]
}

export async function listBlogCategories(): Promise<BlogTaxonomy[]> {
  const supabase = getSupabasePublicClient()
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, slug, name")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as BlogTaxonomy[]
}
