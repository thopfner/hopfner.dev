"use client"

/**
 * Composed section in-context editor panel.
 * Mounts the existing CustomComposerEditor for sections with valid schemas.
 * Falls back to a truthful empty-state for sections without schema.
 */

import { useCallback, useMemo, useState, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { IconPuzzle, IconArrowRight } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/browser"
import { MediaLibraryModal } from "@/components/media-library-modal"
import type { VisualSectionNode } from "./page-visual-editor-types"
import { useVisualEditorStore } from "./page-visual-editor-store"
import {
  formatType,
  normalizeComposerSchema,
  flattenComposerSchemaBlocks,
  versionRowToPayload,
  payloadToDraft,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft, ComposerSchema, FlattenedComposerBlock } from "@/components/admin/section-editor/types"
import { uploadMedia } from "@/lib/media/upload"
import { isComposedSectionSupported } from "./composed-support"

const CustomComposerEditor = dynamic(
  () => import("@/components/admin/section-editor/editors/custom-composer-editor").then((m) => ({ default: m.CustomComposerEditor })),
  { ssr: false }
)

export function ComposedSectionPanel({ node }: { node: VisualSectionNode }) {
  const { pageState, getDirtyDraft, setDirtyDraft } = useVisualEditorStore()
  const typeLabel = formatType(node.sectionType, pageState?.sectionTypeDefaults)

  // Shared composed-support decision (same logic used by canvas node)
  const rawSchema = pageState?.composerSchemas?.[node.sectionType]
  const supported = useMemo(() => isComposedSectionSupported(rawSchema), [rawSchema])
  const schema = useMemo(() => rawSchema ? normalizeComposerSchema(rawSchema) : null, [rawSchema])
  const flatBlocks = useMemo(() => schema ? flattenComposerSchemaBlocks(schema) : [], [schema])

  // Get effective draft
  const dirtyDraft = getDirtyDraft(node.sectionId)
  const effectiveDraft = useMemo((): EditorDraft | null => {
    if (dirtyDraft) return dirtyDraft
    const version = node.draftVersion ?? node.publishedVersion
    if (!version || !pageState) return null
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, node.sectionType)
  }, [dirtyDraft, node, pageState])

  const originalDraft = useMemo((): EditorDraft | null => {
    const version = node.draftVersion ?? node.publishedVersion
    if (!version || !pageState) return null
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, node.sectionType)
  }, [node, pageState])

  // Custom block overrides from content
  const customBlockOverrides = useMemo(() => {
    if (!effectiveDraft) return {} as Record<string, unknown>
    const overrides = effectiveDraft.content._blockOverrides
    return (overrides && typeof overrides === "object" && !Array.isArray(overrides)) ? overrides as Record<string, unknown> : {}
  }, [effectiveDraft])

  // Content update helpers
  const onContentChange = useCallback((updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
    if (!effectiveDraft || !originalDraft) return
    const newDraft: EditorDraft = {
      ...effectiveDraft,
      content: updater(effectiveDraft.content),
    }
    setDirtyDraft(node.sectionId, newDraft, originalDraft)
  }, [effectiveDraft, originalDraft, node.sectionId, setDirtyDraft])

  const setContentPath = useCallback((path: string, value: unknown) => {
    onContentChange((prev) => {
      const parts = path.split(".")
      if (parts.length === 1) return { ...prev, [parts[0]]: value }
      // Simple two-level setter for block overrides
      const [head, ...rest] = parts
      const child = (prev[head] && typeof prev[head] === "object") ? { ...(prev[head] as Record<string, unknown>) } : {}
      let current = child
      for (let i = 0; i < rest.length - 1; i++) {
        const next = current[rest[i]]
        current[rest[i]] = (next && typeof next === "object") ? { ...(next as Record<string, unknown>) } : {}
        current = current[rest[i]] as Record<string, unknown>
      }
      current[rest[rest.length - 1]] = value
      return { ...prev, [head]: child }
    })
  }, [onContentChange])

  const setCustomBlockPatch = useCallback((blockId: string, patch: Record<string, unknown>) => {
    onContentChange((prev) => {
      const existing = (prev._blockOverrides && typeof prev._blockOverrides === "object") ? { ...(prev._blockOverrides as Record<string, unknown>) } : {}
      const blockData = (existing[blockId] && typeof existing[blockId] === "object") ? { ...(existing[blockId] as Record<string, unknown>) } : {}
      return { ...prev, _blockOverrides: { ...existing, [blockId]: { ...blockData, ...patch } } }
    })
  }, [onContentChange])

  const applyCustomBlockImageUrl = useCallback((blockId: string, url: string) => {
    setCustomBlockPatch(blockId, { imageUrl: url })
  }, [setCustomBlockPatch])

  const uploadToCmsMedia = useCallback(async (file: File) => {
    const result = await uploadMedia(file)
    return { publicUrl: result.url ?? "" }
  }, [])

  // No usable schema — truthful empty state (uses shared support decision)
  if (!supported) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconPuzzle size={16} className="text-purple-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-[var(--mantine-color-text)] capitalize">{typeLabel}</div>
            <div className="text-[10px] text-[var(--mantine-color-dimmed)]">Custom composed section</div>
          </div>
        </div>
        <div className="px-3 py-2 rounded bg-[var(--mantine-color-dark-6)] border border-[var(--mantine-color-dark-4)] text-xs text-[var(--mantine-color-dimmed)]">
          No editable blocks configured for this section type.
        </div>
        <Link
          href={`/admin/pages/${node.pageId}`}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-medium rounded border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-6)] transition-colors"
        >
          Open form editor <IconArrowRight size={12} />
        </Link>
      </div>
    )
  }

  // No draft data
  if (!effectiveDraft) {
    return (
      <div className="text-xs text-[var(--mantine-color-dimmed)] py-2">No version data available.</div>
    )
  }

  // Real link resources — lazy-loaded from Supabase
  const [pages, setPages] = useState<Array<{ id: string; slug: string; title: string }>>([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [anchorsByPageId, setAnchorsByPageId] = useState<Record<string, string[]>>({})
  const [anchorsLoadingByPageId, setAnchorsLoadingByPageId] = useState<Record<string, boolean>>({})
  const [mediaLibOpen, setMediaLibOpen] = useState(false)
  const mediaBlockIdRef = useRef("")

  const ensurePagesLoaded = useCallback(async () => {
    if (pages.length > 0) return
    setPagesLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from("pages").select("id, slug, title").order("slug")
      setPages((data ?? []) as Array<{ id: string; slug: string; title: string }>)
    } finally { setPagesLoading(false) }
  }, [pages.length])

  const ensureAnchorsLoaded = useCallback(async (pageId: string) => {
    if (anchorsByPageId[pageId]) return
    setAnchorsLoadingByPageId((prev) => ({ ...prev, [pageId]: true }))
    try {
      const supabase = createClient()
      const { data } = await supabase.from("sections").select("key").eq("page_id", pageId).not("key", "is", null)
      setAnchorsByPageId((prev) => ({ ...prev, [pageId]: (data ?? []).map((r: { key: string }) => r.key).filter(Boolean) }))
    } finally { setAnchorsLoadingByPageId((prev) => ({ ...prev, [pageId]: false })) }
  }, [anchorsByPageId])

  const linkMenuProps = {
    currentPageId: pageState?.pageId ?? "",
    pages,
    pagesLoading,
    anchorsByPageId,
    anchorsLoadingByPageId,
    ensurePagesLoaded,
    ensureAnchorsLoaded,
  }

  const handleOpenCustomImageLibrary = useCallback((blockId: string) => {
    mediaBlockIdRef.current = blockId
    setMediaLibOpen(true)
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconPuzzle size={16} className="text-purple-400 shrink-0" />
        <div>
          <div className="text-sm font-medium text-[var(--mantine-color-text)] capitalize">{typeLabel}</div>
          <div className="text-[10px] text-[var(--mantine-color-dimmed)]">Composed section · {flatBlocks.length} block{flatBlocks.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <CustomComposerEditor
        content={effectiveDraft.content}
        onContentChange={onContentChange}
        setContentPath={setContentPath}
        onError={() => {}}
        loading={false}
        linkMenuProps={linkMenuProps}
        flattenedCustomBlocks={flatBlocks}
        customBlockOverrides={customBlockOverrides}
        setCustomBlockPatch={setCustomBlockPatch}
        applyCustomBlockImageUrl={applyCustomBlockImageUrl}
        onOpenCustomImageLibrary={handleOpenCustomImageLibrary}
        uploadToCmsMedia={uploadToCmsMedia}
      />

      <MediaLibraryModal
        opened={mediaLibOpen}
        onClose={() => setMediaLibOpen(false)}
        onSelect={(item) => {
          if (item.url && mediaBlockIdRef.current) {
            applyCustomBlockImageUrl(mediaBlockIdRef.current, item.url)
          }
          setMediaLibOpen(false)
        }}
        title="Choose Image"
      />

      <Link
        href={`/admin/pages/${node.pageId}`}
        className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 text-[10px] font-medium rounded text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-6)] transition-colors"
      >
        Full form editor <IconArrowRight size={10} />
      </Link>
    </div>
  )
}
