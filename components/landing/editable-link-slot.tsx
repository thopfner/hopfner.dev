"use client"

/**
 * EditableLinkSlot — CTA link/button with CMS-grade in-place editing.
 * Label editing: inline text input.
 * Href editing: anchored popover with page/anchor/custom URL screens
 * that match the form editor's semantic link model.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useVisualEditing, type FieldPath } from "./visual-editing-context"
import { parseHref, buildHref } from "@/components/admin/section-editor/payload"

type Props = {
  labelPath: FieldPath
  hrefPath: FieldPath
  className?: string
  style?: React.CSSProperties
  children: ReactNode
}

export function EditableLinkSlot({ labelPath, hrefPath, className = "", style, children }: Props) {
  const ctx = useVisualEditing()
  if (!ctx) return <>{children}</>
  return (
    <EditableLinkSlotInner labelPath={labelPath} hrefPath={hrefPath} className={className} style={style} ctx={ctx}>
      {children}
    </EditableLinkSlotInner>
  )
}

type LinkScreen = "root" | "this_page" | "pages" | "page_sections" | "custom"

function EditableLinkSlotInner({ labelPath, hrefPath, className, style, children, ctx }: Props & { ctx: NonNullable<ReturnType<typeof useVisualEditing>> }) {
  const { editingField, linkEditField, startEdit, commitEdit, cancelEdit, openLinkEditor, closeLinkEditor, getFieldValue, updateField, focusField, blurField, linkResources } = ctx
  const isEditingLabel = editingField === labelPath
  const isEditingLink = linkEditField === hrefPath
  const inputRef = useRef<HTMLInputElement>(null)
  const linkBtnRef = useRef<HTMLButtonElement>(null)
  const [linkAnchorRect, setLinkAnchorRect] = useState<DOMRect | null>(null)
  const [localLabel, setLocalLabel] = useState("")

  // Link picker state
  const [screen, setScreen] = useState<LinkScreen>("root")
  const [pages, setPages] = useState<Array<{ id: string; slug: string; title: string }>>([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState("")
  const [anchors, setAnchors] = useState<string[]>([])
  const [anchorsLoading, setAnchorsLoading] = useState(false)
  const [customDraft, setCustomDraft] = useState("")

  useEffect(() => {
    if (isEditingLabel) {
      setLocalLabel(getFieldValue(labelPath))
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isEditingLabel, labelPath, getFieldValue])

  useEffect(() => {
    if (isEditingLink) {
      setScreen("root")
      setSelectedPageId("")
      setCustomDraft("")
    }
  }, [isEditingLink])

  const handleLabelCommit = useCallback(() => { commitEdit(labelPath, localLabel) }, [commitEdit, labelPath, localLabel])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); return }
    if (e.key === "Enter") { e.preventDefault(); handleLabelCommit(); return }
  }, [handleLabelCommit, cancelEdit])

  const setHref = useCallback((href: string) => {
    updateField(hrefPath, href)
    closeLinkEditor()
  }, [updateField, hrefPath, closeLinkEditor])

  const loadPages = useCallback(async () => {
    if (!linkResources || pages.length > 0) return
    setPagesLoading(true)
    try {
      const loaded = await linkResources.loadPages()
      setPages(loaded)
    } finally { setPagesLoading(false) }
  }, [linkResources, pages.length])

  const loadAnchors = useCallback(async (pageId: string) => {
    if (!linkResources) return
    setAnchorsLoading(true)
    try {
      const loaded = await linkResources.loadAnchors(pageId)
      setAnchors(loaded)
    } finally { setAnchorsLoading(false) }
  }, [linkResources])

  const enterThisPage = useCallback(() => {
    setScreen("this_page")
    if (linkResources) loadAnchors(linkResources.currentPageId)
  }, [linkResources, loadAnchors])

  const enterPages = useCallback(() => {
    setScreen("pages")
    loadPages()
  }, [loadPages])

  const enterPageSections = useCallback((pageId: string) => {
    setSelectedPageId(pageId)
    setScreen("page_sections")
    loadAnchors(pageId)
  }, [loadAnchors])

  const currentHref = isEditingLink ? getFieldValue(hrefPath) : ""
  const parsed = parseHref(currentHref)
  const selectedPage = pages.find((p) => p.id === selectedPageId)

  // Label editing mode
  if (isEditingLabel) {
    return (
      <span className={`${className} relative inline-flex`} style={{ ...style, pointerEvents: "auto" as const }}>
        <input
          ref={inputRef} type="text" value={localLabel}
          onChange={(e) => setLocalLabel(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={handleLabelCommit}
          className="bg-transparent outline-none ring-1 ring-blue-500/60 rounded-sm min-w-[4ch] text-inherit font-inherit"
          style={{ width: `${Math.max(4, localLabel.length + 1)}ch` }}
          onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}
        />
      </span>
    )
  }

  const menuItemCls = "w-full text-left px-3 py-1.5 text-xs text-[var(--mantine-color-text,#c1c2c5)] hover:bg-[var(--mantine-color-dark-5,#2c2e33)] rounded transition-colors"
  const backBtnCls = "w-full text-left px-3 py-1.5 text-xs text-[var(--mantine-color-dimmed,#909296)] hover:bg-[var(--mantine-color-dark-5,#2c2e33)] rounded transition-colors flex items-center gap-1"

  return (
    <span
      className={`${className} relative group/cta`}
      style={{ ...style, pointerEvents: "auto" as const }}
      onMouseEnter={() => focusField(labelPath)} onMouseLeave={() => blurField()}
    >
      <span
        className="cursor-text hover:outline-dashed hover:outline-1 hover:outline-blue-400/30 hover:outline-offset-1 hover:rounded-sm"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(labelPath) }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </span>

      <button
        ref={linkBtnRef}
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (linkBtnRef.current) setLinkAnchorRect(linkBtnRef.current.getBoundingClientRect()); openLinkEditor(hrefPath) }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] opacity-0 group-hover/cta:opacity-100 transition-opacity shadow-md z-10"
        title="Edit link destination"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>

      {/* CMS-grade link picker — portaled to body for proper layering */}
      {isEditingLink && linkAnchorRect && typeof document !== "undefined" && createPortal(
        <LinkPickerPanel
          anchorRect={linkAnchorRect}
          currentHref={currentHref}
          parsed={parsed}
          screen={screen} setScreen={setScreen}
          pages={pages} pagesLoading={pagesLoading} selectedPage={selectedPage}
          anchors={anchors} anchorsLoading={anchorsLoading}
          customDraft={customDraft} setCustomDraft={setCustomDraft}
          enterThisPage={enterThisPage} enterPages={enterPages} enterPageSections={enterPageSections}
          setHref={setHref} closeLinkEditor={closeLinkEditor}
        />,
        document.body
      )}
    </span>
  )
}

