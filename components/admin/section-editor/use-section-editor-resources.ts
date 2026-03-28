"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import { isControlSupported, type SemanticControl } from "@/lib/design-system/capabilities"
import { SECTION_PRESETS, type SectionPreset } from "@/lib/design-system/presets"
import { loadSectionPresetsFromClient, loadCapabilitiesFromClient } from "@/lib/design-system/loaders"
import type { SectionCapability } from "@/lib/design-system/capabilities"
import {
  publishCmsSectionDraft,
  saveCmsSectionDraft,
} from "@/lib/cms/commands/sections"
import { uploadMedia } from "@/lib/media/upload"
import type {
  SectionRow,
  SectionScope,
  SectionVersionRow,
  SectionTypeDefault,
  SectionTypeDefaultsMap,
  CmsPageRow,
  VersionPayload,
  ComposerSchema,
  EditorDraft,
} from "./types"
import {
  isBuiltinSectionType,
  normalizeSectionType,
  normalizeComposerSchema,
  versionRowToPayload,
  defaultsToPayload,
  payloadToDraft,
  getImageSize,
} from "./payload"

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export type SectionEditorResources = {
  loading: boolean
  error: string | null
  setError: (err: string | null) => void
  versions: SectionVersionRow[]
  allowedClasses: Set<string>
  customComposerSchema: ComposerSchema | null
  pages: CmsPageRow[]
  pagesLoading: boolean
  anchorsByPageId: Record<string, string[]>
  anchorsLoadingByPageId: Record<string, boolean>
  activePresets: Record<string, SectionPreset>
  siteColorMode: "light" | "dark"
  siteTokens: Record<string, unknown>
  isControlSupportedActive: (sectionType: string, control: SemanticControl) => boolean
  normalizedType: string | null
  defaults: SectionTypeDefault | undefined
  isCustomComposedType: boolean
  ensurePagesLoaded: () => Promise<void>
  ensureAnchorsLoaded: (pageId: string) => Promise<void>
  load: (opts?: { forceHydrate?: boolean; onHydrate?: (draft: EditorDraft) => void; isDirty?: boolean }) => Promise<void>
  saveDraft: (draft: EditorDraft, onSuccess: () => Promise<void>) => Promise<void>
  saveAndPublish: (draft: EditorDraft, onSuccess: () => Promise<void>) => Promise<void>
  publishDraft: (isDirty: boolean, onSuccess: () => Promise<void>) => Promise<void>
  deleteDraft: (onSuccess: () => Promise<void>) => Promise<void>
  restoreVersion: (fromVersionId: string, onSuccess: () => Promise<void>) => Promise<void>
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string; bucket: string; path: string }>
}

