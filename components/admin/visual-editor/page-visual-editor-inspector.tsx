"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import {
  IconArrowRight,
  IconDeviceFloppy,
  IconUpload,
  IconLock,
  IconWorld,
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react"
import { useVisualEditorStore } from "./page-visual-editor-store"
import { useVisualSectionPersistence } from "./use-visual-section-persistence"
import {
  versionRowToPayload,
  payloadToDraft,
  formatType,
  normalizeFormatting,
} from "@/components/admin/section-editor/payload"
import { isControlSupported, type SemanticControl } from "@/lib/design-system/capabilities"
import {
  resolveMetaFieldVisibility,
} from "@/components/admin/section-editor/builtin-editor-contract"
import type { EditorDraft } from "@/components/admin/section-editor/types"
import { PagePanel as PagePanelInline } from "./page-visual-editor-page-panel"
import { HistoryPanel } from "./page-visual-editor-history-panel"
import { GlobalSectionPanel } from "./page-visual-editor-global-section-panel"
import { ComposedSectionPanel } from "./page-visual-editor-composed-section-panel"
import { MediaField } from "./page-visual-editor-media-field"
import { TipTapJsonEditor } from "@/components/admin/section-editor/fields/tiptap-json-editor"
import type { VisualSectionNode } from "./page-visual-editor-types"
import { resolveHeroBlockOrder, BLOCK_LABELS } from "@/lib/admin/hero-block-order"

// ---------------------------------------------------------------------------
// Option sets (matching form editor)
// ---------------------------------------------------------------------------

const RHYTHM_OPTIONS = [
  { value: "", label: "Default" }, { value: "hero", label: "Hero" }, { value: "statement", label: "Statement" },
  { value: "compact", label: "Compact" }, { value: "standard", label: "Standard" }, { value: "proof", label: "Proof" },
  { value: "cta", label: "CTA" }, { value: "footer", label: "Footer" },
]
const SURFACE_OPTIONS = [
  { value: "", label: "Default" }, { value: "none", label: "None" }, { value: "panel", label: "Panel" },
  { value: "soft_band", label: "Soft band" }, { value: "contrast_band", label: "Contrast band" },
  { value: "spotlight_stage", label: "Spotlight" }, { value: "grid_stage", label: "Grid stage" },
  { value: "gradient_mesh", label: "Gradient mesh" }, { value: "accent_glow", label: "Accent glow" },
  { value: "dark_elevated", label: "Dark elevated" }, { value: "dot_grid", label: "Dot grid" },
]
const DENSITY_OPTIONS = [
  { value: "", label: "Default" }, { value: "tight", label: "Tight" }, { value: "standard", label: "Standard" }, { value: "airy", label: "Airy" },
]
const GRID_GAP_OPTIONS = [
  { value: "", label: "Default" }, { value: "tight", label: "Tight" }, { value: "standard", label: "Standard" }, { value: "wide", label: "Wide" },
]
const HEADING_OPTIONS = [
  { value: "", label: "Default" }, { value: "default", label: "Standard" }, { value: "display", label: "Display" },
  { value: "mono", label: "Mono" }, { value: "gradient", label: "Gradient" }, { value: "gradient_accent", label: "Gradient Accent" },
  { value: "display_xl", label: "Display XL" }, { value: "display_lg", label: "Display LG" }, { value: "display_md", label: "Display MD" },
]
const LABEL_OPTIONS = [
  { value: "", label: "Default" }, { value: "default", label: "Standard" }, { value: "mono", label: "Mono" },
  { value: "pill", label: "Pill" }, { value: "micro", label: "Micro" },
]
const SUBTITLE_SIZE_OPTIONS = [
  { value: "", label: "Default" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" },
]
const DIVIDER_OPTIONS = [
  { value: "", label: "Default" }, { value: "none", label: "None" }, { value: "subtle", label: "Subtle" }, { value: "strong", label: "Strong" },
]
const CARD_FAMILY_OPTIONS = [
  { value: "", label: "Default" }, { value: "quiet", label: "Quiet" }, { value: "service", label: "Service" },
  { value: "metric", label: "Metric" }, { value: "process", label: "Process" }, { value: "proof", label: "Proof" },
  { value: "logo_tile", label: "Logo Tile" }, { value: "cta", label: "CTA" },
]
const CARD_CHROME_OPTIONS = [
  { value: "", label: "Default" }, { value: "flat", label: "Flat" }, { value: "outlined", label: "Outlined" },
  { value: "elevated", label: "Elevated" }, { value: "inset", label: "Inset" }, { value: "glow", label: "Glow" },
]
const ACCENT_RULE_OPTIONS = [
  { value: "", label: "Default" }, { value: "none", label: "None" }, { value: "top", label: "Top" },
  { value: "left", label: "Left" }, { value: "inline", label: "Inline" },
]
const PADDING_OPTIONS = [
  { value: "", label: "Default" }, { value: "py-4", label: "py-4" }, { value: "py-6", label: "py-6" },
  { value: "py-8", label: "py-8" }, { value: "py-10", label: "py-10" }, { value: "py-12", label: "py-12" },
]
const MAX_WIDTH_OPTIONS = [
  { value: "", label: "Default" }, { value: "max-w-3xl", label: "max-w-3xl" }, { value: "max-w-4xl", label: "max-w-4xl" },
  { value: "max-w-5xl", label: "max-w-5xl" }, { value: "max-w-6xl", label: "max-w-6xl" },
]
const TEXT_ALIGN_OPTIONS = [{ value: "", label: "Default" }, { value: "left", label: "Left" }, { value: "center", label: "Center" }]
const SHADOW_MODE_OPTIONS = [{ value: "inherit", label: "Inherit" }, { value: "on", label: "On" }, { value: "off", label: "Off" }]
const WIDTH_MODE_OPTIONS = [{ value: "content", label: "Content" }, { value: "full", label: "Full width" }]
const HERO_MIN_HEIGHT_OPTIONS = [{ value: "auto", label: "Auto" }, { value: "70svh", label: "70vh" }, { value: "100svh", label: "100vh" }]
const SPACING_TOP_OPTIONS = [
  { value: "", label: "Default" }, { value: "pt-0", label: "None" }, { value: "pt-2", label: "pt-2" },
  { value: "pt-4", label: "pt-4" }, { value: "pt-6", label: "pt-6" }, { value: "pt-8", label: "pt-8" },
  { value: "pt-10", label: "pt-10" }, { value: "pt-12", label: "pt-12" }, { value: "pt-16", label: "pt-16" },
  { value: "pt-20", label: "pt-20" }, { value: "pt-24", label: "pt-24" },
]
const SPACING_BOTTOM_OPTIONS = [
  { value: "", label: "Default" }, { value: "pb-0", label: "None" }, { value: "pb-2", label: "pb-2" },
  { value: "pb-4", label: "pb-4" }, { value: "pb-6", label: "pb-6" }, { value: "pb-8", label: "pb-8" },
  { value: "pb-10", label: "pb-10" }, { value: "pb-12", label: "pb-12" }, { value: "pb-16", label: "pb-16" },
  { value: "pb-20", label: "pb-20" }, { value: "pb-24", label: "pb-24" },
]
const OUTER_SPACING_OPTIONS = [
  { value: "", label: "Default" }, { value: "my-2", label: "my-2" }, { value: "my-4", label: "my-4" },
  { value: "my-6", label: "my-6" }, { value: "my-8", label: "my-8" }, { value: "my-10", label: "my-10" },
  { value: "my-12", label: "my-12" },
]

// Layout variant options per section type
const LAYOUT_VARIANTS: Record<string, { value: string; label: string }[]> = {
  hero_cta: [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }, { value: "split_reversed", label: "Split Reversed" }],
  card_grid: [],
  steps_list: [{ value: "grid", label: "Grid" }, { value: "timeline", label: "Timeline" }, { value: "connected_flow", label: "Connected Flow" }, { value: "workflow_visual", label: "Workflow Visual" }],
  title_body_list: [{ value: "accordion", label: "Accordion" }, { value: "stacked", label: "Stacked" }, { value: "two_column", label: "Two Column" }, { value: "cards", label: "Cards" }],
  label_value_list: [{ value: "default", label: "Default" }, { value: "metrics_grid", label: "Metrics Grid" }, { value: "trust_strip", label: "Trust Strip" }, { value: "tool_badges", label: "Tool Badges" }, { value: "logo_row", label: "Logo Row" }],
  cta_block: [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }, { value: "compact", label: "Compact" }, { value: "high_contrast", label: "High Contrast" }],
  social_proof_strip: [{ value: "inline", label: "Inline" }, { value: "marquee", label: "Marquee" }, { value: "grid", label: "Grid" }],
}

