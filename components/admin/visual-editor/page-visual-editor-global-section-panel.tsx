"use client"
import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import {
  IconWorld,
  IconExternalLink,
  IconDeviceFloppy,
  IconUpload,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react"
import type { VisualSectionNode } from "./page-visual-editor-types"
import {
  formatType,
  versionRowToPayload,
  payloadToDraft,
  normalizeFormatting,
} from "@/components/admin/section-editor/payload"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { useVisualSectionPersistence } from "./use-visual-section-persistence"
import { MediaField } from "./page-visual-editor-media-field"
import type { EditorDraft } from "@/components/admin/section-editor/types"
import {
  getSharedCtaEnabled,
  getFooterCardCtaEnabled,
} from "@/lib/cms/cta-visibility"

// ---------------------------------------------------------------------------
// Small UI helpers (same style as inspector)
// ---------------------------------------------------------------------------

function GInput({ label, value, onChange, placeholder, multiline, disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; disabled?: boolean
}) {
  const cls = "w-full bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-text)] border border-[var(--mantine-color-dark-4)] rounded text-xs px-2 py-1.5 outline-none focus:border-blue-500/50 transition-colors placeholder:text-[var(--mantine-color-dimmed)] disabled:opacity-40 disabled:cursor-not-allowed"
  return (
    <div>
      <label className="block text-[10px] font-medium text-[var(--mantine-color-dimmed)] mb-0.5 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={cls + " resize-none"} disabled={disabled} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} disabled={disabled} />
      )}
    </div>
  )
}

function GSelect({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-[var(--mantine-color-dimmed)] mb-0.5 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-text)] border border-[var(--mantine-color-dark-4)] rounded text-xs px-2 py-1.5 outline-none focus:border-blue-500/50 transition-colors">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function GDivider({ label }: { label: string }) {
  return (
    <div className="pt-2">
      <div className="text-[10px] font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider border-b border-[var(--mantine-color-dark-4)] pb-1">{label}</div>
    </div>
  )
}

function GCollapsible({ label, defaultOpen, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? true)
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full pt-2 pb-1 text-[10px] font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider border-b border-[var(--mantine-color-dark-4)] hover:text-[var(--mantine-color-text)] transition-colors">
        {open ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />}
        {label}
      </button>
      {open && <div className="space-y-2 pt-1.5">{children}</div>}
    </div>
  )
}

