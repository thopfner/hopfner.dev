"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Button,
  Group,
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

import { SectionEditorDrawer } from "@/components/section-editor-drawer"
import { createClient } from "@/lib/supabase/browser"

function formatDateTime(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toISOString().replace("T", " ").replace(/\\.\\d{3}Z$/, "Z")
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
}

type SectionVersionRow = {
  id: string
  section_id: string
  version: number
  status: "draft" | "published" | "archived"
  created_at: string
  published_at: string | null
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
  onToggleEnabled,
  onOpen,
  defaults,
}: {
  section: SectionRow
  published: SectionVersionRow | null
  draft: SectionVersionRow | null
  onToggleEnabled: (id: string, enabled: boolean) => void
  onOpen: (section: SectionRow) => void
  defaults?: SectionTypeDefaultsMap
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
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
      <Group justify="space-between" align="start" gap="sm">
        <Group align="start" gap="sm">
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
            <Group gap="xs">
              <TypeBadge type={section.section_type} defaults={defaults} />
              {section.key ? (
                <Text c="dimmed" size="xs">
                  #{section.key}
                </Text>
              ) : null}
            </Group>
            <Group gap="xs">
              <Badge size="xs" color={published ? "teal" : "gray"} variant="light">
                {published ? "published" : "no published"}
              </Badge>
              <Badge size="xs" color={draft ? "yellow" : "gray"} variant="light">
                {draft ? `draft v${draft.version}` : "no draft"}
              </Badge>
              <Text c="dimmed" size="xs">
                updated {formatDateTime(section.updated_at)}
              </Text>
            </Group>
          </Stack>
        </Group>

        <Switch
          size="sm"
          checked={section.enabled}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onToggleEnabled(section.id, e.currentTarget.checked)}
          aria-label="Enabled"
        />
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

  const [activeSection, setActiveSection] = useState<SectionRow | null>(null)

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
      ] = await Promise.all([
        supabase.from("pages").select("id, slug, title").eq("id", targetPageId).single(),
        supabase
          .from("sections")
          .select("id, page_id, section_type, key, enabled, position, updated_at")
          .eq("page_id", targetPageId)
          .order("position", { ascending: true }),
        supabase
          .from("section_type_defaults")
          .select(
            "section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"
          ),
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

      setPage(pageData)

      const defaultsRows = (defaultsData ?? []) as SectionTypeDefault[]
      const defaultsMap = defaultsRows.reduce((acc, row) => {
        const normalized = normalizeSectionType(String(row.section_type))
        if (!normalized) return acc
        acc[normalized] = { ...row, section_type: normalized }
        return acc
      }, {} as SectionTypeDefaultsMap)
      setTypeDefaults(defaultsMap)

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
        .select("id, section_id, version, status, created_at, published_at")
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
    const payload = next.map((s, idx) => ({ id: s.id, position: idx }))
    const { error: upsertError } = await supabase.from("sections").upsert(payload)
    if (upsertError) {
      setError(upsertError.message)
      return false
    }
    return true
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
    const { data, error: insertError } = await supabase
      .from("sections")
      .insert({
        page_id: normalizedPageId,
        section_type: newType,
        key,
        enabled: true,
        position,
      })
      .select("id, page_id, section_type, key, enabled, position, updated_at")
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    const section = data as SectionRow
    const defaults = typeDefaults[newType]

    // Create an initial draft version so the editor can open immediately.
    const { error: versionError } = await supabase.from("section_versions").insert({
      section_id: section.id,
      version: 1,
      status: "draft",
      title: defaults?.default_title ?? null,
      subtitle: defaults?.default_subtitle ?? null,
      cta_primary_label: defaults?.default_cta_primary_label ?? null,
      cta_primary_href: defaults?.default_cta_primary_href ?? null,
      cta_secondary_label: defaults?.default_cta_secondary_label ?? null,
      cta_secondary_href: defaults?.default_cta_secondary_href ?? null,
      background_media_url: defaults?.default_background_media_url ?? null,
      formatting:
        defaults?.default_formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
      content: defaults?.default_content ?? {},
    })
    if (versionError) {
      setError(versionError.message)
    }

    setAddOpen(false)
    setNewKey("")
    await load()
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Helps diagnose bad links like /pages/undefined.
      // eslint-disable-next-line no-console
      console.debug("[PageEditor] pageId:", pageId, "normalized:", normalizedPageId)
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedPageId])

  return (
    <Stack gap="md">
      <Group justify="space-between" align="start">
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
        <Group justify="space-between" mb="sm">
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
                    onToggleEnabled={onToggleEnabled}
                    onOpen={setActiveSection}
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
            label="Section type"
            value={newType}
            onChange={(v) => setNewType((v as CmsSectionType) ?? "hero_cta")}
            data={SECTION_TYPES.map((type) => ({
              value: type,
              label: typeDefaults[type]?.label ?? type,
            }))}
          />
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
