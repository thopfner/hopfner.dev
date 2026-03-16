"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { IconDeviceFloppy, IconX, IconExternalLink, IconPhoto, IconCheck } from "@tabler/icons-react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { usePageSettingsActions } from "./use-page-settings-actions"
import { ImageFieldPicker } from "@/components/image-field-picker"
import { MediaLibraryModal } from "@/components/media-library-modal"
import { uploadMedia } from "@/lib/media/upload"

function asString(v: unknown): string { return typeof v === "string" ? v : "" }
function asNumber(v: unknown, fallback: number): number { const n = Number(v); return Number.isFinite(n) ? n : fallback }

export function PagePanel() {
  const { pageState } = useVisualEditorStore()
  const {
    effectiveBgImageUrl,
    effectiveFormattingOverride,
    isDirty,
    updateBgImageUrl,
    updateFormattingOverride,
    savePageSettings,
    discardPageSettings,
  } = usePageSettingsActions()
  const [mediaLibOpen, setMediaLibOpen] = useState(false)

  const handleUpload = useCallback(async (file: File) => {
    const result = await uploadMedia(file)
    if (result.url) updateBgImageUrl(result.url)
  }, [updateBgImageUrl])

  if (!pageState) return null

  const backdropScope = asString(effectiveFormattingOverride.topBackdropScope) || "hero-only"
  const navOverlayOpacity = asNumber(effectiveFormattingOverride.topNavOverlayOpacity, 0.18)
  const backdropImageOpacity = asNumber(effectiveFormattingOverride.topBackdropImageOpacity, 1)
  const panelOpacity = asNumber(effectiveFormattingOverride.pagePanelOpacity, 1)
  const sectionCount = pageState.sections.length
  const globalCount = pageState.sections.filter((s) => s.isGlobal).length

  return (
    <div className="w-72 border-l border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0 overflow-hidden">
      {/* Premium page header */}
      <div className="px-4 py-3 border-b border-[var(--mantine-color-dark-4)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--mantine-color-text)] truncate">{pageState.pageTitle}</h2>
            <p className="text-[10px] text-[var(--mantine-color-dimmed)] mt-0.5">/{pageState.pageSlug}</p>
          </div>
          <Link
            href={`/${pageState.pageSlug}`}
            target="_blank"
            className="shrink-0 p-1 rounded text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-5)] transition-colors"
            title="View public page"
          >
            <IconExternalLink size={13} />
          </Link>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--mantine-color-dimmed)]">
          <span>{sectionCount} section{sectionCount !== 1 ? "s" : ""}</span>
          {globalCount > 0 && <span>{globalCount} global</span>}
          {isDirty && <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-300 font-medium">Unsaved</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Backdrop section */}
        <div className="px-4 py-3 space-y-3 border-b border-[var(--mantine-color-dark-5)]">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">
            <IconPhoto size={11} />
            Backdrop
          </div>

          <ImageFieldPicker
            title="Background Image"
            value={effectiveBgImageUrl}
            onChange={(url) => updateBgImageUrl(url)}
            onRemove={() => updateBgImageUrl("")}
            onUploadFile={handleUpload}
            onChooseFromLibrary={() => setMediaLibOpen(true)}
            compact
            showPreview
            previewHeight={72}
            titleSize="xs"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-[var(--mantine-color-dimmed)] mb-0.5">Scope</label>
              <select
                value={backdropScope}
                onChange={(e) => updateFormattingOverride("topBackdropScope", e.target.value)}
                className="w-full bg-[var(--mantine-color-dark-6)] border border-[var(--mantine-color-dark-4)] rounded text-[10px] px-1.5 py-1 text-[var(--mantine-color-text)] outline-none"
              >
                <option value="hero-only">Hero only</option>
                <option value="full-page">Full page</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-[var(--mantine-color-dimmed)] mb-0.5">Image opacity</label>
              <input type="range" min="0" max="1" step="0.05" value={backdropImageOpacity} onChange={(e) => updateFormattingOverride("topBackdropImageOpacity", parseFloat(e.target.value))}
                className="w-full h-1 accent-blue-500" />
            </div>
          </div>
        </div>

        {/* Display section */}
        <div className="px-4 py-3 space-y-3">
          <div className="text-[10px] font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">Display</div>
          <div className="space-y-2">
            <div>
              <label className="flex items-center justify-between text-[9px] text-[var(--mantine-color-dimmed)]">
                <span>Nav overlay</span>
                <span className="font-mono">{navOverlayOpacity.toFixed(2)}</span>
              </label>
              <input type="range" min="0" max="0.6" step="0.02" value={navOverlayOpacity} onChange={(e) => updateFormattingOverride("topNavOverlayOpacity", parseFloat(e.target.value))}
                className="w-full h-1 accent-blue-500" />
            </div>
            <div>
              <label className="flex items-center justify-between text-[9px] text-[var(--mantine-color-dimmed)]">
                <span>Panel opacity</span>
                <span className="font-mono">{panelOpacity.toFixed(2)}</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={panelOpacity} onChange={(e) => updateFormattingOverride("pagePanelOpacity", parseFloat(e.target.value))}
                className="w-full h-1 accent-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Persistent sticky footer — same two-slot structure in clean and dirty states */}
      <div className="px-3 py-2 border-t border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex items-center gap-2" data-testid="page-footer">
        <button
          type="button"
          onClick={isDirty ? savePageSettings : undefined}
          disabled={!isDirty}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium rounded transition-colors ${
            isDirty
              ? "bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
              : "bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-dark-2)] cursor-default"
          }`}
          data-testid="page-footer-save"
        >
          {isDirty ? (
            <><IconDeviceFloppy size={12} /> Save page settings</>
          ) : (
            <><IconCheck size={12} /> Saved</>
          )}
        </button>
        <span className="shrink-0 w-7 flex items-center justify-center" data-testid="page-footer-secondary">
          {isDirty ? (
            <button type="button" onClick={discardPageSettings} className="px-2 py-1.5 text-[10px] font-medium rounded bg-[var(--mantine-color-dark-5)] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-4)] transition-colors" title="Discard changes" data-testid="page-footer-discard">
              <IconX size={12} />
            </button>
          ) : (
            <span className="w-3 h-3 text-[var(--mantine-color-dark-3)]" />
          )}
        </span>
      </div>

      <MediaLibraryModal
        opened={mediaLibOpen}
        onClose={() => setMediaLibOpen(false)}
        onSelect={(item) => {
          if (item.url) updateBgImageUrl(item.url)
          setMediaLibOpen(false)
        }}
        title="Choose Background Image"
      />
    </div>
  )
}
