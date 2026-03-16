/**
 * Data loader for the visual editor.
 * Reads from the same Supabase tables as the current admin page editor.
 * Runs on the browser Supabase client (anon key + RLS).
 */

import { createClient } from "@/lib/supabase/browser"
import { normalizeSectionType } from "@/components/admin/section-editor/payload"
import { loadSectionPresetsFromClient, loadCapabilitiesFromClient } from "@/lib/design-system/loaders"
import type {
  SectionVersionRow,
  SectionTypeDefault,
} from "@/components/admin/section-editor/types"
import type { VisualPageState, VisualSectionNode } from "@/components/admin/visual-editor/page-visual-editor-types"

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

export async function loadPageVisualState(pageId: string): Promise<VisualPageState> {
  const supabase = createClient()

  // Parallel: load page, sections, defaults, globals, custom types, presets, capabilities, whitelist, site settings
  const [
    pageRes,
    sectionsRes,
    defaultsRes,
    globalsRes,
    customTypesRes,
    presets,
    capabilities,
    whitelistRes,
    siteSettingsRes,
  ] = await Promise.all([
    supabase.from("pages").select("id, slug, title, bg_image_url, formatting_override").eq("id", pageId).single(),
    supabase.from("sections").select("id, page_id, section_type, key, enabled, position, global_section_id, formatting_override").eq("page_id", pageId).order("position"),
    supabase.from("section_type_defaults").select("section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"),
    supabase.from("global_sections").select("id, section_type, key"),
    supabase.from("section_type_registry").select("key, source, composer_schema"),
    loadSectionPresetsFromClient(supabase),
    loadCapabilitiesFromClient(supabase),
    supabase.from("tailwind_class_whitelist").select("class"),
    supabase.from("site_formatting_settings").select("settings").limit(1).single(),
  ])

  if (pageRes.error || !pageRes.data) {
    throw new Error(`Failed to load page: ${pageRes.error?.message ?? "not found"}`)
  }

  const page = pageRes.data as {
    id: string
    slug: string
    title: string
    bg_image_url: string | null
    formatting_override: Record<string, unknown> | null
  }

  const sectionRows = (sectionsRes.data ?? []) as Array<{
    id: string
    page_id: string
    section_type: string
    key: string | null
    enabled: boolean
    position: number
    global_section_id: string | null
    formatting_override: Record<string, unknown> | null
  }>

  // Defaults map
  const defaultsMap: Partial<Record<string, SectionTypeDefault>> = {}
  for (const d of (defaultsRes.data ?? []) as SectionTypeDefault[]) {
    defaultsMap[d.section_type] = d
  }

  // Custom type registry — only non-builtin types
  const customTypeRegistry = new Set<string>()
  const composerSchemas: Record<string, unknown> = {}
  for (const row of (customTypesRes.data ?? []) as Array<{ key: string; source: string; composer_schema: unknown }>) {
    if (row.source !== "builtin") {
      customTypeRegistry.add(row.key)
    }
    if (row.composer_schema) {
      composerSchemas[row.key] = row.composer_schema
    }
  }

  // Global section IDs for version lookup
  const globalIds = sectionRows
    .filter((s) => s.global_section_id)
    .map((s) => s.global_section_id!)

  // Load versions: local + global
  const localSectionIds = sectionRows.filter((s) => !s.global_section_id).map((s) => s.id)

  const [localVersionsRes, globalVersionsRes] = await Promise.all([
    localSectionIds.length > 0
      ? supabase
          .from("section_versions")
          .select("id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at")
          .in("section_id", localSectionIds)
          .in("status", ["draft", "published"])
          .order("version", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    globalIds.length > 0
      ? supabase
          .from("global_section_versions")
          .select("id, global_section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at")
          .in("global_section_id", globalIds)
          .in("status", ["draft", "published"])
          .order("version", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ])

  // Build version lookup: ownerId → { draft, published }
  const versionMap = new Map<string, { draft: SectionVersionRow | null; published: SectionVersionRow | null }>()

  function indexVersions(rows: Record<string, unknown>[], ownerKey: string) {
    for (const v of rows) {
      const ownerId = asString(v[ownerKey])
      if (!ownerId) continue
      if (!versionMap.has(ownerId)) {
        versionMap.set(ownerId, { draft: null, published: null })
      }
      const entry = versionMap.get(ownerId)!
      const row = { ...v, owner_id: ownerId } as unknown as SectionVersionRow
      if (row.status === "draft" && !entry.draft) entry.draft = row
      if (row.status === "published" && !entry.published) entry.published = row
    }
  }

  indexVersions((localVersionsRes.data ?? []) as Record<string, unknown>[], "section_id")
  indexVersions((globalVersionsRes.data ?? []) as Record<string, unknown>[], "global_section_id")

  // Build section nodes
  const sections: VisualSectionNode[] = sectionRows.map((row) => {
    const normalizedType = normalizeSectionType(row.section_type) ?? row.section_type
    const isGlobal = !!row.global_section_id
    const ownerId = isGlobal ? row.global_section_id! : row.id
    const versions = versionMap.get(ownerId)

    return {
      sectionId: row.id,
      pageId: row.page_id,
      sectionType: normalizedType,
      source: isGlobal ? "global" : "page",
      isGlobal,
      isCustomComposed: customTypeRegistry.has(normalizedType) || (!defaultsMap[normalizedType] && normalizedType !== "composed"),
      position: row.position,
      key: row.key,
      enabled: row.enabled,
      draftVersion: versions?.draft ?? null,
      publishedVersion: versions?.published ?? null,
      globalSectionId: row.global_section_id,
      formattingOverride: row.formatting_override ?? {},
    }
  })

  // Site formatting
  const siteSettings = asRecord(siteSettingsRes.data?.settings)
  const siteTokens = asRecord(siteSettings.tokens)
  const siteColorMode = asString(siteTokens.colorMode) === "light" ? "light" as const : "dark" as const

  // Tailwind whitelist
  const whitelist = new Set<string>()
  for (const row of (whitelistRes.data ?? []) as Array<{ class: string }>) {
    whitelist.add(row.class)
  }

  return {
    pageId: page.id,
    pageSlug: page.slug,
    pageTitle: page.title,
    pageBgImageUrl: page.bg_image_url ?? "",
    pageFormattingOverride: page.formatting_override ?? {},
    sections,
    sectionTypeDefaults: defaultsMap,
    siteFormattingSettings: siteSettings,
    siteTokens,
    siteColorMode,
    presets,
    capabilities,
    tailwindWhitelist: whitelist,
    customTypeRegistry,
    composerSchemas,
  }
}
