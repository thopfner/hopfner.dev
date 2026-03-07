import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

type PageRow = {
  id: string
  slug: string
  title: string
  updated_at: string
}

type SectionRow = {
  id: string
  page_id: string
  global_section_id: string | null
  section_type: string
  enabled: boolean
}

type SectionVersionRow = {
  section_id: string
  status: "draft" | "published" | "archived"
  version: number
}

type GlobalSectionVersionRow = {
  global_section_id: string
  status: "draft" | "published" | "archived"
  version: number
}

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: pagesData, error: pagesError } = await supabase
      .from("pages")
      .select("id, slug, title, updated_at")
      .order("slug", { ascending: true })

    if (pagesError) {
      return NextResponse.json({ error: pagesError.message }, { status: 500 })
    }

    const pages = (pagesData ?? []) as PageRow[]
    if (!pages.length) {
      return NextResponse.json({
        pages: [],
        counts: { total_pages_count: 0, published_pages_count: 0, unpublished_pages_count: 0 },
      })
    }

    const pageIds = pages.map((p) => p.id)

    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("id, page_id, global_section_id, section_type, enabled")
      .in("page_id", pageIds)

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }

    const sections = (sectionsData ?? []) as SectionRow[]
    const sectionIds = sections.map((s) => s.id)
    const globalSectionIds = [...new Set(sections.map((s) => s.global_section_id).filter(Boolean) as string[])]
    const [sectionVersionsRes, globalSectionVersionsRes] = await Promise.all([
      sectionIds.length
        ? supabase
            .from("section_versions")
            .select("section_id, status, version")
            .in("section_id", sectionIds)
            .in("status", ["draft", "published"])
        : Promise.resolve({ data: [], error: null }),
      globalSectionIds.length
        ? supabase
            .from("global_section_versions")
            .select("global_section_id, status, version")
            .in("global_section_id", globalSectionIds)
            .in("status", ["draft", "published"])
        : Promise.resolve({ data: [], error: null }),
    ])

    if (sectionVersionsRes.error) {
      return NextResponse.json({ error: sectionVersionsRes.error.message }, { status: 500 })
    }
    if (globalSectionVersionsRes.error) {
      return NextResponse.json({ error: globalSectionVersionsRes.error.message }, { status: 500 })
    }

    const sectionVersions = (sectionVersionsRes.data ?? []) as SectionVersionRow[]
    const globalSectionVersions = (globalSectionVersionsRes.data ?? []) as GlobalSectionVersionRow[]

    // Fetch active composed types from registry — these can render without version rows
    const { data: registryData } = await supabase
      .from("section_type_registry")
      .select("key")
      .eq("is_active", true)
      .eq("renderer", "composed")

    const composedTypeKeys = new Set(
      ((registryData ?? []) as Array<{ key: string }>).map((r) => r.key)
    )

    const publishedBySection = new Map<string, number>()
    const draftBySection = new Map<string, number>()
    for (const row of sectionVersions) {
      if (row.status === "published") {
        const prev = publishedBySection.get(row.section_id) ?? -1
        if (row.version > prev) publishedBySection.set(row.section_id, row.version)
      }
      if (row.status === "draft") {
        const prev = draftBySection.get(row.section_id) ?? -1
        if (row.version > prev) draftBySection.set(row.section_id, row.version)
      }
    }

    const publishedByGlobalSection = new Map<string, number>()
    const draftByGlobalSection = new Map<string, number>()
    for (const row of globalSectionVersions) {
      if (row.status === "published") {
        const prev = publishedByGlobalSection.get(row.global_section_id) ?? -1
        if (row.version > prev) publishedByGlobalSection.set(row.global_section_id, row.version)
      }
      if (row.status === "draft") {
        const prev = draftByGlobalSection.get(row.global_section_id) ?? -1
        if (row.version > prev) draftByGlobalSection.set(row.global_section_id, row.version)
      }
    }

    const sectionsByPage = new Map<string, SectionRow[]>()
    for (const section of sections) {
      const arr = sectionsByPage.get(section.page_id) ?? []
      arr.push(section)
      sectionsByPage.set(section.page_id, arr)
    }

    const isSectionPublished = (section: SectionRow) => {
      if (!section.enabled) return true

      if (section.global_section_id) {
        if (publishedByGlobalSection.has(section.global_section_id)) return true
        // Composed sections with no version rows at all render via registry schema fallback
        if (composedTypeKeys.has(section.section_type) && !draftByGlobalSection.has(section.global_section_id)) return true
        return false
      }

      if (publishedBySection.has(section.id)) return true
      // Composed sections with no version rows at all render via registry schema fallback
      if (composedTypeKeys.has(section.section_type) && !draftBySection.has(section.id)) return true
      return false
    }

    const hasSectionDraftChanges = (section: SectionRow) => {
      if (!section.enabled) return false

      if (section.global_section_id) {
        const draftVersion = draftByGlobalSection.get(section.global_section_id)
        const publishedVersion = publishedByGlobalSection.get(section.global_section_id) ?? -1
        return draftVersion !== undefined && draftVersion > publishedVersion
      }

      const draftVersion = draftBySection.get(section.id)
      const publishedVersion = publishedBySection.get(section.id) ?? -1
      return draftVersion !== undefined && draftVersion > publishedVersion
    }

    const rows = pages.map((page) => {
      const pageSections = sectionsByPage.get(page.id) ?? []
      const enabledSections = pageSections.filter((s) => s.enabled)
      const hasEnabledSections = enabledSections.length > 0
      const allPublished = hasEnabledSections && enabledSections.every(isSectionPublished)
      const hasDraftChanges = enabledSections.some(hasSectionDraftChanges)

      return {
        ...page,
        publish_status: allPublished ? ("published" as const) : ("unpublished" as const),
        has_draft_changes: hasDraftChanges,
      }
    })

    const published_pages_count = rows.filter((r) => r.publish_status === "published").length

    return NextResponse.json({
      pages: rows,
      counts: {
        total_pages_count: rows.length,
        published_pages_count,
        unpublished_pages_count: rows.length - published_pages_count,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pages overview."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
