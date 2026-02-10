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
} from "@/lib/cms/types"
import { normalizeSectionType } from "@/lib/cms/types"

type SectionRowWithVersions = CmsSectionRow & {
  section_versions: CmsSectionVersionRow[]
}

export async function getPublishedPageBySlug(slug: string): Promise<{
  page: CmsPage
  sections: CmsPublishedSection[]
  tailwindWhitelist: TailwindWhitelist
  sectionTypeDefaults: CmsSectionTypeDefaultsMap
}> {
  const supabase = getSupabasePublicClient()

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("slug", slug)
    .single()

  if (pageError || !page) {
    throw new Error(pageError?.message ?? `Page not found: ${slug}`)
  }

  const { data: sectionData, error: sectionError } = await supabase
    .from("sections")
    .select(
      "id, page_id, section_type, key, enabled, position, section_versions!inner ( id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at )"
    )
    .eq("page_id", page.id)
    .eq("enabled", true)
    .eq("section_versions.status", "published")
    .order("position", { ascending: true })

  if (sectionError) {
    throw new Error(sectionError.message)
  }

  const sections = ((sectionData ?? []) as SectionRowWithVersions[])
    .map((s) => {
      const published = s.section_versions?.[0]
      if (!published) return null
      const normalized = normalizeSectionType(String(s.section_type))
      if (!normalized) return null
      return {
        id: s.id,
        page_id: s.page_id,
        section_type: normalized as CmsSectionType,
        key: s.key,
        enabled: s.enabled,
        position: s.position,
        published,
      } satisfies CmsPublishedSection
    })
    .filter(Boolean) as CmsPublishedSection[]

  const { data: defaultsData, error: defaultsError } = await supabase
    .from("section_type_defaults")
    .select(
      "section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"
    )

  if (defaultsError) {
    throw new Error(defaultsError.message)
  }

  const defaultsRows = (defaultsData ?? []) as CmsSectionTypeDefault[]
  const sectionTypeDefaults = defaultsRows.reduce((acc, row) => {
    const normalized = normalizeSectionType(String(row.section_type))
    if (!normalized) return acc
    acc[normalized] = { ...row, section_type: normalized }
    return acc
  }, {} as CmsSectionTypeDefaultsMap)

  const { data: wlData, error: wlError } = await supabase
    .from("tailwind_class_whitelist")
    .select("class")

  if (wlError) {
    throw new Error(wlError.message)
  }

  const rows = (wlData ?? []) as Array<{ class: string }>
  const tailwindWhitelist = new Set(rows.map((r) => r.class))

  return { page: page as CmsPage, sections, tailwindWhitelist, sectionTypeDefaults }
}
