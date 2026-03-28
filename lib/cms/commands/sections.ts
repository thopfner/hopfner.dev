import type { SupabaseClient } from "@supabase/supabase-js"

import { defaultsToPayload } from "@/lib/cms/payload"
import type { EditorDraft, SectionTypeDefault } from "@/components/admin/section-editor/types"

import {
  archiveExistingDraftVersions,
  assertValidDraftTailwindClasses,
  buildDraftVersionInsert,
  fetchSectionVersionById,
  getNextSectionVersionNumber,
  getSectionCommandConfig,
  type CmsCommandSectionScope,
  type CmsCommandVersionRow,
} from "./shared"

export type CmsPageSectionRow = {
  id: string
  page_id: string
  section_type: string
  key: string | null
  enabled: boolean
  position: number
  global_section_id: string | null
}

type SourceSectionVersionRow = {
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
}

export type AddCmsSectionInput = {
  pageId: string
  sectionType: string
  position?: number
  key?: string | null
  enabled?: boolean
  globalSectionId?: string | null
  defaults?: SectionTypeDefault | null
}

export type AddCmsSectionResult = {
  sectionId: string
  position: number
  seededDraftVersionId: string | null
}

export type DuplicateCmsSectionInput = {
  pageId: string
  sourceSectionId: string
}

export type DuplicateCmsSectionResult = {
  sectionId: string
  position: number
  key: string | null
  seededDraftVersionId: string | null
}

export type ReorderCmsSectionsInput = {
  order: string[]
}

export type UpdateCmsSectionRowInput = {
  sectionId: string
  key?: string | null
  enabled?: boolean
}

export type DeleteCmsSectionInput = {
  sectionId: string
}

export type SaveCmsSectionDraftInput = {
  scope: CmsCommandSectionScope
  sectionId: string
  sectionType: string | null | undefined
  draft: EditorDraft
  allowedClasses: Set<string>
}

export type PublishCmsSectionDraftInput = {
  scope: CmsCommandSectionScope
  sectionId: string
  versionId: string
}

