"use client"

/**
 * Section library — type picker for adding new sections.
 * Shows built-in section types with labels, descriptions, and search.
 */

import { useMemo, useState, useRef, useEffect } from "react"
import { IconSearch, IconPlus } from "@tabler/icons-react"
import { FloatingSurface } from "./floating-surface"
import { useVisualEditorStore } from "./page-visual-editor-store"

type SectionTypeOption = {
  type: string
  label: string
  description: string
}

const BUILTIN_TYPES: SectionTypeOption[] = [
  { type: "hero_cta", label: "Hero", description: "Primary hero section with headline and CTA" },
  { type: "card_grid", label: "Card Grid", description: "Grid of service or feature cards" },
  { type: "steps_list", label: "Steps", description: "Numbered process or how-it-works steps" },
  { type: "title_body_list", label: "Content List", description: "Accordion, stacked, or card list items" },
  { type: "rich_text_block", label: "Rich Text", description: "Editorial text block with heading" },
  { type: "label_value_list", label: "Label/Value", description: "Metrics, tech stack, or trust strip" },
  { type: "faq_list", label: "FAQ", description: "Frequently asked questions accordion" },
  { type: "cta_block", label: "CTA Block", description: "Call-to-action section with buttons" },
  { type: "social_proof_strip", label: "Social Proof", description: "Logo strip, badges, and trust notes" },
  { type: "proof_cluster", label: "Proof Cluster", description: "Metrics, testimonial, and proof card" },
  { type: "case_study_split", label: "Case Study", description: "Before/after comparison with stats" },
  { type: "booking_scheduler", label: "Booking", description: "Intake form and calendar scheduler" },
  { type: "footer_grid", label: "Footer", description: "Footer with links, legal, and brand" },
  { type: "nav_links", label: "Navigation", description: "Top navigation bar with links and CTA" },
]

type Props = {
  onSelect: (sectionType: string) => void
  anchorRect: DOMRect | null
  open: boolean
  onClose: () => void
}

export function SectionLibrary({ onSelect, anchorRect, open, onClose }: Props) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { pageState } = useVisualEditorStore()

  useEffect(() => {
    if (open) {
      setQuery("")
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Merge DB defaults with built-in list for labels
  const types = useMemo(() => {
    if (!pageState?.sectionTypeDefaults) return BUILTIN_TYPES
    return BUILTIN_TYPES.map((t) => {
      const defaults = pageState.sectionTypeDefaults[t.type]
      return defaults ? { ...t, label: defaults.label || t.label, description: (defaults.description as string) || t.description } : t
    })
  }, [pageState])

  const filtered = query.trim()
    ? types.filter((t) =>
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.type.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      )
    : types

  return (
    <FloatingSurface anchorRect={anchorRect} open={open} onClose={onClose} maxWidth={320} maxHeight={460}>
      <div className="px-3 py-2 border-b border-[#2c2e33]">
        <div className="text-[11px] font-semibold text-[#909296] uppercase tracking-wider mb-2">Add Section</div>
        <div className="relative">
          <IconSearch size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#909296]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search section types..."
            className="w-full pl-6 pr-2 py-1.5 text-xs rounded bg-[#25262b] border border-[#373a40] text-[#c1c2c5] placeholder:text-[#909296] outline-none focus:border-blue-500/50"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="p-1.5 max-h-[360px] overflow-y-auto space-y-0.5">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-xs text-center text-[#909296]">No matching section types</div>
        ) : (
          filtered.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => { onSelect(t.type); onClose() }}
              className="w-full text-left px-3 py-2 rounded text-xs hover:bg-[#2c2e33] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <IconPlus size={12} className="text-[#909296] group-hover:text-blue-400 shrink-0 transition-colors" />
                <div className="min-w-0">
                  <span className="block font-medium text-[#c1c2c5] truncate">{t.label}</span>
                  <span className="block text-[10px] text-[#909296] truncate">{t.description}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </FloatingSurface>
  )
}
