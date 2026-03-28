/**
 * Save/publish adapter for the visual editor.
 * Writes through the same tables and RPCs as the current form editor.
 */

"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/browser"
import {
  publishCmsSectionDraft,
  reorderCmsSections,
  saveCmsSectionDraft,
  type CmsCommandVersionRow,
} from "@/lib/cms/commands"
import {
  validateClassTokens,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft, SectionVersionRow } from "@/components/admin/section-editor/types"
import type { VisualSectionNode, VisualPageState } from "./page-visual-editor-types"

type SaveResult = { success: true; version: SectionVersionRow } | { success: false; error: string }

function toSectionVersionRow(version: CmsCommandVersionRow): SectionVersionRow {
  return {
    id: version.id,
    owner_id: version.ownerId,
    version: version.version,
    status: version.status,
    title: version.title,
    subtitle: version.subtitle,
    cta_primary_label: version.ctaPrimaryLabel,
    cta_primary_href: version.ctaPrimaryHref,
    cta_secondary_label: version.ctaSecondaryLabel,
    cta_secondary_href: version.ctaSecondaryHref,
    background_media_url: version.backgroundMediaUrl,
    formatting: version.formatting,
    content: version.content,
    created_at: version.createdAt,
    published_at: version.publishedAt,
  }
}

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

    try {
      const version = await saveCmsSectionDraft(supabase, {
        scope: "page",
        sectionId: node.sectionId,
        sectionType: node.sectionType,
        draft,
        allowedClasses: pageState.tailwindWhitelist,
      })
      return { success: true, version: toSectionVersionRow(version) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save draft",
      }
    }
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

    try {
      const version = await publishCmsSectionDraft(supabase, {
        scope: "page",
        sectionId: node.sectionId,
        versionId: saveResult.version.id,
      })
      return { success: true, version: toSectionVersionRow(version) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Published but failed to fetch updated version",
      }
    }
  }, [pageState, saveDraft])

  const saveOrder = useCallback(async (order: string[]): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient()
    try {
      await reorderCmsSections(supabase, { order })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save order",
      }
    }
  }, [])

  return { saveDraft, publishDraft, saveOrder }
}
