import fs from "node:fs"
import path from "node:path"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { BLUEPRINT_PAGES, type PageInput } from "../lib/cms/blueprint-content"

type SnapshotPayload = {
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

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local")
  const raw = fs.readFileSync(envPath, "utf8")

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#") || !t.includes("=")) continue

    const i = t.indexOf("=")
    const key = t.slice(0, i).trim()
    let value = t.slice(i + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) process.env[key] = value
  }
}

async function captureSnapshot(supabase: SupabaseClient, slugs: string[]): Promise<SnapshotPayload> {
  const { data: pages, error: pErr } = await supabase.from("pages").select("id, slug, title").in("slug", slugs)
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

  return {
    pages: pageRows
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((page) => ({
        slug: page.slug,
        title: page.title,
        sections: sectionRows
          .filter((s) => s.page_id === page.id)
          .map((s) => ({
            id: s.id,
            key: s.key,
            section_type: s.section_type,
            enabled: s.enabled,
            position: s.position,
            versions: versionRows.filter((v) => v.section_id === s.id),
          })),
      })),
  }
}

async function applyBlueprintContent(supabase: SupabaseClient, pages: PageInput[]) {
  for (const page of pages) {
    const { data: upsertedPage, error: pageErr } = await supabase
      .from("pages")
      .upsert({ slug: page.slug, title: page.title }, { onConflict: "slug" })
      .select("id")
      .single<{ id: string }>()
    if (pageErr) throw new Error(`Page ${page.slug}: ${pageErr.message}`)

    const pageId = upsertedPage.id

    const { error: clearErr } = await supabase.from("sections").delete().eq("page_id", pageId)
    if (clearErr) throw new Error(`Page ${page.slug} cleanup: ${clearErr.message}`)

    for (const section of page.sections.sort((a, b) => a.position - b.position)) {
      const { data: insertedSection, error: secErr } = await supabase
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
      if (secErr) throw new Error(`Page ${page.slug}, section ${section.key ?? section.section_type}: ${secErr.message}`)

      const { error: vErr } = await supabase.from("section_versions").insert({
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
      if (vErr) throw new Error(`Page ${page.slug}, section version ${section.key ?? section.section_type}: ${vErr.message}`)
    }
  }
}

async function main() {
  loadEnvLocal()

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const slugs = BLUEPRINT_PAGES.map((p) => p.slug)

  const snapshotPayload = await captureSnapshot(supabase, slugs)
  const { data: snapshotRow, error: snapshotErr } = await supabase
    .from("cms_content_snapshots")
    .insert({
      source: "manual-cli-blueprint-apply",
      label: "Pre-blueprint apply snapshot (CLI)",
      target_page_slugs: slugs,
      payload: snapshotPayload,
    })
    .select("id, created_at")
    .single<{ id: string; created_at: string }>()
  if (snapshotErr) throw new Error(`Snapshot insert failed: ${snapshotErr.message}`)

  await applyBlueprintContent(supabase, BLUEPRINT_PAGES)

  const { count, error: countErr } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .in("slug", slugs)
  if (countErr) throw new Error(`Post-apply verification failed: ${countErr.message}`)

  const { count: secCount, error: secErr } = await supabase
    .from("sections")
    .select("id", { count: "exact", head: true })
  if (secErr) throw new Error(`Section count failed: ${secErr.message}`)

  console.log("BLUEPRINT_APPLY:OK")
  console.log("SNAPSHOT_ID", snapshotRow.id)
  console.log("SNAPSHOT_CREATED_AT", snapshotRow.created_at)
  console.log("TARGET_SLUGS", slugs.length)
  console.log("MATCHED_PAGES", count ?? 0)
  console.log("TOTAL_SECTIONS", secCount ?? 0)
}

main().catch((error) => {
  console.error("BLUEPRINT_APPLY:FAIL")
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
