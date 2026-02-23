import { getSupabasePublicClient } from "@/lib/cms/supabase"
import type {
  CmsPage,
  CmsPublishedSection,
  CmsSectionRow,
  CmsSectionType,
  CmsSectionVersionRow,
  CmsSectionTypeDefault,
  CmsSectionTypeDefaultsMap,
  TailwindWhitelist,
  SiteFormattingSettings,
} from "@/lib/cms/types"
import { normalizeSectionType } from "@/lib/cms/types"

export async function getPublishedPageBySlug(slug: string): Promise<{
  page: CmsPage
  sections: CmsPublishedSection[]
  tailwindWhitelist: TailwindWhitelist
  sectionTypeDefaults: CmsSectionTypeDefaultsMap
  siteFormattingSettings: SiteFormattingSettings
  customSectionSchemas: Record<string, Record<string, unknown>>
}> {
  const supabase = getSupabasePublicClient()

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, slug, title, bg_image_url, formatting_override")
    .eq("slug", slug)
    .single()

  if (pageError || !page) throw new Error(pageError?.message ?? `Page not found: ${slug}`)

  const { data: sectionData, error: sectionError } = await supabase
    .from("sections")
    .select("id, page_id, section_type, key, enabled, position, global_section_id, formatting_override")
    .eq("page_id", page.id)
    .eq("enabled", true)
    .order("position", { ascending: true })

  if (sectionError) throw new Error(sectionError.message)

  const sectionRows = ((sectionData ?? []) as Array<CmsSectionRow & { section_type: string }>).map((s) => {
    const normalized = normalizeSectionType(String(s.section_type))
    if (!normalized) return null
    return { ...s, section_type: normalized as CmsSectionType }
  }).filter(Boolean) as CmsSectionRow[]

  const { data: registryData, error: registryError } = await supabase
    .from("section_type_registry")
    .select("key, renderer, composer_schema, is_active")
    .eq("is_active", true)

  if (registryError) throw new Error(registryError.message)

  const registryRows = (registryData ?? []) as Array<{ key: string; renderer: string; composer_schema?: Record<string, unknown> }>

  const composedTypeKeys = new Set(
    registryRows
      .filter((r) => r.renderer === "composed")
      .map((r) => r.key)
  )

  const customSectionSchemas = registryRows.reduce((acc, row) => {
    if (row.renderer === "composed") {
      acc[row.key] = (row.composer_schema ?? {}) as Record<string, unknown>
    }
    return acc
  }, {} as Record<string, Record<string, unknown>>)

  const sectionIds = sectionRows.map((s) => s.id)
  const globalIds = Array.from(new Set(sectionRows.map((s) => s.global_section_id).filter(Boolean) as string[]))

  const localPublishedBySectionId = new Map<string, CmsSectionVersionRow>()
  if (sectionIds.length) {
    const { data, error } = await supabase
      .from("section_versions")
      .select("id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at")
      .in("section_id", sectionIds)
      .eq("status", "published")
    if (error) throw new Error(error.message)
    ;((data ?? []) as CmsSectionVersionRow[]).forEach((row) => localPublishedBySectionId.set(row.section_id, row))
  }

  const globalPublishedById = new Map<string, CmsSectionVersionRow>()
  if (globalIds.length) {
    const { data, error } = await supabase
      .from("global_section_versions")
      .select("id, global_section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at")
      .in("global_section_id", globalIds)
      .eq("status", "published")
    if (error) throw new Error(error.message)
    ;((data ?? []) as Array<CmsSectionVersionRow & { global_section_id: string }>).forEach((row) => {
      globalPublishedById.set(row.global_section_id, {
        ...row,
        section_id: row.global_section_id,
      })
    })
  }

  const sections = sectionRows
    .map((s) => {
      const localPublished = localPublishedBySectionId.get(s.id)
      const globalPublished = s.global_section_id ? globalPublishedById.get(s.global_section_id) : undefined
      const linkedToGlobal = Boolean(s.global_section_id)
      const isComposed = composedTypeKeys.has(String(s.section_type))

      const fallbackComposedPublished = {
        id: `composed:${s.id}`,
        section_id: s.id,
        version: 1,
        status: "published" as const,
        title: null,
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: {},
        content: {},
        created_at: new Date(0).toISOString(),
        published_at: new Date(0).toISOString(),
      }

      const published = linkedToGlobal
        ? (globalPublished ?? (isComposed ? fallbackComposedPublished : undefined))
        : (localPublished ?? globalPublished ?? (isComposed ? fallbackComposedPublished : undefined))

      if (!published) return null
      return {
        ...s,
        published,
        source: linkedToGlobal || !localPublished ? "global" : "page",
      } satisfies CmsPublishedSection
    })
    .filter(Boolean) as CmsPublishedSection[]

  const { data: defaultsData, error: defaultsError } = await supabase
    .from("section_type_defaults")
    .select("section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities")

  if (defaultsError) throw new Error(defaultsError.message)

  const defaultsRows = (defaultsData ?? []) as CmsSectionTypeDefault[]
  const sectionTypeDefaults = defaultsRows.reduce((acc, row) => {
    const normalized = normalizeSectionType(String(row.section_type))
    if (!normalized) return acc
    acc[normalized] = { ...row, section_type: normalized }
    return acc
  }, {} as CmsSectionTypeDefaultsMap)

  const { data: wlData, error: wlError } = await supabase.from("tailwind_class_whitelist").select("class")
  if (wlError) throw new Error(wlError.message)
  const tailwindWhitelist = new Set(((wlData ?? []) as Array<{ class: string }>).map((r) => r.class))

  const { data: siteFmtData } = await supabase
    .from("site_formatting_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle()

  return {
    page: page as CmsPage,
    sections,
    tailwindWhitelist,
    sectionTypeDefaults,
    siteFormattingSettings: (siteFmtData?.settings as SiteFormattingSettings) ?? {},
    customSectionSchemas,
  }
}
