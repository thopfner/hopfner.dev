import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

type SectionRow = {
  id: string
  page_id: string
  global_section_id: string | null
}

type DraftRow = {
  id: string
  section_id: string
  version: number
}

type GlobalDraftRow = {
  id: string
  global_section_id: string
  version: number
}

export async function POST() {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabase = getSupabaseAdmin()
    const userSupabase = await createClient()

    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("id, page_id, global_section_id")

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }

    const sections = (sectionsData ?? []) as SectionRow[]
    if (!sections.length) {
      return NextResponse.json({
        ok: true,
        pagesAffected: 0,
        sectionsPublished: 0,
        localSectionsPublished: 0,
        globalSectionsPublished: 0,
        failures: [],
      })
    }

    const pagesAffected = new Set<string>()
    const failures: Array<{ sectionId: string; pageId: string; message: string }> = []

    const localSections = sections.filter((s) => !s.global_section_id)
    const localSectionIds = localSections.map((s) => s.id)

    const localDraftsRes = localSectionIds.length
      ? await supabase
          .from("section_versions")
          .select("id, section_id, version")
          .in("section_id", localSectionIds)
          .eq("status", "draft")
          .order("section_id", { ascending: true })
          .order("version", { ascending: false })
      : { data: [], error: null }

    if (localDraftsRes.error) {
      return NextResponse.json({ error: localDraftsRes.error.message }, { status: 500 })
    }

    const latestLocalDraftBySection = new Map<string, DraftRow>()
    for (const row of (localDraftsRes.data ?? []) as DraftRow[]) {
      if (!latestLocalDraftBySection.has(row.section_id)) {
        latestLocalDraftBySection.set(row.section_id, row)
      }
    }

    let localSectionsPublished = 0

    for (const section of localSections) {
      const draft = latestLocalDraftBySection.get(section.id)
      if (!draft) continue

      const { error } = await userSupabase.rpc("publish_section_version", {
        p_section_id: section.id,
        p_version_id: draft.id,
      })

      if (error) {
        failures.push({ sectionId: section.id, pageId: section.page_id, message: error.message })
        continue
      }

      localSectionsPublished += 1
      pagesAffected.add(section.page_id)
    }

    const globalSectionIds = [...new Set(sections.map((s) => s.global_section_id).filter(Boolean) as string[])]

    const globalDraftsRes = globalSectionIds.length
      ? await supabase
          .from("global_section_versions")
          .select("id, global_section_id, version")
          .in("global_section_id", globalSectionIds)
          .eq("status", "draft")
          .order("global_section_id", { ascending: true })
          .order("version", { ascending: false })
      : { data: [], error: null }

    if (globalDraftsRes.error) {
      return NextResponse.json({ error: globalDraftsRes.error.message }, { status: 500 })
    }

    const latestGlobalDraftBySection = new Map<string, GlobalDraftRow>()
    for (const row of (globalDraftsRes.data ?? []) as GlobalDraftRow[]) {
      if (!latestGlobalDraftBySection.has(row.global_section_id)) {
        latestGlobalDraftBySection.set(row.global_section_id, row)
      }
    }

    const pageIdsByGlobalSection = new Map<string, Set<string>>()
    for (const section of sections) {
      if (!section.global_section_id) continue
      const current = pageIdsByGlobalSection.get(section.global_section_id) ?? new Set<string>()
      current.add(section.page_id)
      pageIdsByGlobalSection.set(section.global_section_id, current)
    }

    let globalSectionsPublished = 0

    for (const globalSectionId of globalSectionIds) {
      const draft = latestGlobalDraftBySection.get(globalSectionId)
      if (!draft) continue

      const linkedPageIds = [...(pageIdsByGlobalSection.get(globalSectionId) ?? new Set<string>())]
      const fallbackPageId = linkedPageIds[0] ?? ""

      const { error } = await userSupabase.rpc("publish_global_section_version", {
        p_global_section_id: globalSectionId,
        p_version_id: draft.id,
      })

      if (error) {
        if (linkedPageIds.length) {
          for (const pageId of linkedPageIds) {
            failures.push({
              sectionId: `global:${globalSectionId}`,
              pageId,
              message: error.message,
            })
          }
        } else {
          failures.push({
            sectionId: `global:${globalSectionId}`,
            pageId: fallbackPageId,
            message: error.message,
          })
        }
        continue
      }

      globalSectionsPublished += 1
      for (const pageId of linkedPageIds) pagesAffected.add(pageId)
    }

    const sectionsPublished = localSectionsPublished + globalSectionsPublished

    return NextResponse.json({
      ok: true,
      pagesAffected: pagesAffected.size,
      sectionsPublished,
      localSectionsPublished,
      globalSectionsPublished,
      failures,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish all sections."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
