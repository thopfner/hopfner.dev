"use client"

/**
 * Page settings actions for the visual editor.
 * Persists page backdrop through the canonical DB contract:
 * - `pages.bg_image_url` for the background image URL
 * - `pages.formatting_override` for backdrop scope and opacity settings
 *
 * Pushes unsaved draft values to the store for live preview truth.
 */

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import { useVisualEditorStore } from "./page-visual-editor-store"

type PageSettingsLocal = {
  bgImageUrl: string
  formattingOverride: Record<string, unknown>
}

export function usePageSettingsActions() {
  const { pageState, reload, setSaveStatus, setPageSettingsDraft } = useVisualEditorStore()
  const [localSettings, setLocalSettings] = useState<PageSettingsLocal | null>(null)
  const isDirty = localSettings !== null

  const effectiveBgImageUrl = localSettings?.bgImageUrl ?? pageState?.pageBgImageUrl ?? ""
  const effectiveFormattingOverride = localSettings?.formattingOverride ?? pageState?.pageFormattingOverride ?? {}

  // Push draft values to store for live preview
  useEffect(() => {
    setPageSettingsDraft(localSettings)
  }, [localSettings, setPageSettingsDraft])

  const getLocal = useCallback((): PageSettingsLocal => {
    return localSettings ?? {
      bgImageUrl: pageState?.pageBgImageUrl ?? "",
      formattingOverride: { ...(pageState?.pageFormattingOverride ?? {}) },
    }
  }, [localSettings, pageState])

  const updateBgImageUrl = useCallback((url: string) => {
    const current = getLocal()
    setLocalSettings({ ...current, bgImageUrl: url })
  }, [getLocal])

  const updateFormattingOverride = useCallback((key: string, value: unknown) => {
    const current = getLocal()
    setLocalSettings({
      ...current,
      formattingOverride: { ...current.formattingOverride, [key]: value },
    })
  }, [getLocal])

  const savePageSettings = useCallback(async () => {
    if (!pageState || !localSettings) return
    const supabase = createClient()
    setSaveStatus("saving")

    const { error } = await supabase
      .from("pages")
      .update({
        bg_image_url: localSettings.bgImageUrl.trim() || null,
        formatting_override: localSettings.formattingOverride,
      })
      .eq("id", pageState.pageId)

    if (error) {
      setSaveStatus("error", error.message)
      return
    }

    setLocalSettings(null)
    setSaveStatus("saved")
    await reload()
  }, [pageState, localSettings, reload, setSaveStatus])

  const discardPageSettings = useCallback(() => {
    setLocalSettings(null)
  }, [])

  return {
    effectiveBgImageUrl,
    effectiveFormattingOverride,
    isDirty,
    updateBgImageUrl,
    updateFormattingOverride,
    savePageSettings,
    discardPageSettings,
  }
}
