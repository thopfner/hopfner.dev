import type { SupabaseClient } from "@supabase/supabase-js"

export type BlogIngestPayload = {
  id: string
  title: string
  excerpt?: string
  content: { blocks: unknown[] }
  seoTitle?: string
  seoDescription?: string
  categories: string[]
  tags: string[]
}

export function slugify(input: string): string {
  const base = (input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return base || "blog-post"
}

export function textOrNull(value: unknown): string | null {
  const t = typeof value === "string" ? value.trim() : ""
  return t ? t : null
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of values) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
  }
  return out
}

export async function ensureTaxonomy(
  supabase: SupabaseClient,
  table: "blog_categories" | "blog_tags",
  rawNames: string[]
): Promise<Array<{ id: string; name: string; slug: string }>> {
  const names = uniqueStrings(rawNames)
  if (!names.length) return []

  const rows = names.map((name) => ({ slug: slugify(name), name }))
  const { error: upsertError } = await supabase.from(table).upsert(rows, {
    onConflict: "slug",
    ignoreDuplicates: false,
  })
  if (upsertError) throw new Error(upsertError.message)

  const slugs = rows.map((r) => r.slug)
  const { data, error } = await supabase
    .from(table)
    .select("id, name, slug")
    .in("slug", slugs)
  if (error) throw new Error(error.message)

  return ((data ?? []) as Array<{ id: string; name: string; slug: string }>).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export function validateIngestPayload(payload: unknown): { ok: true; payload: BlogIngestPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Payload must be an object." }
  }

  const p = payload as Record<string, unknown>
  const id = typeof p.id === "string" ? p.id.trim() : ""
  const title = typeof p.title === "string" ? p.title.trim() : ""
  const content = p.content as { blocks?: unknown[] } | undefined
  const categories = Array.isArray(p.categories) ? p.categories.filter((v): v is string => typeof v === "string") : []
  const tags = Array.isArray(p.tags) ? p.tags.filter((v): v is string => typeof v === "string") : []

  if (!id) return { ok: false, error: "id is required." }
  if (!title) return { ok: false, error: "title is required." }
  if (!content || !Array.isArray(content.blocks) || !content.blocks.length) {
    return { ok: false, error: "content.blocks is required." }
  }
  if (!categories.length) return { ok: false, error: "categories must contain at least 1 value." }
  if (!tags.length) return { ok: false, error: "tags must contain at least 1 value." }

  return {
    ok: true,
    payload: {
      id,
      title,
      excerpt: typeof p.excerpt === "string" ? p.excerpt : undefined,
      content: { blocks: content.blocks },
      seoTitle: typeof p.seoTitle === "string" ? p.seoTitle : undefined,
      seoDescription: typeof p.seoDescription === "string" ? p.seoDescription : undefined,
      categories,
      tags,
    },
  }
}