export async function listCmsPageSections(supabase: SupabaseClient, pageId: string) {
  const { data, error } = await supabase
    .from("sections")
    .select("id, page_id, section_type, key, enabled, position, global_section_id")
    .eq("page_id", pageId)
    .order("position", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as CmsPageSectionRow[]
}

async function shiftSectionsForInsert(
  supabase: SupabaseClient,
  sections: CmsPageSectionRow[],
  insertAt: number
) {
  const toShift = sections.filter((section) => section.position >= insertAt)
  if (!toShift.length) return

  const results = await Promise.all(
    toShift.map((section) =>
      supabase.from("sections").update({ position: section.position + 1 }).eq("id", section.id)
    )
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) {
    throw new Error(failed.error.message)
  }
}

async function loadSectionTypeDefault(
  supabase: SupabaseClient,
  sectionType: string
) {
  const { data, error } = await supabase
    .from("section_type_defaults")
    .select(
      "section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"
    )
    .eq("section_type", sectionType)
    .maybeSingle<SectionTypeDefault>()

  if (error) {
    throw new Error(error.message)
  }

  return data ?? null
}

async function seedSectionDraftFromDefaults(
  supabase: SupabaseClient,
  sectionId: string,
  defaults: SectionTypeDefault | null | undefined
) {
  const payload = defaults
    ? defaultsToPayload(defaults)
    : {
        title: null,
        subtitle: null,
        cta_primary_label: null,
        cta_primary_href: null,
        cta_secondary_label: null,
        cta_secondary_href: null,
        background_media_url: null,
        formatting: { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
        content: {},
      }
  const { data, error } = await supabase
    .from("section_versions")
    .insert({
      section_id: sectionId,
      version: 1,
      status: "draft",
      ...payload,
    })
    .select("id")
    .single<{ id: string }>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to seed section draft.")
  }

  return data.id
}

function dedupeSectionKey(baseKey: string | null, sections: CmsPageSectionRow[]) {
  if (!baseKey) return null

  const existing = new Set(sections.map((section) => section.key ?? "").filter(Boolean))
  const base = baseKey.trim()
  if (!base) return null

  if (existing.has(base)) {
    let attempt = 1
    while (true) {
      const suffix = attempt === 1 ? "-copy" : `-copy-${attempt}`
      const candidate = `${base}${suffix}`
      if (!existing.has(candidate)) {
        return candidate
      }
      attempt += 1
    }
  }

  return base
}

async function loadLatestSourceVersion(
  supabase: SupabaseClient,
  sectionId: string
) {
  const { data, error } = await supabase
    .from("section_versions")
    .select(
      "id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content"
    )
    .eq("section_id", sectionId)
    .in("status", ["draft", "published"])
    .order("version", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const versions = (data ?? []) as SourceSectionVersionRow[]
  const latestDraft =
    versions.find((version) => version.status === "draft") ?? null
  const latestPublished =
    versions.find((version) => version.status === "published") ?? null

  return latestDraft ?? latestPublished
}

async function seedDuplicateVersion(
  supabase: SupabaseClient,
  sectionId: string,
  version: SourceSectionVersionRow
) {
  const { data, error } = await supabase
    .from("section_versions")
    .insert({
      section_id: sectionId,
      version: 1,
      status: "draft",
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
    .select("id")
    .single<{ id: string }>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to seed duplicated section draft.")
  }

  return data.id
}

export async function addCmsSection(
  supabase: SupabaseClient,
  input: AddCmsSectionInput
): Promise<AddCmsSectionResult> {
  const sections = await listCmsPageSections(supabase, input.pageId)
  const insertAt = Math.min(Math.max(input.position ?? sections.length, 0), sections.length)

  await shiftSectionsForInsert(supabase, sections, insertAt)

  const { data, error } = await supabase
    .from("sections")
    .insert({
      page_id: input.pageId,
      section_type: input.sectionType,
      key: input.key ?? null,
      enabled: input.enabled ?? true,
      position: insertAt,
      global_section_id: input.globalSectionId ?? null,
    })
    .select("id")
    .single<{ id: string }>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to add section.")
  }

  let seededDraftVersionId: string | null = null
  if (!input.globalSectionId) {
    const defaults = input.defaults ?? await loadSectionTypeDefault(supabase, input.sectionType)
    seededDraftVersionId = await seedSectionDraftFromDefaults(supabase, data.id, defaults)
  }

  return {
    sectionId: data.id,
    position: insertAt,
    seededDraftVersionId,
  }
}

export async function duplicateCmsSection(
  supabase: SupabaseClient,
  input: DuplicateCmsSectionInput
): Promise<DuplicateCmsSectionResult> {
  const sections = await listCmsPageSections(supabase, input.pageId)
  const source = sections.find((section) => section.id === input.sourceSectionId)

  if (!source) {
    throw new Error("Source section not found.")
  }

  const insertAt = source.position + 1
  await shiftSectionsForInsert(supabase, sections, insertAt)

  const nextKey = dedupeSectionKey(source.key, sections)

  const { data, error } = await supabase
    .from("sections")
    .insert({
      page_id: source.page_id,
      section_type: source.section_type,
      key: nextKey,
      enabled: source.enabled,
      position: insertAt,
      global_section_id: source.global_section_id,
    })
    .select("id")
    .single<{ id: string }>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to duplicate section.")
  }

  let seededDraftVersionId: string | null = null
  if (!source.global_section_id) {
    const version = await loadLatestSourceVersion(supabase, source.id)
    if (version) {
      seededDraftVersionId = await seedDuplicateVersion(supabase, data.id, version)
    }
  }

  return {
    sectionId: data.id,
    position: insertAt,
    key: nextKey,
    seededDraftVersionId,
  }
}

export async function reorderCmsSections(
  supabase: SupabaseClient,
  input: ReorderCmsSectionsInput
) {
  const results = await Promise.all(
    input.order.map((sectionId, index) =>
      supabase.from("sections").update({ position: index }).eq("id", sectionId)
    )
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) {
    throw new Error(failed.error.message)
  }
}

export async function updateCmsSectionRow(
  supabase: SupabaseClient,
  input: UpdateCmsSectionRowInput
) {
  const patch: Record<string, unknown> = {}

  if ("key" in input) {
    patch.key = input.key ?? null
  }

  if (typeof input.enabled === "boolean") {
    patch.enabled = input.enabled
  }

  if (!Object.keys(patch).length) {
    return
  }

  const { error } = await supabase.from("sections").update(patch).eq("id", input.sectionId)
  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteCmsSection(
  supabase: SupabaseClient,
  input: DeleteCmsSectionInput
) {
  const { error } = await supabase.from("sections").delete().eq("id", input.sectionId)
  if (error) {
    throw new Error(error.message)
  }
}

export async function saveCmsSectionDraft(
  supabase: SupabaseClient,
  input: SaveCmsSectionDraftInput
): Promise<CmsCommandVersionRow> {
  assertValidDraftTailwindClasses(input.draft, input.allowedClasses)
  await archiveExistingDraftVersions(supabase, input.scope, input.sectionId)

  const nextVersion = await getNextSectionVersionNumber(supabase, input.scope, input.sectionId)
  const { versionTable, ownerIdColumn } = getSectionCommandConfig(input.scope)
  const payload = buildDraftVersionInsert(input.draft, input.sectionType)

  const { data, error } = await supabase
    .from(versionTable)
    .insert({
      [ownerIdColumn]: input.sectionId,
      version: nextVersion,
      status: "draft",
      ...payload,
    })
    .select("id")
    .single<{ id: string }>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save draft.")
  }

  const version = await fetchSectionVersionById(supabase, input.scope, data.id)
  if (!version) {
    throw new Error("Draft saved but could not be reloaded.")
  }

  return version
}

export async function publishCmsSectionDraft(
  supabase: SupabaseClient,
  input: PublishCmsSectionDraftInput
): Promise<CmsCommandVersionRow> {
  const { publishRpc } = getSectionCommandConfig(input.scope)
  const args =
    input.scope === "global"
      ? {
          p_global_section_id: input.sectionId,
          p_version_id: input.versionId,
          p_publish_at: new Date().toISOString(),
        }
      : {
          p_section_id: input.sectionId,
          p_version_id: input.versionId,
        }

  const { error } = await supabase.rpc(publishRpc, args)
  if (error) {
    throw new Error(error.message)
  }

  const version = await fetchSectionVersionById(supabase, input.scope, input.versionId)
  if (!version) {
    throw new Error("Published but failed to fetch updated version.")
  }

  return version
}
