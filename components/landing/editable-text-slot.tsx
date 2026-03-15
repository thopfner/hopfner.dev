"use client"

/**
 * EditableTextSlot — renders text as its original element in frontend mode.
 * In admin visual editor mode, adds editable affordances and in-place editing.
 *
 * For display-scale headings (h1/h2/h3/blockquote): anchored overlay editor
 * with intentionally reduced edit-mode typography for comfortable authoring.
 *
 * For single-line compact labels: inline input replacement.
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

/** Determine if a tag is display-scale heading text. */
function isLargeTextTag(tag: string): boolean {
  return tag === "h1" || tag === "h2" || tag === "h3" || tag === "blockquote"
}

// ---------------------------------------------------------------------------
// Edit-mode typography mapping
// Reduces oversized display classes to comfortable editing sizes.
// Only applied to overlay-edited display text, not normal paragraphs.
// ---------------------------------------------------------------------------
const EDIT_TYPOGRAPHY_MAP: Record<string, string> = {
  // Display XL → LG
  "text-display-xl": "text-2xl",
  "lg:text-6xl": "lg:text-3xl",
  "text-6xl": "text-3xl",
  // Display LG → MD
  "text-display-lg": "text-xl",
  "lg:text-5xl": "lg:text-2xl",
  "text-5xl": "text-2xl",
  // Large headings → one step smaller
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
    // Replace as whole word to avoid partial matches
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const displayRef = useRef<HTMLElement>(null)
  const lastRectRef = useRef<DOMRect | null>(null)
  const originalValueRef = useRef("")
  const [localValue, setLocalValue] = useState("")
  const useOverlay = multiline || isLargeTextTag(as ?? "span")

  // Track display element rect continuously while not editing
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
        const el = inputRef.current
        if (!el) return
        el.focus()
        // Force top-of-text visibility
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
    if (isEditing && useOverlay && inputRef.current instanceof HTMLTextAreaElement) {
      const ta = inputRef.current
      ta.style.height = "auto"
      ta.style.height = ta.scrollHeight + "px"
    }
  }, [localValue, isEditing, useOverlay])

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Escape") { e.preventDefault(); handleCancel(); return }
    if (e.key === "Enter") {
      if ((multiline || useOverlay) && !e.metaKey && !e.ctrlKey) return
      e.preventDefault(); handleCommit(); return
    }
    if (e.key === "Tab") { e.preventDefault(); handleCommit(); return }
  }, [handleCommit, handleCancel, multiline, useOverlay])

  // --- Edit mode ---
  if (isEditing) {
    const rect = lastRectRef.current

    // Overlay editor for display-scale headings
    if (useOverlay && rect) {
      // Viewport clamping
      const vh = typeof window !== "undefined" ? window.innerHeight : 800
      const vw = typeof window !== "undefined" ? window.innerWidth : 1200
      const pad = 16
      const maxOverlayH = Math.min(vh * 0.6, vh - rect.top - pad)
      const clampedLeft = Math.max(pad, Math.min(rect.left, vw - rect.width - pad))
      const clampedTop = Math.max(pad, rect.top)

      const overlayStyle: React.CSSProperties = {
        position: "fixed",
        top: clampedTop,
        left: clampedLeft,
        width: Math.min(rect.width, vw - pad * 2),
        minHeight: Math.min(rect.height, maxOverlayH),
        maxHeight: maxOverlayH,
        zIndex: 9999,
        boxSizing: "border-box",
      }

      // Edit-mode typography: reduce display classes for comfort
      const editCls = editModeClassName(className ?? "", as ?? "span")

      const overlay = (
        <div style={overlayStyle}>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCommit}
            className={`${editCls} outline-none ring-2 ring-blue-500/60 rounded-md bg-[#0c0e14]/97 shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-text resize-none block`}
            style={{
              ...style,
              width: "100%",
              minHeight: Math.min(rect.height, maxOverlayH),
              maxHeight: maxOverlayH,
              overflowY: "auto",
              padding: "0.75rem 1rem",
              lineHeight: 1.5,
            }}
            placeholder={placeholder}
            rows={1}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      )

      return (
        <>
          {createElement(as!, { id, className: `${className} invisible`, style }, children)}
          {createPortal(overlay, document.body)}
        </>
      )
    }

    // Inline editor for small/single-line text
    const mw = rect?.width ?? 0
    const mh = rect?.height ?? 0
    const editCls = `${className} outline-none ring-1 ring-blue-500/60 rounded-sm bg-transparent cursor-text min-w-[2ch]`
    const editorStyle: React.CSSProperties = {
      ...style,
      minWidth: mw > 0 ? mw : undefined,
      minHeight: mh > 0 ? mh : undefined,
      width: mw > 0 ? mw + 8 : "100%",
    }

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCommit}
          className={editCls + " resize-none block overflow-hidden"}
          style={editorStyle}
          placeholder={placeholder}
          rows={1}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleCommit}
        className={editCls}
        style={editorStyle}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
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
