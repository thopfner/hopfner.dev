"use client"

/**
 * EditableTextSlot — renders text as its original element in frontend mode.
 * In admin visual editor mode, adds editable affordances and in-place editing.
 *
 * ALL plain-text fields use one unified anchored overlay editing system.
 * Small text and large text behave identically — the overlay scales from
 * the measured display element rect.
 *
 * Field-level no-op protection: commits are skipped when the value is unchanged.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, createElement } from "react"
import { createPortal } from "react-dom"
import { useVisualEditing, type FieldPath } from "./visual-editing-context"

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div" | "blockquote" | "dt" | "dd" | "li"
  fieldPath: FieldPath
  id?: string
  className?: string
  style?: React.CSSProperties
  children: ReactNode
  multiline?: boolean
  placeholder?: string
}

export function EditableTextSlot({
  as = "span",
  fieldPath,
  id,
  className = "",
  style,
  children,
  multiline,
  placeholder,
}: Props) {
  const ctx = useVisualEditing()
  if (!ctx) {
    return createElement(as, { id, className, style }, children)
  }
  return (
    <EditableTextSlotInner
      as={as} fieldPath={fieldPath} id={id} className={className}
      style={style} multiline={multiline} placeholder={placeholder} ctx={ctx}
    >
      {children}
    </EditableTextSlotInner>
  )
}

/** Determine if a tag is display-scale heading text (gets typography downshift). */
function isLargeTextTag(tag: string): boolean {
  return tag === "h1" || tag === "h2" || tag === "h3" || tag === "blockquote"
}

// ---------------------------------------------------------------------------
// Edit-mode typography mapping for oversized display text
// ---------------------------------------------------------------------------
const EDIT_TYPOGRAPHY_MAP: Record<string, string> = {
  "text-display-xl": "text-2xl",
  "lg:text-6xl": "lg:text-3xl",
  "text-6xl": "text-3xl",
  "text-display-lg": "text-xl",
  "lg:text-5xl": "lg:text-2xl",
  "text-5xl": "text-2xl",
  "sm:text-4xl": "sm:text-2xl",
  "text-4xl": "text-2xl",
  "sm:text-3xl": "sm:text-xl",
  "text-3xl": "text-xl",
  "lg:text-4xl": "lg:text-2xl",
}

function editModeClassName(cls: string, tag: string): string {
  if (!isLargeTextTag(tag)) return cls
  let result = cls
  for (const [from, to] of Object.entries(EDIT_TYPOGRAPHY_MAP)) {
    result = result.replace(new RegExp(`(^|\\s)${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`, "g"), `$1${to}$2`)
  }
  return result
}

