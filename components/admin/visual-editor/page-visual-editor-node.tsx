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
import { SectionActionsMenu } from "./page-visual-editor-section-actions-menu"
import { isComposedSectionSupported } from "./composed-support"
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

  // Shared composed-support decision (same logic used by inspector panel)
  const hasComposerSchema = node.isCustomComposed && isComposedSectionSupported(pageState?.composerSchemas?.[node.sectionType])
  const showUnsupportedBanner = node.isCustomComposed && !hasComposerSchema

  // Chrome elements — rendered inside SectionPreview's surface via chromeSlot
  const chromeEl = (
    <>
      {/* Surface-inset type pill */}
      <span
        data-chrome="type-pill"
        className={`absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium rounded-full backdrop-blur-sm shadow-sm pointer-events-auto transition-opacity ${
          isSelected
            ? "opacity-100 bg-blue-500/90 text-white"
            : "opacity-0 group-hover:opacity-90 bg-[var(--mantine-color-dark-7)]/90 text-[var(--mantine-color-dimmed)]"
        }`}
      >
        <span className="capitalize">{typeLabel}</span>
        {node.isGlobal && (
          <span className={`inline-flex items-center gap-0.5 ${isSelected ? "text-blue-200" : "text-blue-400"}`} title="Global · Locked">
            <IconWorld size={9} />
            <IconLock size={8} />
            <span className="text-[8px]">Global</span>
          </span>
        )}
        {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Unsaved" />}
      </span>

      {/* Top-right actions */}
      {isSelected && (
        <span className="absolute top-2 right-2 z-20 pointer-events-auto" data-chrome="actions">
          <SectionActionsMenu node={node} />
        </span>
      )}

      {/* Composed section info chip (schema-backed, not blocked) */}
      {hasComposerSchema && (
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium rounded-full bg-purple-500/20 text-purple-300 backdrop-blur-sm shadow-sm">
            Composed
          </span>
        </div>
      )}
    </>
  )

  return (
    <div
      className={`relative z-0 group cursor-pointer transition-all ${
        isSelected
          ? "ring-1 ring-blue-500/70 z-10"
          : "hover:ring-1 hover:ring-blue-400/30 hover:z-[5]"
      } ${!node.enabled ? "opacity-40" : ""}`}
      onClick={() => setSelection({ sectionId: node.sectionId })}
    >
      {/* Unsupported banner — only for sections with NO schema (stays on node wrapper at z-30) */}
      {showUnsupportedBanner && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--mantine-color-dark-7)]/80 backdrop-blur-sm rounded">
          <div className="text-center px-6 py-4 max-w-xs">
            <IconAlertTriangle size={20} className="mx-auto mb-2 text-yellow-400" />
            <p className="text-xs font-medium text-[var(--mantine-color-text)] mb-1">Custom Section</p>
            <p className="text-[10px] text-[var(--mantine-color-dimmed)] mb-3">
              No editor schema configured. Use the form editor.
            </p>
            <Link
              href={`/admin/pages/${node.pageId}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-6)] transition-colors"
            >
              Form editor <IconArrowRight size={10} />
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
        chromeSlot={chromeEl}
        visualEditing={visualEditing}
      />

      {isSelected && <SpacingHandles node={node} />}
    </div>
  )
}

export const VisualSectionNodeView = memo(VisualSectionNodeInner)
