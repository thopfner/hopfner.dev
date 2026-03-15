/**
 * Save/publish adapter for the visual editor.
 * Writes through the same tables and RPCs as the current form editor.
 */

"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/browser"
import {
  draftToPayload,
  formattingToJsonb,
  normalizeFormatting,
  validateClassTokens,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft, SectionVersionRow } from "@/components/admin/section-editor/types"
import type { VisualSectionNode, VisualPageState } from "./page-visual-editor-types"

type SaveResult = { success: true; version: SectionVersionRow } | { success: false; error: string }

export function useVisualSectionPersistence(pageState: VisualPageState | null) {
  const saveDraft = useCallback(async (
    node: VisualSectionNode,
    draft: EditorDraft,
  ): Promise<SaveResult> => {
    if (!pageState) return { success: false, error: "Page state not loaded" }
    if (node.isGlobal) return { success: false, error: "Cannot save global sections from page visual editor" }

    const supabase = createClient()

    // Validate Tailwind classes
    const whitelist = pageState.tailwindWhitelist
    for (const field of ["containerClass", "sectionClass"] as const) {
      const value = draft.formatting[field]
      if (value) {
        const { invalid } = validateClassTokens(value, whitelist)
        if (invalid.length > 0) {
          return { success: false, error: `Invalid class tokens in ${field}: ${invalid.join(", ")}` }
        }
      }
    }
    if (draft.formatting.mobile) {
      for (const field of ["containerClass", "sectionClass"] as const) {
        const value = draft.formatting.mobile[field]
        if (value) {
          const { invalid } = validateClassTokens(value, whitelist)
          if (invalid.length > 0) {
            return { success: false, error: `Invalid mobile class tokens in ${field}: ${invalid.join(", ")}` }
          }
        }
      }
    }

    // Convert draft → payload
    const payload = draftToPayload(draft, node.sectionType)

    // Archive existing draft if any
    if (node.draftVersion) {
      await supabase
        .from("section_versions")
        .update({ status: "archived" })
        .eq("id", node.draftVersion.id)
    }

    // Determine next version number
    const latestVersion = Math.max(
      node.draftVersion?.version ?? 0,
      node.publishedVersion?.version ?? 0,
    )

    // Insert new draft version
    const { data, error } = await supabase
      .from("section_versions")
      .insert({
        section_id: node.sectionId,
        version: latestVersion + 1,
        status: "draft",
        ...payload,
      })
      .select()
      .single()

    if (error || !data) {
      return { success: false, error: error?.message ?? "Failed to save draft" }
    }

    return { success: true, version: data as SectionVersionRow }
  }, [pageState])

  const publishDraft = useCallback(async (
    node: VisualSectionNode,
    draft: EditorDraft,
  ): Promise<SaveResult> => {
    if (!pageState) return { success: false, error: "Page state not loaded" }
    if (node.isGlobal) return { success: false, error: "Cannot publish global sections from page visual editor" }

    // First save as draft
    const saveResult = await saveDraft(node, draft)
    if (!saveResult.success) return saveResult

    const supabase = createClient()

    // Publish the draft via RPC (must pass both p_section_id and p_version_id)
    const { data, error } = await supabase.rpc("publish_section_version", {
      p_section_id: node.sectionId,
      p_version_id: saveResult.version.id,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Fetch the published version
    const { data: published, error: fetchErr } = await supabase
      .from("section_versions")
      .select("*")
      .eq("id", saveResult.version.id)
      .single()

    if (fetchErr || !published) {
      return { success: false, error: "Published but failed to fetch updated version" }
    }

    return { success: true, version: published as SectionVersionRow }
  }, [pageState, saveDraft])

  const saveOrder = useCallback(async (order: string[]): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient()

    // Update positions for all sections
    const updates = order.map((sectionId, index) =>
      supabase
        .from("sections")
        .update({ position: index })
        .eq("id", sectionId)
    )

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      return { success: false, error: failed.error.message }
    }

    return { success: true }
  }, [])

  return { saveDraft, publishDraft, saveOrder }
}
