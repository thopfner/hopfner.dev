import "server-only"

import { readFileSync } from "node:fs"

import type { SupabaseClient } from "@supabase/supabase-js"

import { BLUEPRINT_PAGES, BLUEPRINT_SOURCE_PATH, type PageInput } from "@/lib/cms/blueprint-content"
import {
  captureContentSnapshot,
  restoreContentSnapshot,
  type SnapshotPayload,
} from "@/lib/cms/content-snapshots"

export async function captureSnapshot(
  supabase: SupabaseClient,
  slugs: string[]
): Promise<SnapshotPayload> {
  return captureContentSnapshot(supabase, slugs, {
    includeSiteFormatting: false,
  })
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
  await restoreContentSnapshot(supabase, snapshot, {
    restoreSiteFormatting: false,
  })
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