// ---------------------------------------------------------------------------
// Small UI components
// ---------------------------------------------------------------------------

function InspectorSelect({ label, value, options, onChange }: {
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

function InspectorSlider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-[10px] font-medium text-[var(--mantine-color-dimmed)] mb-0.5 uppercase tracking-wider">
        <span>{label}</span><span className="normal-case tracking-normal">{value.toFixed(1)}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-blue-500" />
    </div>
  )
}

function InspectorInput({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean
}) {
  const cls = "w-full bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-text)] border border-[var(--mantine-color-dark-4)] rounded text-xs px-2 py-1.5 outline-none focus:border-blue-500/50 transition-colors placeholder:text-[var(--mantine-color-dimmed)]"
  return (
    <div>
      <label className="block text-[10px] font-medium text-[var(--mantine-color-dimmed)] mb-0.5 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={cls + " resize-none"} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}

function InspectorDivider({ label }: { label: string }) {
  return (
    <div className="pt-2">
      <div className="text-[10px] font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider border-b border-[var(--mantine-color-dark-4)] pb-1">{label}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Collapsible group
// ---------------------------------------------------------------------------

function CollapsibleGroup({ label, defaultOpen, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
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

// ---------------------------------------------------------------------------
// Content array item editor
// ---------------------------------------------------------------------------

function ContentArrayEditor({ label, items, fields, onUpdate }: {
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

  const removeItem = (idx: number) => {
    onUpdate(items.filter((_, i) => i !== idx))
  }

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
                <InspectorInput key={f.key} label={f.label} value={String(item[f.key] ?? "")}
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
// Preset selector
// ---------------------------------------------------------------------------

function PresetSelector({ sectionType, currentKey, onChange }: {
  sectionType: string; currentKey: string; onChange: (key: string) => void
}) {
  const { pageState } = useVisualEditorStore()
  const presets = pageState?.presets ?? {}
  const validPresets = useMemo(() =>
    Object.values(presets).filter((p) => p.sectionType === sectionType || p.sectionType === "any"),
    [presets, sectionType])
  if (validPresets.length === 0) return null
  const options = [{ value: "", label: "No preset" }, ...validPresets.map((p) => ({ value: p.key, label: p.name }))]
  return <InspectorSelect label="Preset" value={currentKey} options={options} onChange={onChange} />
}

// ---------------------------------------------------------------------------
// Section-specific content panels
// ---------------------------------------------------------------------------

function SectionContentPanel({ sectionType, content, onContentChange }: {
  sectionType: string
  content: Record<string, unknown>
  onContentChange: (key: string, value: unknown) => void
}) {
  const s = (v: unknown) => typeof v === "string" ? v : ""
  const arr = (v: unknown): Record<string, unknown>[] =>
    Array.isArray(v) ? v.map((i) => (i && typeof i === "object" ? i as Record<string, unknown> : {})) : []
  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((i) => String(i ?? "")) : []

  // Eyebrow — most section types have it
  const hasEyebrow = !["footer_grid", "nav_links"].includes(sectionType)

  // Layout variant
  const layoutOptions = LAYOUT_VARIANTS[sectionType]
  const hasLayout = layoutOptions && layoutOptions.length > 0

  return (
    <>
      {hasEyebrow && (
        <InspectorInput label="Eyebrow" value={s(content.eyebrow)} onChange={(v) => onContentChange("eyebrow", v)} placeholder="Section label..." />
      )}

      {hasLayout && (
        <InspectorSelect label="Layout Variant" value={s(content.layoutVariant)} options={[{ value: "", label: "Default" }, ...layoutOptions]} onChange={(v) => onContentChange("layoutVariant", v)} />
      )}

      {/* Hero CTA */}
      {sectionType === "hero_cta" && (
        <>
          <ContentArrayEditor label="Bullets" items={strArr(content.bullets).map((t) => ({ text: t }))}
            fields={[{ key: "text", label: "Bullet" }]}
            onUpdate={(items) => onContentChange("bullets", items.map((i) => i.text))} />
          <InspectorInput label="Trust Line" value={s(content.trustLine)} onChange={(v) => onContentChange("trustLine", v)} multiline />
          <ContentArrayEditor label="Trust Items" items={arr(content.trustItems)}
            fields={[{ key: "text", label: "Text" }]}
            onUpdate={(items) => onContentChange("trustItems", items)} />
          <ContentArrayEditor label="Hero Stats" items={arr(content.heroStats)}
            fields={[{ key: "value", label: "Value" }, { key: "label", label: "Label" }]}
            onUpdate={(items) => onContentChange("heroStats", items)} />
          <InspectorDivider label="Proof Panel" />
          <InspectorSelect label="Proof Panel Type" value={s((content.proofPanel as Record<string, unknown> | undefined)?.type as string ?? "")}
            options={[{ value: "", label: "None" }, { value: "stats", label: "Stats grid" }, { value: "mockup", label: "Mockup" }, { value: "image", label: "Image" }]}
            onChange={(v) => onContentChange("proofPanel", { ...(content.proofPanel && typeof content.proofPanel === "object" ? content.proofPanel as Record<string, unknown> : {}), type: v || undefined })} />
          {content.proofPanel && typeof content.proofPanel === "object" && (content.proofPanel as Record<string, unknown>).type && (
            <>
              <InspectorInput label="Proof Headline" value={s((content.proofPanel as Record<string, unknown>).headline)} onChange={(v) => onContentChange("proofPanel", { ...(content.proofPanel as Record<string, unknown>), headline: v })} />
              {(content.proofPanel as Record<string, unknown>).type === "stats" && (
                <ContentArrayEditor label="Proof Stats" items={arr((content.proofPanel as Record<string, unknown>).items)}
                  fields={[{ key: "value", label: "Value" }, { key: "label", label: "Label" }]}
                  onUpdate={(items) => onContentChange("proofPanel", { ...(content.proofPanel as Record<string, unknown>), items })} />
              )}
              {(content.proofPanel as Record<string, unknown>).type === "mockup" && (
                <InspectorSelect label="Mockup Variant" value={s((content.proofPanel as Record<string, unknown>).mockupVariant)}
                  options={[{ value: "dashboard", label: "Dashboard" }, { value: "workflow", label: "Workflow" }, { value: "terminal", label: "Terminal" }]}
                  onChange={(v) => onContentChange("proofPanel", { ...(content.proofPanel as Record<string, unknown>), mockupVariant: v })} />
              )}
              {((content.proofPanel as Record<string, unknown>).type === "image" || (content.proofPanel as Record<string, unknown>).type === "mockup") && (
                <InspectorInput label="Proof Image URL" value={s((content.proofPanel as Record<string, unknown>).imageUrl)} onChange={(v) => onContentChange("proofPanel", { ...(content.proofPanel as Record<string, unknown>), imageUrl: v })} />
              )}
            </>
          )}
          <InspectorDivider label="Content Block Order" />
          {(() => {
            const order = resolveHeroBlockOrder(strArr(content.heroContentOrder))
            const sides = content.heroContentSides && typeof content.heroContentSides === "object"
              ? content.heroContentSides as Record<string, unknown> : {}
            const isSplit = s(content.layoutVariant) === "split" || s(content.layoutVariant) === "split_reversed"
            const move = (idx: number, dir: -1 | 1) => {
              const target = idx + dir
              if (target < 0 || target >= order.length) return
              const next = [...order]
              ;[next[idx], next[target]] = [next[target], next[idx]]
              onContentChange("heroContentOrder", next)
            }
            return (
              <div className="space-y-1">
                {order.map((key, idx) => (
                  <div key={key} className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-6)]">
                    <div className="flex items-center gap-0.5">
                      <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                        className="text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] disabled:opacity-30">
                        <IconArrowUp size={12} />
                      </button>
                      <button type="button" onClick={() => move(idx, 1)} disabled={idx === order.length - 1}
                        className="text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] disabled:opacity-30">
                        <IconArrowDown size={12} />
                      </button>
                    </div>
                    <span className="flex-1 text-[11px] font-medium text-[var(--mantine-color-text)]">
                      {BLOCK_LABELS[key]}
                    </span>
                    {isSplit && (
                      <InspectorSelect label="" value={s(sides[key]) || "left"}
                        options={[{ value: "left", label: "L" }, { value: "right", label: "R" }]}
                        onChange={(v) => onContentChange("heroContentSides", { ...sides, [key]: v })} />
                    )}
                  </div>
                ))}
              </div>
            )
          })()}
        </>
      )}

      {/* Card Grid */}
      {sectionType === "card_grid" && (
        <>
          <InspectorSelect label="Columns" value={s(content.columns)} options={[
            { value: "", label: "Auto" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" },
          ]} onChange={(v) => onContentChange("columns", v ? Number(v) : undefined)} />
          <InspectorDivider label="Default Card Fields" />
          {(["showTitle", "showText", "showImage", "showYouGet", "showBestFor"] as const).map((key) => {
            const display = content.cardDisplay && typeof content.cardDisplay === "object" ? content.cardDisplay as Record<string, unknown> : {}
            return (
              <InspectorSelect key={key} label={key.replace("show", "Show ")}
                value={display[key] === false ? "off" : "on"}
                options={[{ value: "on", label: "On" }, { value: "off", label: "Off" }]}
                onChange={(v) => onContentChange("cardDisplay", { ...display, [key]: v === "on" })} />
            )
          })}
          <ContentArrayEditor label="Cards" items={arr(content.cards)}
            fields={[
              { key: "title", label: "Title" },
              { key: "text", label: "Description", multiline: true },
              { key: "icon", label: "Icon (emoji)" },
              { key: "stat", label: "Stat" },
              { key: "tag", label: "Tag" },
              { key: "imageUrl", label: "Image URL" },
              { key: "alt", label: "Image Alt" },
              { key: "bestFor", label: "Best for" },
            ]}
            onUpdate={(items) => onContentChange("cards", items)} />
        </>
      )}

      {/* Steps List */}
      {sectionType === "steps_list" && (
        <ContentArrayEditor label="Steps" items={arr(content.steps)}
          fields={[{ key: "title", label: "Title" }, { key: "body", label: "Body", multiline: true }, { key: "icon", label: "Icon (emoji)" }, { key: "stat", label: "Stat" }]}
          onUpdate={(items) => onContentChange("steps", items)} />
      )}

      {/* Title Body List */}
      {sectionType === "title_body_list" && (
        <ContentArrayEditor label="Items" items={arr(content.items)}
          fields={[{ key: "title", label: "Title" }, { key: "body", label: "Body", multiline: true }]}
          onUpdate={(items) => onContentChange("items", items)} />
      )}

      {/* FAQ List */}
      {sectionType === "faq_list" && (
        <ContentArrayEditor label="FAQ Items" items={arr(content.items)}
          fields={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", multiline: true }]}
          onUpdate={(items) => onContentChange("items", items)} />
      )}

      {/* Label Value List */}
      {sectionType === "label_value_list" && (
        <>
          <ContentArrayEditor label="Items" items={arr(content.items)}
            fields={[{ key: "label", label: "Label" }, { key: "value", label: "Value" }, { key: "icon", label: "Icon (emoji)" }, { key: "imageUrl", label: "Image URL" }]}
            onUpdate={(items) => onContentChange("items", items)} />
          <InspectorSelect label="Compact Mode" value={content.compact === true ? "on" : "off"}
            options={[{ value: "off", label: "Off" }, { value: "on", label: "On" }]}
            onChange={(v) => onContentChange("compact", v === "on")} />
        </>
      )}

      {/* CTA Block */}
      {sectionType === "cta_block" && (
        <InspectorInput label="Body" value={s(content.body)} onChange={(v) => onContentChange("body", v)} multiline />
      )}

      {/* Rich Text Block */}
      {sectionType === "rich_text_block" && (
        <>
          {content.bodyRichText && typeof content.bodyRichText === "object" ? (
            <TipTapJsonEditor
              label="Body (rich text)"
              value={content.bodyRichText as Record<string, unknown>}
              onChange={(next) => onContentChange("bodyRichText", next)}
            />
          ) : (
            <InspectorInput label="Body" value={s(content.body)} onChange={(v) => onContentChange("body", v)} multiline />
          )}
        </>
      )}

      {/* Social Proof Strip */}
      {sectionType === "social_proof_strip" && (() => {
        const logos = arr(content.logos)
        const updateLogo = (idx: number, key: string, value: string) => {
          const next = [...logos]
          next[idx] = { ...next[idx], [key]: value }
          onContentChange("logos", next)
        }
        const moveLogo = (idx: number, dir: -1 | 1) => {
          const target = idx + dir
          if (target < 0 || target >= logos.length) return
          const next = [...logos]
          ;[next[idx], next[target]] = [next[target], next[idx]]
          onContentChange("logos", next)
        }
        const removeLogo = (idx: number) => onContentChange("logos", logos.filter((_, i) => i !== idx))
        const addLogo = () => onContentChange("logos", [...logos, { label: "", imageUrl: "", alt: "", href: "" }])

        return (
          <>
            <InspectorInput label="Trust Note" value={s(content.trustNote)} onChange={(v) => onContentChange("trustNote", v)} />
            <InspectorDivider label="Logos" />
            {logos.map((logo, idx) => (
              <CollapsibleGroup key={idx} label={s(logo.label) || `Logo ${idx + 1}`} defaultOpen={false}>
                <InspectorInput label="Label" value={s(logo.label)} onChange={(v) => updateLogo(idx, "label", v)} />
                <MediaField label="Logo Image" value={s(logo.imageUrl)} onChange={(v) => updateLogo(idx, "imageUrl", v)} />
                <InspectorInput label="Alt Text" value={s(logo.alt)} onChange={(v) => updateLogo(idx, "alt", v)} />
                <InspectorInput label="Link" value={s(logo.href)} onChange={(v) => updateLogo(idx, "href", v)} placeholder="Optional URL" />
                <div className="flex gap-1 pt-1">
                  <button type="button" onClick={() => moveLogo(idx, -1)} disabled={idx === 0}
                    className="text-[10px] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] disabled:opacity-30">Move up</button>
                  <button type="button" onClick={() => moveLogo(idx, 1)} disabled={idx === logos.length - 1}
                    className="text-[10px] text-[var(--mantine-color-dimmed)] hover:text-[var(--mantine-color-text)] disabled:opacity-30">Move down</button>
                  <button type="button" onClick={() => removeLogo(idx)}
                    className="text-[10px] text-red-400/60 hover:text-red-400 ml-auto">Remove</button>
                </div>
              </CollapsibleGroup>
            ))}
            <button type="button" onClick={addLogo}
              className="flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
              <IconPlus size={10} /> Add Logo
            </button>
            <ContentArrayEditor label="Badges" items={arr(content.badges)}
              fields={[{ key: "text", label: "Text" }, { key: "icon", label: "Icon (emoji)" }]}
              onUpdate={(items) => onContentChange("badges", items)} />
          </>
        )
      })()}

      {/* Proof Cluster */}
      {sectionType === "proof_cluster" && (
        <>
          <ContentArrayEditor label="Metrics" items={arr(content.metrics)}
            fields={[{ key: "value", label: "Value" }, { key: "label", label: "Label" }, { key: "icon", label: "Icon (emoji)" }]}
            onUpdate={(items) => onContentChange("metrics", items)} />
          <InspectorDivider label="Proof Card" />
          <InspectorInput label="Proof Card Title" value={s((content.proofCard as Record<string, unknown> | undefined)?.title as string ?? "")} onChange={(v) => onContentChange("proofCard", { ...(content.proofCard && typeof content.proofCard === "object" ? content.proofCard as Record<string, unknown> : {}), title: v })} />
          <InspectorInput label="Proof Card Body" value={s((content.proofCard as Record<string, unknown> | undefined)?.body as string ?? "")} onChange={(v) => onContentChange("proofCard", { ...(content.proofCard && typeof content.proofCard === "object" ? content.proofCard as Record<string, unknown> : {}), body: v })} multiline />
          <ContentArrayEditor label="Proof Card Stats" items={arr((content.proofCard as Record<string, unknown> | undefined)?.stats)}
            fields={[{ key: "value", label: "Value" }, { key: "label", label: "Label" }]}
            onUpdate={(items) => onContentChange("proofCard", { ...(content.proofCard && typeof content.proofCard === "object" ? content.proofCard as Record<string, unknown> : {}), stats: items })} />
          <InspectorDivider label="Testimonial" />
          <InspectorInput label="Quote" value={s((content.testimonial as Record<string, unknown> | undefined)?.quote as string ?? "")} onChange={(v) => onContentChange("testimonial", { ...(content.testimonial && typeof content.testimonial === "object" ? content.testimonial as Record<string, unknown> : {}), quote: v })} multiline />
          <InspectorInput label="Author" value={s((content.testimonial as Record<string, unknown> | undefined)?.author as string ?? "")} onChange={(v) => onContentChange("testimonial", { ...(content.testimonial && typeof content.testimonial === "object" ? content.testimonial as Record<string, unknown> : {}), author: v })} />
          <InspectorInput label="Role" value={s((content.testimonial as Record<string, unknown> | undefined)?.role as string ?? "")} onChange={(v) => onContentChange("testimonial", { ...(content.testimonial && typeof content.testimonial === "object" ? content.testimonial as Record<string, unknown> : {}), role: v })} />
          <InspectorInput label="Image URL" value={s((content.testimonial as Record<string, unknown> | undefined)?.imageUrl as string ?? "")} onChange={(v) => onContentChange("testimonial", { ...(content.testimonial && typeof content.testimonial === "object" ? content.testimonial as Record<string, unknown> : {}), imageUrl: v })} />
        </>
      )}

      {/* Case Study Split */}
      {sectionType === "case_study_split" && (
        <>
          <InspectorInput label="Narrative" value={s(content.narrative)} onChange={(v) => onContentChange("narrative", v)} multiline />
          <InspectorInput label="Before Label" value={s(content.beforeLabel)} onChange={(v) => onContentChange("beforeLabel", v)} />
          <InspectorInput label="After Label" value={s(content.afterLabel)} onChange={(v) => onContentChange("afterLabel", v)} />
          <ContentArrayEditor label="Before Items" items={strArr(content.beforeItems).map((t) => ({ text: t }))}
            fields={[{ key: "text", label: "Item" }]}
            onUpdate={(items) => onContentChange("beforeItems", items.map((i) => i.text))} />
          <ContentArrayEditor label="After Items" items={strArr(content.afterItems).map((t) => ({ text: t }))}
            fields={[{ key: "text", label: "Item" }]}
            onUpdate={(items) => onContentChange("afterItems", items.map((i) => i.text))} />
          <ContentArrayEditor label="Stats" items={arr(content.stats)}
            fields={[{ key: "value", label: "Value" }, { key: "label", label: "Label" }]}
            onUpdate={(items) => onContentChange("stats", items)} />
          <InspectorDivider label="Media" />
          <InspectorInput label="Media Title" value={s(content.mediaTitle)} onChange={(v) => onContentChange("mediaTitle", v)} />
          <MediaField label="Media Image" value={s(content.mediaImageUrl)} onChange={(v) => onContentChange("mediaImageUrl", v)} />
        </>
      )}

      {/* Booking Scheduler */}
      {sectionType === "booking_scheduler" && (() => {
        const intakeFields = content.intakeFields && typeof content.intakeFields === "object" && !Array.isArray(content.intakeFields) ? content.intakeFields as Record<string, unknown> : {}
        const INTAKE_KEYS = ["fullName", "workEmail", "company", "jobTitle", "teamSize", "functionArea", "currentTools", "mainBottleneck", "desiredOutcome90d"] as const
        const INTAKE_DEFAULTS: Record<string, { label: string; helpText: string }> = {
          fullName: { label: "Full name", helpText: "" },
          workEmail: { label: "Work email", helpText: "" },
          company: { label: "Company", helpText: "" },
          jobTitle: { label: "Job title", helpText: "" },
          teamSize: { label: "Team size", helpText: "" },
          functionArea: { label: "Function area", helpText: "operations, finance, treasury, founder, other" },
          currentTools: { label: "Current tools", helpText: "" },
          mainBottleneck: { label: "Main bottleneck", helpText: "" },
          desiredOutcome90d: { label: "Desired outcome (90 days)", helpText: "" },
        }
        return (
          <>
            <InspectorInput label="Cal.com Link" value={s(content.calLink)} onChange={(v) => onContentChange("calLink", v)} placeholder="hopfner/workflow-review" />
            <InspectorInput label="Form Heading" value={s(content.formHeading)} onChange={(v) => onContentChange("formHeading", v)} />
            <InspectorInput label="Submit Label" value={s(content.submitLabel)} onChange={(v) => onContentChange("submitLabel", v)} />
            <InspectorDivider label="Intake Fields" />
            {INTAKE_KEYS.map((key) => {
              const field = intakeFields[key] && typeof intakeFields[key] === "object" ? intakeFields[key] as Record<string, unknown> : {}
              const defaults = INTAKE_DEFAULTS[key]
              return (
                <CollapsibleGroup key={key} label={key.replace(/([A-Z])/g, " $1").trim()} defaultOpen={false}>
                  <InspectorInput label="Label" value={s(field.label) || defaults.label} onChange={(v) => onContentChange("intakeFields", { ...intakeFields, [key]: { ...defaults, ...field, label: v } })} />
                  <InspectorInput label="Help Text" value={s(field.helpText) || defaults.helpText} onChange={(v) => onContentChange("intakeFields", { ...intakeFields, [key]: { ...defaults, ...field, helpText: v } })} />
                </CollapsibleGroup>
              )
            })}
          </>
        )
      })()}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main inspector
// ---------------------------------------------------------------------------

export function VisualEditorInspector() {
  const store = useVisualEditorStore()
  const { pageState, selection, setDirtyDraft, clearDirtyDraft, getDirtyDraft, isSectionDirty, setSaveStatus } = store
  const { saveDraft, publishDraft } = useVisualSectionPersistence(pageState)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const selectedNode = useMemo(() => {
    if (!pageState || !selection) return null
    return pageState.sections.find((s) => s.sectionId === selection.sectionId) ?? null
  }, [pageState, selection])

  const effectiveDraft = useMemo((): EditorDraft | null => {
    if (!selectedNode || !pageState) return null
    const dirty = getDirtyDraft(selectedNode.sectionId)
    if (dirty) return dirty
    const version = selectedNode.draftVersion ?? selectedNode.publishedVersion
    if (!version) return null
    const defaults = pageState.sectionTypeDefaults[selectedNode.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, selectedNode.sectionType)
  }, [selectedNode, pageState, getDirtyDraft])

  const originalDraft = useMemo((): EditorDraft | null => {
    if (!selectedNode || !pageState) return null
    const version = selectedNode.draftVersion ?? selectedNode.publishedVersion
    if (!version) return null
    const defaults = pageState.sectionTypeDefaults[selectedNode.sectionType]
    const payload = versionRowToPayload(version, defaults)
    return payloadToDraft(payload, selectedNode.sectionType)
  }, [selectedNode, pageState])

  const updateFormatting = useCallback((key: string, value: unknown) => {
    if (!selectedNode || !effectiveDraft || !originalDraft) return
    const newFormatting = { ...effectiveDraft.formatting, [key]: value }
    const newDraft: EditorDraft = { ...effectiveDraft, formatting: normalizeFormatting(newFormatting as unknown as Record<string, unknown>) }
    setDirtyDraft(selectedNode.sectionId, newDraft, originalDraft)
  }, [selectedNode, effectiveDraft, originalDraft, setDirtyDraft])

  const updateFormattingBatch = useCallback((updates: Record<string, unknown>) => {
    if (!selectedNode || !effectiveDraft || !originalDraft) return
    const newFormatting = { ...effectiveDraft.formatting, ...updates }
    const newDraft: EditorDraft = { ...effectiveDraft, formatting: normalizeFormatting(newFormatting as unknown as Record<string, unknown>) }
    setDirtyDraft(selectedNode.sectionId, newDraft, originalDraft)
  }, [selectedNode, effectiveDraft, originalDraft, setDirtyDraft])

  const updateMeta = useCallback((key: string, value: string) => {
    if (!selectedNode || !effectiveDraft || !originalDraft) return
    const newDraft: EditorDraft = { ...effectiveDraft, meta: { ...effectiveDraft.meta, [key]: value } }
    setDirtyDraft(selectedNode.sectionId, newDraft, originalDraft)
  }, [selectedNode, effectiveDraft, originalDraft, setDirtyDraft])

  const updateContent = useCallback((key: string, value: unknown) => {
    if (!selectedNode || !effectiveDraft || !originalDraft) return
    const newDraft: EditorDraft = { ...effectiveDraft, content: { ...effectiveDraft.content, [key]: value } }
    setDirtyDraft(selectedNode.sectionId, newDraft, originalDraft)
  }, [selectedNode, effectiveDraft, originalDraft, setDirtyDraft])

  const handleSave = useCallback(async () => {
    if (!selectedNode || !effectiveDraft) return
    setSaveStatus("saving")
    const result = await saveDraft(selectedNode, effectiveDraft)
    if (result.success) {
      clearDirtyDraft(selectedNode.sectionId)
      setSaveStatus("saved")
      setTimeout(() => store.reload(), 500)
    } else {
      setSaveStatus("error", result.error)
    }
  }, [selectedNode, effectiveDraft, saveDraft, clearDirtyDraft, setSaveStatus, store])

  const handlePublish = useCallback(async () => {
    if (!selectedNode || !effectiveDraft) return
    setSaveStatus("publishing")
    const result = await publishDraft(selectedNode, effectiveDraft)
    if (result.success) {
      clearDirtyDraft(selectedNode.sectionId)
      setSaveStatus("published")
      setTimeout(() => store.reload(), 500)
    } else {
      setSaveStatus("error", result.error)
    }
  }, [selectedNode, effectiveDraft, publishDraft, clearDirtyDraft, setSaveStatus, store])

  const handleDiscard = useCallback(() => {
    if (!selectedNode) return
    clearDirtyDraft(selectedNode.sectionId)
    setConfirmDiscard(false)
  }, [selectedNode, clearDirtyDraft])

  // ---------------------------------------------------------------------------
  // No selection — page context
  // ---------------------------------------------------------------------------
  if (!selection || !selectedNode) {
    return (
      <div className="w-72 border-l border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0">
        <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-4)]">
          <span className="text-xs font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">Inspector</span>
        </div>
        <PagePanelInline />
      </div>
    )
  }

  const typeLabel = formatType(selectedNode.sectionType, pageState?.sectionTypeDefaults)
  const isDirty = isSectionDirty(selectedNode.sectionId)
  const metaVisibility = resolveMetaFieldVisibility(selectedNode.sectionType, {})
  const supports = (control: SemanticControl): boolean => {
    const caps = pageState?.capabilities?.[selectedNode.sectionType]
    if (caps) return caps.supported.includes(control)
    return isControlSupported(selectedNode.sectionType, control)
  }

  // ---------------------------------------------------------------------------
  // Global section — locked
  // ---------------------------------------------------------------------------
  if (selectedNode.isGlobal) {
    return (
      <div className="w-72 border-l border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0 overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-4)]">
          <span className="text-xs font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">Inspector</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <GlobalSectionPanel node={selectedNode} />
          <div className="border-t border-[var(--mantine-color-dark-4)] pt-3">
            <HistoryPanel sectionId={selectedNode.sectionId} />
          </div>
        </div>
      </div>
    )
  }

  if (selectedNode.isCustomComposed) {
    return (
      <div className="w-72 border-l border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0 overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-4)]">
          <span className="text-xs font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">Inspector</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <ComposedSectionPanel node={selectedNode} />
          <div className="border-t border-[var(--mantine-color-dark-4)] pt-3">
            <HistoryPanel sectionId={selectedNode.sectionId} />
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // No draft data
  // ---------------------------------------------------------------------------
  if (!effectiveDraft) {
    return (
      <div className="w-72 border-l border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0">
        <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-4)]">
          <span className="text-xs font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">Inspector</span>
        </div>
        <div className="p-3 text-xs text-[var(--mantine-color-dimmed)]">No version data available for this section.</div>
      </div>
    )
  }

  const f = effectiveDraft.formatting
  const hasAnySupportedDesignToken = supports("sectionRhythm") || supports("sectionSurface") || supports("contentDensity") || supports("gridGap") || supports("headingTreatment") || supports("labelStyle") || supports("subtitleSize") || supports("dividerMode")
  const hasAnyComponentToken = supports("cardFamily") || supports("cardChrome") || supports("accentRule")

  // ---------------------------------------------------------------------------
  // Full inspector — reorganized: Content → Actions → Style → Layout → Advanced
  // ---------------------------------------------------------------------------
  return (
    <div className="w-72 border-l border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-4)] flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">Inspector</span>
        {isDirty && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">Unsaved</span>}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Section identity */}
        {effectiveDraft.meta.title?.trim() && (
          <div className="text-sm font-medium text-[var(--mantine-color-text)] truncate">{effectiveDraft.meta.title}</div>
        )}
        <div className="text-[11px] text-[var(--mantine-color-dimmed)] capitalize">{typeLabel}{selectedNode.key ? <span className="ml-1.5 text-[10px] opacity-60">#{selectedNode.key}</span> : null}</div>
        <div className="flex items-center gap-1.5 text-[10px]">
          {selectedNode.publishedVersion && <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">Published v{selectedNode.publishedVersion.version}</span>}
          {selectedNode.draftVersion && <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">Draft v{selectedNode.draftVersion.version}</span>}
        </div>

        {/* Preset */}
        <PresetSelector sectionType={selectedNode.sectionType} currentKey={f.sectionPresetKey ?? ""} onChange={(key) => {
          const preset = pageState?.presets?.[key]
          updateFormattingBatch({
            sectionPresetKey: key,
            ...(preset ? {
              sectionRhythm: preset.presentation.rhythm,
              sectionSurface: preset.presentation.surface,
              contentDensity: preset.presentation.density,
              gridGap: preset.presentation.gridGap,
              headingTreatment: preset.presentation.headingTreatment,
              labelStyle: preset.presentation.labelStyle,
              dividerMode: preset.presentation.dividerMode,
              subtitleSize: preset.presentation.subtitleSize ?? "",
              cardFamily: preset.component?.family ?? "",
              cardChrome: preset.component?.chrome ?? "",
              accentRule: preset.component?.accentRule ?? "",
            } : {}),
          })
        }} />

        {/* ── CONTENT ── */}
        <CollapsibleGroup label="Content" defaultOpen>
          {/* Meta fields */}
          {metaVisibility.title && (
            <InspectorInput label="Title" value={effectiveDraft.meta.title} onChange={(v) => updateMeta("title", v)} />
          )}
          {metaVisibility.subtitle && (
            <InspectorInput label="Subtitle" value={effectiveDraft.meta.subtitle} onChange={(v) => updateMeta("subtitle", v)} />
          )}

          {/* Section-specific content */}
          <SectionContentPanel sectionType={selectedNode.sectionType} content={effectiveDraft.content} onContentChange={updateContent} />
        </CollapsibleGroup>

        {/* ── ACTIONS (CTA + Background) ── */}
        {(metaVisibility.ctaPrimary || metaVisibility.ctaSecondary || metaVisibility.backgroundMedia) && (
          <CollapsibleGroup label="Actions" defaultOpen>
            {metaVisibility.ctaPrimary && (
              <>
                <InspectorInput label="CTA Label" value={effectiveDraft.meta.ctaPrimaryLabel} onChange={(v) => updateMeta("ctaPrimaryLabel", v)} placeholder="e.g. Get started" />
                <InspectorInput label="CTA Link" value={effectiveDraft.meta.ctaPrimaryHref} onChange={(v) => updateMeta("ctaPrimaryHref", v)} placeholder="e.g. /contact" />
              </>
            )}
            {metaVisibility.ctaSecondary && (
              <>
                <InspectorInput label="Secondary CTA Label" value={effectiveDraft.meta.ctaSecondaryLabel} onChange={(v) => updateMeta("ctaSecondaryLabel", v)} />
                <InspectorInput label="Secondary CTA Link" value={effectiveDraft.meta.ctaSecondaryHref} onChange={(v) => updateMeta("ctaSecondaryHref", v)} />
              </>
            )}
            {metaVisibility.backgroundMedia && (
              <MediaField label="Background Media" value={effectiveDraft.meta.backgroundMediaUrl} onChange={(v) => updateMeta("backgroundMediaUrl", v)} />
            )}
          </CollapsibleGroup>
        )}

        {/* ── STYLE ── */}
        {(hasAnySupportedDesignToken || hasAnyComponentToken) && (
          <CollapsibleGroup label="Style" defaultOpen>
            {supports("sectionRhythm") && <InspectorSelect label="Rhythm" value={f.sectionRhythm ?? ""} options={RHYTHM_OPTIONS} onChange={(v) => updateFormatting("sectionRhythm", v)} />}
            {supports("sectionSurface") && <InspectorSelect label="Surface" value={f.sectionSurface ?? ""} options={SURFACE_OPTIONS} onChange={(v) => updateFormatting("sectionSurface", v)} />}
            {supports("contentDensity") && <InspectorSelect label="Density" value={f.contentDensity ?? ""} options={DENSITY_OPTIONS} onChange={(v) => updateFormatting("contentDensity", v)} />}
            {supports("gridGap") && <InspectorSelect label="Grid Gap" value={f.gridGap ?? ""} options={GRID_GAP_OPTIONS} onChange={(v) => updateFormatting("gridGap", v)} />}
            {supports("headingTreatment") && <InspectorSelect label="Heading" value={f.headingTreatment ?? ""} options={HEADING_OPTIONS} onChange={(v) => updateFormatting("headingTreatment", v)} />}
            {supports("labelStyle") && <InspectorSelect label="Label Style" value={f.labelStyle ?? ""} options={LABEL_OPTIONS} onChange={(v) => updateFormatting("labelStyle", v)} />}
            {supports("subtitleSize") && <InspectorSelect label="Subtitle Size" value={f.subtitleSize ?? ""} options={SUBTITLE_SIZE_OPTIONS} onChange={(v) => updateFormatting("subtitleSize", v)} />}
            {supports("dividerMode") && <InspectorSelect label="Dividers" value={f.dividerMode ?? ""} options={DIVIDER_OPTIONS} onChange={(v) => updateFormatting("dividerMode", v)} />}
            {hasAnyComponentToken && (
              <>
                <InspectorDivider label="Component" />
                {supports("cardFamily") && <InspectorSelect label="Card Family" value={f.cardFamily ?? ""} options={CARD_FAMILY_OPTIONS} onChange={(v) => updateFormatting("cardFamily", v)} />}
                {supports("cardChrome") && <InspectorSelect label="Card Chrome" value={f.cardChrome ?? ""} options={CARD_CHROME_OPTIONS} onChange={(v) => updateFormatting("cardChrome", v)} />}
                {supports("accentRule") && <InspectorSelect label="Accent Rule" value={f.accentRule ?? ""} options={ACCENT_RULE_OPTIONS} onChange={(v) => updateFormatting("accentRule", v)} />}
              </>
            )}
            {/* Shadow */}
            <InspectorDivider label="Shadow" />
            <InspectorSelect label="Shadow" value={f.shadowMode} options={SHADOW_MODE_OPTIONS} onChange={(v) => updateFormatting("shadowMode", v)} />
            <InspectorSelect label="Inner Shadow" value={f.innerShadowMode} options={SHADOW_MODE_OPTIONS} onChange={(v) => updateFormatting("innerShadowMode", v)} />
            {f.innerShadowMode === "on" && (
              <InspectorSlider label="Strength" value={f.innerShadowStrength} min={0} max={1.8} step={0.05} onChange={(v) => updateFormatting("innerShadowStrength", v)} />
            )}
          </CollapsibleGroup>
        )}

        {/* ── LAYOUT ── */}
        <CollapsibleGroup label="Layout" defaultOpen={false}>
          <InspectorSelect label="Padding Y" value={f.paddingY} options={PADDING_OPTIONS} onChange={(v) => updateFormatting("paddingY", v)} />
          <InspectorSelect label="Max Width" value={f.maxWidth} options={MAX_WIDTH_OPTIONS} onChange={(v) => updateFormatting("maxWidth", v)} />
          <InspectorSelect label="Text Align" value={f.textAlign} options={TEXT_ALIGN_OPTIONS} onChange={(v) => updateFormatting("textAlign", v)} />
          <InspectorSelect label="Width Mode" value={f.widthMode} options={WIDTH_MODE_OPTIONS} onChange={(v) => updateFormatting("widthMode", v)} />
          {selectedNode.sectionType === "hero_cta" && (
            <>
              <InspectorSelect label="Hero Min Height" value={f.heroMinHeight} options={HERO_MIN_HEIGHT_OPTIONS} onChange={(v) => updateFormatting("heroMinHeight", v)} />
              <InspectorSelect label="Hero Right Align" value={f.heroRightAlign} options={TEXT_ALIGN_OPTIONS} onChange={(v) => updateFormatting("heroRightAlign", v)} />
            </>
          )}
        </CollapsibleGroup>

        {/* ── ADVANCED ── */}
        <CollapsibleGroup label="Advanced" defaultOpen={false}>
          <InspectorSelect label="Spacing Top" value={f.spacingTop} options={SPACING_TOP_OPTIONS} onChange={(v) => updateFormatting("spacingTop", v)} />
          <InspectorSelect label="Spacing Bottom" value={f.spacingBottom} options={SPACING_BOTTOM_OPTIONS} onChange={(v) => updateFormatting("spacingBottom", v)} />
          <InspectorSelect label="Outer Spacing" value={f.outerSpacing} options={OUTER_SPACING_OPTIONS} onChange={(v) => updateFormatting("outerSpacing", v)} />
          <InspectorInput label="Container Class" value={f.containerClass} onChange={(v) => updateFormatting("containerClass", v)} placeholder="Custom Tailwind classes" />
          <InspectorInput label="Section Class" value={f.sectionClass} onChange={(v) => updateFormatting("sectionClass", v)} placeholder="Custom Tailwind classes" />
          <div className="pt-1">
            <Link href={`/admin/pages/${selectedNode.pageId}`}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-medium rounded border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-6)] transition-colors">
              Open form editor <IconArrowRight size={12} />
            </Link>
          </div>
        </CollapsibleGroup>

        {/* ── HISTORY ── */}
        <CollapsibleGroup label="History" defaultOpen={false}>
          <HistoryPanel sectionId={selectedNode.sectionId} />
        </CollapsibleGroup>
      </div>

      {/* Sticky action bar */}
      <div className="p-3 border-t border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] space-y-1.5 shrink-0">
        <div className="flex gap-1.5">
          <button type="button" onClick={handleSave} disabled={!isDirty}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-[var(--mantine-color-dark-5)] text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-dark-4)] disabled:opacity-40 disabled:pointer-events-none transition-colors">
            <IconDeviceFloppy size={13} /> Save draft
          </button>
          <button type="button" onClick={handlePublish} disabled={!isDirty && !selectedNode.draftVersion}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-colors">
            <IconUpload size={13} /> Publish
          </button>
        </div>
        {isDirty && (
          <button type="button" onClick={confirmDiscard ? handleDiscard : () => setConfirmDiscard(true)}
            className="w-full px-3 py-1.5 text-[10px] text-red-400 hover:text-red-300 transition-colors">
            {confirmDiscard ? "Click again to confirm discard" : "Discard changes"}
          </button>
        )}
      </div>
    </div>
  )
}
