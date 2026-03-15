"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import {
  versionRowToPayload,
  payloadToDraft,
} from "@/components/admin/section-editor/payload"
import {
  resolveMetaFieldVisibility,
} from "@/components/admin/section-editor/builtin-editor-contract"
import type { EditorDraft } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "./page-visual-editor-types"

type EditableField = {
  key: string
  path: "meta" | "content"
  label: string
  value: string
  multiline?: boolean
}

/**
 * Inline editing overlay — appears over a selected section on the canvas.
 * Shows small editable field chips that the user can click to edit in-place.
 */
export function InlineEditOverlay({ node }: { node: VisualSectionNode }) {
  const {
    pageState,
    selection,
    getDirtyDraft,
    setDirtyDraft,
  } = useVisualEditorStore()

  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const isSelected = selection?.sectionId === node.sectionId
  if (!isSelected || !pageState || node.isGlobal || node.isCustomComposed) return null

  const metaVisibility = resolveMetaFieldVisibility(node.sectionType, {})

  // Get the effective draft
  const dirtyDraft = getDirtyDraft(node.sectionId)
  let effectiveDraft: EditorDraft | null = dirtyDraft
  if (!effectiveDraft) {
    const version = node.draftVersion ?? node.publishedVersion
    if (!version) return null
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    effectiveDraft = payloadToDraft(payload, node.sectionType)
  }

  const originalDraft = (() => {
    const version = node.draftVersion ?? node.publishedVersion
    if (!version) return effectiveDraft
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, node.sectionType)
  })()

  // Build editable fields list
  const fields: EditableField[] = []
  if (metaVisibility.title && effectiveDraft.meta.title) {
    fields.push({ key: "title", path: "meta", label: "Title", value: effectiveDraft.meta.title })
  }
  if (metaVisibility.subtitle && effectiveDraft.meta.subtitle) {
    fields.push({ key: "subtitle", path: "meta", label: "Subtitle", value: effectiveDraft.meta.subtitle })
  }
  if (typeof effectiveDraft.content.eyebrow === "string" && effectiveDraft.content.eyebrow) {
    fields.push({ key: "eyebrow", path: "content", label: "Eyebrow", value: effectiveDraft.content.eyebrow })
  }
  if (metaVisibility.ctaPrimary && effectiveDraft.meta.ctaPrimaryLabel) {
    fields.push({ key: "ctaPrimaryLabel", path: "meta", label: "CTA", value: effectiveDraft.meta.ctaPrimaryLabel })
  }
  if (metaVisibility.ctaSecondary && effectiveDraft.meta.ctaSecondaryLabel) {
    fields.push({ key: "ctaSecondaryLabel", path: "meta", label: "CTA 2", value: effectiveDraft.meta.ctaSecondaryLabel })
  }

  if (fields.length === 0) return null

  const startEdit = (field: EditableField) => {
    setEditingField(field.key)
    setEditValue(field.value)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commitEdit = () => {
    if (!editingField || !effectiveDraft || !originalDraft) {
      setEditingField(null)
      return
    }
    const field = fields.find((f) => f.key === editingField)
    if (!field) { setEditingField(null); return }

    let newDraft: EditorDraft
    if (field.path === "meta") {
      newDraft = { ...effectiveDraft, meta: { ...effectiveDraft.meta, [field.key]: editValue } }
    } else {
      newDraft = { ...effectiveDraft, content: { ...effectiveDraft.content, [field.key]: editValue } }
    }
    setDirtyDraft(node.sectionId, newDraft, originalDraft)
    setEditingField(null)
  }

  const cancelEdit = () => {
    setEditingField(null)
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
      <div className="flex flex-wrap gap-1 p-1.5 bg-[var(--mantine-color-dark-8)]/90 backdrop-blur-sm border-t border-blue-500/30">
        {fields.map((field) => (
          editingField === field.key ? (
            <div key={field.key} className="flex items-center gap-1">
              <span className="text-[9px] text-[var(--mantine-color-dimmed)] uppercase tracking-wider shrink-0">{field.label}</span>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitEdit() }
                  if (e.key === "Escape") { e.preventDefault(); cancelEdit() }
                }}
                onBlur={commitEdit}
                className="bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-text)] border border-blue-500/50 rounded text-[11px] px-1.5 py-0.5 outline-none min-w-[120px]"
              />
            </div>
          ) : (
            <button
              key={field.key}
              type="button"
              onClick={(e) => { e.stopPropagation(); startEdit(field) }}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-[var(--mantine-color-dark-6)] border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] hover:border-blue-500/50 hover:bg-[var(--mantine-color-dark-5)] transition-colors truncate max-w-[180px]"
              title={`Edit ${field.label}: ${field.value}`}
            >
              <span className="text-[9px] text-[var(--mantine-color-dimmed)] uppercase tracking-wider shrink-0">{field.label}</span>
              <span className="truncate">{field.value}</span>
            </button>
          )
        ))}
      </div>
    </div>
  )
}
