import type { SupabaseClient } from "@supabase/supabase-js"

import { draftToPayload, normalizeSectionType, validateClassTokens } from "@/lib/cms/payload"
import type { EditorDraft } from "@/components/admin/section-editor/types"

export type CmsCommandSectionScope = "page" | "global"

type SectionCommandConfig = {
  versionTable: "section_versions" | "global_section_versions"
  ownerIdColumn: "section_id" | "global_section_id"
  publishRpc: "publish_section_version" | "publish_global_section_version"
}

export type CmsCommandVersionRow = {
  id: string
  ownerId: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  subtitle: string | null
  ctaPrimaryLabel: string | null
  ctaPrimaryHref: string | null
  ctaSecondaryLabel: string | null
  ctaSecondaryHref: string | null
  backgroundMediaUrl: string | null
  formatting: Record<string, unknown>
  content: Record<string, unknown>
  createdAt: string
  publishedAt: string | null
}

export function getSectionCommandConfig(scope: CmsCommandSectionScope): SectionCommandConfig {
  return scope === "global"
    ? {
        versionTable: "global_section_versions",
        ownerIdColumn: "global_section_id",
        publishRpc: "publish_global_section_version",
      }
    : {
        versionTable: "section_versions",
        ownerIdColumn: "section_id",
        publishRpc: "publish_section_version",
      }
}

export function getNormalizedSectionType(sectionType: string | null | undefined) {
  const raw = (sectionType ?? "").trim()
  if (!raw) return null
  return normalizeSectionType(raw) ?? raw
}

export function assertValidDraftTailwindClasses(draft: EditorDraft, allowedClasses: Set<string>) {
  const invalid = [
    ...validateClassTokens(draft.formatting.containerClass, allowedClasses).invalid,
    ...validateClassTokens(draft.formatting.sectionClass, allowedClasses).invalid,
    ...(draft.formatting.mobile
      ? validateClassTokens(draft.formatting.mobile.containerClass, allowedClasses).invalid
      : []),
    ...(draft.formatting.mobile
      ? validateClassTokens(draft.formatting.mobile.sectionClass, allowedClasses).invalid
      : []),
  ]

  if (invalid.length > 0) {
    throw new Error(`Invalid Tailwind classes: ${invalid.join(", ")}`)
  }
}

export function buildDraftVersionInsert(
  draft: EditorDraft,
  sectionType: string | null | undefined
) {
  return draftToPayload(draft, getNormalizedSectionType(sectionType))
}

export async function archiveExistingDraftVersions(
  supabase: SupabaseClient,
  scope: CmsCommandSectionScope,
  ownerId: string
) {
  const { versionTable, ownerIdColumn } = getSectionCommandConfig(scope)
  const { error } = await supabase
    .from(versionTable)
    .update({ status: "archived" })
    .eq(ownerIdColumn, ownerId)
    .eq("status", "draft")

  if (error) {
    throw new Error(error.message)
  }
}

export async function getNextSectionVersionNumber(
  supabase: SupabaseClient,
  scope: CmsCommandSectionScope,
  ownerId: string
) {
  const { versionTable, ownerIdColumn } = getSectionCommandConfig(scope)
  const { data, error } = await supabase
    .from(versionTable)
    .select("version")
    .eq(ownerIdColumn, ownerId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle<{ version: number }>()

  if (error) {
    throw new Error(error.message)
  }

  return (data?.version ?? 0) + 1
}

function mapCommandVersionRow(
  row: Record<string, unknown>,
  ownerIdColumn: "section_id" | "global_section_id"
): CmsCommandVersionRow {
  return {
    id: String(row.id ?? ""),
    ownerId: String(row[ownerIdColumn] ?? ""),
    version: Number(row.version ?? 0),
    status: ((row.status as CmsCommandVersionRow["status"]) ?? "draft"),
    title: typeof row.title === "string" ? row.title : null,
    subtitle: typeof row.subtitle === "string" ? row.subtitle : null,
    ctaPrimaryLabel: typeof row.cta_primary_label === "string" ? row.cta_primary_label : null,
    ctaPrimaryHref: typeof row.cta_primary_href === "string" ? row.cta_primary_href : null,
    ctaSecondaryLabel: typeof row.cta_secondary_label === "string" ? row.cta_secondary_label : null,
    ctaSecondaryHref: typeof row.cta_secondary_href === "string" ? row.cta_secondary_href : null,
    backgroundMediaUrl:
      typeof row.background_media_url === "string" ? row.background_media_url : null,
    formatting:
      row.formatting && typeof row.formatting === "object" && !Array.isArray(row.formatting)
        ? (row.formatting as Record<string, unknown>)
        : {},
    content:
      row.content && typeof row.content === "object" && !Array.isArray(row.content)
        ? (row.content as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at ?? ""),
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
  }
}

export async function fetchSectionVersionById(
  supabase: SupabaseClient,
  scope: CmsCommandSectionScope,
  versionId: string
) {
  const { versionTable, ownerIdColumn } = getSectionCommandConfig(scope)
  const select = [
    "id",
    ownerIdColumn,
    "version",
    "status",
    "title",
    "subtitle",
    "cta_primary_label",
    "cta_primary_href",
    "cta_secondary_label",
    "cta_secondary_href",
    "background_media_url",
    "formatting",
    "content",
    "created_at",
    "published_at",
  ].join(", ")

  const { data, error } = await supabase
    .from(versionTable)
    .select(select)
    .eq("id", versionId)
    .maybeSingle<Record<string, unknown>>()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapCommandVersionRow(data, ownerIdColumn) : null
}
