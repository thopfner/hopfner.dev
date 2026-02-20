"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronLeft,
  IconCopy,
  IconDotsVertical,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react"

import { SectionEditorDrawer } from "@/components/section-editor-drawer"
import { createClient } from "@/lib/supabase/browser"

function formatDateTime(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  // Client-side locale formatting for readability; keep exact timestamp in title attr.
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d)
}

type CmsSectionType =
  | "nav_links"
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"

type SectionTypeDefault = {
  section_type: CmsSectionType
  label: string
  description: string | null
  default_title: string | null
  default_subtitle: string | null
  default_cta_primary_label: string | null
  default_cta_primary_href: string | null
  default_cta_secondary_label: string | null
  default_cta_secondary_href: string | null
  default_background_media_url: string | null
  default_formatting: Record<string, unknown>
  default_content: Record<string, unknown>
  capabilities: Record<string, unknown>
}

type SectionTypeDefaultsMap = Partial<Record<CmsSectionType, SectionTypeDefault>>

const SECTION_TYPES: CmsSectionType[] = [
  "nav_links",
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
]

function normalizeSectionType(raw: string): CmsSectionType | null {
  switch (raw) {
    case "nav_links":
    case "hero_cta":
    case "card_grid":
    case "steps_list":
    case "title_body_list":
    case "rich_text_block":
    case "label_value_list":
    case "faq_list":
    case "cta_block":
      return raw
    case "header_nav":
      return "nav_links"
    case "hero":
      return "hero_cta"
    case "what_i_deliver":
      return "card_grid"
    case "how_it_works":
      return "steps_list"
    case "workflows":
      return "title_body_list"
    case "why_this_approach":
      return "rich_text_block"
    case "tech_stack":
      return "label_value_list"
    case "faq":
      return "faq_list"
    case "final_cta":
      return "cta_block"
    default:
      return null
  }
}

type SectionRow = {
  id: string
  page_id: string
  section_type: CmsSectionType
  key: string | null
  enabled: boolean
  position: number
  updated_at: string
  global_section_id?: string | null
}

type SectionVersionRow = {
  id: string
  section_id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  created_at: string
  published_at: string | null
}

type CmsPageRow = { id: string; slug: string; title: string }

type DuplicateOutcome = "duplicated" | "skipped" | "failed"

type DuplicateBulkPageResult = {
  pageId: string
  pageSlug: string
  pageTitle: string
  outcome: DuplicateOutcome
  message: string
  insertedSectionId?: string
}

type DuplicateBulkAudit = {
  sourceSectionId: string
  sourcePageId: string
  sourceFingerprint: string
  attemptedAt: string
  placementMode: "same_relative_index"
  duplicateRule: string
  insertedCount: number
  skippedCount: number
  failedCount: number
  noOpMessage?: string
  results: DuplicateBulkPageResult[]
}