export function useSectionEditorResources(
  section: SectionRow | null,
  scope: SectionScope,
  typeDefaults: SectionTypeDefaultsMap | null | undefined
): SectionEditorResources {
  const supabase = useMemo(() => createClient(), [])
  const versionTable = scope === "global" ? "global_section_versions" : "section_versions"
  const ownerIdColumn = scope === "global" ? "global_section_id" : "section_id"
  const restoreRpc = scope === "global" ? "rollback_global_section_to_version" : "restore_section_version"
  const versionSelect = `id, ${ownerIdColumn}, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at`

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versions, setVersions] = useState<SectionVersionRow[]>([])
  const [allowedClasses, setAllowedClasses] = useState<Set<string>>(new Set())
  const [customComposerSchema, setCustomComposerSchema] = useState<ComposerSchema | null>(null)

  const legacyDraftCleanupWarnedRef = useRef(false)

  // Pages / anchors (lazy loaded)
  const [pages, setPages] = useState<CmsPageRow[]>([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [anchorsByPageId, setAnchorsByPageId] = useState<Record<string, string[]>>({})
  const [anchorsLoadingByPageId, setAnchorsLoadingByPageId] = useState<Record<string, boolean>>({})
  const anchorsCacheRef = useRef<Record<string, string[]>>({})
  const anchorsPromiseRef = useRef<Partial<Record<string, Promise<void>>>>({})
  const pagesLoadedRef = useRef(false)
  const pagesPromiseRef = useRef<Promise<void> | null>(null)

  // DB-backed design system registries
  const [dbPresets, setDbPresets] = useState<Record<string, SectionPreset> | null>(null)
  const [dbCapabilities, setDbCapabilities] = useState<Record<string, SectionCapability> | null>(null)
  const [siteColorMode, setSiteColorMode] = useState<"light" | "dark">("dark")
  const [siteTokens, setSiteTokens] = useState<Record<string, unknown>>({})
  const dbPresetsRef = useRef(false)

  useEffect(() => {
    if (dbPresetsRef.current) return
    dbPresetsRef.current = true
    Promise.all([
      loadSectionPresetsFromClient(supabase),
      loadCapabilitiesFromClient(supabase),
      supabase.from("site_formatting_settings").select("settings").eq("id", "default").maybeSingle(),
    ]).then(([presets, caps, siteRes]) => {
      setDbPresets(presets)
      setDbCapabilities(caps)
      if (siteRes.data?.settings) {
        const tokens = (siteRes.data.settings as Record<string, unknown>).tokens as Record<string, unknown> | undefined
        const mode = typeof tokens?.colorMode === "string" ? tokens.colorMode : "dark"
        setSiteColorMode(mode === "light" ? "light" : "dark")
        if (tokens) setSiteTokens(tokens)
      }
    })
  }, [supabase])

  const activePresets = dbPresets ?? SECTION_PRESETS
  const isControlSupportedActive = useCallback(
    (sectionType: string, control: SemanticControl): boolean => {
      if (dbCapabilities) {
        const cap = dbCapabilities[sectionType] ?? dbCapabilities["composed"]
        return cap?.supported.includes(control) ?? false
      }
      return isControlSupported(sectionType, control)
    },
    [dbCapabilities]
  )

  const normalizedType = useMemo(() => section ? normalizeSectionType(section.section_type) : null, [section])
  const defaults = useMemo(
    () => normalizedType && isBuiltinSectionType(normalizedType) ? typeDefaults?.[normalizedType] : undefined,
    [normalizedType, typeDefaults]
  )
  const isCustomComposedType = Boolean(normalizedType && !isBuiltinSectionType(normalizedType))

  // Published / draft derivations
  const drafts = useMemo(() => versions.filter((v) => v.status === "draft").sort((a, b) => b.version - a.version), [versions])
  const activeDraft = drafts[0] ?? null

  // ---------------------------------------------------------------------------
  // Lazy loaders
  // ---------------------------------------------------------------------------

  const ensureAnchorsLoaded = useCallback(
    async (pageId: string) => {
      const pid = (pageId ?? "").trim()
      if (!pid) return
      if (anchorsCacheRef.current[pid]) return
      if (anchorsPromiseRef.current[pid]) {
        await anchorsPromiseRef.current[pid]
        return
      }

      setAnchorsLoadingByPageId((prev) => ({ ...prev, [pid]: true }))
      const p = (async () => {
        try {
          const { data, error: err } = await supabase
            .from("sections")
            .select("key, position")
            .eq("page_id", pid)
            .not("key", "is", null)
            .order("position", { ascending: true })

          if (err) throw new Error(err.message)

          const keys = ((data ?? []) as Array<{ key: string | null }>)
            .map((r) => String(r.key ?? ""))
            .filter(Boolean)
          anchorsCacheRef.current[pid] = keys
          setAnchorsByPageId((prev) => ({ ...prev, [pid]: keys }))
        } finally {
          setAnchorsLoadingByPageId((prev) => ({ ...prev, [pid]: false }))
          delete anchorsPromiseRef.current[pid]
        }
      })()

      anchorsPromiseRef.current[pid] = p
      await p
    },
    [supabase]
  )

  const ensurePagesLoaded = useCallback(async () => {
    if (pagesLoadedRef.current) return
    if (pagesPromiseRef.current) {
      await pagesPromiseRef.current
      return
    }

    setPagesLoading(true)
    const p = (async () => {
      try {
        const { data, error: err } = await supabase
          .from("pages")
          .select("id, slug, title")
          .order("slug", { ascending: true })

        if (err) throw new Error(err.message)
        setPages((data ?? []) as CmsPageRow[])
        pagesLoadedRef.current = true
      } finally {
        setPagesLoading(false)
        pagesPromiseRef.current = null
      }
    })()

    pagesPromiseRef.current = p
    await p
  }, [supabase])

  // ---------------------------------------------------------------------------
  // Core load
  // ---------------------------------------------------------------------------

  const load = useCallback(
    async ({
      forceHydrate = false,
      onHydrate,
      isDirty = false,
    }: {
      forceHydrate?: boolean
      onHydrate?: (draft: EditorDraft) => void
      isDirty?: boolean
    } = {}) => {
      if (!section) return
      setLoading(true)
      setError(null)
      try {
        const [{ data: vData, error: vErr }, { data: clsData, error: clsErr }] =
          await Promise.all([
            supabase
              .from(versionTable)
              .select(versionSelect)
              .eq(ownerIdColumn, section.id)
              .order("version", { ascending: false }),
            supabase.from("tailwind_class_whitelist").select("class"),
          ])

        if (vErr) throw new Error(vErr.message)
        if (clsErr) throw new Error(clsErr.message)

        let versionRows = (vData ?? []) as unknown as SectionVersionRow[]

        // Guard legacy data: enforce at most one active draft
        const foundDrafts = versionRows.filter((v) => v.status === "draft")
        if (foundDrafts.length > 1) {
          const sortedDrafts = foundDrafts.slice().sort((a, b) => b.version - a.version)
          const keep = sortedDrafts[0]
          const toArchive = sortedDrafts.slice(1).map((v) => v.id)
          if (toArchive.length) {
            if (!legacyDraftCleanupWarnedRef.current) {
              console.warn(
                `[CMS] Found ${foundDrafts.length} drafts for section ${section.id}. Archiving all but latest (v${keep.version}).`
              )
              legacyDraftCleanupWarnedRef.current = true
            }

            const { error: archiveError } = await supabase
              .from(versionTable)
              .update({ status: "archived" })
              .in("id", toArchive)
            if (archiveError) throw new Error(archiveError.message)

            const { data: v2Data, error: v2Err } = await supabase
              .from(versionTable)
              .select(versionSelect)
              .eq(ownerIdColumn, section.id)
              .order("version", { ascending: false })
            if (v2Err) throw new Error(v2Err.message)
            versionRows = (v2Data ?? []) as unknown as SectionVersionRow[]
          }
        }

        setVersions(versionRows)

        const clsRows = (clsData ?? []) as Array<{ class: string }>
        setAllowedClasses(new Set(clsRows.map((r) => r.class)))

        // Load custom composer schema if applicable
        let nextCustomComposerSchema: ComposerSchema | null = null
        if (section) {
          const nextType = normalizeSectionType(String(section.section_type))
          if (nextType && !isBuiltinSectionType(nextType)) {
            const { data: registryRow, error: registryError } = await supabase
              .from("section_type_registry")
              .select("key, renderer, composer_schema, is_active")
              .eq("key", nextType)
              .maybeSingle<{
                key: string
                renderer: "legacy" | "composed"
                composer_schema: Record<string, unknown> | null
                is_active: boolean
              }>()

            if (registryError) {
              throw new Error(registryError.message)
            }

            if (registryRow?.is_active && registryRow.renderer === "composed") {
              nextCustomComposerSchema = normalizeComposerSchema(registryRow.composer_schema)
            }
          }
        }
        setCustomComposerSchema(nextCustomComposerSchema)

        // Hydrate editor state if needed
        if (forceHydrate || !isDirty) {
          const nextPublished = versionRows.find((v) => v.status === "published") ?? null
          const nextDraft =
            versionRows
              .filter((v) => v.status === "draft")
              .sort((a, b) => b.version - a.version)[0] ?? null
          const nextBase = nextDraft ?? nextPublished

          let payload: VersionPayload
          if (nextBase) {
            payload = versionRowToPayload(nextBase, defaults)
          } else {
            payload = defaultsToPayload(defaults)
          }

          const draft = payloadToDraft(payload, normalizedType)
          onHydrate?.(draft)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load section.")
        setVersions([])
      } finally {
        setLoading(false)
      }
    },
    [section, supabase, versionTable, ownerIdColumn, versionSelect, defaults, normalizedType]
  )

  // ---------------------------------------------------------------------------
  // Save draft
  // ---------------------------------------------------------------------------

  const saveDraft = useCallback(
    async (draft: EditorDraft, onSuccess: () => Promise<void>) => {
      if (!section) return
      setError(null)
      setLoading(true)
      try {
        await saveCmsSectionDraft(supabase, {
          scope,
          sectionId: section.id,
          sectionType: normalizedType,
          draft,
          allowedClasses,
        })

        await onSuccess()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save draft.")
      } finally {
        setLoading(false)
      }
    },
    [section, supabase, allowedClasses, normalizedType, scope]
  )

  // ---------------------------------------------------------------------------
  // Save and publish in one step
  // ---------------------------------------------------------------------------

  const saveAndPublishFn = useCallback(
    async (draft: EditorDraft, onSuccess: () => Promise<void>) => {
      if (!section) return
      setError(null)
      setLoading(true)
      try {
        const savedDraft = await saveCmsSectionDraft(supabase, {
          scope,
          sectionId: section.id,
          sectionType: normalizedType,
          draft,
          allowedClasses,
        })
        await publishCmsSectionDraft(supabase, {
          scope,
          sectionId: section.id,
          versionId: savedDraft.id,
        })

        await onSuccess()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save and publish.")
      } finally {
        setLoading(false)
      }
    },
    [section, supabase, allowedClasses, scope, normalizedType]
  )

  // ---------------------------------------------------------------------------
  // Publish draft
  // ---------------------------------------------------------------------------

  const publishDraftFn = useCallback(
    async (isDirty: boolean, onSuccess: () => Promise<void>) => {
      if (!section) return
      if (!activeDraft) {
        setError("No draft to publish. Edit and save a draft first.")
        return
      }
      if (isDirty) {
        setError("Save draft before publishing changes.")
        return
      }
      setError(null)
      setLoading(true)
      try {
        await publishCmsSectionDraft(supabase, {
          scope,
          sectionId: section.id,
          versionId: activeDraft.id,
        })

        await onSuccess()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to publish.")
      } finally {
        setLoading(false)
      }
    },
    [section, activeDraft, scope, supabase]
  )

  // ---------------------------------------------------------------------------
  // Delete draft
  // ---------------------------------------------------------------------------

  const deleteDraftFn = useCallback(
    async (onSuccess: () => Promise<void>) => {
      if (!section) return
      if (!activeDraft) return
      setError(null)
      setLoading(true)
      try {
        const { error: delError } = await supabase
          .from(versionTable)
          .delete()
          .eq(ownerIdColumn, section.id)
          .eq("status", "draft")
        if (delError) throw new Error(delError.message)

        await onSuccess()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete draft.")
      } finally {
        setLoading(false)
      }
    },
    [section, activeDraft, supabase, versionTable, ownerIdColumn]
  )

  // ---------------------------------------------------------------------------
  // Restore version
  // ---------------------------------------------------------------------------

  const restoreVersionFn = useCallback(
    async (fromVersionId: string, onSuccess: () => Promise<void>) => {
      if (!section) return
      setError(null)
      setLoading(true)
      try {
        const restoreArgs =
          scope === "global"
            ? { p_global_section_id: section.id, p_from_version_id: fromVersionId }
            : { p_section_id: section.id, p_from_version_id: fromVersionId }
        const { data, error: rpcError } = await supabase.rpc(restoreRpc, restoreArgs)
        if (rpcError) throw new Error(rpcError.message)
        if (typeof data === "string") {
          const { error: archiveError } = await supabase
            .from(versionTable)
            .update({ status: "archived" })
            .eq(ownerIdColumn, section.id)
            .eq("status", "draft")
            .neq("id", data)
          if (archiveError) throw new Error(archiveError.message)
        }

        await onSuccess()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to restore version.")
      } finally {
        setLoading(false)
      }
    },
    [section, scope, supabase, restoreRpc, versionTable, ownerIdColumn]
  )

  // ---------------------------------------------------------------------------
  // Upload media
  // ---------------------------------------------------------------------------

  const uploadToCmsMediaFn = useCallback(
    async (file: File) => {
      const { width, height } = await getImageSize(file)
      const { bucket, path, url } = await uploadMedia(file, {
        metadata: {
          mimeType: file.type,
          sizeBytes: file.size,
          width: width ?? null,
          height: height ?? null,
          alt: null,
        },
      })

      const publicUrl = url ?? ""
      if (!publicUrl) {
        throw new Error("Upload succeeded but no public URL was returned.")
      }

      return { publicUrl, bucket, path }
    },
    []
  )

  return {
    loading,
    error,
    setError,
    versions,
    allowedClasses,
    customComposerSchema,
    pages,
    pagesLoading,
    anchorsByPageId,
    anchorsLoadingByPageId,
    siteColorMode,
    siteTokens,
    activePresets,
    isControlSupportedActive,
    normalizedType,
    defaults,
    isCustomComposedType,
    ensurePagesLoaded,
    ensureAnchorsLoaded,
    load,
    saveDraft,
    saveAndPublish: saveAndPublishFn,
    publishDraft: publishDraftFn,
    deleteDraft: deleteDraftFn,
    restoreVersion: restoreVersionFn,
    uploadToCmsMedia: uploadToCmsMediaFn,
  }
}
