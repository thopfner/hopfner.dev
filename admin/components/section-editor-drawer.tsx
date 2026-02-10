"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core"
import { IconPhoto, IconPlus, IconRestore, IconUpload, IconX } from "@tabler/icons-react"
import { RichTextEditor } from "@mantine/tiptap"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { useEditor } from "@tiptap/react"

import { createClient } from "@/lib/supabase/browser"

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

type SectionRow = {
  id: string
  page_id: string
  section_type: CmsSectionType
  key: string | null
}

type SectionVersionRow = {
  id: string
  section_id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  subtitle: string | null
  cta_primary_label: string | null
  cta_primary_href: string | null
  cta_secondary_label: string | null
  cta_secondary_href: string | null
  background_media_url: string | null
  formatting: Record<string, unknown>
  content: Record<string, unknown>
  created_at: string
  published_at: string | null
}

type FormattingState = {
  containerClass: string
  sectionClass: string
  paddingY: "" | "py-4" | "py-6" | "py-8" | "py-10" | "py-12"
  maxWidth: "" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl"
  textAlign: "" | "left" | "center"
  mobile?: {
    containerClass: string
    sectionClass: string
    paddingY: "" | "py-4" | "py-6" | "py-8" | "py-10" | "py-12"
  }
}

const DEFAULT_FORMATTING: FormattingState = {
  containerClass: "",
  sectionClass: "",
  paddingY: "py-6",
  maxWidth: "max-w-5xl",
  textAlign: "left",
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

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

function formatType(type: CmsSectionType, defaults?: SectionTypeDefaultsMap) {
  return defaults?.[type]?.label ?? type.replaceAll("_", " ")
}

async function getImageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {}
  const url = URL.createObjectURL(file)
  try {
    const img = document.createElement("img")
    img.src = url
    await img.decode()
    return { width: img.naturalWidth, height: img.naturalHeight }
  } catch {
    return {}
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function uploadToCmsMedia(file: File) {
  const supabase = createClient()
  const bucket = "cms-media"
  const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_")
  const path = `uploads/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path)
  const publicUrl = publicUrlData.publicUrl

  const { width, height } = await getImageSize(file)

  const { error: mediaError } = await supabase.from("media").insert({
    bucket,
    path,
    mime_type: file.type,
    size_bytes: file.size,
    width: width ?? null,
    height: height ?? null,
    alt: null,
  })
  if (mediaError) {
    // Upload succeeded; metadata insert failure should not block usage of URL.
    // Surface error to user but return URL anyway.
    console.warn("Failed to insert media metadata:", mediaError.message)
  }

  return { publicUrl, bucket, path }
}

function validateClassTokens(input: string, allowed: Set<string>) {
  const tokens = input
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
  const invalid = tokens.filter((t) => !allowed.has(t))
  return { tokens, invalid }
}

function normalizeFormatting(raw: Record<string, unknown>): FormattingState {
  const mobile = asRecord(raw.mobile)
  const out: FormattingState = {
    containerClass: asString(raw.containerClass),
    sectionClass: asString(raw.sectionClass),
    paddingY: (asString(raw.paddingY) as FormattingState["paddingY"]) || "",
    maxWidth: (asString(raw.maxWidth) as FormattingState["maxWidth"]) || "",
    textAlign: (asString(raw.textAlign) as FormattingState["textAlign"]) || "",
  }
  const hasMobile =
    typeof mobile.containerClass === "string" ||
    typeof mobile.sectionClass === "string" ||
    typeof mobile.paddingY === "string"

  if (hasMobile) {
    out.mobile = {
      containerClass: asString(mobile.containerClass),
      sectionClass: asString(mobile.sectionClass),
      paddingY: (asString(mobile.paddingY) as FormattingState["paddingY"]) || "",
    }
  }

  return out
}

function formattingToJsonb(state: FormattingState) {
  const base: Record<string, unknown> = {
    containerClass: state.containerClass.trim(),
    sectionClass: state.sectionClass.trim(),
    paddingY: state.paddingY,
    maxWidth: state.maxWidth,
    textAlign: state.textAlign,
  }
  if (state.mobile) {
    base.mobile = {
      containerClass: state.mobile.containerClass.trim(),
      sectionClass: state.mobile.sectionClass.trim(),
      paddingY: state.mobile.paddingY,
    }
  }
  return base
}

function textOrNull(input: string) {
  const t = input.trim()
  return t ? t : null
}

type VersionPayload = {
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...base }
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      out[key] = value
      return
    }
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value)
      return
    }
    out[key] = value
  })
  return out
}

function coalesceText(primary: string | null | undefined, fallback: string | null | undefined) {
  const p = (primary ?? "").trim()
  if (p) return p
  const f = (fallback ?? "").trim()
  return f
}

function versionRowToPayload(
  v: SectionVersionRow,
  defaults?: SectionTypeDefault
): VersionPayload {
  const mergedFormatting = deepMerge(
    asRecord(defaults?.default_formatting),
    asRecord(v.formatting)
  )
  const mergedContent = deepMerge(
    asRecord(defaults?.default_content),
    asRecord(v.content)
  )
  const normalizedFormatting = normalizeFormatting(mergedFormatting)
  return {
    title: coalesceText(v.title, defaults?.default_title) || null,
    subtitle: coalesceText(v.subtitle, defaults?.default_subtitle) || null,
    cta_primary_label: coalesceText(v.cta_primary_label, defaults?.default_cta_primary_label) || null,
    cta_primary_href: coalesceText(v.cta_primary_href, defaults?.default_cta_primary_href) || null,
    cta_secondary_label: coalesceText(v.cta_secondary_label, defaults?.default_cta_secondary_label) || null,
    cta_secondary_href: coalesceText(v.cta_secondary_href, defaults?.default_cta_secondary_href) || null,
    background_media_url: coalesceText(v.background_media_url, defaults?.default_background_media_url) || null,
    formatting: formattingToJsonb(normalizedFormatting),
    content: mergedContent,
  }
}

function defaultsToPayload(defaults?: SectionTypeDefault): VersionPayload {
  const normalizedFormatting = normalizeFormatting(asRecord(defaults?.default_formatting))
  return {
    title: coalesceText(null, defaults?.default_title) || null,
    subtitle: coalesceText(null, defaults?.default_subtitle) || null,
    cta_primary_label: coalesceText(null, defaults?.default_cta_primary_label) || null,
    cta_primary_href: coalesceText(null, defaults?.default_cta_primary_href) || null,
    cta_secondary_label: coalesceText(null, defaults?.default_cta_secondary_label) || null,
    cta_secondary_href: coalesceText(null, defaults?.default_cta_secondary_href) || null,
    background_media_url: coalesceText(null, defaults?.default_background_media_url) || null,
    formatting: formattingToJsonb(normalizedFormatting),
    content: asRecord(defaults?.default_content),
  }
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (!value || typeof value !== "object") return value
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(obj).sort()) out[key] = sortDeep(obj[key])
  return out
}

function stableStringify(value: unknown) {
  return JSON.stringify(sortDeep(value))
}

function formatDateTime(ts: string | null) {
  if (!ts) return "—"
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toISOString().replace("T", " ").replace(/\\.\\d{3}Z$/, "Z")
}

function StatusBadge({ status }: { status: SectionVersionRow["status"] }) {
  const color = status === "published" ? "teal" : status === "draft" ? "yellow" : "gray"
  return (
    <Badge size="xs" color={color} variant="light">
      {status}
    </Badge>
  )
}

function TipTapJsonEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    // Next.js renders Client Components on the server too; TipTap requires this to avoid hydration mismatches.
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: false }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as Record<string, unknown>)
    },
  })

  async function onPickImage(file: File) {
    if (!editor) return
    const { publicUrl } = await uploadToCmsMedia(file)
    editor.chain().focus().setImage({ src: publicUrl }).run()
  }

  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Group gap="xs">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0]
              e.currentTarget.value = ""
              if (!file) return
              await onPickImage(file)
            }}
          />
          <ActionIcon
            variant="default"
            size="sm"
            aria-label="Insert image"
            onClick={() => fileRef.current?.click()}
          >
            <IconPhoto size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Stack>
  )
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...items, ""])}
        >
          Add
        </Button>
      </Group>
      <Stack gap="xs">
        {items.map((val, idx) => (
          <Group key={idx} gap="xs" align="start">
            <TextInput
              value={val}
              placeholder={placeholder}
              onChange={(e) => {
                const next = items.slice()
                next[idx] = e.currentTarget.value
                onChange(next)
              }}
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="default"
              aria-label="Remove"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        ))}
        {!items.length ? (
          <Text c="dimmed" size="sm">
            No items.
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}

export function SectionEditorDrawer({
  opened,
  section,
  onClose,
  onChanged,
  typeDefaults,
}: {
  opened: boolean
  section: SectionRow | null
  onClose: () => void
  onChanged: () => void | Promise<void>
  typeDefaults?: SectionTypeDefaultsMap | null
}) {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versions, setVersions] = useState<SectionVersionRow[]>([])
  const [allowedClasses, setAllowedClasses] = useState<Set<string>>(new Set())

  const [baseSnapshot, setBaseSnapshot] = useState<VersionPayload | null>(null)
  const legacyDraftCleanupWarnedRef = useRef(false)

  // Draft form state (typed fields)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState("")
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState("")
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState("")
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState("")
  const [backgroundMediaUrl, setBackgroundMediaUrl] = useState("")
  const [formatting, setFormatting] = useState<FormattingState>({
    ...DEFAULT_FORMATTING,
  })

  // Content state (varies by section_type)
  const [content, setContent] = useState<Record<string, unknown>>({})

  const [uploadOpen, setUploadOpen] = useState(false)

  const normalizedType = section ? normalizeSectionType(section.section_type) : null
  const defaults = normalizedType ? typeDefaults?.[normalizedType] : undefined

  const published = versions.find((v) => v.status === "published") ?? null
  const drafts = versions.filter((v) => v.status === "draft").sort((a, b) => b.version - a.version)
  const activeDraft = drafts[0] ?? null
  const editorBaseVersion = activeDraft ?? published
  const formPayload: VersionPayload = {
    title: textOrNull(title),
    subtitle: textOrNull(subtitle),
    cta_primary_label: textOrNull(ctaPrimaryLabel),
    cta_primary_href: textOrNull(ctaPrimaryHref),
    cta_secondary_label: textOrNull(ctaSecondaryLabel),
    cta_secondary_href: textOrNull(ctaSecondaryHref),
    background_media_url: textOrNull(backgroundMediaUrl),
    formatting: formattingToJsonb(formatting),
    content,
  }

  const isDirty = baseSnapshot ? stableStringify(formPayload) !== stableStringify(baseSnapshot) : false

  async function load({ forceHydrate = false }: { forceHydrate?: boolean } = {}) {
    if (!section) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: vData, error: vErr }, { data: clsData, error: clsErr }] =
        await Promise.all([
          supabase
            .from("section_versions")
            .select(
              "id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at"
            )
            .eq("section_id", section.id)
            .order("version", { ascending: false }),
          supabase.from("tailwind_class_whitelist").select("class"),
        ])

      if (vErr) throw new Error(vErr.message)
      if (clsErr) throw new Error(clsErr.message)

      let versionRows = (vData ?? []) as SectionVersionRow[]

      // Guard legacy data: enforce at most one active draft (keep highest draft version).
      const foundDrafts = versionRows.filter((v) => v.status === "draft")
      if (foundDrafts.length > 1) {
        const sortedDrafts = foundDrafts.slice().sort((a, b) => b.version - a.version)
        const keep = sortedDrafts[0]
        const toArchive = sortedDrafts.slice(1).map((v) => v.id)
        if (toArchive.length) {
          if (!legacyDraftCleanupWarnedRef.current) {
            console.warn(
              `[CMS] Found ${foundDrafts.length} drafts for section ${section.id}. Archiving all but latest (v${keep.version}).`
            )
            legacyDraftCleanupWarnedRef.current = true
          }

          const { error: archiveError } = await supabase
            .from("section_versions")
            .update({ status: "archived" })
            .in("id", toArchive)
          if (archiveError) throw new Error(archiveError.message)

          const { data: v2Data, error: v2Err } = await supabase
            .from("section_versions")
            .select(
              "id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at"
            )
            .eq("section_id", section.id)
            .order("version", { ascending: false })
          if (v2Err) throw new Error(v2Err.message)
          versionRows = (v2Data ?? []) as SectionVersionRow[]
        }
      }

      setVersions(versionRows)

      const clsRows = (clsData ?? []) as Array<{ class: string }>
      setAllowedClasses(new Set(clsRows.map((r) => r.class)))

      if (forceHydrate || !isDirty) {
        const nextPublished = versionRows.find((v) => v.status === "published") ?? null
        const nextDraft =
          versionRows
            .filter((v) => v.status === "draft")
            .sort((a, b) => b.version - a.version)[0] ?? null
        const nextBase = nextDraft ?? nextPublished

        hydrateFrom(nextBase)
        if (nextBase) {
          setBaseSnapshot(versionRowToPayload(nextBase, defaults))
        } else {
          setBaseSnapshot(defaultsToPayload(defaults))
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load section.")
      setVersions([])
    } finally {
      setLoading(false)
    }
  }

  function hydrateFrom(v: SectionVersionRow | null) {
    if (!v) {
      const payload = defaultsToPayload(defaults)
      setTitle(payload.title ?? "")
      setSubtitle(payload.subtitle ?? "")
      setCtaPrimaryLabel(payload.cta_primary_label ?? "")
      setCtaPrimaryHref(payload.cta_primary_href ?? "")
      setCtaSecondaryLabel(payload.cta_secondary_label ?? "")
      setCtaSecondaryHref(payload.cta_secondary_href ?? "")
      setBackgroundMediaUrl(payload.background_media_url ?? "")
      setFormatting(normalizeFormatting(payload.formatting))
      setContent(payload.content)
      return
    }
    const payload = versionRowToPayload(v, defaults)
    setTitle(payload.title ?? "")
    setSubtitle(payload.subtitle ?? "")
    setCtaPrimaryLabel(payload.cta_primary_label ?? "")
    setCtaPrimaryHref(payload.cta_primary_href ?? "")
    setCtaSecondaryLabel(payload.cta_secondary_label ?? "")
    setCtaSecondaryHref(payload.cta_secondary_href ?? "")
    setBackgroundMediaUrl(payload.background_media_url ?? "")
    setFormatting(normalizeFormatting(payload.formatting))
    setContent(payload.content)
  }

  useEffect(() => {
    if (!opened) return
    // New section open: force hydrate (even if the previous section had unsaved edits).
    setBaseSnapshot(null)
    void load({ forceHydrate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, section?.id])

  async function onSaveDraft() {
    if (!section) return
    if (!isDirty) return
    setError(null)
    setLoading(true)
    try {
      const containerValidation = validateClassTokens(formatting.containerClass, allowedClasses)
      const sectionValidation = validateClassTokens(formatting.sectionClass, allowedClasses)
      const mobileContainerValidation = formatting.mobile
        ? validateClassTokens(formatting.mobile.containerClass, allowedClasses)
        : { invalid: [] as string[] }
      const mobileSectionValidation = formatting.mobile
        ? validateClassTokens(formatting.mobile.sectionClass, allowedClasses)
        : { invalid: [] as string[] }

      const invalid = [
        ...containerValidation.invalid,
        ...sectionValidation.invalid,
        ...mobileContainerValidation.invalid,
        ...mobileSectionValidation.invalid,
      ]
      if (invalid.length) {
        setError(`Invalid Tailwind classes: ${invalid.join(", ")}`)
        return
      }

      // Draft semantics (single active draft per section):
      // - If dirty, archive any existing draft(s) then insert a NEW immutable draft version (v+1).
      // - Publish uses RPC to promote the last saved draft row (no insert on publish).
      const payload: VersionPayload = {
        title: textOrNull(title),
        subtitle: textOrNull(subtitle),
        cta_primary_label: textOrNull(ctaPrimaryLabel),
        cta_primary_href: textOrNull(ctaPrimaryHref),
        cta_secondary_label: textOrNull(ctaSecondaryLabel),
        cta_secondary_href: textOrNull(ctaSecondaryHref),
        background_media_url: textOrNull(backgroundMediaUrl),
        formatting: formattingToJsonb(formatting),
        content,
      }

      const { error: archiveError } = await supabase
        .from("section_versions")
        .update({ status: "archived" })
        .eq("section_id", section.id)
        .eq("status", "draft")
      if (archiveError) throw new Error(archiveError.message)

      const nextVersion = (versions.reduce((m, v) => Math.max(m, v.version), 0) || 0) + 1
      const { error: insertError } = await supabase.from("section_versions").insert({
        section_id: section.id,
        version: nextVersion,
        status: "draft",
        ...payload,
      })
      if (insertError) throw new Error(insertError.message)

      await load({ forceHydrate: true })
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft.")
    } finally {
      setLoading(false)
    }
  }

  async function onPublishDraft() {
    if (!section) return
    if (!activeDraft) {
      setError("No draft to publish. Edit and save a draft first.")
      return
    }
    if (isDirty) {
      setError("Save draft before publishing changes.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { error: rpcError } = await supabase.rpc("publish_section_version", {
        p_section_id: section.id,
        p_version_id: activeDraft.id,
      })
      if (rpcError) throw new Error(rpcError.message)

      await load({ forceHydrate: true })
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish.")
    } finally {
      setLoading(false)
    }
  }

  async function onRestore(fromVersionId: string) {
    if (!section) return
    setError(null)
    setLoading(true)
    try {
      const { data, error: rpcError } = await supabase.rpc("restore_section_version", {
        p_section_id: section.id,
        p_from_version_id: fromVersionId,
      })
      if (rpcError) throw new Error(rpcError.message)
      if (typeof data === "string") {
        // Ensure only one active draft exists after restore (archive any legacy drafts).
        const { error: archiveError } = await supabase
          .from("section_versions")
          .update({ status: "archived" })
          .eq("section_id", section.id)
          .eq("status", "draft")
          .neq("id", data)
        if (archiveError) throw new Error(archiveError.message)
      }
      await load({ forceHydrate: true })
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to restore version.")
    } finally {
      setLoading(false)
    }
  }

  async function onUploadBackground(file: File) {
    const { publicUrl } = await uploadToCmsMedia(file)
    setBackgroundMediaUrl(publicUrl)
  }

  // Section-type specific content editors (minimal, structured).
  const type = normalizedType
  const capabilities = asRecord(defaults?.capabilities)
  const fieldCaps = asRecord(capabilities.fields)
  const showTitle = fieldCaps.title !== false
  const showSubtitle = fieldCaps.subtitle !== false
  const showCtaPrimary = fieldCaps.cta_primary === true
  const showCtaSecondary = fieldCaps.cta_secondary === true
  const showBackgroundMedia = fieldCaps.background_media === true

  const heroBullets = asArray<string>(content.bullets)
  const heroTrust = asString(content.trustLine)

  const whatCards = asArray<Record<string, unknown>>(content.cards)
  const howSteps = asArray<Record<string, unknown>>(content.steps)
  const workflowItems = asArray<Record<string, unknown>>(content.items)
  const techItems = asArray<Record<string, unknown>>(content.items)
  const faqItems = asArray<Record<string, unknown>>(content.items)
  const navLinks = asArray<Record<string, unknown>>(content.links)

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="sm">
            <Title order={3} size="h4">
              Section
            </Title>
            {type ? <Badge variant="default">{formatType(type, typeDefaults ?? undefined)}</Badge> : null}
            {section?.key ? (
              <Text size="sm" c="dimmed">
                #{section.key}
              </Text>
            ) : null}
          </Group>
        }
        position="right"
        size="xl"
      >
        <Stack gap="md">
          {error ? (
            <Paper withBorder p="sm" radius="md">
              <Text c="red" size="sm">
                {error}
              </Text>
            </Paper>
          ) : null}

          <Paper withBorder p="md" radius="md">
            <Stack gap={6}>
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Text fw={600} size="sm">
                    Current
                  </Text>
                  {published ? (
                    <Badge size="xs" color="teal" variant="light">
                      published v{published.version}
                    </Badge>
                  ) : (
                    <Badge size="xs" color="gray" variant="light">
                      no published
                    </Badge>
                  )}
                  {activeDraft ? (
                    <Badge size="xs" color="yellow" variant="light">
                      draft v{activeDraft.version}
                    </Badge>
                  ) : (
                    <Badge size="xs" color="gray" variant="light">
                      no draft
                    </Badge>
                  )}
                  {editorBaseVersion ? (
                    <Badge size="xs" variant="default">
                      editing v{editorBaseVersion.version} ({editorBaseVersion.status})
                    </Badge>
                  ) : null}
                </Group>

                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="default"
                    loading={loading}
                    onClick={onSaveDraft}
                    disabled={!isDirty}
                  >
                    Save draft
                  </Button>
                  <Button
                    size="xs"
                    loading={loading}
                    onClick={onPublishDraft}
                    disabled={!activeDraft || isDirty}
                  >
                    Publish
                  </Button>
                </Group>
              </Group>

              {isDirty ? (
                <Group justify="space-between" gap="xs">
                  <Text size="xs" c="dimmed">
                    Unsaved changes. Save draft to publish your edits.
                  </Text>
                </Group>
              ) : null}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">
                Fields
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                {showTitle ? (
                  <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
                ) : null}
                {showSubtitle ? (
                  <TextInput label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.currentTarget.value)} />
                ) : null}
                {showCtaPrimary ? (
                  <TextInput
                    label="Primary CTA label"
                    value={ctaPrimaryLabel}
                    onChange={(e) => setCtaPrimaryLabel(e.currentTarget.value)}
                  />
                ) : null}
                {showCtaPrimary ? (
                  <TextInput
                    label="Primary CTA href"
                    value={ctaPrimaryHref}
                    onChange={(e) => setCtaPrimaryHref(e.currentTarget.value)}
                    placeholder="#contact"
                  />
                ) : null}
                {showCtaSecondary ? (
                  <TextInput
                    label="Secondary CTA label"
                    value={ctaSecondaryLabel}
                    onChange={(e) => setCtaSecondaryLabel(e.currentTarget.value)}
                  />
                ) : null}
                {showCtaSecondary ? (
                  <TextInput
                    label="Secondary CTA href"
                    value={ctaSecondaryHref}
                    onChange={(e) => setCtaSecondaryHref(e.currentTarget.value)}
                    placeholder="#services"
                  />
                ) : null}
              </SimpleGrid>

              {showBackgroundMedia ? (
                <Group align="end" gap="sm">
                  <TextInput
                    label="Background media URL"
                    value={backgroundMediaUrl}
                    onChange={(e) => setBackgroundMediaUrl(e.currentTarget.value)}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <Button
                    size="sm"
                    variant="default"
                    leftSection={<IconUpload size={16} />}
                    onClick={() => setUploadOpen(true)}
                  >
                    Upload
                  </Button>
                </Group>
              ) : null}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">
                Formatting
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <Select
                  label="Padding Y"
                  data={["", "py-4", "py-6", "py-8", "py-10", "py-12"]}
                  value={formatting.paddingY}
                  onChange={(v) =>
                    setFormatting((s) => ({
                      ...s,
                      paddingY: ((v ?? "") as FormattingState["paddingY"]) || "",
                    }))
                  }
                />
                <Select
                  label="Max width"
                  data={["", "max-w-3xl", "max-w-4xl", "max-w-5xl", "max-w-6xl"]}
                  value={formatting.maxWidth}
                  onChange={(v) =>
                    setFormatting((s) => ({
                      ...s,
                      maxWidth: ((v ?? "") as FormattingState["maxWidth"]) || "",
                    }))
                  }
                />
                <Select
                  label="Text align"
                  data={[
                    { value: "", label: "(default)" },
                    { value: "left", label: "left" },
                    { value: "center", label: "center" },
                  ]}
                  value={formatting.textAlign}
                  onChange={(v) =>
                    setFormatting((s) => ({
                      ...s,
                      textAlign: ((v ?? "") as FormattingState["textAlign"]) || "",
                    }))
                  }
                />
                <Box />
              </SimpleGrid>

              <Textarea
                label="containerClass (whitelisted Tailwind tokens)"
                value={formatting.containerClass}
                onChange={(e) =>
                  setFormatting((s) => ({ ...s, containerClass: e.currentTarget.value }))
                }
                autosize
                minRows={2}
              />
              <Textarea
                label="sectionClass (whitelisted Tailwind tokens)"
                value={formatting.sectionClass}
                onChange={(e) =>
                  setFormatting((s) => ({ ...s, sectionClass: e.currentTarget.value }))
                }
                autosize
                minRows={2}
              />

              <Group justify="space-between" align="center">
                <Text size="sm" fw={600}>
                  Mobile overrides (optional)
                </Text>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() =>
                    setFormatting((s) =>
                      s.mobile
                        ? { ...s, mobile: undefined }
                        : {
                            ...s,
                            mobile: {
                              containerClass: "",
                              sectionClass: "",
                              paddingY: "",
                            },
                          }
                    )
                  }
                >
                  {formatting.mobile ? "Disable" : "Enable"}
                </Button>
              </Group>

              {formatting.mobile ? (
                <Stack gap="sm">
                  <Select
                    label="Mobile padding Y"
                    data={["", "py-4", "py-6", "py-8", "py-10", "py-12"]}
                    value={formatting.mobile.paddingY}
                    onChange={(v) =>
                      setFormatting((s) =>
                        s.mobile
                          ? {
                              ...s,
                              mobile: {
                                ...s.mobile,
                                paddingY:
                                  ((v ?? "") as FormattingState["paddingY"]) || "",
                              },
                            }
                          : s
                      )
                    }
                  />
                  <Textarea
                    label="Mobile containerClass"
                    value={formatting.mobile.containerClass}
                    onChange={(e) =>
                      setFormatting((s) =>
                        s.mobile
                          ? {
                              ...s,
                              mobile: {
                                ...s.mobile,
                                containerClass: e.currentTarget.value,
                              },
                            }
                          : s
                      )
                    }
                    autosize
                    minRows={2}
                  />
                  <Textarea
                    label="Mobile sectionClass"
                    value={formatting.mobile.sectionClass}
                    onChange={(e) =>
                      setFormatting((s) =>
                        s.mobile
                          ? {
                              ...s,
                              mobile: {
                                ...s.mobile,
                                sectionClass: e.currentTarget.value,
                              },
                            }
                          : s
                      )
                    }
                    autosize
                    minRows={2}
                  />
                </Stack>
              ) : null}

              <Text c="dimmed" size="xs">
                Only a strict, safe list of Tailwind classes is allowed (validated in the app and DB).
              </Text>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">
                Content ({type ? formatType(type, typeDefaults ?? undefined) : "—"})
              </Text>

              {type === "hero_cta" ? (
                <>
                  <ListEditor
                    label="Bullets"
                    items={heroBullets}
                    onChange={(next) => setContent((c) => ({ ...c, bullets: next }))}
                    placeholder="✅ ..."
                  />
                  <Textarea
                    label="Trust line"
                    value={heroTrust}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, trustLine: e.currentTarget.value }))
                    }
                    autosize
                    minRows={2}
                  />
                </>
              ) : null}

              {type === "card_grid" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Cards
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          cards: [...whatCards, { title: "", text: "", youGet: [], bestFor: "" }],
                        }))
                      }
                    >
                      Add card
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {whatCards.map((card, idx) => {
                      const r = asRecord(card)
                      const youGet = asArray<string>(r.youGet)
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                Card {idx + 1}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove card"
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    cards: whatCards.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                            <TextInput
                              label="Title"
                              value={asString(r.title)}
                              onChange={(e) => {
                                const next = whatCards.slice()
                                next[idx] = { ...r, title: e.currentTarget.value }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                            />
                            <Textarea
                              label="Text"
                              value={asString(r.text)}
                              onChange={(e) => {
                                const next = whatCards.slice()
                                next[idx] = { ...r, text: e.currentTarget.value }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                              autosize
                              minRows={2}
                            />
                            <ListEditor
                              label="You get (list)"
                              items={youGet}
                              onChange={(nextList) => {
                                const next = whatCards.slice()
                                next[idx] = { ...r, youGet: nextList }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                              placeholder="workflow map"
                            />
                            <TextInput
                              label="Best for"
                              value={asString(r.bestFor)}
                              onChange={(e) => {
                                const next = whatCards.slice()
                                next[idx] = { ...r, bestFor: e.currentTarget.value }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                    {!whatCards.length ? (
                      <Text c="dimmed" size="sm">
                        No cards.
                      </Text>
                    ) : null}
                  </Stack>
                </Stack>
              ) : null}

              {type === "steps_list" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Steps
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          steps: [...howSteps, { title: "", body: "" }],
                        }))
                      }
                    >
                      Add step
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {howSteps.map((step, idx) => {
                      const r = asRecord(step)
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                Step {idx + 1}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove step"
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    steps: howSteps.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                            <TextInput
                              label="Title"
                              value={asString(r.title)}
                              onChange={(e) => {
                                const next = howSteps.slice()
                                next[idx] = { ...r, title: e.currentTarget.value }
                                setContent((c) => ({ ...c, steps: next }))
                              }}
                            />
                            <Textarea
                              label="Body"
                              value={asString(r.body)}
                              onChange={(e) => {
                                const next = howSteps.slice()
                                next[idx] = { ...r, body: e.currentTarget.value }
                                setContent((c) => ({ ...c, steps: next }))
                              }}
                              autosize
                              minRows={2}
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {type === "title_body_list" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Items
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          items: [...workflowItems, { title: "", body: "" }],
                        }))
                      }
                    >
                      Add item
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {workflowItems.map((item, idx) => {
                      const r = asRecord(item)
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                Item {idx + 1}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove item"
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    items: workflowItems.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                            <TextInput
                              label="Title"
                              value={asString(r.title)}
                              onChange={(e) => {
                                const next = workflowItems.slice()
                                next[idx] = { ...r, title: e.currentTarget.value }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                            />
                            <Textarea
                              label="Body"
                              value={asString(r.body)}
                              onChange={(e) => {
                                const next = workflowItems.slice()
                                next[idx] = { ...r, body: e.currentTarget.value }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                              autosize
                              minRows={2}
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {type === "rich_text_block" ? (
                <TipTapJsonEditor
                  label="Body"
                  value={asRecord(content.bodyRichText)}
                  onChange={(next) => setContent((c) => ({ ...c, bodyRichText: next }))}
                />
              ) : null}

              {type === "label_value_list" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Items
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          items: [...techItems, { label: "", value: "" }],
                        }))
                      }
                    >
                      Add item
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {techItems.map((item, idx) => {
                      const r = asRecord(item)
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                Item {idx + 1}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove item"
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    items: techItems.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                            <TextInput
                              label="Label"
                              value={asString(r.label)}
                              onChange={(e) => {
                                const next = techItems.slice()
                                next[idx] = { ...r, label: e.currentTarget.value }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                            />
                            <TextInput
                              label="Value"
                              value={asString(r.value)}
                              onChange={(e) => {
                                const next = techItems.slice()
                                next[idx] = { ...r, value: e.currentTarget.value }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {type === "faq_list" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Items
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          items: [...faqItems, { question: "", answerRichText: { type: "doc", content: [] } }],
                        }))
                      }
                    >
                      Add FAQ
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {faqItems.map((item, idx) => {
                      const r = asRecord(item)
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                FAQ {idx + 1}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove FAQ"
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    items: faqItems.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                            <TextInput
                              label="Question"
                              value={asString(r.question)}
                              onChange={(e) => {
                                const next = faqItems.slice()
                                next[idx] = { ...r, question: e.currentTarget.value }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                            />
                            <TipTapJsonEditor
                              label="Answer"
                              value={asRecord(r.answerRichText)}
                              onChange={(nextJson) => {
                                const next = faqItems.slice()
                                next[idx] = { ...r, answerRichText: nextJson }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {type === "cta_block" ? (
                <Textarea
                  label="Body"
                  value={asString(content.body)}
                  onChange={(e) => setContent((c) => ({ ...c, body: e.currentTarget.value }))}
                  autosize
                  minRows={2}
                />
              ) : null}

              {type === "nav_links" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Links
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          links: [...navLinks, { label: "", href: "", anchorId: "" }],
                        }))
                      }
                    >
                      Add link
                    </Button>
                  </Group>
                  <Stack gap="xs">
                    {navLinks.map((lnk, idx) => {
                      const r = asRecord(lnk)
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                Link {idx + 1}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove link"
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    links: navLinks.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                              <TextInput
                                label="Label"
                                value={asString(r.label)}
                                onChange={(e) => {
                                  const next = navLinks.slice()
                                  next[idx] = { ...r, label: e.currentTarget.value }
                                  setContent((c) => ({ ...c, links: next }))
                                }}
                              />
                              <TextInput
                                label="Href"
                                value={asString(r.href)}
                                onChange={(e) => {
                                  const next = navLinks.slice()
                                  next[idx] = { ...r, href: e.currentTarget.value }
                                  setContent((c) => ({ ...c, links: next }))
                                }}
                                placeholder="#faq"
                              />
                              <TextInput
                                label="Anchor ID"
                                value={asString(r.anchorId)}
                                onChange={(e) => {
                                  const next = navLinks.slice()
                                  next[idx] = { ...r, anchorId: e.currentTarget.value }
                                  setContent((c) => ({ ...c, links: next }))
                                }}
                                placeholder="faq"
                              />
                            </SimpleGrid>
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {!type ? (
                <Text c="dimmed" size="sm">
                  Select a section.
                </Text>
              ) : null}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">
                Version history
              </Text>
              <Table withTableBorder withColumnBorders striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Version</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Published</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {versions.map((v) => (
                    <Table.Tr key={v.id}>
                      <Table.Td>v{v.version}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={v.status} />
                      </Table.Td>
	                      <Table.Td>
	                        <Text c="dimmed" size="sm">
	                          {formatDateTime(v.created_at)}
	                        </Text>
	                      </Table.Td>
	                      <Table.Td>
	                        <Text c="dimmed" size="sm">
	                          {formatDateTime(v.published_at)}
	                        </Text>
		                      </Table.Td>
	                      <Table.Td>
	                        <Group justify="end">
	                          <Button
	                            size="xs"
	                            variant="default"
	                            leftSection={<IconRestore size={14} />}
                            onClick={() => onRestore(v.id)}
                          >
                            Restore to draft
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {!versions.length ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text c="dimmed" size="sm">
                          No versions.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : null}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>

          <Text c="dimmed" size="xs">
            Publish and restore are done via secure RPC functions. Only admins can mutate content.
          </Text>
        </Stack>
      </Drawer>

      <Modal opened={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload image" centered>
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Upload to Supabase Storage bucket <code>cms-media</code>. The public URL will be used.
          </Text>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0]
              e.currentTarget.value = ""
              if (!file) return
              try {
                setLoading(true)
                await onUploadBackground(file)
                setUploadOpen(false)
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.")
              } finally {
                setLoading(false)
              }
            }}
          />
          <Group justify="end">
            <Button variant="default" onClick={() => setUploadOpen(false)}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
