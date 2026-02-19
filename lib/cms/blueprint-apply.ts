import "server-only"

import { readFileSync } from "node:fs"

import type { SupabaseClient } from "@supabase/supabase-js"

import { BLUEPRINT_PAGES, BLUEPRINT_SOURCE_PATH, type PageInput } from "@/lib/cms/blueprint-content"

export type SnapshotPayload = {
  pages: Array<{
    slug: string
    title: string
    sections: Array<{
      id: string
      key: string | null
      section_type: string
      enabled: boolean
      position: number
      versions: Array<{
        id: string
        version: number
        status: "draft" | "published" | "archived"
        title: string | null
        subtitle: string | null
        cta_primary_label: string | null
        cta_primary_href: string | null
        cta_secondary_label: string | null
        cta_secondary_href: string | null
        background_media_url: string | null
        formatting: Record<string, unknown>
        content: Record<string, unknown>
      }>
    }>
  }>
}

export async function captureSnapshot(
  supabase: SupabaseClient,
  slugs: string[]
): Promise<SnapshotPayload> {
  const { data: pages, error: pErr } = await supabase
    .from("pages")
    .select("id, slug, title")
    .in("slug", slugs)

  if (pErr) throw new Error(pErr.message)

  const pageRows = (pages ?? []) as Array<{ id: string; slug: string; title: string }>
  const pageIds = pageRows.map((p) => p.id)

  const { data: sections, error: sErr } = pageIds.length
    ? await supabase
        .from("sections")
        .select("id, page_id, key, section_type, enabled, position")
        .in("page_id", pageIds)
        .order("position", { ascending: true })
    : { data: [], error: null }

  if (sErr) throw new Error(sErr.message)

  const sectionRows = (sections ?? []) as Array<{
    id: string
    page_id: string
    key: string | null
    section_type: string
    enabled: boolean
    position: number
  }>

  const sectionIds = sectionRows.map((s) => s.id)

  const { data: versions, error: vErr } = sectionIds.length
    ? await supabase
        .from("section_versions")
        .select(
          "id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content"
        )
        .in("section_id", sectionIds)
        .order("version", { ascending: true })
    : { data: [], error: null }

  if (vErr) throw new Error(vErr.message)

  const versionRows = (versions ?? []) as Array<{
    id: string
    section_id: string
    version: number
    status: "draft" | "published" | "archived"
    title: string | null
    subtitle: string | null
    cta_primary_label: string | null
    cta_primary_href: string | null
    cta_secondary_label: string | null
    cta_secondary_href: string | null
    background_media_url: string | null
    formatting: Record<string, unknown>
    content: Record<string, unknown>
  }>

  const payload: SnapshotPayload = {
    pages: pageRows
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((page) => {
        const pageSections = sectionRows
          .filter((s) => s.page_id === page.id)
          .map((section) => ({
            ...section,
            versions: versionRows.filter((v) => v.section_id === section.id),
          }))

        return {
          slug: page.slug,
          title: page.title,
          sections: pageSections.map((s) => ({
            id: s.id,
            key: s.key,
            section_type: s.section_type,
            enabled: s.enabled,
            position: s.position,
            versions: s.versions,
          })),
        }
      }),
  }

  return payload
}

