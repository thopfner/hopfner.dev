"use client"

import React, { useCallback, useMemo, memo } from "react"
import Link from "next/link"
import { SectionPreview } from "@/components/admin/section-preview"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { resolveEffectivePreview } from "@/lib/admin/visual-editor/resolve-effective-visual-section"
import {
  formatType,
  versionRowToPayload,
  payloadToDraft,
  stableStringify,
} from "@/components/admin/section-editor/payload"
import { createClient } from "@/lib/supabase/browser"
import { IconWorld, IconLock, IconPencil, IconAlertTriangle, IconArrowRight } from "@tabler/icons-react"
import { SpacingHandles } from "./page-visual-editor-spacing-handles"
import type { FieldPath, LinkResources } from "@/components/landing/visual-editing-context"
import type { EditorDraft } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "./page-visual-editor-types"

type Props = {
  node: VisualSectionNode
}

/**
 * Resolve a dot-path like "meta.title" or "content.cards.0.title" to a string value.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return ""
    if (typeof current !== "object") return ""
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === "string" ? current : ""
}

/**
 * Resolve a dot-path to any value (string, object, array).
 */
function getNestedRawValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/**
 * Set a dot-path value immutably, returning a new object.
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split(".")
  if (parts.length === 1) {
    return { ...obj, [parts[0]]: value }
  }

  const [head, ...rest] = parts
  const child = obj[head]
  if (Array.isArray(child)) {
    const idx = Number(rest[0])
    if (Number.isFinite(idx)) {
      const newArr = [...child]
      if (rest.length === 1) {
        newArr[idx] = value
      } else {
        const item = newArr[idx]
        if (item && typeof item === "object" && !Array.isArray(item)) {
          newArr[idx] = setNestedValue(item as Record<string, unknown>, rest.slice(1).join("."), value)
        }
      }
      return { ...obj, [head]: newArr }
    }
    return obj
  }

  const childObj = (child && typeof child === "object" && !Array.isArray(child))
    ? child as Record<string, unknown>
    : {}
  return { ...obj, [head]: setNestedValue(childObj, rest.join("."), value) }
}

function VisualSectionNodeInner({ node }: Props) {
  const {
    pageState,
    selection,
    setSelection,
    getDirtyDraft,
    setDirtyDraft,
    clearDirtyDraft,
    isSectionDirty,
  } = useVisualEditorStore()

  const isSelected = selection?.sectionId === node.sectionId
  const isDirty = isSectionDirty(node.sectionId)
  const dirtyDraft = getDirtyDraft(node.sectionId)
  const typeLabel = formatType(node.sectionType, pageState?.sectionTypeDefaults)

  const previewData = useMemo(() => {
    if (!pageState) return null
    return resolveEffectivePreview(
      node,
      pageState.siteFormattingSettings,
      pageState.sectionTypeDefaults[node.sectionType],
      dirtyDraft,
    )
  }, [pageState, node, dirtyDraft])

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

  // Visual editing adapter callbacks
  const getFieldValue = useCallback((path: FieldPath): string => {
    if (!effectiveDraft) return ""
    const flat: Record<string, unknown> = { meta: effectiveDraft.meta, content: effectiveDraft.content }
    return getNestedValue(flat, path)
  }, [effectiveDraft])

  const getStructuredFieldValue = useCallback((path: FieldPath): unknown => {
    if (!effectiveDraft) return undefined
    const flat: Record<string, unknown> = { meta: effectiveDraft.meta, content: effectiveDraft.content }
    return getNestedRawValue(flat, path)
  }, [effectiveDraft])

  const applyDraftUpdate = useCallback((path: FieldPath, value: unknown) => {
    if (!effectiveDraft || !originalDraft) return
    let newDraft: EditorDraft

    if (path.startsWith("meta.")) {
      const metaKey = path.slice(5)
      newDraft = {
        ...effectiveDraft,
        meta: { ...effectiveDraft.meta, [metaKey]: value },
      }
    } else if (path.startsWith("content.")) {
      const contentPath = path.slice(8)
      newDraft = {
        ...effectiveDraft,
        content: setNestedValue({ ...effectiveDraft.content }, contentPath, value),
      }
    } else {
      return
    }

    // Guard B: draft-level semantic equality — if the new draft matches
    // the original, clear dirty state instead of creating a false dirty flag
    const newSig = stableStringify({ meta: newDraft.meta, content: newDraft.content })
    const origSig = stableStringify({ meta: originalDraft.meta, content: originalDraft.content })
    if (newSig === origSig) {
      clearDirtyDraft(node.sectionId)
      return
    }

    setDirtyDraft(node.sectionId, newDraft, originalDraft)
  }, [effectiveDraft, originalDraft, node.sectionId, setDirtyDraft, clearDirtyDraft])

  const updateField = useCallback((path: FieldPath, value: string) => {
    applyDraftUpdate(path, value)
  }, [applyDraftUpdate])

  const updateStructuredField = useCallback((path: FieldPath, value: unknown) => {
    applyDraftUpdate(path, value)
  }, [applyDraftUpdate])

  // Link resources — lazy-loaded pages and anchors via Supabase
  const linkResources = useMemo((): LinkResources | undefined => {
    if (!pageState) return undefined
    return {
      currentPageId: pageState.pageId,
      loadPages: async () => {
        const supabase = createClient()
        const { data } = await supabase.from("pages").select("id, slug, title").order("slug")
        return (data ?? []) as Array<{ id: string; slug: string; title: string }>
      },
      loadAnchors: async (pageId: string) => {
        const supabase = createClient()
        const { data } = await supabase.from("sections").select("key").eq("page_id", pageId).not("key", "is", null)
        return (data ?? []).map((r: { key: string }) => r.key).filter(Boolean)
      },
    }
  }, [pageState])

  // Visual editing config
  const visualEditing = useMemo(() => {
    if (!isSelected || node.isGlobal || node.isCustomComposed) return undefined
    return {
      sectionId: node.sectionId,
      getFieldValue,
      getStructuredFieldValue,
      updateField,
      updateStructuredField,
      linkResources,
    }
  }, [isSelected, node.isGlobal, node.isCustomComposed, node.sectionId, getFieldValue, getStructuredFieldValue, updateField, updateStructuredField, linkResources])

  if (!pageState || !previewData) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[var(--mantine-color-dimmed)] border border-dashed border-[var(--mantine-color-dark-4)] rounded-md">
        No version data available
      </div>
    )
  }

  const showUnsupportedBanner = node.isCustomComposed

  return (
    <div
      className={`relative group cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--mantine-color-dark-8)] z-10"
          : "hover:ring-1 hover:ring-blue-400/40 hover:z-[5]"
      } ${!node.enabled ? "opacity-40" : ""}`}
      onClick={() => setSelection({ sectionId: node.sectionId })}
    >
      <div
        className={`absolute -top-0 left-0 z-20 flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-br transition-opacity ${
          isSelected
            ? "opacity-100 bg-blue-500 text-white"
            : "opacity-0 group-hover:opacity-100 bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-text)] border-b border-r border-[var(--mantine-color-dark-4)]"
        }`}
      >
        <span className="capitalize">{typeLabel}</span>
        {node.isGlobal && <IconWorld size={10} className={isSelected ? "text-blue-200" : "text-blue-400"} />}
        {node.isGlobal && <IconLock size={9} className={isSelected ? "text-yellow-200" : "text-yellow-400"} />}
      </div>

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 pointer-events-none">
        {isDirty && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm">
            <IconPencil size={10} />
            Edited
          </span>
        )}
        {node.isGlobal && !isDirty && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
            <IconLock size={10} />
            Locked
          </span>
        )}
      </div>

      {showUnsupportedBanner && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--mantine-color-dark-7)]/80 backdrop-blur-sm rounded">
          <div className="text-center px-6 py-4 max-w-xs">
            <IconAlertTriangle size={24} className="mx-auto mb-2 text-yellow-400" />
            <p className="text-sm font-medium text-[var(--mantine-color-text)] mb-1">Custom/Composed Section</p>
            <p className="text-xs text-[var(--mantine-color-dimmed)] mb-3">
              Visual editing is not available for custom sections. Use the form editor to make changes.
            </p>
            <Link
              href={`/admin/pages/${node.pageId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-6)] transition-colors"
            >
              Open form editor
              <IconArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      <SectionPreview
        sectionType={node.sectionType}
        content={previewData.content}
        formatting={previewData.formatting}
        title={previewData.title}
        subtitle={previewData.subtitle}
        ctaPrimaryLabel={previewData.ctaPrimaryLabel}
        ctaPrimaryHref={previewData.ctaPrimaryHref}
        ctaSecondaryLabel={previewData.ctaSecondaryLabel}
        ctaSecondaryHref={previewData.ctaSecondaryHref}
        backgroundMediaUrl={previewData.backgroundMediaUrl}
        embedded
        colorMode={pageState.siteColorMode}
        siteTokens={pageState.siteTokens}
        visualEditing={visualEditing}
      />

      {isSelected && <SpacingHandles node={node} />}
    </div>
  )
}

export const VisualSectionNodeView = memo(VisualSectionNodeInner)
