"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconDeviceMobile,
  IconArrowsSort,
  IconCheck,
  IconAlertTriangle,
  IconExternalLink,
  IconSelector,
  IconSearch,
  IconDeviceFloppy,
  IconUpload,
  IconTrash,
} from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/browser"
import { FloatingSurface } from "./floating-surface"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { useVisualSectionPersistence } from "./use-visual-section-persistence"
import { useSelectedSectionActions } from "./use-selected-section-actions"
import { formatType } from "@/components/admin/section-editor/payload"

// ---------------------------------------------------------------------------
// Page chooser
// ---------------------------------------------------------------------------

function PageChooser({ currentPageId, currentTitle }: {
  currentPageId: string
  currentTitle: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<Array<{ id: string; slug: string; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  const loadPages = useCallback(async () => {
    if (pages.length > 0) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from("pages").select("id, slug, title").order("slug")
      setPages((data ?? []) as Array<{ id: string; slug: string; title: string }>)
    } finally {
      setLoading(false)
    }
  }, [pages.length])

  const handleOpen = useCallback(() => {
    if (triggerRef.current) setAnchorRect(triggerRef.current.getBoundingClientRect())
    setOpen(true)
    loadPages()
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [loadPages])

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const filtered = query.trim()
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase())
      )
    : pages

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : handleOpen()}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors max-w-[200px] ${
          open ? "text-blue-300" : "text-[var(--mantine-color-text)] hover:text-blue-300"
        }`}
      >
        <span className="truncate">{currentTitle}</span>
        <IconSelector size={14} className="shrink-0 text-[var(--mantine-color-dimmed)]" />
      </button>

      <FloatingSurface anchorRect={anchorRect} open={open} onClose={() => setOpen(false)} maxWidth={320} maxHeight={360}>
        <div className="p-2 border-b border-[#2c2e33]">
          <div className="relative">
            <IconSearch size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#909296]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded bg-[#25262b] border border-[#373a40] text-[#c1c2c5] placeholder:text-[#909296] outline-none focus:border-blue-500/50"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="p-1 max-h-[280px] overflow-y-auto">
          {loading ? (
            <div className="px-3 py-4 text-xs text-center text-[#909296]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-4 text-xs text-center text-[#909296]">No pages found</div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setOpen(false)
                  if (p.id !== currentPageId) router.push(`/admin/pages/${p.id}/visual`)
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                  p.id === currentPageId
                    ? "bg-blue-500/20 text-blue-200 font-medium"
                    : "text-[#c1c2c5] hover:bg-[#2c2e33]"
                }`}
              >
                <span className="block font-medium truncate">{p.title}</span>
                <span className="block text-[10px] text-[#909296] truncate">/{p.slug}</span>
              </button>
            ))
          )}
        </div>
      </FloatingSurface>
    </>
  )
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

export function VisualEditorToolbar() {
  const { pageState, viewport, setViewport, orderDirty, sectionOrder, saveStatus, saveError, setSaveStatus, reload } = useVisualEditorStore()
  const { saveOrder } = useVisualSectionPersistence(pageState)
  const { selectedNode, isDirty, handleSave, handlePublish, handleDiscard } = useSelectedSectionActions()
  const [savingOrder, setSavingOrder] = useState(false)

  const handleSaveOrder = useCallback(async () => {
    setSavingOrder(true)
    const result = await saveOrder(sectionOrder)
    if (result.success) {
      setSaveStatus("saved")
      await reload()
    } else {
      setSaveStatus("error", result.error)
    }
    setSavingOrder(false)
  }, [saveOrder, sectionOrder, setSaveStatus, reload])

  if (!pageState) return null

  const selectedTypeLabel = selectedNode
    ? formatType(selectedNode.sectionType, pageState.sectionTypeDefaults)
    : null

  return (
    <div className="relative z-50 isolate flex flex-wrap items-center justify-between gap-y-1 min-h-[44px] px-3 border-b border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] shrink-0">
      {/* Left: back + page chooser + public link */}
      <div className="flex items-center gap-2.5 min-w-0 py-1">
        <Link
          href="/admin/pages"
          className="flex items-center text-xs text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] transition-colors shrink-0"
          title="Back to pages"
        >
          <IconArrowLeft size={14} />
        </Link>
        <div className="w-px h-4 bg-[var(--mantine-color-dark-4)] shrink-0" />
        <PageChooser
          currentPageId={pageState.pageId}
          currentTitle={pageState.pageTitle}
        />
        <Link
          href={`/${pageState.pageSlug}`}
          target="_blank"
          className="flex items-center gap-1 text-[10px] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] transition-colors shrink-0"
          title="Open public page"
        >
          <IconExternalLink size={11} />
        </Link>
      </div>

      {/* Center: viewport switcher */}
      <div className="flex items-center gap-0.5 rounded-md border border-[var(--mantine-color-dark-4)] p-0.5 bg-[var(--mantine-color-dark-8)]">
        {([
          { value: "desktop" as const, icon: IconDeviceDesktop },
          { value: "tablet" as const, icon: IconDeviceTablet },
          { value: "mobile" as const, icon: IconDeviceMobile },
        ]).map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setViewport(value)}
            className={`p-1 rounded text-xs transition-all ${
              viewport === value
                ? "bg-blue-500/20 text-blue-300"
                : "text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)]"
            }`}
            title={value}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Right: section actions + status */}
      <div className="flex items-center gap-2 shrink-0 py-1">
        {/* Selected section context */}
        {selectedNode && (
          <span className="text-[10px] text-[var(--mantine-color-dimmed)] truncate max-w-[120px] capitalize hidden sm:inline">
            {selectedTypeLabel}
          </span>
        )}

        {/* Section save/publish/discard */}
        {selectedNode && isDirty && (
          <>
            <button type="button" onClick={handleSave} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              <IconDeviceFloppy size={12} />
              Save
            </button>
            <button type="button" onClick={handlePublish} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-colors">
              <IconUpload size={12} />
              Publish
            </button>
            <button type="button" onClick={handleDiscard} className="text-[10px] font-medium px-1.5 py-1 rounded text-[var(--mantine-color-dimmed)] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Discard changes">
              <IconTrash size={12} />
            </button>
          </>
        )}

        {/* Order save */}
        {orderDirty && (
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={savingOrder}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 disabled:opacity-50 transition-colors"
          >
            <IconArrowsSort size={12} />
            {savingOrder ? "..." : "Order"}
          </button>
        )}

        {/* Status */}
        {saveStatus === "saving" && <span className="text-[10px] text-[var(--mantine-color-dimmed)] animate-pulse">Saving...</span>}
        {saveStatus === "saved" && <span className="flex items-center gap-0.5 text-[10px] text-green-400"><IconCheck size={12} />Saved</span>}
        {saveStatus === "publishing" && <span className="text-[10px] text-[var(--mantine-color-dimmed)] animate-pulse">Publishing...</span>}
        {saveStatus === "published" && <span className="flex items-center gap-0.5 text-[10px] text-green-400"><IconCheck size={12} />Published</span>}
        {saveStatus === "error" && <span className="flex items-center gap-0.5 text-[10px] text-red-400" title={saveError ?? undefined}><IconAlertTriangle size={12} />Error</span>}
      </div>
    </div>
  )
}
