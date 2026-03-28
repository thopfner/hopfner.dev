import type { SupabaseClient } from "@supabase/supabase-js"

const RESERVED_PAGE_SLUGS = new Set(["admin", "_next", "api", "well-known"])

export type CreateCmsPageInput = {
  slug: string
  title: string
}

export type CreateCmsPageResult = {
  id: string
  slug: string
  title: string
}

export type EnsureCmsPageInput = CreateCmsPageInput
export type EnsureCmsPageResult = CreateCmsPageResult

export function normalizeCmsPageSlug(raw: string) {
  return raw.trim().toLowerCase()
}

export function validateCmsPageSlug(raw: string) {
  const slug = raw.trim()
  if (!slug) return "Slug is required."
  if (slug !== slug.toLowerCase()) return "Slug must be lowercase."
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug must use only a-z, 0-9, and hyphens (no spaces)."
  }
  if (RESERVED_PAGE_SLUGS.has(slug)) return `Slug "${slug}" is reserved.`
  return null
}

export async function createCmsPage(
  supabase: SupabaseClient,
  input: CreateCmsPageInput
): Promise<CreateCmsPageResult> {
  const slug = normalizeCmsPageSlug(input.slug)
  const title = input.title.trim()

  const slugError = validateCmsPageSlug(slug)
  if (slugError) {
    throw new Error(slugError)
  }

  if (!title) {
    throw new Error("Title is required.")
  }

  const { data, error } = await supabase
    .from("pages")
    .insert({ slug, title })
    .select("id, slug, title")
    .single<CreateCmsPageResult>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create page.")
  }

  return data
}

export async function ensureCmsPage(
  supabase: SupabaseClient,
  input: EnsureCmsPageInput
): Promise<EnsureCmsPageResult> {
  const slug = normalizeCmsPageSlug(input.slug)
  const title = input.title.trim()

  const slugError = validateCmsPageSlug(slug)
  if (slugError) {
    throw new Error(slugError)
  }

  if (!title) {
    throw new Error("Title is required.")
  }

  const { data: existing, error: existingError } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("slug", slug)
    .maybeSingle<EnsureCmsPageResult>()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (!existing) {
    return createCmsPage(supabase, { slug, title })
  }

  if (existing.title === title) {
    return existing
  }

  const { data, error } = await supabase
    .from("pages")
    .update({ title })
    .eq("id", existing.id)
    .select("id, slug, title")
    .single<EnsureCmsPageResult>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update page.")
  }

  return data
}