function EditableTextSlotInner({
  as, fieldPath, id, className, style, children, multiline, placeholder, ctx,
}: Props & { ctx: NonNullable<ReturnType<typeof useVisualEditing>> }) {
  const { focusedField, editingField, focusField, blurField, startEdit, commitEdit, cancelEdit, getFieldValue } = ctx
  const isFocused = focusedField === fieldPath
  const isEditing = editingField === fieldPath
  const editorRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const displayRef = useRef<HTMLElement>(null)
  const lastRectRef = useRef<DOMRect | null>(null)
  const originalValueRef = useRef("")
  const [localValue, setLocalValue] = useState("")

  // Continuously track display element rect while not editing
  useLayoutEffect(() => {
    if (!isEditing && displayRef.current) {
      lastRectRef.current = displayRef.current.getBoundingClientRect()
    }
  })

  // Initialize local value and auto-focus on edit start
  useEffect(() => {
    if (isEditing) {
      const val = getFieldValue(fieldPath)
      setLocalValue(val)
      originalValueRef.current = val
      requestAnimationFrame(() => {
        const el = editorRef.current
        if (!el) return
        el.focus()
        el.scrollTop = 0
        el.setSelectionRange(0, 0)
        if (el instanceof HTMLTextAreaElement) {
          el.style.height = "auto"
          el.style.height = el.scrollHeight + "px"
        }
      })
    }
  }, [isEditing, fieldPath, getFieldValue])

  // Auto-resize textarea on value change
  useEffect(() => {
    if (isEditing && editorRef.current instanceof HTMLTextAreaElement) {
      const ta = editorRef.current
      ta.style.height = "auto"
      ta.style.height = ta.scrollHeight + "px"
    }
  }, [localValue, isEditing])

  const handleCommit = useCallback(() => {
    if (localValue === originalValueRef.current) {
      cancelEdit()
      return
    }
    commitEdit(fieldPath, localValue)
  }, [commitEdit, cancelEdit, fieldPath, localValue])

  const handleCancel = useCallback(() => {
    cancelEdit()
  }, [cancelEdit])

  // Multiline: Enter creates newlines, Cmd+Enter commits
  // Single-line: Enter commits
  const isMultilineEdit = multiline || isLargeTextTag(as ?? "span")

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Escape") { e.preventDefault(); handleCancel(); return }
    if (e.key === "Enter") {
      if (isMultilineEdit && !e.metaKey && !e.ctrlKey) return
      e.preventDefault(); handleCommit(); return
    }
    if (e.key === "Tab") { e.preventDefault(); handleCommit(); return }
  }, [handleCommit, handleCancel, isMultilineEdit])

  // --- Edit mode: unified overlay for ALL plain-text fields ---
  if (isEditing) {
    const rect = lastRectRef.current
    if (!rect) {
      // Fallback: no rect measured yet, commit immediately
      cancelEdit()
      return null
    }

    const vh = typeof window !== "undefined" ? window.innerHeight : 800
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200
    const pad = 12

    // Overlay sizing: use measured element width, clamp to viewport
    const overlayWidth = Math.max(120, Math.min(rect.width + 16, vw - pad * 2))
    const maxOverlayH = Math.min(vh * 0.6, vh - Math.max(pad, rect.top) - pad)
    const clampedLeft = Math.max(pad, Math.min(rect.left - 8, vw - overlayWidth - pad))
    const clampedTop = Math.max(pad, rect.top)

    const overlayStyle: React.CSSProperties = {
      position: "fixed",
      top: clampedTop,
      left: clampedLeft,
      width: overlayWidth,
      minHeight: Math.min(rect.height + 8, maxOverlayH),
      maxHeight: maxOverlayH,
      zIndex: 9999,
      boxSizing: "border-box",
    }

    // Typography: downshift for large display text, normalize for single-line
    const editCls = editModeClassName(className ?? "", as ?? "span")

    // Single-line editor-safe treatment:
    // - generous minimum width (at least 200px or measured + padding)
    // - normalized font size (text-sm) for readability
    // - avoid inheriting truncation/overflow/display-oriented classes
    const singleLineWidth = Math.max(200, overlayWidth)
    const singleLineLeft = Math.max(pad, Math.min(rect.left - 8, vw - singleLineWidth - pad))

    const editorElement = isMultilineEdit ? (
      <textarea
        ref={editorRef as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleCommit}
        className={`${editCls} outline-none ring-2 ring-blue-500/60 rounded-md bg-[#0c0e14]/97 shadow-[0_6px_24px_rgba(0,0,0,0.45)] cursor-text resize-none block`}
        style={{ ...style, width: "100%", minHeight: rect.height, maxHeight: maxOverlayH, overflowY: "auto", padding: "0.5rem 0.75rem", lineHeight: 1.5 }}
        placeholder={placeholder}
        rows={1}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    ) : (
      <input
        ref={editorRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleCommit}
        className="text-sm font-medium text-[var(--foreground,#e5e7eb)] outline-none ring-2 ring-blue-500/60 rounded-md bg-[#0c0e14]/97 shadow-[0_6px_24px_rgba(0,0,0,0.45)] cursor-text"
        style={{ width: singleLineWidth, padding: "0.5rem 0.75rem" }}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    )

    // For single-line, override overlay positioning with the wider width
    const effectiveOverlayStyle = isMultilineEdit ? overlayStyle : {
      ...overlayStyle,
      left: singleLineLeft,
      width: singleLineWidth,
    }

    return (
      <>
        {/* Keep display element in place for layout stability */}
        {createElement(as!, { id, className: `${className} invisible`, style }, children)}
        {createPortal(<div style={effectiveOverlayStyle}>{editorElement}</div>, document.body)}
      </>
    )
  }

  // --- Display mode ---
  const focusCls = isFocused
    ? " outline-dashed outline-1 outline-blue-400/50 outline-offset-2 rounded-sm"
    : ""
  const hoverCls = " hover:outline-dashed hover:outline-1 hover:outline-blue-400/30 hover:outline-offset-2 hover:rounded-sm"

  return createElement(
    as!,
    {
      ref: displayRef,
      id,
      className: `${className}${focusCls}${hoverCls} cursor-text transition-[outline]`,
      style: { ...style, pointerEvents: "auto" as const },
      onMouseEnter: () => focusField(fieldPath),
      onMouseLeave: () => blurField(),
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); startEdit(fieldPath) },
      onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    },
    children || (placeholder ? createElement("span", { className: "opacity-40" }, placeholder) : null),
  )
}