export async function applyBlueprintContent(supabase: SupabaseClient, pages: PageInput[]) {
  for (const page of pages) {
    const { data: upsertedPage, error: pageErr } = await supabase
      .from("pages")
      .upsert({ slug: page.slug, title: page.title }, { onConflict: "slug" })
      .select("id")
      .single<{ id: string }>()

    if (pageErr) throw new Error(`Page ${page.slug}: ${pageErr.message}`)

    const pageId = upsertedPage.id

    const { data: existingSections, error: existingErr } = await supabase
      .from("sections")
      .select("id")
      .eq("page_id", pageId)

    if (existingErr) throw new Error(`Page ${page.slug} sections lookup: ${existingErr.message}`)

    const existingIds = (existingSections ?? []).map((row) => row.id)
    if (existingIds.length) {
      const { error: delErr } = await supabase.from("sections").delete().eq("page_id", pageId)
      if (delErr) throw new Error(`Page ${page.slug} section cleanup: ${delErr.message}`)
    }

    for (const section of page.sections.sort((a, b) => a.position - b.position)) {
      const { data: insertedSection, error: insErr } = await supabase
        .from("sections")
        .insert({
          page_id: pageId,
          key: section.key,
          section_type: section.section_type,
          enabled: section.enabled,
          position: section.position,
        })
        .select("id")
        .single<{ id: string }>()

      if (insErr) throw new Error(`Page ${page.slug}, section ${section.key ?? section.section_type}: ${insErr.message}`)

      const { error: versionErr } = await supabase.from("section_versions").insert({
        section_id: insertedSection.id,
        version: 1,
        status: section.version.status,
        title: section.version.title,
        subtitle: section.version.subtitle,
        cta_primary_label: section.version.cta_primary_label,
        cta_primary_href: section.version.cta_primary_href,
        cta_secondary_label: section.version.cta_secondary_label,
        cta_secondary_href: section.version.cta_secondary_href,
        background_media_url: section.version.background_media_url,
        formatting: section.version.formatting,
        content: section.version.content,
      })

      if (versionErr) throw new Error(`Page ${page.slug}, section version ${section.key ?? section.section_type}: ${versionErr.message}`)
    }
  }
}

export async function restoreFromSnapshot(supabase: SupabaseClient, snapshot: SnapshotPayload) {
  for (const page of snapshot.pages) {
    const { data: upsertedPage, error: pageErr } = await supabase
      .from("pages")
      .upsert({ slug: page.slug, title: page.title }, { onConflict: "slug" })
      .select("id")
      .single<{ id: string }>()

    if (pageErr) throw new Error(`Restore page ${page.slug}: ${pageErr.message}`)

    const pageId = upsertedPage.id

    const { error: clearErr } = await supabase.from("sections").delete().eq("page_id", pageId)
    if (clearErr) throw new Error(`Restore page ${page.slug} cleanup: ${clearErr.message}`)

    for (const section of page.sections.sort((a, b) => a.position - b.position)) {
      const { data: insertedSection, error: insErr } = await supabase
        .from("sections")
        .insert({
          page_id: pageId,
          key: section.key,
          section_type: section.section_type,
          enabled: section.enabled,
          position: section.position,
        })
        .select("id")
        .single<{ id: string }>()

      if (insErr) throw new Error(`Restore section ${section.key ?? section.section_type}: ${insErr.message}`)

      for (const version of section.versions.sort((a, b) => a.version - b.version)) {
        const { error: vErr } = await supabase.from("section_versions").insert({
          section_id: insertedSection.id,
          version: version.version,
          status: version.status,
          title: version.title,
          subtitle: version.subtitle,
          cta_primary_label: version.cta_primary_label,
          cta_primary_href: version.cta_primary_href,
          cta_secondary_label: version.cta_secondary_label,
          cta_secondary_href: version.cta_secondary_href,
          background_media_url: version.background_media_url,
          formatting: version.formatting,
          content: version.content,
        })
        if (vErr) throw new Error(`Restore version ${version.version}: ${vErr.message}`)
      }
    }
  }
}

export function buildBlueprintPlan() {
  const raw = readFileSync(BLUEPRINT_SOURCE_PATH, "utf8")
  return {
    sourcePath: BLUEPRINT_SOURCE_PATH,
    sourceBytes: Buffer.byteLength(raw, "utf8"),
    pageCount: BLUEPRINT_PAGES.length,
    pages: BLUEPRINT_PAGES.map((p) => ({
      slug: p.slug,
      title: p.title,
      sectionCount: p.sections.length,
      sectionTypes: p.sections.map((s) => s.section_type),
      keys: p.sections.map((s) => s.key).filter(Boolean),
    })),
  }
}