function normalizeTextForFingerprint(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function stableJson(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (Array.isArray(value)) return `[${value.map((v) => stableJson(v)).join(",")}]`
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    )
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`
  }
  return JSON.stringify(value)
}

function simpleHash(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, "0")
}

function buildDuplicateFingerprint(params: {
  sectionType: CmsSectionType
  key: string | null
  title: string | null
  content: Record<string, unknown> | null
}) {
  const normalizedType = normalizeTextForFingerprint(params.sectionType)
  const normalizedKey = normalizeTextForFingerprint(params.key)
  const normalizedTitle = normalizeTextForFingerprint(params.title)
  const contentHash = simpleHash(stableJson(params.content ?? {}))
  return `${normalizedType}::${normalizedKey}::${normalizedTitle}::${contentHash}`
}

function TypeBadge({
  type,
  defaults,
}: {
  type: CmsSectionType
  defaults?: SectionTypeDefaultsMap
}) {
  return (
    <Badge size="sm" variant="default">
      {defaults?.[type]?.label ?? type}
    </Badge>
  )
}

function SortableSectionItem({
  section,
  published,
  draft,
  displayTitle,
  onToggleEnabled,
  onOpen,
  onDelete,
  onDuplicate,
  onDuplicateToAllPages,
  onDetach,
  onMove,
  currentPageId,
  pages,
  pagesLoading,
  ensurePagesLoaded,
  duplicateLoading,
  sectionCount,
  defaults,
}: {
  section: SectionRow
  published: SectionVersionRow | null
  draft: SectionVersionRow | null
  displayTitle: string | null
  onToggleEnabled: (id: string, enabled: boolean) => void
  onOpen: (section: SectionRow) => void
  onDelete: (section: SectionRow) => void
  onDuplicate: (section: SectionRow, targetPageId: string) => Promise<void>
  onDuplicateToAllPages: (section: SectionRow) => Promise<void>
  onDetach: (section: SectionRow) => Promise<void>
  onMove: (sectionId: string, direction: "up" | "down") => Promise<void>
  currentPageId: string
  pages: CmsPageRow[]
  pagesLoading: boolean
  ensurePagesLoaded: () => Promise<CmsPageRow[]>
  duplicateLoading: boolean
  sectionCount: number
  defaults?: SectionTypeDefaultsMap
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const [menuOpened, setMenuOpened] = useState(false)
  const [menuScreen, setMenuScreen] = useState<"root" | "dup_target" | "dup_pages">("root")

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  const otherPages = pages.filter((p) => p.id !== currentPageId)

  async function runDuplicate(targetPageId: string) {
    setMenuOpened(false)
    setMenuScreen("root")
    await onDuplicate(section, targetPageId)
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      withBorder
      radius="md"
      p="sm"
      onClick={() => onOpen(section)}
      className="cursor-pointer select-none"
    >
      <Group justify="space-between" align="center" gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Group align="start" gap="sm" style={{ minWidth: 0, flex: 1 }}>
          <div
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="mt-0.5 cursor-grab text-xs text-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            ⠿
          </div>
          <Stack gap={4}>
            {(() => {
              const typeLabel = defaults?.[section.section_type]?.label ?? section.section_type
              const titleLine = displayTitle?.trim() ? displayTitle.trim() : typeLabel
              const showTypeLine = Boolean(displayTitle?.trim())

              return (
                <>
                  <Group gap="xs">
                    <Text size="sm" fw={600} lineClamp={1}>
                      {titleLine}
                    </Text>
                    {section.key ? (
                      <Text c="dimmed" size="xs">
                        #{section.key}
                      </Text>
                    ) : null}
                  </Group>
                  {showTypeLine ? (
                    <Group gap="xs">
                      <TypeBadge type={section.section_type} defaults={defaults} />
                      {section.global_section_id ? <Badge size="xs" variant="light" color="blue">global</Badge> : null}
                    </Group>
                  ) : null}
                </>
              )
            })()}
            <Group gap="xs">
              <Badge size="xs" color={published ? "teal" : "gray"} variant="light">
                {published ? "published" : "no published"}
              </Badge>
              <Badge size="xs" color={draft ? "yellow" : "gray"} variant="light">
                {draft ? `draft v${draft.version}` : "no draft"}
              </Badge>
              <Text c="dimmed" size="xs" title={new Date(section.updated_at).toLocaleString()}>
                updated {formatDateTime(section.updated_at)}
              </Text>
            </Group>
          </Stack>
        </Group>

        <Group
          gap="xs"
          wrap="nowrap"
          style={{ flexShrink: 0 }}
          // Prevent click/pointer events on controls from opening the drawer.
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ActionIcon
            variant="default"
            aria-label="Move section up"
            onClick={() => void onMove(section.id, "up")}
            disabled={duplicateLoading || section.position <= 0}
          >
            <IconArrowUp size={15} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            aria-label="Move section down"
            onClick={() => void onMove(section.id, "down")}
            disabled={duplicateLoading || section.position >= sectionCount - 1}
          >
            <IconArrowDown size={15} />
          </ActionIcon>

          <Switch
            size="sm"
            checked={section.enabled}
            onChange={(e) => onToggleEnabled(section.id, e.currentTarget.checked)}
            aria-label="Enabled"
          />

          <Menu
            withinPortal
            position="bottom-end"
            shadow="md"
            opened={menuOpened}
            onChange={(opened) => {
              setMenuOpened(opened)
              if (!opened) setMenuScreen("root")
            }}
          >
            <Menu.Target>
              <ActionIcon variant="default" aria-label="Section actions">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item closeMenuOnClick={false} onClick={() => setMenuOpened(false)}>
                <Text size="xs" fw={600} c="dimmed">
                  Actions
                </Text>
              </Menu.Item>
              <Menu.Divider />
              {menuScreen === "root" ? (
                <>
                  <Menu.Item
                    leftSection={<IconCopy size={14} />}
                    closeMenuOnClick={false}
                    onClick={() => setMenuScreen("dup_target")}
                    disabled={duplicateLoading}
                  >
                    Duplicate…
                  </Menu.Item>
                  {section.global_section_id ? (
                    <Menu.Item
                      closeMenuOnClick
                      onClick={() => void onDetach(section)}
                    >
                      Detach from global (fork local)
                    </Menu.Item>
                  ) : null}
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onDelete(section)}
                  >
                    Delete…
                  </Menu.Item>
                </>
              ) : null}

              {menuScreen === "dup_target" ? (
                <>
                  <Menu.Item
                    leftSection={<IconChevronLeft size={14} />}
                    closeMenuOnClick={false}
                    onClick={() => setMenuScreen("root")}
                  >
                    Back
                  </Menu.Item>
                  <Menu.Label>Duplicate to</Menu.Label>
                  <Menu.Item
                    closeMenuOnClick={false}
                    disabled={duplicateLoading}
                    onClick={() => void runDuplicate(currentPageId)}
                  >
                    This page
                  </Menu.Item>
                  <Menu.Item
                    closeMenuOnClick={false}
                    disabled={duplicateLoading}
                    onClick={() => {
                      setMenuScreen("dup_pages")
                      void ensurePagesLoaded()
                    }}
                  >
                    Another page
                  </Menu.Item>
                  <Menu.Item
                    closeMenuOnClick={false}
                    disabled={duplicateLoading}
                    leftSection={<IconWorld size={14} />}
                    onClick={() => {
                      setMenuOpened(false)
                      setMenuScreen("root")
                      void onDuplicateToAllPages(section)
                    }}
                  >
                    Duplicate to all pages
                  </Menu.Item>
                </>
              ) : null}

              {menuScreen === "dup_pages" ? (
                <>
                  <Menu.Item
                    leftSection={<IconChevronLeft size={14} />}
                    closeMenuOnClick={false}
                    onClick={() => setMenuScreen("dup_target")}
                  >
                    Back
                  </Menu.Item>
                  <Menu.Label>Choose page</Menu.Label>
                  {pagesLoading ? (
                    <Menu.Item disabled closeMenuOnClick={false}>
                      Loading…
                    </Menu.Item>
                  ) : otherPages.length ? (
                    <div style={{ maxHeight: 260, overflowY: "auto" }}>
                      {otherPages.map((p) => (
                        <Menu.Item
                          key={p.id}
                          disabled={duplicateLoading}
                          closeMenuOnClick={false}
                          onClick={() => void runDuplicate(p.id)}
                        >
                          {p.title} ({p.slug})
                        </Menu.Item>
                      ))}
                    </div>
                  ) : (
                    <Menu.Item disabled closeMenuOnClick={false}>
                      No other pages
                    </Menu.Item>
                  )}
                </>
              ) : null}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Paper>
  )
}

export function PageEditor({ pageId }: { pageId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const normalizedPageId = (pageId ?? "").trim()
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const hasValidPageId = UUID_RE.test(normalizedPageId)

  const [page, setPage] = useState<{ id: string; slug: string; title: string } | null>(null)
  const [sections, setSections] = useState<SectionRow[]>([])
  const [versions, setVersions] = useState<SectionVersionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeDefaults, setTypeDefaults] = useState<SectionTypeDefaultsMap>({})

  const [addOpen, setAddOpen] = useState(false)
  const [newType, setNewType] = useState<CmsSectionType>("hero_cta")
  const [newKey, setNewKey] = useState("")
  const [addSource, setAddSource] = useState<"local" | "global">("local")
  const [globalSections, setGlobalSections] = useState<Array<{ id: string; key: string; section_type: CmsSectionType }>>([])
  const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null)

  const [activeSection, setActiveSection] = useState<SectionRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SectionRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(null)
  const [bulkAudit, setBulkAudit] = useState<DuplicateBulkAudit | null>(null)
  const [bulkAuditOpen, setBulkAuditOpen] = useState(false)

  const [allPages, setAllPages] = useState<CmsPageRow[]>([])
  const [allPagesLoading, setAllPagesLoading] = useState(false)
  const allPagesLoadedRef = useRef(false)
  const allPagesRef = useRef<CmsPageRow[]>([])
  const allPagesPromiseRef = useRef<Promise<CmsPageRow[]> | null>(null)

  function getPublishedFor(sectionId: string) {
    return versions.find((v) => v.section_id === sectionId && v.status === "published") ?? null
  }

  function getLatestDraftFor(sectionId: string) {
    return (
      versions
        .filter((v) => v.section_id === sectionId && v.status === "draft")
        .sort((a, b) => b.version - a.version)[0] ?? null
    )
  }

  function getDisplayTitle(sectionId: string): string | null {
    const draftTitle = getLatestDraftFor(sectionId)?.title?.trim() ?? ""
    if (draftTitle) return draftTitle
    const pubTitle = getPublishedFor(sectionId)?.title?.trim() ?? ""
    return pubTitle || null
  }

  const ensurePagesLoaded = useCallback(async (): Promise<CmsPageRow[]> => {
    if (allPagesLoadedRef.current) return allPagesRef.current
    if (allPagesPromiseRef.current) return allPagesPromiseRef.current

    setAllPagesLoading(true)
    const p = (async (): Promise<CmsPageRow[]> => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("id, slug, title")
          .order("slug", { ascending: true })
        if (error) throw new Error(error.message)
        const pages = (data ?? []) as CmsPageRow[]
        allPagesRef.current = pages
        setAllPages(pages)
        allPagesLoadedRef.current = true
        return pages
      } finally {
        setAllPagesLoading(false)
        allPagesPromiseRef.current = null
      }
    })()

    allPagesPromiseRef.current = p
    return p
  }, [supabase])

  type BaseRow = {
    version: number
    status: "draft" | "published"
    title: string | null
    subtitle: string | null
    cta_primary_label: string | null
    cta_primary_href: string | null
    cta_secondary_label: string | null
    cta_secondary_href: string | null
    background_media_url: string | null
    formatting: Record<string, unknown>
    content: Record<string, unknown>
  }

  async function fetchSourceBase(sourceSectionId: string) {
    const { data: baseRows, error: baseErr } = await supabase
      .from("section_versions")
      .select(
        "version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content"
      )
      .eq("section_id", sourceSectionId)
      .in("status", ["draft", "published"])
      .order("version", { ascending: false })

    if (baseErr) throw new Error(baseErr.message)

    const rows = (baseRows ?? []) as BaseRow[]
    const latestDraft = rows.filter((r) => r.status === "draft").sort((a, b) => b.version - a.version)[0] ?? null
    const publishedRow = rows.find((r) => r.status === "published") ?? null
    return latestDraft ?? publishedRow
  }

  async function duplicateSectionToPage(source: SectionRow, targetPageId: string) {
    const base = await fetchSourceBase(source.id)
    const defaults = typeDefaults[source.section_type]

    const { data: existingSections, error: existingErr } = await supabase
      .from("sections")
      .select("id, key, position")
      .eq("page_id", targetPageId)
      .order("position", { ascending: true })
    if (existingErr) throw new Error(existingErr.message)

    const typedExisting = (existingSections ?? []) as Array<{ id: string; key: string | null; position: number }>
    const insertAt = Math.min(source.position, typedExisting.length)

    if (typedExisting.length) {
      const moveRows = typedExisting.filter((row) => row.position >= insertAt)
      const updates = await Promise.all(
        moveRows.map((row) => supabase.from("sections").update({ position: row.position + 1 }).eq("id", row.id))
      )
      const firstError = updates.find((u) => u.error)?.error
      if (firstError) throw new Error(firstError.message)
    }

    let nextKey: string | null = source.key
    if (source.key) {
      const existing = new Set(typedExisting.map((r) => (r.key ?? "").trim()).filter(Boolean))
      const baseKey = source.key.trim()
      if (!existing.has(baseKey)) {
        nextKey = baseKey
      } else {
        let i = 1
        while (true) {
          const suffix = i === 1 ? "-copy" : `-copy-${i}`
          const candidate = `${baseKey}${suffix}`
          if (!existing.has(candidate)) {
            nextKey = candidate
            break
          }
          i += 1
        }
      }
    }

    const { data: newSectionData, error: insertSectionError } = await supabase
      .from("sections")
      .insert({
        page_id: targetPageId,
        section_type: source.section_type,
        key: nextKey,
        enabled: source.enabled,
        position: insertAt,
      })
      .select("id, page_id, section_type, key, enabled, position, updated_at, global_section_id")
      .single()

    if (insertSectionError) throw new Error(insertSectionError.message)

    const newSection = newSectionData as SectionRow
    const versionInsert = base
      ? {
          section_id: newSection.id,
          version: 1,
          status: "draft" as const,
          title: base.title,
          subtitle: base.subtitle,
          cta_primary_label: base.cta_primary_label,
          cta_primary_href: base.cta_primary_href,
          cta_secondary_label: base.cta_secondary_label,
          cta_secondary_href: base.cta_secondary_href,
          background_media_url: base.background_media_url,
          formatting: base.formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
          content: base.content ?? {},
        }
      : {
          section_id: newSection.id,
          version: 1,
          status: "draft" as const,
          title: defaults?.default_title ?? null,
          subtitle: defaults?.default_subtitle ?? null,
          cta_primary_label: defaults?.default_cta_primary_label ?? null,
          cta_primary_href: defaults?.default_cta_primary_href ?? null,
          cta_secondary_label: defaults?.default_cta_secondary_label ?? null,
          cta_secondary_href: defaults?.default_cta_secondary_href ?? null,
          background_media_url: defaults?.default_background_media_url ?? null,
          formatting: defaults?.default_formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
          content: defaults?.default_content ?? {},
        }

    const { error: versionErr } = await supabase.from("section_versions").insert(versionInsert)
    if (versionErr) throw new Error(versionErr.message)

    return { newSection, base }
  }

  async function duplicateSection(source: SectionRow, targetPageId: string) {
    if (!hasValidPageId) {
      setError("Missing or invalid page identifier.")
      return
    }

    setError(null)
    setDuplicateLoadingId(source.id)
    try {
      await duplicateSectionToPage(source, targetPageId)
      if (targetPageId === normalizedPageId) await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to duplicate section.")
    } finally {
      setDuplicateLoadingId(null)
    }
  }

  async function duplicateSectionToAllPages(source: SectionRow) {
    if (!hasValidPageId) {
      setError("Missing or invalid page identifier.")
      return
    }

    setError(null)
    setDuplicateLoadingId(source.id)
    try {
      const endpoints = ["/api/content/sections/duplicate-all", "/admin/api/content/sections/duplicate-all"]
      const requestBody = JSON.stringify({
        sourceSectionId: source.id,
        sourcePageId: normalizedPageId,
        sourcePosition: source.position,
      })

      let payload: { ok?: boolean; error?: string; audit?: DuplicateBulkAudit } | null = null
      let lastError = "Failed to duplicate section to all pages."

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: requestBody,
        })

        const parsed = (await response.json().catch(() => ({}))) as {
          ok?: boolean
          error?: string
          audit?: DuplicateBulkAudit
        }

        if (response.ok && parsed?.ok && parsed.audit) {
          payload = parsed
          break
        }

        if (parsed?.error) lastError = parsed.error
      }

      if (!payload?.audit) {
        throw new Error(lastError)
      }

      console.info("[CMS] bulk-section-duplicate-audit", payload.audit)
      setBulkAudit(payload.audit)
      setBulkAuditOpen(true)

      if (payload.audit.insertedCount > 0) {
        await load()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to duplicate section to all pages.")
    } finally {
      setDuplicateLoadingId(null)
    }
  }

  async function load() {
    if (!hasValidPageId) {
      setError("Missing or invalid page identifier.")
      setLoading(false)
      return
    }
    const targetPageId = normalizedPageId

    setLoading(true)
    setError(null)
    try {
      const [
        { data: pageData, error: pageError },
        { data: sectionData, error: sectionError },
        { data: defaultsData, error: defaultsError },
        { data: globalData, error: globalError },
      ] = await Promise.all([
        supabase.from("pages").select("id, slug, title").eq("id", targetPageId).single(),
        supabase
          .from("sections")
          .select("id, page_id, section_type, key, enabled, position, updated_at, global_section_id")
          .eq("page_id", targetPageId)
          .order("position", { ascending: true }),
        supabase
          .from("section_type_defaults")
          .select(
            "section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"
          ),
        supabase.from("global_sections").select("id, key, section_type").eq("enabled", true).order("key", { ascending: true }),
      ])

      if (pageError) {
        setError(pageError.message)
        return
      }
      if (sectionError) {
        setError(sectionError.message)
        return
      }
      if (defaultsError) {
        setError(defaultsError.message)
        return
      }
      if (globalError) {
        setError(globalError.message)
        return
      }

      setPage(pageData)

      const defaultsRows = (defaultsData ?? []) as SectionTypeDefault[]
      const defaultsMap = defaultsRows.reduce((acc, row) => {
        const normalized = normalizeSectionType(String(row.section_type))
        if (!normalized) return acc
        acc[normalized] = { ...row, section_type: normalized }
        return acc
      }, {} as SectionTypeDefaultsMap)
      setTypeDefaults(defaultsMap)
      setGlobalSections(
        ((globalData ?? []) as Array<{ id: string; key: string; section_type: string }>)
          .map((g) => {
            const normalized = normalizeSectionType(g.section_type)
            return normalized ? { ...g, section_type: normalized } : null
          })
          .filter(Boolean) as Array<{ id: string; key: string; section_type: CmsSectionType }>
      )

      const typedSections = (sectionData ?? [])
        .map((s) => {
          const normalized = normalizeSectionType(String(s.section_type))
          if (!normalized) return null
          return { ...(s as SectionRow), section_type: normalized }
        })
        .filter(Boolean) as SectionRow[]
      setSections(typedSections)

      const ids = typedSections.map((s) => s.id)
      if (!ids.length) {
        setVersions([])
        return
      }

      const { data: versionData, error: versionError } = await supabase
        .from("section_versions")
        .select("id, section_id, version, status, title, created_at, published_at")
        .in("section_id", ids)
        .order("version", { ascending: false })

      if (versionError) {
        setError(versionError.message)
        return
      }

      setVersions((versionData ?? []) as SectionVersionRow[])
    } finally {
      setLoading(false)
    }
  }

  async function detachGlobalSection(source: SectionRow) {
    setError(null)
    try {
      const { error } = await supabase.rpc("detach_global_section_to_local", {
        p_section_id: source.id,
      })
      if (error) throw new Error(error.message)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to detach global section.")
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteLoading(true)
    setError(null)
    try {
      const { error: delError } = await supabase.from("sections").delete().eq("id", id)
      if (delError) throw new Error(delError.message)

      // Close drawer if it was open for this section.
      if (activeSection?.id === id) setActiveSection(null)

      // Remove locally first; then renumber positions to keep them contiguous.
      const remaining = sections.filter((s) => s.id !== id)
      const renumbered = remaining.map((s, idx) => ({ ...s, position: idx }))
      setSections(renumbered)
      setVersions((v) => v.filter((row) => row.section_id !== id))

      await persistPositions(renumbered)
      setDeleteTarget(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete section.")
    } finally {
      setDeleteLoading(false)
    }
  }

  async function onToggleEnabled(id: string, enabled: boolean) {
    setError(null)
    const prev = sections
    setSections((s) => s.map((row) => (row.id === id ? { ...row, enabled } : row)))
    const { error: updateError } = await supabase
      .from("sections")
      .update({ enabled })
      .eq("id", id)
    if (updateError) {
      setError(updateError.message)
      setSections(prev)
    }
  }

  async function persistPositions(next: SectionRow[]) {
    const results = await Promise.all(
      next.map((s, idx) => supabase.from("sections").update({ position: idx }).eq("id", s.id))
    )

    const firstError = results.find((r) => r.error)?.error
    if (firstError) {
      setError(firstError.message)
      // Re-sync to avoid UI showing an order that didn't persist.
      await load()
      return false
    }

    return true
  }

  async function moveSectionByButton(sectionId: string, direction: "up" | "down") {
    const fromIndex = sections.findIndex((s) => s.id === sectionId)
    if (fromIndex < 0) return

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= sections.length) return

    const next = arrayMove(sections, fromIndex, toIndex).map((s, idx) => ({
      ...s,
      position: idx,
    }))
    setSections(next)
    await persistPositions(next)
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeId = String(active.id)
    const overId = over ? String(over.id) : null
    if (!overId || activeId === overId) return

    const oldIndex = sections.findIndex((s) => s.id === activeId)
    const newIndex = sections.findIndex((s) => s.id === overId)
    if (oldIndex < 0 || newIndex < 0) return

    const next = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      position: idx,
    }))
    setSections(next)
    await persistPositions(next)
  }

  async function onAddSection() {
    setError(null)
    const key = newKey.trim() || null
    const position = sections.length
    if (!hasValidPageId) {
      setError("Cannot add sections without a valid page.")
      return
    }

    const globalSelected = addSource === "global" ? globalSections.find((g) => g.id === selectedGlobalId) ?? null : null
    const sectionType = globalSelected?.section_type ?? newType

    const { data, error: insertError } = await supabase
      .from("sections")
      .insert({
        page_id: normalizedPageId,
        section_type: sectionType,
        key,
        enabled: true,
        position,
        global_section_id: globalSelected?.id ?? null,
      })
      .select("id, page_id, section_type, key, enabled, position, updated_at, global_section_id")
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    const section = data as SectionRow
    const defaults = typeDefaults[sectionType]

    const { error: versionError } = await supabase.from("section_versions").insert({
      section_id: section.id,
      version: 1,
      status: "draft",
      title: globalSelected ? null : defaults?.default_title ?? null,
      subtitle: globalSelected ? null : defaults?.default_subtitle ?? null,
      cta_primary_label: globalSelected ? null : defaults?.default_cta_primary_label ?? null,
      cta_primary_href: globalSelected ? null : defaults?.default_cta_primary_href ?? null,
      cta_secondary_label: globalSelected ? null : defaults?.default_cta_secondary_label ?? null,
      cta_secondary_href: globalSelected ? null : defaults?.default_cta_secondary_href ?? null,
      background_media_url: globalSelected ? null : defaults?.default_background_media_url ?? null,
      formatting: globalSelected ? {} : defaults?.default_formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
      content: globalSelected ? {} : defaults?.default_content ?? {},
    })
    if (versionError) setError(versionError.message)

    setAddOpen(false)
    setNewKey("")
    setSelectedGlobalId(null)
    await load()
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Helps diagnose bad links like /pages/undefined.
      console.debug("[PageEditor] pageId:", pageId, "normalized:", normalizedPageId)
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedPageId])

  return (
    <Stack gap="md">
      <Group justify="space-between" align="start" wrap="wrap" gap="xs">
        <div>
          <Title order={2} size="h3">
            Page Editor
          </Title>
          <Text c="dimmed" size="sm">
            {page ? (
              <>
                Editing <b>{page.title}</b> (<code>{page.slug}</code>)
              </>
            ) : (
              "Loading…"
            )}
          </Text>
        </div>
        <Button size="sm" variant="default" component={Link} href="/">
          Back
        </Button>
      </Group>

      {error ? (
        <Paper withBorder p="sm" radius="md">
          <Text c="red" size="sm">
            {error}
          </Text>
        </Paper>
      ) : null}

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="sm" wrap="wrap" gap="xs">
          <Group gap="sm">
            <Text fw={600} size="sm">
              Sections
            </Text>
            <Badge variant="default">{sections.length}</Badge>
          </Group>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            Add section
          </Button>
        </Group>

        {loading ? (
          <Text c="dimmed" size="sm">
            Loading…
          </Text>
        ) : sections.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <Stack gap="xs">
                {sections.map((s) => (
                  <SortableSectionItem
                    key={s.id}
                    section={s}
                    published={getPublishedFor(s.id)}
                    draft={getLatestDraftFor(s.id)}
                    displayTitle={getDisplayTitle(s.id)}
                    onToggleEnabled={onToggleEnabled}
                    onOpen={setActiveSection}
                    onDelete={setDeleteTarget}
                    onDuplicate={duplicateSection}
                    onDuplicateToAllPages={duplicateSectionToAllPages}
                    onDetach={detachGlobalSection}
                    onMove={moveSectionByButton}
                    currentPageId={normalizedPageId}
                    pages={allPages}
                    pagesLoading={allPagesLoading}
                    ensurePagesLoaded={ensurePagesLoaded}
                    duplicateLoading={duplicateLoadingId === s.id}
                    sectionCount={sections.length}
                    defaults={typeDefaults}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        ) : (
          <Text c="dimmed" size="sm">
            No sections yet.
          </Text>
        )}
      </Paper>

      <Modal opened={addOpen} onClose={() => setAddOpen(false)} title="Add section" centered>
        <Stack gap="sm">
          <Select
            label="Source"
            value={addSource}
            onChange={(v) => setAddSource((v as "local" | "global") ?? "local")}
            data={[{ value: "local", label: "Page-specific section" }, { value: "global", label: "Global reusable section" }]}
          />
          {addSource === "global" ? (
            <Select
              label="Global section"
              value={selectedGlobalId}
              onChange={setSelectedGlobalId}
              data={globalSections.map((g) => ({ value: g.id, label: `${g.key} (${typeDefaults[g.section_type]?.label ?? g.section_type})` }))}
            />
          ) : (
            <Select
              label="Section type"
              value={newType}
              onChange={(v) => setNewType((v as CmsSectionType) ?? "hero_cta")}
              data={SECTION_TYPES.map((type) => ({
                value: type,
                label: typeDefaults[type]?.label ?? type,
              }))}
            />
          )}
          <TextInput
            label="Key (optional, used for anchors like #faq)"
            placeholder="faq"
            value={newKey}
            onChange={(e) => setNewKey(e.currentTarget.value)}
          />
          <Group justify="end">
            <Button variant="default" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAddSection}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => (deleteLoading ? null : setDeleteTarget(null))}
        title="Delete section?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This permanently deletes the section and all of its versions.
          </Text>
          {deleteTarget ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="default">
                    {typeDefaults[deleteTarget.section_type]?.label ?? deleteTarget.section_type}
                  </Badge>
                  {deleteTarget.key ? (
                    <Text c="dimmed" size="xs">
                      #{deleteTarget.key}
                    </Text>
                  ) : null}
                </Group>
                {getDisplayTitle(deleteTarget.id) ? (
                  <Text size="sm" fw={500} lineClamp={2}>
                    {getDisplayTitle(deleteTarget.id)}
                  </Text>
                ) : null}
              </Stack>
            </Paper>
          ) : null}
          <Group justify="end">
            <Button
              variant="default"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button color="red" onClick={onConfirmDelete} loading={deleteLoading}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={bulkAuditOpen}
        onClose={() => setBulkAuditOpen(false)}
        title="Duplicate to all pages audit"
        centered
        size="lg"
      >
        {bulkAudit ? (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Rule: {bulkAudit.duplicateRule}
            </Text>
            <Group gap="xs">
              <Badge color="teal" variant="light">Inserted {bulkAudit.insertedCount}</Badge>
              <Badge color="yellow" variant="light">Skipped {bulkAudit.skippedCount}</Badge>
              <Badge color="red" variant="light">Failed {bulkAudit.failedCount}</Badge>
            </Group>
            {bulkAudit.noOpMessage ? (
              <Text size="sm" c="yellow">
                {bulkAudit.noOpMessage}
              </Text>
            ) : null}
            <Paper withBorder radius="md" p="sm">
              <Stack gap={6}>
                {bulkAudit.results.length ? (
                  bulkAudit.results.map((row) => (
                    <Group key={row.pageId} justify="space-between" align="start" gap="sm">
                      <Text size="sm" fw={500}>
                        {row.pageTitle} ({row.pageSlug})
                      </Text>
                      <Text size="xs" c={row.outcome === "failed" ? "red" : row.outcome === "skipped" ? "yellow" : "teal"}>
                        {row.outcome}: {row.message}
                      </Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    No page-level operations were performed.
                  </Text>
                )}
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </Modal>

      <SectionEditorDrawer
        opened={Boolean(activeSection)}
        section={activeSection}
        onClose={() => setActiveSection(null)}
        onChanged={load}
        typeDefaults={typeDefaults}
      />
    </Stack>
  )
}