function GArrayEditor({ label, items, fields, onUpdate }: {
  label: string
  items: Record<string, unknown>[]
  fields: { key: string; label: string; multiline?: boolean }[]
  onUpdate: (newItems: Record<string, unknown>[]) => void
}) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onUpdate(next)
  }
  const removeItem = (idx: number) => onUpdate(items.filter((_, i) => i !== idx))
  const addItem = () => {
    const blank: Record<string, unknown> = {}
    fields.forEach((f) => { blank[f.key] = "" })
    onUpdate([...items, blank])
  }
  const updateField = (idx: number, key: string, value: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [key]: value }
    onUpdate(next)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-[var(--mantine-color-dimmed)] uppercase tracking-wider">{label}</span>
        <button type="button" onClick={addItem}
          className="flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
          <IconPlus size={10} /> Add
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="border border-[var(--mantine-color-dark-4)] rounded overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-1 bg-[var(--mantine-color-dark-6)] cursor-pointer"
            onClick={() => setExpanded(expanded === idx ? null : idx)}>
            <span className="flex-1 text-[10px] text-[var(--mantine-color-text)] truncate">
              {String(item[fields[0]?.key] || `Item ${idx + 1}`).slice(0, 40)}
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveItem(idx, -1) }}
              className="text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)]"><IconArrowUp size={10} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveItem(idx, 1) }}
              className="text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)]"><IconArrowDown size={10} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeItem(idx) }}
              className="text-red-400/60 hover:text-red-400"><IconTrash size={10} /></button>
          </div>
          {expanded === idx && (
            <div className="p-2 space-y-1.5 bg-[var(--mantine-color-dark-7)]">
              {fields.map((f) => (
                <GInput key={f.key} label={f.label} value={String(item[f.key] ?? "")}
                  onChange={(v) => updateField(idx, f.key, v)} multiline={f.multiline} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const s = (v: unknown) => typeof v === "string" ? v : ""

function GToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-blue-500" />
      <span className={`text-[10px] font-medium uppercase tracking-wider ${checked ? "text-[var(--mantine-color-text)]" : "text-[var(--mantine-color-dimmed)]"}`}>{label}</span>
    </label>
  )
}
const arr = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.map((i) => (i && typeof i === "object" ? i as Record<string, unknown> : {})) : []

// ---------------------------------------------------------------------------
// Nav links content editor
// ---------------------------------------------------------------------------

function NavLinksContent({ content, onContentChange, meta, onMetaChange }: {
  content: Record<string, unknown>
  onContentChange: (key: string, value: unknown) => void
  meta: { ctaPrimaryLabel: string; ctaPrimaryHref: string }
  onMetaChange: (key: string, value: string) => void
}) {
  const logo = content.logo && typeof content.logo === "object" ? content.logo as Record<string, unknown> : {}
  const ctaEnabled = getSharedCtaEnabled(content, "ctaPrimary")

  return (
    <>
      <GCollapsible label="Logo" defaultOpen>
        <MediaField label="Logo Image" value={s(logo.url)} onChange={(v) => onContentChange("logo", { ...logo, url: v })} />
        <GInput label="Alt Text" value={s(logo.alt)} onChange={(v) => onContentChange("logo", { ...logo, alt: v })} placeholder="Site logo" />
        <GInput label="Width (px)" value={String(logo.widthPx ?? 140)} onChange={(v) => {
          const n = parseInt(v, 10)
          if (Number.isFinite(n)) onContentChange("logo", { ...logo, widthPx: Math.min(320, Math.max(60, n)) })
        }} />
      </GCollapsible>

      <GCollapsible label="Nav Links" defaultOpen>
        <GArrayEditor label="Links" items={arr(content.links)}
          fields={[{ key: "label", label: "Label" }, { key: "href", label: "Link URL" }, { key: "anchorId", label: "Anchor ID" }]}
          onUpdate={(items) => onContentChange("links", items)} />
      </GCollapsible>

      <GCollapsible label="Header CTA" defaultOpen>
        <GToggle label="Show CTA" checked={ctaEnabled} onChange={(v) => onContentChange("ctaPrimaryEnabled", v)} />
        <GInput label="CTA Label" value={meta.ctaPrimaryLabel} onChange={(v) => onMetaChange("ctaPrimaryLabel", v)} placeholder="Book a call" disabled={!ctaEnabled} />
        <GInput label="CTA Link" value={meta.ctaPrimaryHref} onChange={(v) => onMetaChange("ctaPrimaryHref", v)} placeholder="#contact" disabled={!ctaEnabled} />
      </GCollapsible>
    </>
  )
}

// ---------------------------------------------------------------------------
// Footer grid content editor
// ---------------------------------------------------------------------------

function FooterGridContent({ content, onContentChange }: {
  content: Record<string, unknown>
  onContentChange: (key: string, value: unknown) => void
}) {
  const legal = content.legal && typeof content.legal === "object" ? content.legal as Record<string, unknown> : {}

  return (
    <>
      <GInput label="Brand Text" value={s(content.brandText)} onChange={(v) => onContentChange("brandText", v)} />

      <GCollapsible label="Footer Cards" defaultOpen>
        {arr(content.cards).map((card, idx) => {
          const cards = arr(content.cards)
          const updateCard = (key: string, value: unknown) => {
            const next = [...cards]
            next[idx] = { ...next[idx], [key]: value }
            onContentChange("cards", next)
          }
          const cardLinks = Array.isArray(card.links) ? card.links.map((l: unknown) => (l && typeof l === "object" ? l as Record<string, unknown> : { label: "", href: "" })) : []
          return (
            <GCollapsible key={idx} label={s(card.title) || `Card ${idx + 1}`} defaultOpen={false}>
              <GInput label="Title" value={s(card.title)} onChange={(v) => updateCard("title", v)} />
              <GInput label="Body" value={s(card.body)} onChange={(v) => updateCard("body", v)} multiline />
              <GSelect label="Links Mode" value={s(card.linksMode) || "flat"}
                options={[{ value: "flat", label: "Flat" }, { value: "grouped", label: "Grouped" }]}
                onChange={(v) => updateCard("linksMode", v)} />
              <GArrayEditor label="Links" items={cardLinks}
                fields={[{ key: "label", label: "Label" }, { key: "href", label: "Link URL" }]}
                onUpdate={(items) => updateCard("links", items)} />
              {/* Per-card CTA toggles */}
              {(() => {
                const ctaPri = card.ctaPrimary && typeof card.ctaPrimary === "object" ? card.ctaPrimary as Record<string, unknown> : {}
                const ctaSec = card.ctaSecondary && typeof card.ctaSecondary === "object" ? card.ctaSecondary as Record<string, unknown> : {}
                return (
                  <>
                    <GToggle label="Show CTA 1" checked={getFooterCardCtaEnabled(card, "ctaPrimary")}
                      onChange={(v) => updateCard("ctaPrimary", { ...ctaPri, enabled: v })} />
                    <GInput label="CTA 1 Label" value={s(ctaPri.label)} onChange={(v) => updateCard("ctaPrimary", { ...ctaPri, label: v })} disabled={!getFooterCardCtaEnabled(card, "ctaPrimary")} />
                    <GInput label="CTA 1 Link" value={s(ctaPri.href)} onChange={(v) => updateCard("ctaPrimary", { ...ctaPri, href: v })} disabled={!getFooterCardCtaEnabled(card, "ctaPrimary")} />
                    <GToggle label="Show CTA 2" checked={getFooterCardCtaEnabled(card, "ctaSecondary")}
                      onChange={(v) => updateCard("ctaSecondary", { ...ctaSec, enabled: v })} />
                    <GInput label="CTA 2 Label" value={s(ctaSec.label)} onChange={(v) => updateCard("ctaSecondary", { ...ctaSec, label: v })} disabled={!getFooterCardCtaEnabled(card, "ctaSecondary")} />
                    <GInput label="CTA 2 Link" value={s(ctaSec.href)} onChange={(v) => updateCard("ctaSecondary", { ...ctaSec, href: v })} disabled={!getFooterCardCtaEnabled(card, "ctaSecondary")} />
                  </>
                )
              })()}
              <div className="flex gap-1 pt-1">
                <button type="button" onClick={() => {
                  const next = [...cards]
                  if (idx > 0) { [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; onContentChange("cards", next) }
                }} disabled={idx === 0}
                  className="text-[10px] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] disabled:opacity-30">Move up</button>
                <button type="button" onClick={() => {
                  const next = [...cards]
                  if (idx < next.length - 1) { [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; onContentChange("cards", next) }
                }} disabled={idx === cards.length - 1}
                  className="text-[10px] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] disabled:opacity-30">Move down</button>
                <button type="button" onClick={() => onContentChange("cards", cards.filter((_, i) => i !== idx))}
                  className="text-[10px] text-red-400/60 hover:text-red-400 ml-auto">Remove</button>
              </div>
            </GCollapsible>
          )
        })}
        <button type="button" onClick={() => onContentChange("cards", [...arr(content.cards), { title: "", body: "", linksMode: "flat", links: [] }])}
          className="flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
          <IconPlus size={10} /> Add Card
        </button>
      </GCollapsible>

      <GCollapsible label="Legal" defaultOpen={false}>
        <GInput label="Copyright" value={s(legal.copyright)} onChange={(v) => onContentChange("legal", { ...legal, copyright: v })} />
        <GArrayEditor label="Legal Links" items={arr(legal.links)}
          fields={[{ key: "label", label: "Label" }, { key: "href", label: "Link URL" }]}
          onUpdate={(items) => onContentChange("legal", { ...legal, links: items })} />
      </GCollapsible>

      {/* Per-card CTA controls are now inline in each footer card above.
         Subscribe editing is per-card only (footer-card-row.tsx). */}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function GlobalSectionPanel({ node }: { node: VisualSectionNode }) {
  const store = useVisualEditorStore()
  const { pageState, setDirtyDraft, clearDirtyDraft, getDirtyDraft, isSectionDirty, setSaveStatus } = store
  const { saveDraft, publishDraft } = useVisualSectionPersistence(pageState)
  const typeLabel = formatType(node.sectionType, pageState?.sectionTypeDefaults)

  // Compute draft data for this global section
  const effectiveDraft = useMemo((): EditorDraft | null => {
    if (!pageState) return null
    const dirty = getDirtyDraft(node.sectionId)
    if (dirty) return dirty
    const version = node.draftVersion ?? node.publishedVersion
    if (!version) return null
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, node.sectionType)
  }, [node, pageState, getDirtyDraft])

  const originalDraft = useMemo((): EditorDraft | null => {
    if (!pageState) return null
    const version = node.draftVersion ?? node.publishedVersion
    if (!version) return null
    const defaults = pageState.sectionTypeDefaults[node.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, node.sectionType)
  }, [node, pageState])

  const updateContent = useCallback((key: string, value: unknown) => {
    if (!effectiveDraft || !originalDraft) return
    const newDraft: EditorDraft = { ...effectiveDraft, content: { ...effectiveDraft.content, [key]: value } }
    setDirtyDraft(node.sectionId, newDraft, originalDraft)
  }, [node.sectionId, effectiveDraft, originalDraft, setDirtyDraft])

  const updateMeta = useCallback((key: string, value: string) => {
    if (!effectiveDraft || !originalDraft) return
    const newDraft: EditorDraft = { ...effectiveDraft, meta: { ...effectiveDraft.meta, [key]: value } }
    setDirtyDraft(node.sectionId, newDraft, originalDraft)
  }, [node.sectionId, effectiveDraft, originalDraft, setDirtyDraft])

  const handleSave = useCallback(async () => {
    if (!effectiveDraft) return
    setSaveStatus("saving")
    const result = await saveDraft(node, effectiveDraft)
    if (result.success) {
      clearDirtyDraft(node.sectionId)
      setSaveStatus("saved")
      setTimeout(() => store.reload(), 500)
    } else {
      setSaveStatus("error", result.error)
    }
  }, [node, effectiveDraft, saveDraft, clearDirtyDraft, setSaveStatus, store])

  const handlePublish = useCallback(async () => {
    if (!effectiveDraft) return
    setSaveStatus("publishing")
    const result = await publishDraft(node, effectiveDraft)
    if (result.success) {
      clearDirtyDraft(node.sectionId)
      setSaveStatus("published")
      setTimeout(() => store.reload(), 500)
    } else {
      setSaveStatus("error", result.error)
    }
  }, [node, effectiveDraft, publishDraft, clearDirtyDraft, setSaveStatus, store])

  const isDirty = isSectionDirty(node.sectionId)
  const hasEditableContent = node.sectionType === "nav_links" || node.sectionType === "footer_grid"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconWorld size={16} className="text-blue-400 shrink-0" />
        <div>
          <div className="text-sm font-medium text-[var(--mantine-color-text)] capitalize">{typeLabel}</div>
          <div className="text-[10px] text-[var(--mantine-color-dimmed)]">Global shared section</div>
        </div>
      </div>
      <div data-testid="global-warning-banner" className="px-3 py-2 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
        This section is shared across pages. Changes affect all pages using it.
      </div>
      {node.key && (
        <div className="text-[10px] text-[var(--mantine-color-dimmed)]">Key: <span className="font-mono text-[var(--mantine-color-text)]">{node.key}</span></div>
      )}

      {/* Content editing for nav_links and footer_grid */}
      {hasEditableContent && effectiveDraft && (
        <>
          {node.sectionType === "nav_links" && (
            <NavLinksContent
              content={effectiveDraft.content}
              onContentChange={updateContent}
              meta={{ ctaPrimaryLabel: effectiveDraft.meta.ctaPrimaryLabel, ctaPrimaryHref: effectiveDraft.meta.ctaPrimaryHref }}
              onMetaChange={updateMeta}
            />
          )}
          {node.sectionType === "footer_grid" && (
            <FooterGridContent content={effectiveDraft.content} onContentChange={updateContent} />
          )}

          {/* Save / publish bar */}
          <div className="flex gap-1.5 pt-2">
            <button type="button" onClick={handleSave} disabled={!isDirty}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-[var(--mantine-color-dark-5)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-4)] disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <IconDeviceFloppy size={13} /> Save draft
            </button>
            <button type="button" onClick={handlePublish} disabled={!isDirty && !node.draftVersion}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <IconUpload size={13} /> Publish
            </button>
          </div>
        </>
      )}

      <Link
        href="/admin/global-sections"
        className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-medium rounded border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-6)] transition-colors"
      >
        Open global section editor <IconExternalLink size={12} />
      </Link>
    </div>
  )
}