/** Portaled link picker panel */
function LinkPickerPanel({
  anchorRect, currentHref, parsed, screen, setScreen,
  pages, pagesLoading, selectedPage, anchors, anchorsLoading,
  customDraft, setCustomDraft,
  enterThisPage, enterPages, enterPageSections,
  setHref, closeLinkEditor,
}: {
  anchorRect: DOMRect
  currentHref: string
  parsed: ReturnType<typeof parseHref>
  screen: LinkScreen
  setScreen: (s: LinkScreen) => void
  pages: Array<{ id: string; slug: string; title: string }>
  pagesLoading: boolean
  selectedPage: { id: string; slug: string; title: string } | undefined
  anchors: string[]
  anchorsLoading: boolean
  customDraft: string
  setCustomDraft: (v: string | ((prev: string) => string)) => void
  enterThisPage: () => void
  enterPages: () => void
  enterPageSections: (pageId: string) => void
  setHref: (href: string) => void
  closeLinkEditor: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeLinkEditor()
      }
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler) }
  }, [closeLinkEditor])

  // Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeLinkEditor() }
    }
    document.addEventListener("keydown", handler, true)
    return () => document.removeEventListener("keydown", handler, true)
  }, [closeLinkEditor])

  const pad = 12
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200
  const vh = typeof window !== "undefined" ? window.innerHeight : 800
  const maxW = Math.min(300, vw - pad * 2)
  const maxH = Math.min(380, vh - pad * 2)
  const left = Math.max(pad, Math.min(anchorRect.left, vw - maxW - pad))
  const top = Math.min(anchorRect.bottom + 4, vh - maxH - pad)

  const menuItemCls = "w-full text-left px-3 py-1.5 text-xs text-[#c1c2c5] hover:bg-[#2c2e33] rounded transition-colors truncate"
  const backBtnCls = "w-full text-left px-3 py-1.5 text-xs text-[#909296] hover:bg-[#2c2e33] rounded transition-colors flex items-center gap-1"

  return (
        <div
          ref={panelRef}
          style={{ position: "fixed", top, left, width: maxW, maxHeight: maxH, zIndex: 99999 }}
          className="bg-[#1a1b1e] border border-[#373a40] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-5,#2c2e33)] flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[var(--mantine-color-dimmed,#909296)] uppercase tracking-wider">Link Destination</span>
            {currentHref && (
              <span className="text-[9px] text-[var(--mantine-color-dimmed,#909296)] truncate max-w-[140px]">→ {currentHref}</span>
            )}
          </div>

          <div className="p-1.5 space-y-0.5 max-h-[300px] overflow-y-auto">
            {screen === "root" && (
              <>
                <button type="button" className={menuItemCls} onClick={enterThisPage}>
                  # This page section
                </button>
                <button type="button" className={menuItemCls} onClick={enterPages}>
                  ↗ Another page
                </button>
                <button type="button" className={menuItemCls} onClick={() => { setScreen("custom"); setCustomDraft(parsed.kind === "custom" ? parsed.href : currentHref) }}>
                  🔗 Custom URL...
                </button>
                <div className="border-t border-[var(--mantine-color-dark-5,#2c2e33)] my-1" />
                <button type="button" className={`${menuItemCls} text-red-400`} onClick={() => setHref("")}>
                  Clear link
                </button>
              </>
            )}

            {screen === "this_page" && (
              <>
                <button type="button" className={backBtnCls} onClick={() => setScreen("root")}>← Back</button>
                <div className="px-2 py-1 text-[9px] font-semibold text-[var(--mantine-color-dimmed,#909296)] uppercase">This page sections</div>
                {anchorsLoading ? (
                  <div className="px-3 py-2 text-xs text-[var(--mantine-color-dimmed,#909296)]">Loading...</div>
                ) : anchors.length > 0 ? (
                  anchors.map((k) => (
                    <button key={k} type="button" className={menuItemCls} onClick={() => setHref(buildHref({ kind: "this_page_anchor", anchor: k }))}>
                      #{k}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-[var(--mantine-color-dimmed,#909296)]">No keyed sections</div>
                )}
              </>
            )}

            {screen === "pages" && (
              <>
                <button type="button" className={backBtnCls} onClick={() => setScreen("root")}>← Back</button>
                <div className="px-2 py-1 text-[9px] font-semibold text-[var(--mantine-color-dimmed,#909296)] uppercase">Pages</div>
                {pagesLoading ? (
                  <div className="px-3 py-2 text-xs text-[var(--mantine-color-dimmed,#909296)]">Loading...</div>
                ) : pages.map((p) => (
                  <button key={p.id} type="button" className={menuItemCls} onClick={() => enterPageSections(p.id)}>
                    {p.title} <span className="text-[var(--mantine-color-dimmed,#909296)]">/{p.slug}</span>
                  </button>
                ))}
              </>
            )}

            {screen === "page_sections" && selectedPage && (
              <>
                <button type="button" className={backBtnCls} onClick={() => setScreen("pages")}>← Back</button>
                <div className="px-2 py-1 text-[9px] font-semibold text-[var(--mantine-color-dimmed,#909296)] uppercase">{selectedPage.title}</div>
                <button type="button" className={menuItemCls} onClick={() => setHref(`/${selectedPage.slug}`)}>
                  Top of page
                </button>
                {anchorsLoading ? (
                  <div className="px-3 py-2 text-xs text-[var(--mantine-color-dimmed,#909296)]">Loading sections...</div>
                ) : anchors.length > 0 ? (
                  anchors.map((k) => (
                    <button key={k} type="button" className={menuItemCls} onClick={() => setHref(buildHref({ kind: "page_anchor", pageSlug: selectedPage.slug, anchor: k }))}>
                      #{k}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-[var(--mantine-color-dimmed,#909296)]">No keyed sections</div>
                )}
              </>
            )}

            {screen === "custom" && (
              <>
                <button type="button" className={backBtnCls} onClick={() => setScreen("root")}>← Back</button>
                <div className="px-1.5 py-1 space-y-1.5">
                  <input
                    type="text" value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); setHref(customDraft.trim()) } if (e.key === "Escape") { e.preventDefault(); closeLinkEditor() } }}
                    placeholder="https://... or mailto:... or /page#section"
                    className="w-full bg-[var(--mantine-color-dark-6,#25262b)] text-[var(--mantine-color-text,#c1c2c5)] border border-[var(--mantine-color-dark-4,#373a40)] rounded text-xs px-2 py-1.5 outline-none focus:border-blue-500/50"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setCustomDraft((v) => v.startsWith("mailto:") ? v : `mailto:${v.replace(/^(mailto:|tel:)/, "")}`)}
                      className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[var(--mantine-color-dark-5,#2c2e33)] text-[var(--mantine-color-dimmed,#909296)] hover:text-[var(--mantine-color-text,#c1c2c5)]">
                      mailto:
                    </button>
                    <button type="button" onClick={() => setCustomDraft((v) => v.startsWith("tel:") ? v : `tel:${v.replace(/^(mailto:|tel:)/, "")}`)}
                      className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[var(--mantine-color-dark-5,#2c2e33)] text-[var(--mantine-color-dimmed,#909296)] hover:text-[var(--mantine-color-text,#c1c2c5)]">
                      tel:
                    </button>
                    <div className="flex-1" />
                    <button type="button" onClick={() => setHref(customDraft.trim())}
                      className="px-2.5 py-0.5 text-[10px] font-medium rounded bg-blue-600 text-white hover:bg-blue-500">
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
  )
}
