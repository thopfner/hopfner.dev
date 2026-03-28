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
import {
  addCmsSection,
  duplicateCmsSection,
  reorderCmsSections,
} from "@/lib/cms/commands/sections"
import { useVisualEditorStore } from "./page-visual-editor-store"

export function usePageCompositionActions() {
  const { pageState, reload, setSaveStatus } = useVisualEditorStore()

  /** Add a new section at the end or at a specific position */
  const addSection = useCallback(async (sectionType: string, position?: number) => {
    if (!pageState) return
    const supabase = createClient()
    const insertAt = position ?? pageState.sections.length
    try {
      const result = await addCmsSection(supabase, {
        pageId: pageState.pageId,
        sectionType,
        position: insertAt,
        defaults: pageState.sectionTypeDefaults[sectionType] ?? null,
      })
      setSaveStatus("saved")
      await reload()
      return result.sectionId as string
    } catch (error) {
      setSaveStatus("error", error instanceof Error ? error.message : "Failed to add section")
      return null
    }
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
    try {
      const result = await duplicateCmsSection(supabase, {
        pageId: pageState.pageId,
        sourceSectionId: sectionId,
      })
      setSaveStatus("saved")
      await reload()
      return result.sectionId as string
    } catch (error) {
      setSaveStatus("error", error instanceof Error ? error.message : "Failed to duplicate section")
      return null
    }
  }, [pageState, reload, setSaveStatus])

  /** Delete a local section with position renumbering */
  const deleteSection = useCallback(async (sectionId: string) => {
    if (!pageState) return false
    const supabase = createClient()
    const target = pageState.sections.find((s) => s.sectionId === sectionId)
    if (!target || target.isGlobal) return false

    try {
      const { error } = await supabase.from("sections").delete().eq("id", sectionId)
      if (error) {
        throw new Error(error.message)
      }

      const remainingOrder = pageState.sections
        .filter((s) => s.sectionId !== sectionId)
        .sort((a, b) => a.position - b.position)
        .map((s) => s.sectionId)

      await reorderCmsSections(supabase, { order: remainingOrder })

      setSaveStatus("saved")
      await reload()
      return true
    } catch (error) {
      setSaveStatus("error", error instanceof Error ? error.message : "Failed to delete section")
      return false
    }
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
