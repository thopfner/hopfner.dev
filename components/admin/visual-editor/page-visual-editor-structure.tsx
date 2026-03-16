"use client"

import { useMemo, useState, useRef } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconGripVertical,
  IconWorld,
  IconLock,
  IconEyeOff,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react"
import { SectionLibrary } from "./page-visual-editor-section-library"
import { usePageCompositionActions } from "./use-page-composition-actions"
import { useVisualEditorStore } from "./page-visual-editor-store"
import {
  formatType,
  versionRowToPayload,
  payloadToDraft,
  asRecord,
} from "@/components/admin/section-editor/payload"
import type { VisualSectionNode } from "./page-visual-editor-types"

// ---------------------------------------------------------------------------
// Resolve display title for a section
// ---------------------------------------------------------------------------

function resolveSectionTitle(node: VisualSectionNode, dirtyDraftTitle?: string): string {
  // 1. dirty draft title
  if (dirtyDraftTitle?.trim()) return dirtyDraftTitle.trim()
  // 2. draft version title
  if (node.draftVersion?.title?.trim()) return node.draftVersion.title.trim()
  // 3. published version title
  if (node.publishedVersion?.title?.trim()) return node.publishedVersion.title.trim()
  return ""
}

// ---------------------------------------------------------------------------
// Status dot
// ---------------------------------------------------------------------------

function StatusDot({ node }: { node: VisualSectionNode }) {
  const hasDraft = !!node.draftVersion
  const hasPublished = !!node.publishedVersion

  if (hasDraft && !hasPublished) {
    return <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" title="Draft only" />
  }
  if (hasDraft && hasPublished) {
    return <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" title="Unpublished changes" />
  }
  if (!hasDraft && hasPublished) {
    return <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" title="Published" />
  }
  return null
}

// ---------------------------------------------------------------------------
// Sortable item
// ---------------------------------------------------------------------------

function StructureItem({ node, isOverlay }: { node: VisualSectionNode; isOverlay?: boolean }) {
  const { selection, setSelection, pageState, isSectionDirty, getDirtyDraft } = useVisualEditorStore()
  const isSelected = !isOverlay && selection?.sectionId === node.sectionId
  const isDirty = isSectionDirty(node.sectionId)
  const typeLabel = formatType(node.sectionType, pageState?.sectionTypeDefaults)
  const dirtyDraft = getDirtyDraft(node.sectionId)
  const sectionTitle = resolveSectionTitle(node, dirtyDraft?.meta?.title)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.sectionId, disabled: isOverlay })

  const sty = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={sty}
      className={`group/row flex items-center gap-1.5 px-1.5 py-1.5 rounded text-xs cursor-pointer transition-all ${
        isOverlay
          ? "bg-[var(--mantine-color-dark-5)] text-[var(--mantine-color-text)] shadow-lg ring-1 ring-blue-500/50"
          : isSelected
          ? "bg-blue-500/10 text-[var(--mantine-color-text)] border-l-2 border-l-blue-500"
          : "text-[var(--mantine-color-dimmed)] hover:bg-[var(--mantine-color-dark-6)] hover:text-[var(--mantine-color-text)]"
      } ${!node.enabled && !isOverlay ? "opacity-30" : ""}`}
      onClick={isOverlay ? undefined : () => setSelection({ sectionId: node.sectionId })}
    >
      {/* Drag handle — muted, reveals on row hover */}
      <button
        type="button"
        className="text-[var(--mantine-color-dark-4)] opacity-40 group-hover/row:opacity-100 hover:!text-[var(--mantine-color-dimmed)] cursor-grab active:cursor-grabbing shrink-0 transition-opacity"
        {...(isOverlay ? {} : attributes)}
        {...(isOverlay ? {} : listeners)}
      >
        <IconGripVertical size={11} />
      </button>

      {/* Labels: title first, type + semantics as secondary line */}
      <div className="flex-1 min-w-0 leading-snug">
        {sectionTitle ? (
          <span className="block text-[11px] line-clamp-2" title={sectionTitle}>{sectionTitle}</span>
        ) : (
          <span className="block truncate capitalize text-[11px] text-[var(--mantine-color-dimmed)]">{typeLabel}</span>
        )}
        <span className="flex items-center gap-1 text-[9px] text-[var(--mantine-color-dark-2)] leading-tight">
          <span className="capitalize truncate">{sectionTitle ? typeLabel : ""}</span>
          {node.isGlobal && (
            <span className="inline-flex items-center gap-0.5 text-blue-400 shrink-0">
              <IconWorld size={9} />
              <IconLock size={8} />
              <span className="text-[8px]">Global</span>
            </span>
          )}
          {!node.enabled && <IconEyeOff size={9} className="shrink-0" />}
        </span>
      </div>

      {/* Minimal status: single indicator */}
      <span className="shrink-0">
        {isDirty ? (
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 block" title="Unsaved" />
        ) : (
          <StatusDot node={node} />
        )}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drop indicator line
