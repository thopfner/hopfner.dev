"use client"

/**
 * EditableRichTextSlot — renders HTML content in frontend mode.
 * In admin visual editor mode, shows an anchored rich-text editing panel.
 *
 * Persistence contract:
 * - Saves structured JSON to `richTextPath` (canonical source of truth)
 * - Optionally syncs `fallbackTextPath` with plain-text extraction
 * - Does NOT write to *Html shadow fields
 */

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useVisualEditing, type FieldPath } from "./visual-editing-context"

const TipTapMiniEditor = dynamic(
  () => import("./editable-rich-text-editor").then((m) => ({ default: m.EditableRichTextEditor })),
  { ssr: false }
)

type Props = {
  /** Field path for the rich-text JSON (canonical write target) */
  richTextPath: FieldPath
  /** Optional field path for plain-text fallback sync */
  fallbackTextPath?: FieldPath
  /** The rendered HTML string (read-only, derived from rich text) */
  html: string
  className?: string
  style?: React.CSSProperties
}

export function EditableRichTextSlot({ richTextPath, fallbackTextPath, html, className = "", style }: Props) {
  const ctx = useVisualEditing()

  if (!ctx) {
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <EditableRichTextSlotInner
      richTextPath={richTextPath}
      fallbackTextPath={fallbackTextPath}
      html={html}
      className={className}
      style={style}
      ctx={ctx}
    />
  )
}

function EditableRichTextSlotInner({
  richTextPath,
  fallbackTextPath,
  html,
  className,
  style,
  ctx,
}: Props & { ctx: NonNullable<ReturnType<typeof useVisualEditing>> }) {
  const { richEditField, focusedField, focusField, blurField, openRichEditor, closeRichEditor, updateStructuredField, updateField } = ctx
  const isEditing = richEditField === richTextPath
  const isFocused = focusedField === richTextPath
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [editorHtml, setEditorHtml] = useState(html)

  useEffect(() => {
    if (isEditing) setEditorHtml(html)
  }, [isEditing, html])

  const handleSave = useCallback((newHtml: string, newJson: unknown, plainText: string) => {
    // Write structured JSON as canonical source of truth
    if (newJson) {
      updateStructuredField(richTextPath, newJson)
    }
    // Sync fallback plain text if path is provided
    if (fallbackTextPath && plainText !== undefined) {
      updateField(fallbackTextPath, plainText)
    }
    closeRichEditor()
  }, [richTextPath, fallbackTextPath, updateStructuredField, updateField, closeRichEditor])

  const focusCls = isFocused
    ? " outline-dashed outline-1 outline-blue-400/50 outline-offset-2 rounded-sm"
    : ""
  const hoverCls = " hover:outline-dashed hover:outline-1 hover:outline-blue-400/30 hover:outline-offset-2 hover:rounded-sm"

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`${className}${focusCls}${hoverCls} cursor-text transition-[outline]`}
        style={{ ...style, pointerEvents: "auto" as const }}
        dangerouslySetInnerHTML={{ __html: html }}
        onMouseEnter={() => focusField(richTextPath)}
        onMouseLeave={() => blurField()}
        onClick={(e) => { e.stopPropagation(); openRichEditor(richTextPath) }}
        onMouseDown={(e) => e.stopPropagation()}
      />

      {(isFocused || isEditing) && !isEditing && (
        <div className="absolute -top-2 -right-2 z-20 px-1.5 py-0.5 text-[9px] font-medium rounded bg-blue-500/90 text-white shadow-sm pointer-events-none">
          Rich text
        </div>
      )}

      {isEditing && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--mantine-color-dark-7,#1a1b1e)] border border-[var(--mantine-color-dark-4,#373a40)] rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ minWidth: 400, maxWidth: 720 }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--mantine-color-dark-4,#373a40)]">
            <span className="text-[11px] font-semibold text-[var(--mantine-color-dimmed,#909296)] uppercase tracking-wider">Edit Rich Text</span>
            <button
              type="button"
              onClick={() => closeRichEditor()}
              className="w-6 h-6 flex items-center justify-center rounded text-[var(--mantine-color-dimmed,#909296)] hover:text-[var(--mantine-color-text,#c1c2c5)] hover:bg-[var(--mantine-color-dark-5,#2c2e33)] transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          <div className="p-3">
            <TipTapMiniEditor
              initialHtml={editorHtml}
              onSave={handleSave}
              onCancel={() => closeRichEditor()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
