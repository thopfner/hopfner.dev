"use client"

/**
 * Page composition actions for the visual editor.
 * Reuses the same Supabase persistence paths as the form editor:
 * - sections table for section rows
 * - section_versions table for seeded content
 * - section_type_defaults for initial values
 */

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/browser"
import { useVisualEditorStore } from "./page-visual-editor-store"
import type { SectionTypeDefault } from "@/components/admin/section-editor/types"

export function usePageCompositionActions() {
  const { pageState, reload, setSaveStatus } = useVisualEditorStore()

  /** Add a new section at the end or at a specific position */
  const addSection = useCallback(async (sectionType: string, position?: number) => {
    if (!pageState) return
    const supabase = createClient()
    const defaults = pageState.sectionTypeDefaults[sectionType] as SectionTypeDefault | undefined
    const insertAt = position ?? pageState.sections.length

    // Shift positions for sections at or after insertAt
    if (insertAt < pageState.sections.length) {
      const toShift = pageState.sections.filter((s) => s.position >= insertAt)
      await Promise.all(
        toShift.map((s) =>
          supabase.from("sections").update({ position: s.position + 1 }).eq("id", s.sectionId)
        )
      )
    }

    // Insert section row
    const { data: newSection, error: sectionErr } = await supabase
      .from("sections")
      .insert({
        page_id: pageState.pageId,
        section_type: sectionType,
        key: null,
        enabled: true,
        position: insertAt,
        global_section_id: null,
      })
      .select("id")
      .single()

    if (sectionErr || !newSection) {
      setSaveStatus("error", sectionErr?.message ?? "Failed to add section")
      return null
    }

    // Seed initial version from defaults
    const { error: versionErr } = await supabase.from("section_versions").insert({
      section_id: newSection.id,
      version: 1,
      status: "draft",
      title: defaults?.default_title ?? null,
      subtitle: defaults?.default_subtitle ?? null,
      cta_primary_label: defaults?.default_cta_primary_label ?? null,
      cta_primary_href: defaults?.default_cta_primary_href ?? null,
      cta_secondary_label: defaults?.default_cta_secondary_label ?? null,
      cta_secondary_href: defaults?.default_cta_secondary_href ?? null,
      background_media_url: defaults?.default_background_media_url ?? null,
      formatting: defaults?.default_formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
      content: defaults?.default_content ?? {},
    })

    if (versionErr) {
      setSaveStatus("error", versionErr.message)
      return null
    }

    setSaveStatus("saved")
    await reload()
    return newSection.id as string
  }, [pageState, reload, setSaveStatus])

  /** Insert a section relative to another section */
  const insertRelative = useCallback(async (
    targetSectionId: string,
    direction: "above" | "below",
    sectionType: string
  ) => {
    if (!pageState) return null
    const target = pageState.sections.find((s) => s.sectionId === targetSectionId)
    if (!target) return null
    const position = direction === "above" ? target.position : target.position + 1
    return addSection(sectionType, position)
  }, [pageState, addSection])

  /** Duplicate a section on the current page */
  const duplicateSection = useCallback(async (sectionId: string) => {
    if (!pageState) return null
    const supabase = createClient()
    const source = pageState.sections.find((s) => s.sectionId === sectionId)
    if (!source) return null

    // Fetch source version data
    const version = source.draftVersion ?? source.publishedVersion
    const insertAt = source.position + 1

    // Shift positions
    const toShift = pageState.sections.filter((s) => s.position >= insertAt)
    if (toShift.length > 0) {
      await Promise.all(
        toShift.map((s) =>
          supabase.from("sections").update({ position: s.position + 1 }).eq("id", s.sectionId)
        )
      )
    }

    // Deduplicate key
    let nextKey = source.key
    if (source.key) {
      const existing = new Set(pageState.sections.map((s) => s.key ?? "").filter(Boolean))
      const base = source.key.trim()
      if (existing.has(base)) {
        let i = 1
        while (true) {
          const suffix = i === 1 ? "-copy" : `-copy-${i}`
          const candidate = `${base}${suffix}`
          if (!existing.has(candidate)) { nextKey = candidate; break }
          i++
        }
      }
    }

    // Create new section row
    const { data: newSection, error: insertErr } = await supabase
      .from("sections")
      .insert({
        page_id: pageState.pageId,
        section_type: source.sectionType,
        key: nextKey,
        enabled: source.enabled,
        position: insertAt,
        global_section_id: source.globalSectionId ?? null,
      })
      .select("id")
      .single()

    if (insertErr || !newSection) {
      setSaveStatus("error", insertErr?.message ?? "Failed to duplicate section")
      return null
    }

    // Seed version from source (skip if global-linked)
    if (!source.isGlobal && version) {
      await supabase.from("section_versions").insert({
        section_id: newSection.id,
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
    }

    setSaveStatus("saved")
    await reload()
    return newSection.id as string
  }, [pageState, reload, setSaveStatus])

  /** Delete a local section with position renumbering */
  const deleteSection = useCallback(async (sectionId: string) => {
    if (!pageState) return false
    const supabase = createClient()
    const target = pageState.sections.find((s) => s.sectionId === sectionId)
    if (!target || target.isGlobal) return false

    // Delete section (cascades to section_versions)
    const { error } = await supabase.from("sections").delete().eq("id", sectionId)
    if (error) {
      setSaveStatus("error", error.message)
      return false
    }

    // Renumber remaining positions
    const remaining = pageState.sections
      .filter((s) => s.sectionId !== sectionId)
      .sort((a, b) => a.position - b.position)

    await Promise.all(
      remaining.map((s, idx) =>
        supabase.from("sections").update({ position: idx }).eq("id", s.sectionId)
      )
    )

    setSaveStatus("saved")
    await reload()
    return true
  }, [pageState, reload, setSaveStatus])

  /** Toggle section enabled/disabled */
  const toggleSection = useCallback(async (sectionId: string) => {
    if (!pageState) return
    const supabase = createClient()
    const target = pageState.sections.find((s) => s.sectionId === sectionId)
    if (!target) return

    await supabase.from("sections").update({ enabled: !target.enabled }).eq("id", sectionId)
    await reload()
  }, [pageState, reload])

  return { addSection, insertRelative, duplicateSection, deleteSection, toggleSection }
}
