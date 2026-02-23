import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

type CmsSectionType = string

type DuplicateOutcome = "duplicated" | "skipped" | "failed"

type DuplicateBulkPageResult = {
  pageId: string
  pageSlug: string
  pageTitle: string
  outcome: DuplicateOutcome
  message: string
  insertedSectionId?: string
}

type DuplicateBulkAudit = {
  sourceSectionId: string
  sourcePageId: string
  sourceFingerprint: string
  attemptedAt: string
  placementMode: "same_relative_index"
  duplicateRule: string
  insertedCount: number
  skippedCount: number
  failedCount: number
  noOpMessage?: string
  results: DuplicateBulkPageResult[]
}

function normalizeTextForFingerprint(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function stableJson(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (Array.isArray(value)) return `[${value.map((v) => stableJson(v)).join(",")}]`
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    )
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`
  }
  return JSON.stringify(value)
}

function simpleHash(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, "0")
}

function buildDuplicateFingerprint(params: {
  sectionType: CmsSectionType
  key: string | null
  title: string | null
  content: Record<string, unknown> | null
}) {
  const normalizedType = normalizeTextForFingerprint(params.sectionType)
  const normalizedKey = normalizeTextForFingerprint(params.key)
  const normalizedTitle = normalizeTextForFingerprint(params.title)
  const contentHash = simpleHash(stableJson(params.content ?? {}))
  return `${normalizedType}::${normalizedKey}::${normalizedTitle}::${contentHash}`
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json()) as {
      sourceSectionId?: string
      sourcePageId?: string
      sourcePosition?: number
    }

    const sourceSectionId = String(body?.sourceSectionId ?? "").trim()
    const sourcePageId = String(body?.sourcePageId ?? "").trim()
    const sourcePosition = Number(body?.sourcePosition ?? 0)

    if (!sourceSectionId || !sourcePageId || !Number.isFinite(sourcePosition)) {
      return NextResponse.json({ error: "Missing required payload." }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: sourceSection, error: sourceSectionErr } = await supabase
      .from("sections")
      .select("id, page_id, section_type, key, enabled, position")
      .eq("id", sourceSectionId)
      .single<{
        id: string
        page_id: string
        section_type: CmsSectionType
        key: string | null
        enabled: boolean
        position: number
      }>()

    if (sourceSectionErr || !sourceSection) {
      throw new Error(sourceSectionErr?.message ?? "Source section not found.")
    }

    const { data: sourceVersions, error: sourceVersionsErr } = await supabase
      .from("section_versions")
      .select(
        "version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content"
      )
      .eq("section_id", sourceSection.id)
      .in("status", ["draft", "published"])
      .order("version", { ascending: false })

    if (sourceVersionsErr) throw new Error(sourceVersionsErr.message)

    const typedSourceVersions =
      (sourceVersions as Array<{
        version: number
        status: "draft" | "published"
        title: string | null
        subtitle: string | null
        cta_primary_label: string | null
        cta_primary_href: string | null
        cta_secondary_label: string | null
        cta_secondary_href: string | null
        background_media_url: string | null
        formatting: Record<string, unknown> | null
        content: Record<string, unknown> | null
      }> | null) ?? []

    const latestDraft =
      typedSourceVersions
        .filter((r) => r.status === "draft")
        .sort((a, b) => b.version - a.version)[0] ?? null
    const published = typedSourceVersions.find((r) => r.status === "published") ?? null
    const sourceBase = latestDraft ?? published

    const sourceFingerprint = buildDuplicateFingerprint({
      sectionType: sourceSection.section_type,
      key: sourceSection.key,
      title: sourceBase?.title ?? null,
      content: sourceBase?.content ?? null,
    })

    const { data: pages, error: pagesErr } = await supabase
      .from("pages")
      .select("id, slug, title")
      .order("slug", { ascending: true })

    if (pagesErr) throw new Error(pagesErr.message)

    const targetPages = ((pages ?? []) as Array<{ id: string; slug: string; title: string }>).filter(
      (p) => p.id !== sourcePageId
    )

    if (!targetPages.length) {
      const audit: DuplicateBulkAudit = {
        sourceSectionId,
        sourcePageId,
        sourceFingerprint,
        attemptedAt: new Date().toISOString(),
        placementMode: "same_relative_index",
        duplicateRule:
          "section_type + normalized key + normalized title + stable content hash (latest draft else published)",
        insertedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        noOpMessage: "No eligible target pages found. The current page is excluded from bulk duplication.",
        results: [],
      }
      return NextResponse.json({ ok: true, audit })
    }

    const results: DuplicateBulkPageResult[] = []

    for (const targetPage of targetPages) {
      try {
        const { data: targetSections, error: targetErr } = await supabase
          .from("sections")
          .select("id, section_type, key, position")
          .eq("page_id", targetPage.id)
          .order("position", { ascending: true })

        if (targetErr) throw new Error(targetErr.message)

        const typedTargetSections =
          (targetSections as Array<{ id: string; section_type: CmsSectionType; key: string | null; position: number }> | null) ??
          []

        const targetSectionIds = typedTargetSections.map((s) => s.id)

        let targetVersions: Array<{
          section_id: string
          status: "draft" | "published"
          version: number
          title: string | null
          content: Record<string, unknown> | null
        }> = []

        if (targetSectionIds.length) {
          const { data: versionsData, error: versionsErr } = await supabase
            .from("section_versions")
            .select("section_id, status, version, title, content")
            .in("section_id", targetSectionIds)
            .in("status", ["draft", "published"])
            .order("version", { ascending: false })
          if (versionsErr) throw new Error(versionsErr.message)
          targetVersions =
            (versionsData as Array<{
              section_id: string
              status: "draft" | "published"
              version: number
              title: string | null
              content: Record<string, unknown> | null
            }> | null) ?? []
        }

        const latestBySection = new Map<string, { title: string | null; content: Record<string, unknown> | null }>()
        for (const v of targetVersions) {
          if (!latestBySection.has(v.section_id)) {
            latestBySection.set(v.section_id, { title: v.title, content: v.content })
          }
        }

        const hasConflict = typedTargetSections.some((row) => {
          const latest = latestBySection.get(row.id)
          const fp = buildDuplicateFingerprint({
            sectionType: row.section_type,
            key: row.key,
            title: latest?.title ?? null,
            content: latest?.content ?? null,
          })
          return fp === sourceFingerprint
        })

        if (hasConflict) {
          results.push({
            pageId: targetPage.id,
            pageSlug: targetPage.slug,
            pageTitle: targetPage.title,
            outcome: "skipped",
            message: "Skipped by duplicate rule fingerprint match.",
          })
          continue
        }

        const insertAt = Math.min(sourcePosition, typedTargetSections.length)

        if (typedTargetSections.length) {
          const moveRows = typedTargetSections.filter((row) => row.position >= insertAt)
          for (const row of moveRows) {
            const { error: moveError } = await supabase
              .from("sections")
              .update({ position: row.position + 1 })
              .eq("id", row.id)
            if (moveError) throw new Error(moveError.message)
          }
        }

        let nextKey: string | null = sourceSection.key
        if (sourceSection.key) {
          const existingKeys = new Set(typedTargetSections.map((r) => (r.key ?? "").trim()).filter(Boolean))
          const baseKey = sourceSection.key.trim()
          if (!existingKeys.has(baseKey)) {
            nextKey = baseKey
          } else {
            let i = 1
            while (true) {
              const suffix = i === 1 ? "-copy" : `-copy-${i}`
              const candidate = `${baseKey}${suffix}`
              if (!existingKeys.has(candidate)) {
                nextKey = candidate
                break
              }
              i += 1
            }
          }
        }

        const { data: newSectionData, error: insertSectionError } = await supabase
          .from("sections")
          .insert({
            page_id: targetPage.id,
            section_type: sourceSection.section_type,
            key: nextKey,
            enabled: sourceSection.enabled,
            position: insertAt,
          })
          .select("id")
          .single<{ id: string }>()

        if (insertSectionError) throw new Error(insertSectionError.message)

        const { error: versionErr } = await supabase.from("section_versions").insert({
          section_id: newSectionData.id,
          version: 1,
          status: "draft",
          title: sourceBase?.title ?? null,
          subtitle: sourceBase?.subtitle ?? null,
          cta_primary_label: sourceBase?.cta_primary_label ?? null,
          cta_primary_href: sourceBase?.cta_primary_href ?? null,
          cta_secondary_label: sourceBase?.cta_secondary_label ?? null,
          cta_secondary_href: sourceBase?.cta_secondary_href ?? null,
          background_media_url: sourceBase?.background_media_url ?? null,
          formatting: sourceBase?.formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
          content: sourceBase?.content ?? {},
        })

        if (versionErr) throw new Error(versionErr.message)

        results.push({
          pageId: targetPage.id,
          pageSlug: targetPage.slug,
          pageTitle: targetPage.title,
          outcome: "duplicated",
          message: `Inserted at relative index ${insertAt}.`,
          insertedSectionId: newSectionData.id,
        })
      } catch (err) {
        results.push({
          pageId: targetPage.id,
          pageSlug: targetPage.slug,
          pageTitle: targetPage.title,
          outcome: "failed",
          message: err instanceof Error ? err.message : "Unknown duplication error",
        })
      }
    }

    const audit: DuplicateBulkAudit = {
      sourceSectionId,
      sourcePageId,
      sourceFingerprint,
      attemptedAt: new Date().toISOString(),
      placementMode: "same_relative_index",
      duplicateRule:
        "section_type + normalized key + normalized title + stable content hash (latest draft else published)",
      insertedCount: results.filter((r) => r.outcome === "duplicated").length,
      skippedCount: results.filter((r) => r.outcome === "skipped").length,
      failedCount: results.filter((r) => r.outcome === "failed").length,
      noOpMessage:
        results.length === 0
          ? "No eligible target pages were found in this workspace (excluding current page)."
          : undefined,
      results,
    }

    return NextResponse.json({ ok: true, audit })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to duplicate section to all pages."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