// ---------------------------------------------------------------------------

function DropIndicator() {
  return (
    <div className="h-0.5 mx-2 rounded bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
  )
}

// ---------------------------------------------------------------------------
// Structure panel
// ---------------------------------------------------------------------------

export function VisualEditorStructure() {
  const { pageState, sectionOrder, setSectionOrder, orderDirty, getDirtyDraft } = useVisualEditorStore()
  const { addSection } = usePageCompositionActions()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [addLibOpen, setAddLibOpen] = useState(false)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const [addAnchorRect, setAddAnchorRect] = useState<DOMRect | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const orderedSections = useMemo(() => {
    if (!pageState) return []
    const sectionMap = new Map(pageState.sections.map((s) => [s.sectionId, s]))
    return sectionOrder
      .map((id) => sectionMap.get(id))
      .filter((s): s is VisualSectionNode => !!s)
  }, [pageState, sectionOrder])

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return orderedSections
    const q = searchQuery.toLowerCase().trim()
    return orderedSections.filter((node) => {
      const dirtyDraft = getDirtyDraft(node.sectionId)
      const title = resolveSectionTitle(node, dirtyDraft?.meta?.title)
      const typeLabel = formatType(node.sectionType, pageState?.sectionTypeDefaults)
      return (
        title.toLowerCase().includes(q) ||
        typeLabel.toLowerCase().includes(q) ||
        (node.key ?? "").toLowerCase().includes(q) ||
        node.sectionType.toLowerCase().includes(q)
      )
    })
  }, [orderedSections, searchQuery, pageState, getDirtyDraft])

  const activeNode = useMemo(() => {
    if (!activeId || !pageState) return null
    return pageState.sections.find((s) => s.sectionId === activeId) ?? null
  }, [activeId, pageState])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over?.id as string ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    setOverId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sectionOrder.indexOf(active.id as string)
    const newIndex = sectionOrder.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = [...sectionOrder]
    newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, active.id as string)
    setSectionOrder(newOrder)
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverId(null)
  }

  const isFiltering = searchQuery.trim().length > 0

  return (
    <div className="w-56 border-r border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-7)] flex flex-col shrink-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--mantine-color-dark-4)] flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">
          Sections
        </span>
        {orderDirty && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
            reordered
          </span>
        )}
      </div>

      {/* Search / filter */}
      <div className="px-2 py-1.5 border-b border-[var(--mantine-color-dark-5)]">
        <div className="relative">
          <IconSearch size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--mantine-color-dimmed)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter sections..."
            className="w-full pl-6 pr-2 py-1 text-[10px] rounded bg-[var(--mantine-color-dark-6)] border border-[var(--mantine-color-dark-4)] text-[var(--mantine-color-text)] placeholder:text-[var(--mantine-color-dimmed)] outline-none focus:border-blue-500/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {isFiltering ? (
          // When filtering, show flat list without drag
          filteredSections.length > 0 ? (
            filteredSections.map((node) => (
              <StructureItem key={node.sectionId} node={node} />
            ))
          ) : (
            <div className="text-[10px] text-[var(--mantine-color-dimmed)] text-center py-4">
              No matching sections
            </div>
          )
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={sectionOrder}
              strategy={verticalListSortingStrategy}
            >
              {orderedSections.map((node) => (
                <div key={node.sectionId}>
                  {activeId && overId === node.sectionId && activeId !== node.sectionId && (
                    <DropIndicator />
                  )}
                  <StructureItem node={node} />
                </div>
              ))}
            </SortableContext>

            <DragOverlay dropAnimation={null}>
              {activeNode ? <StructureItem node={activeNode} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Footer: count + add button */}
      <div className="px-2 py-1.5 border-t border-[var(--mantine-color-dark-4)] flex items-center justify-between">
        <span className="text-[10px] text-[var(--mantine-color-dimmed)]">
          {isFiltering
            ? `${filteredSections.length} of ${orderedSections.length}`
            : `${orderedSections.length} section${orderedSections.length !== 1 ? "s" : ""}`
          }
        </span>
        <button
          ref={addBtnRef}
          type="button"
          onClick={() => { if (addBtnRef.current) setAddAnchorRect(addBtnRef.current.getBoundingClientRect()); setAddLibOpen(true) }}
          className="flex items-center gap-0.5 text-[10px] font-medium text-blue-300 hover:text-blue-200 transition-colors"
          title="Add section"
        >
          <IconPlus size={11} />
          Add
        </button>
        <SectionLibrary
          onSelect={(type) => addSection(type)}
          anchorRect={addAnchorRect}
          open={addLibOpen}
          onClose={() => setAddLibOpen(false)}
        />
      </div>
    </div>
  )
}
