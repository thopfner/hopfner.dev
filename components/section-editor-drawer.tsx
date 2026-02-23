"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Drawer,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  Slider,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core"
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconChevronLeft,
  IconExternalLink,
  IconHash,
  IconLink as IconLinkIcon,
  IconPlus,
  IconRestore,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { RichTextEditor } from "@mantine/tiptap"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { useEditor } from "@tiptap/react"

import { uploadMedia } from "@/lib/media/upload"
import type { MediaItem } from "@/lib/media/types"
import { ImageFieldPicker } from "@/components/image-field-picker"
import { MediaLibraryModal } from "@/components/media-library-modal"
import { MediaPickerMenu } from "@/components/media-picker-menu"
import { createClient } from "@/lib/supabase/browser"

const ADMIN_SHELL_HEADER_HEIGHT_PX = 52

type BuiltinCmsSectionType =
  | "nav_links"
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"
  | "footer_grid"

type CmsSectionType = BuiltinCmsSectionType | string

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

type SectionScope = "page" | "global"

type SectionRow = {
  id: string
  page_id?: string | null
  section_type: CmsSectionType | string
  key: string | null
}

type SectionVersionRow = {
  id: string
  owner_id: string
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
  outerSpacing: "" | "my-2" | "my-4" | "my-6" | "my-8" | "my-10" | "my-12"
  maxWidth: "" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl"
  textAlign: "" | "left" | "center"
  widthMode: "content" | "full"
  heroMinHeight: "auto" | "70svh" | "100svh"
  shadowMode: "inherit" | "on" | "off"
  innerShadowMode: "inherit" | "on" | "off"
  innerShadowStrength: number
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
  outerSpacing: "",
  maxWidth: "max-w-5xl",
  textAlign: "left",
  widthMode: "content",
  heroMinHeight: "auto",
  shadowMode: "inherit",
  innerShadowMode: "inherit",
  innerShadowStrength: 0,
}

type CardDisplayState = {
  showTitle: boolean
  showText: boolean
  showImage: boolean
  showYouGet: boolean
  showBestFor: boolean
  youGetMode: "block" | "list"
  bestForMode: "block" | "list"
}

const DEFAULT_CARD_DISPLAY: CardDisplayState = {
  showTitle: true,
  showText: true,
  showImage: false,
  showYouGet: false,
  showBestFor: false,
  youGetMode: "block",
  bestForMode: "block",
}

const DEFAULT_CARD_IMAGE_WIDTH = 240

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

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === "string") : []
}

function inputValueFromEvent(e: unknown): string {
  if (
    e &&
    typeof e === "object" &&
    "currentTarget" in e &&
    (e as { currentTarget?: { value?: unknown } }).currentTarget &&
    typeof (e as { currentTarget?: { value?: unknown } }).currentTarget?.value === "string"
  ) {
    return (e as { currentTarget: { value: string } }).currentTarget.value
  }
  return ""
}

function toCardDisplay(v: unknown): CardDisplayState {
  const r = asRecord(v)
  const defaults = DEFAULT_CARD_DISPLAY
  return {
    showTitle: typeof r.showTitle === "boolean" ? r.showTitle : defaults.showTitle,
    showText: typeof r.showText === "boolean" ? r.showText : defaults.showText,
    showImage: typeof r.showImage === "boolean" ? r.showImage : defaults.showImage,
    showYouGet: typeof r.showYouGet === "boolean" ? r.showYouGet : defaults.showYouGet,
    showBestFor: typeof r.showBestFor === "boolean" ? r.showBestFor : defaults.showBestFor,
    youGetMode: r.youGetMode === "list" ? "list" : defaults.youGetMode,
    bestForMode: r.bestForMode === "list" ? "list" : defaults.bestForMode,
  }
}

function emptyRichTextDoc(): Record<string, unknown> {
  return { type: "doc", content: [] }
}

function plainTextToRichTextDoc(text: string): Record<string, unknown> {
  const trimmed = text.trim()
  if (!trimmed) return emptyRichTextDoc()
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      },
    ],
  }
}

function richTextWithFallback(rich: unknown, fallbackText: unknown): Record<string, unknown> {
  const richRecord = asRecord(rich)
  if (Object.keys(richRecord).length > 0) return richRecord
  return plainTextToRichTextDoc(asString(fallbackText))
}

function richTextDocToPlainText(input: unknown): string {
  function walk(node: unknown): string[] {
    const record = asRecord(node)
    const nodeType = asString(record.type)

    if (nodeType === "text") {
      const textValue = asString(record.text)
      return textValue ? [textValue] : []
    }

    const children = asArray<unknown>(record.content)
    const parts = children.flatMap((child) => walk(child))

    if (["paragraph", "heading", "blockquote", "listItem"].includes(nodeType)) {
      return parts.length ? [parts.join(" ")] : []
    }

    return parts
  }

  const pieces = walk(input).map((piece) => piece.trim()).filter(Boolean)
  return pieces.join("\n")
}

type ComposerBlockType = "heading" | "subtitle" | "rich_text" | "cards" | "faq" | "image" | "list" | "cta"

type ComposerBlock = {
  id: string
  type: ComposerBlockType
  title?: string
  body?: string
  imageUrl?: string
  listStyle?: "basic" | "steps"
  items?: string[]
  steps?: Array<{ title?: string; body?: string }>
  cards?: Array<{ title: string; body: string }>
  faqs?: Array<{ q: string; a: string }>
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

type ComposerColumn = { id: string; blocks: ComposerBlock[] }
type ComposerRow = { id: string; columns: ComposerColumn[] }
type ComposerSchema = {
  rows?: ComposerRow[]
}

type FlattenedComposerBlock = {
  rowId: string
  columnId: string
  rowIndex: number
  columnIndex: number
  block: ComposerBlock
}

function normalizeComposerSchema(input: unknown): ComposerSchema {
  if (!input || typeof input !== "object") return { rows: [] }
  const raw = input as ComposerSchema
  const rows = asArray<ComposerRow>(raw.rows)
  return {
    rows: rows.map((row, rowIndex) => ({
      id: asString(row.id, `row-${rowIndex + 1}`),
      columns: asArray<ComposerColumn>(row.columns)
        .slice(0, 3)
        .map((col, colIndex) => ({
          id: asString(col.id, `col-${colIndex + 1}`),
          blocks: asArray<ComposerBlock>(col.blocks).map((block, blockIndex) => ({
            ...block,
            id: asString(block.id, `blk-${rowIndex + 1}-${colIndex + 1}-${blockIndex + 1}`),
            type: (asString(block.type, "rich_text") as ComposerBlockType),
            listStyle:
              asString(block.type) === "list"
                ? asString(block.listStyle) === "basic"
                  ? "basic"
                  : "steps"
                : block.listStyle,
          })),
        })),
    })),
  }
}

function flattenComposerSchemaBlocks(schema: ComposerSchema | null): FlattenedComposerBlock[] {
  if (!schema) return []
  const rows = asArray<ComposerRow>(schema.rows)
  const out: FlattenedComposerBlock[] = []
  rows.forEach((row, rowIndex) => {
    const columns = asArray<ComposerColumn>(row.columns)
    columns.forEach((column, columnIndex) => {
      const blocks = asArray<ComposerBlock>(column.blocks)
      blocks.forEach((block) => {
        out.push({
          rowId: asString(row.id, `row-${rowIndex + 1}`),
          columnId: asString(column.id, `col-${columnIndex + 1}`),
          rowIndex,
          columnIndex,
          block,
        })
      })
    })
  })
  return out
}

const BUILTIN_SECTION_TYPES = new Set<BuiltinCmsSectionType>([
  "nav_links",
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
  "footer_grid",
])

function isBuiltinSectionType(type: string): type is BuiltinCmsSectionType {
  return BUILTIN_SECTION_TYPES.has(type as BuiltinCmsSectionType)
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
    case "footer_grid":
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
      return raw?.trim() ? raw.trim() : null
  }
}

function formatType(type: CmsSectionType, defaults?: SectionTypeDefaultsMap) {
  return defaults?.[type as BuiltinCmsSectionType]?.label ?? type.replaceAll("_", " ")
}

type CmsPageRow = { id: string; slug: string; title: string }

type ParsedLinkTarget =
  | { kind: "this_page_anchor"; anchor: string }
  | { kind: "page"; pageSlug: string }
  | { kind: "page_anchor"; pageSlug: string; anchor: string }
  | { kind: "custom"; href: string }

function pageSlugToPath(slug: string): string {
  return `/${slug}`
}

function parseHref(rawHref: string): ParsedLinkTarget {
  const href = (rawHref ?? "").trim()
  if (!href) return { kind: "custom", href: "" }

  if (href.startsWith("#")) {
    const anchor = href.slice(1).trim()
    return anchor ? { kind: "this_page_anchor", anchor } : { kind: "custom", href }
  }

  if (href.startsWith("/")) {
    const [pathPart, hashPart] = href.split("#", 2)
    const slug = (pathPart ?? "").slice(1).trim()
    if (slug && !slug.includes("/")) {
      const anchor = (hashPart ?? "").trim()
      return anchor
        ? { kind: "page_anchor", pageSlug: slug, anchor }
        : { kind: "page", pageSlug: slug }
    }
  }

  return { kind: "custom", href }
}

function buildHref(target: ParsedLinkTarget): string {
  switch (target.kind) {
    case "this_page_anchor":
      return `#${target.anchor}`
    case "page":
      return pageSlugToPath(target.pageSlug)
    case "page_anchor":
      return `${pageSlugToPath(target.pageSlug)}#${target.anchor}`
    case "custom":
      return target.href
  }
}

type LinkMenuScreen =
  | "root"
  | "this_page"
  | "pages"
  | "page_actions"
  | "page_sections"
  | "custom"

function LinkMenuField({
  label,
  value,
  onChange,
  currentPageId,
  pages,
  pagesLoading,
  anchorsByPageId,
  anchorsLoadingByPageId,
  ensurePagesLoaded,
  ensureAnchorsLoaded,
}: {
  label: string
  value: string
  onChange: (nextHref: string) => void
  currentPageId: string
  pages: CmsPageRow[]
  pagesLoading: boolean
  anchorsByPageId: Record<string, string[]>
  anchorsLoadingByPageId: Record<string, boolean>
  ensurePagesLoaded: () => Promise<void>
  ensureAnchorsLoaded: (pageId: string) => Promise<void>
}) {
  const [opened, setOpened] = useState(false)
  const [screen, setScreen] = useState<LinkMenuScreen>("root")
  const [selectedPageId, setSelectedPageId] = useState("")
  const [customDraft, setCustomDraft] = useState("")

  const parsed = useMemo(() => parseHref(value), [value])
  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null

  const thisPageAnchors = anchorsByPageId[currentPageId] ?? []
  const thisPageAnchorsLoading = anchorsLoadingByPageId[currentPageId] ?? false
  const selectedPageAnchors = selectedPageId ? anchorsByPageId[selectedPageId] ?? [] : []
  const selectedPageAnchorsLoading = selectedPageId ? anchorsLoadingByPageId[selectedPageId] ?? false : false

  function reset() {
    setScreen("root")
    setSelectedPageId("")
    setCustomDraft("")
  }

  function closeMenu() {
    setOpened(false)
    reset()
  }

  function setHref(nextHref: string) {
    if (nextHref !== value) onChange(nextHref)
    closeMenu()
  }

  function enterThisPage() {
    setScreen("this_page")
    void ensureAnchorsLoaded(currentPageId)
  }

  function enterPages() {
    setScreen("pages")
    void ensurePagesLoaded()
  }

  function enterCustom() {
    setScreen("custom")
    setCustomDraft(parsed.kind === "custom" ? parsed.href : "")
  }

  return (
    <Menu
      withinPortal={false}
      position="bottom-start"
      shadow="md"
      width={340}
      opened={opened}
      onChange={(nextOpened) => {
        setOpened(nextOpened)
        if (nextOpened) {
          void ensurePagesLoaded()
        } else {
          reset()
        }
      }}
    >
      <Menu.Target>
        <TextInput
          label={label}
          value={value}
          readOnly
          placeholder="Choose link..."
          rightSection={<IconChevronDown size={16} />}
          rightSectionPointerEvents="none"
        />
      </Menu.Target>

      <Menu.Dropdown>
        {screen === "root" ? (
          <>
            <Menu.Label>Choose Link</Menu.Label>
            <Menu.Item leftSection={<IconHash size={16} />} closeMenuOnClick={false} onClick={enterThisPage}>
              This page
            </Menu.Item>
            <Menu.Item leftSection={<IconLinkIcon size={16} />} closeMenuOnClick={false} onClick={enterPages}>
              Another page
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconExternalLink size={16} />} closeMenuOnClick={false} onClick={enterCustom}>
              Custom URL...
            </Menu.Item>
            <Menu.Item c="dimmed" closeMenuOnClick={false} onClick={() => setHref("")}>
              Clear link
            </Menu.Item>
          </>
        ) : null}

        {screen === "this_page" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("root")}>
              Back
            </Menu.Item>
            <Menu.Label>This page sections</Menu.Label>
            {thisPageAnchorsLoading ? (
              <Menu.Item closeMenuOnClick={false} disabled leftSection={<Loader size="xs" />}>
                Loading...
              </Menu.Item>
            ) : thisPageAnchors.length ? (
              <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                {thisPageAnchors.map((k) => (
                  <Menu.Item key={k} onClick={() => setHref(buildHref({ kind: "this_page_anchor", anchor: k }))}>
                    #{k}
                  </Menu.Item>
                ))}
              </Box>
            ) : (
              <Menu.Item closeMenuOnClick={false} disabled>
                No keyed sections on this page
              </Menu.Item>
            )}
          </>
        ) : null}

        {screen === "pages" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("root")}>
              Back
            </Menu.Item>
            <Menu.Label>Pages</Menu.Label>
            {pagesLoading ? (
              <Menu.Item closeMenuOnClick={false} disabled leftSection={<Loader size="xs" />}>
                Loading...
              </Menu.Item>
            ) : pages.length ? (
              <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                {pages.map((p) => (
                  <Menu.Item
                    key={p.id}
                    closeMenuOnClick={false}
                    onClick={() => {
                      setSelectedPageId(p.id)
                      setScreen("page_actions")
                    }}
                  >
                    {p.title} ({p.slug})
                  </Menu.Item>
                ))}
              </Box>
            ) : (
              <Menu.Item closeMenuOnClick={false} disabled>
                No pages found
              </Menu.Item>
            )}
          </>
        ) : null}

        {screen === "page_actions" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("pages")}>
              Back
            </Menu.Item>
            <Menu.Label>
              {selectedPage ? `${selectedPage.title} (${selectedPage.slug})` : "Page"}
            </Menu.Label>
            <Menu.Item
              disabled={!selectedPage}
              onClick={() => {
                if (!selectedPage) return
                setHref(buildHref({ kind: "page", pageSlug: selectedPage.slug }))
              }}
            >
              Top of page
            </Menu.Item>
            <Menu.Item
              disabled={!selectedPage}
              closeMenuOnClick={false}
              onClick={() => {
                if (!selectedPage) return
                setScreen("page_sections")
                void ensureAnchorsLoaded(selectedPage.id)
              }}
            >
              Section on this page
            </Menu.Item>
          </>
        ) : null}

        {screen === "page_sections" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("page_actions")}>
              Back
            </Menu.Item>
            <Menu.Label>Sections</Menu.Label>
            {!selectedPage ? (
              <Menu.Item closeMenuOnClick={false} disabled>
                Pick a page first
              </Menu.Item>
            ) : selectedPageAnchorsLoading ? (
              <Menu.Item closeMenuOnClick={false} disabled leftSection={<Loader size="xs" />}>
                Loading...
              </Menu.Item>
            ) : selectedPageAnchors.length ? (
              <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                {selectedPageAnchors.map((k) => (
                  <Menu.Item
                    key={k}
                    onClick={() => {
                      if (!selectedPage) return
                      setHref(buildHref({ kind: "page_anchor", pageSlug: selectedPage.slug, anchor: k }))
                    }}
                  >
                    #{k}
                  </Menu.Item>
                ))}
              </Box>
            ) : (
              <Menu.Item closeMenuOnClick={false} disabled>
                No keyed sections on this page
              </Menu.Item>
            )}
          </>
        ) : null}

        {screen === "custom" ? (
          <Box p="sm">
            <Group justify="space-between" mb="xs">
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconChevronLeft size={14} />}
                onClick={() => setScreen("root")}
              >
                Back
              </Button>
              <Text size="xs" c="dimmed">
                Custom URL
              </Text>
            </Group>
            <TextInput
              label="Link"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.currentTarget.value)}
              placeholder="https://... or mailto:... or /about#pricing"
              mb="xs"
            />
            <Group justify="space-between">
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setCustomDraft((v) => (v.startsWith("mailto:") ? v : `mailto:${v}`))}
                >
                  mailto:
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setCustomDraft((v) => (v.startsWith("tel:") ? v : `tel:${v}`))}
                >
                  tel:
                </Button>
              </Group>
              <Button size="xs" onClick={() => setHref(customDraft.trim())}>
                Apply
              </Button>
            </Group>
          </Box>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  )
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
  const { bucket, path, url } = await uploadMedia(file)
  const publicUrl = url ?? ""
  if (!publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.")
  }

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
  const rawShadowMode = asString(raw.shadowMode)
  const rawInnerShadowMode = asString(raw.innerShadowMode)
  const rawInnerShadowStrength = Number(raw.innerShadowStrength)
  const out: FormattingState = {
    containerClass: asString(raw.containerClass),
    sectionClass: asString(raw.sectionClass),
    paddingY: (asString(raw.paddingY) as FormattingState["paddingY"]) || "",
    outerSpacing: (asString(raw.outerSpacing) as FormattingState["outerSpacing"]) || "",
    maxWidth: (asString(raw.maxWidth) as FormattingState["maxWidth"]) || "",
    textAlign: (asString(raw.textAlign) as FormattingState["textAlign"]) || "",
    widthMode: asString(raw.widthMode) === "full" ? "full" : "content",
    heroMinHeight:
      asString(raw.heroMinHeight) === "70svh" || asString(raw.heroMinHeight) === "100svh"
        ? (asString(raw.heroMinHeight) as FormattingState["heroMinHeight"])
        : "auto",
    shadowMode: rawShadowMode === "off" || rawShadowMode === "on" ? rawShadowMode : "inherit",
    innerShadowMode:
      rawInnerShadowMode === "off" || rawInnerShadowMode === "on"
        ? rawInnerShadowMode
        : "inherit",
    innerShadowStrength: Number.isFinite(rawInnerShadowStrength)
      ? Math.min(1.8, Math.max(0, rawInnerShadowStrength))
      : 0,
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
    outerSpacing: state.outerSpacing,
    maxWidth: state.maxWidth,
    textAlign: state.textAlign,
    widthMode: state.widthMode,
    heroMinHeight: state.heroMinHeight,
    shadowMode: state.shadowMode,
    innerShadowMode: state.innerShadowMode,
    innerShadowStrength: state.innerShadowStrength,
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
  onError,
}: {
  label: string
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  onError?: (message: string) => void
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)

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

  function onPickFromLibrary(item: MediaItem) {
    if (!editor) return
    editor.chain().focus().setImage({ src: item.url }).run()
    setLibraryOpen(false)
  }

  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Group gap="xs">
          <MediaPickerMenu
            iconTarget
            label="Insert image"
            withinPortal={false}
            onUploadFile={onPickImage}
            onChooseFromLibrary={() => setLibraryOpen(true)}
            onError={onError}
          />
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

      <MediaLibraryModal
        opened={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={onPickFromLibrary}
      />
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
  scope = "page",
}: {
  opened: boolean
  section: SectionRow | null
  onClose: () => void
  onChanged: () => void | Promise<void>
  typeDefaults?: SectionTypeDefaultsMap | null
  scope?: SectionScope
}) {
  const supabase = useMemo(() => createClient(), [])
  const versionTable = scope === "global" ? "global_section_versions" : "section_versions"
  const ownerIdColumn = scope === "global" ? "global_section_id" : "section_id"
  const publishRpc = scope === "global" ? "publish_global_section_version" : "publish_section_version"
  const restoreRpc = scope === "global" ? "rollback_global_section_to_version" : "restore_section_version"
  const versionSelect = `id, ${ownerIdColumn}, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content, created_at, published_at`

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versions, setVersions] = useState<SectionVersionRow[]>([])
  const [allowedClasses, setAllowedClasses] = useState<Set<string>>(new Set())
  const [customComposerSchema, setCustomComposerSchema] = useState<ComposerSchema | null>(null)

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

  const [deleteDraftOpen, setDeleteDraftOpen] = useState(false)
  const [deleteDraftLoading, setDeleteDraftLoading] = useState(false)
  const [backgroundLibraryOpen, setBackgroundLibraryOpen] = useState(false)
  const [navLogoLibraryOpen, setNavLogoLibraryOpen] = useState(false)
  const [cardImageLibraryTarget, setCardImageLibraryTarget] = useState<number | null>(null)
  const [customImageLibraryTargetId, setCustomImageLibraryTargetId] = useState<string | null>(null)

  const [pages, setPages] = useState<CmsPageRow[]>([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [anchorsByPageId, setAnchorsByPageId] = useState<Record<string, string[]>>({})
  const [anchorsLoadingByPageId, setAnchorsLoadingByPageId] = useState<Record<string, boolean>>({})
  const anchorsCacheRef = useRef<Record<string, string[]>>({})
  const anchorsPromiseRef = useRef<Partial<Record<string, Promise<void>>>>({})
  const pagesLoadedRef = useRef(false)
  const pagesPromiseRef = useRef<Promise<void> | null>(null)

  const normalizedType = section ? normalizeSectionType(section.section_type) : null
  const defaults = normalizedType && isBuiltinSectionType(normalizedType) ? typeDefaults?.[normalizedType] : undefined
  const isCustomComposedType = Boolean(normalizedType && !isBuiltinSectionType(normalizedType))
  const flattenedCustomBlocks = useMemo(
    () => flattenComposerSchemaBlocks(customComposerSchema),
    [customComposerSchema]
  )

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

  const ensureAnchorsLoaded = useCallback(
    async (pageId: string) => {
      const pid = (pageId ?? "").trim()
      if (!pid) return
      if (anchorsCacheRef.current[pid]) return
      if (anchorsPromiseRef.current[pid]) {
        await anchorsPromiseRef.current[pid]
        return
      }

      setAnchorsLoadingByPageId((prev) => ({ ...prev, [pid]: true }))
      const p = (async () => {
        try {
          const { data, error } = await supabase
            .from("sections")
            .select("key, position")
            .eq("page_id", pid)
            .not("key", "is", null)
            .order("position", { ascending: true })

          if (error) throw new Error(error.message)

          const keys = ((data ?? []) as Array<{ key: string | null }>)
            .map((r) => String(r.key ?? ""))
            .filter(Boolean)
          anchorsCacheRef.current[pid] = keys
          setAnchorsByPageId((prev) => ({ ...prev, [pid]: keys }))
        } finally {
          setAnchorsLoadingByPageId((prev) => ({ ...prev, [pid]: false }))
          delete anchorsPromiseRef.current[pid]
        }
      })()

      anchorsPromiseRef.current[pid] = p
      await p
    },
    [supabase]
  )

  const ensurePagesLoaded = useCallback(async () => {
    if (pagesLoadedRef.current) return
    if (pagesPromiseRef.current) {
      await pagesPromiseRef.current
      return
    }

    setPagesLoading(true)
    const p = (async () => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("id, slug, title")
          .order("slug", { ascending: true })

        if (error) throw new Error(error.message)
        setPages((data ?? []) as CmsPageRow[])
        pagesLoadedRef.current = true
      } finally {
        setPagesLoading(false)
        pagesPromiseRef.current = null
      }
    })()

    pagesPromiseRef.current = p
    await p
  }, [supabase])

  async function load({ forceHydrate = false }: { forceHydrate?: boolean } = {}) {
    if (!section) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: vData, error: vErr }, { data: clsData, error: clsErr }] =
        await Promise.all([
          supabase
            .from(versionTable)
            .select(versionSelect)
            .eq(ownerIdColumn, section.id)
            .order("version", { ascending: false }),
          supabase.from("tailwind_class_whitelist").select("class"),
        ])

      if (vErr) throw new Error(vErr.message)
      if (clsErr) throw new Error(clsErr.message)

      let versionRows = (vData ?? []) as unknown as SectionVersionRow[]

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
            .from(versionTable)
            .update({ status: "archived" })
            .in("id", toArchive)
          if (archiveError) throw new Error(archiveError.message)

          const { data: v2Data, error: v2Err } = await supabase
            .from(versionTable)
            .select(versionSelect)
            .eq(ownerIdColumn, section.id)
            .order("version", { ascending: false })
          if (v2Err) throw new Error(v2Err.message)
          versionRows = (v2Data ?? []) as unknown as SectionVersionRow[]
        }
      }

      setVersions(versionRows)

      const clsRows = (clsData ?? []) as Array<{ class: string }>
      setAllowedClasses(new Set(clsRows.map((r) => r.class)))

      let nextCustomComposerSchema: ComposerSchema | null = null
      if (section) {
        const nextType = normalizeSectionType(String(section.section_type))
        if (nextType && !isBuiltinSectionType(nextType)) {
          const { data: registryRow, error: registryError } = await supabase
            .from("section_type_registry")
            .select("key, renderer, composer_schema, is_active")
            .eq("key", nextType)
            .maybeSingle<{
              key: string
              renderer: "legacy" | "composed"
              composer_schema: Record<string, unknown> | null
              is_active: boolean
            }>()

          if (registryError) {
            throw new Error(registryError.message)
          }

          if (registryRow?.is_active && registryRow.renderer === "composed") {
            nextCustomComposerSchema = normalizeComposerSchema(registryRow.composer_schema)
          }
        }
      }
      setCustomComposerSchema(nextCustomComposerSchema)

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

  // Link picker loads pages/anchors lazily (when the user opens the picker).

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
        .from(versionTable)
        .update({ status: "archived" })
        .eq(ownerIdColumn, section.id)
        .eq("status", "draft")
      if (archiveError) throw new Error(archiveError.message)

      const nextVersion = (versions.reduce((m, v) => Math.max(m, v.version), 0) || 0) + 1
      const { error: insertError } = await supabase.from(versionTable).insert({
        [ownerIdColumn]: section.id,
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
      const publishArgs =
        scope === "global"
          ? { p_global_section_id: section.id, p_version_id: activeDraft.id, p_publish_at: new Date().toISOString() }
          : { p_section_id: section.id, p_version_id: activeDraft.id }
      const { error: rpcError } = await supabase.rpc(publishRpc, publishArgs)
      if (rpcError) throw new Error(rpcError.message)

      await load({ forceHydrate: true })
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish.")
    } finally {
      setLoading(false)
    }
  }

  async function onConfirmDeleteDraft() {
    if (!section) return
    if (!activeDraft) return
    setError(null)
    setDeleteDraftLoading(true)
    try {
      const { error: delError } = await supabase
        .from(versionTable)
        .delete()
        .eq(ownerIdColumn, section.id)
        .eq("status", "draft")
      if (delError) throw new Error(delError.message)

      setDeleteDraftOpen(false)
      await load({ forceHydrate: true })
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete draft.")
    } finally {
      setDeleteDraftLoading(false)
    }
  }

  async function onRestore(fromVersionId: string) {
    if (!section) return
    setError(null)
    setLoading(true)
    try {
      const restoreArgs =
        scope === "global"
          ? { p_global_section_id: section.id, p_from_version_id: fromVersionId }
          : { p_section_id: section.id, p_from_version_id: fromVersionId }
      const { data, error: rpcError } = await supabase.rpc(restoreRpc, restoreArgs)
      if (rpcError) throw new Error(rpcError.message)
      if (typeof data === "string") {
        // Ensure only one active draft exists after restore (archive any legacy drafts).
        const { error: archiveError } = await supabase
          .from(versionTable)
          .update({ status: "archived" })
          .eq(ownerIdColumn, section.id)
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
  const navLogo = asRecord(content.logo)
  const navLogoUrl = asString(navLogo.url)
  const footerCards = asArray<Record<string, unknown>>(content.cards)
  const footerLegal = asRecord(content.legal)
  const footerLegalLinks = asArray<Record<string, unknown>>(footerLegal.links)
  const footerBrandText = asString(content.brandText)
  const navLogoAlt = asString(navLogo.alt, "Site logo")
  const navLogoWidthRaw = Number(navLogo.widthPx)
  const navLogoWidth = Number.isFinite(navLogoWidthRaw)
    ? Math.min(320, Math.max(60, Math.round(navLogoWidthRaw)))
    : 140

  function applyNavLogoUrl(url: string) {
    setContent((c) => {
      const existing = asRecord(c.logo)
      const existingWidthRaw = Number(existing.widthPx)
      const existingWidth = Number.isFinite(existingWidthRaw)
        ? Math.min(320, Math.max(60, Math.round(existingWidthRaw)))
        : 140
      const existingAlt = asString(existing.alt, "").trim()
      return {
        ...c,
        logo: {
          ...existing,
          url,
          alt: existingAlt || "Site logo",
          widthPx: existingWidth,
        },
      }
    })
  }

  function applyCardImageUrl(cardIndex: number, url: string) {
    setContent((c) => {
      const cards = asArray<Record<string, unknown>>(c.cards)
      if (cardIndex < 0 || cardIndex >= cards.length) return c
      const nextCards = cards.slice()
      const card = asRecord(nextCards[cardIndex])
      const image = asRecord(card.image)
      const existingWidthRaw = Number(image.widthPx)
      const existingWidth = Number.isFinite(existingWidthRaw)
        ? Math.min(420, Math.max(80, Math.round(existingWidthRaw)))
        : DEFAULT_CARD_IMAGE_WIDTH
      nextCards[cardIndex] = {
        ...card,
        image: {
          ...image,
          url,
          alt: asString(image.alt) || asString(card.title),
          widthPx: existingWidth,
        },
      }
      return {
        ...c,
        cards: nextCards,
      }
    })
  }

  function applyCardImageWidth(cardIndex: number, widthPx: number) {
    setContent((c) => {
      const cards = asArray<Record<string, unknown>>(c.cards)
      if (cardIndex < 0 || cardIndex >= cards.length) return c
      const nextCards = cards.slice()
      const card = asRecord(nextCards[cardIndex])
      const image = asRecord(card.image)
      nextCards[cardIndex] = {
        ...card,
        image: {
          ...image,
          widthPx: Math.min(420, Math.max(80, Math.round(widthPx))),
        },
      }
      return {
        ...c,
        cards: nextCards,
      }
    })
  }

  function setCardDisplayForCard(cardIndex: number, nextPatch: Partial<CardDisplayState>) {
    setContent((c) => {
      const cards = asArray<Record<string, unknown>>(c.cards)
      if (!cards.length || cardIndex < 0 || cardIndex >= cards.length) return c
      const globalDisplay = toCardDisplay(c.cardDisplay)
      const nextCards = cards.map((card, idx) => {
        const cardRecord = asRecord(card)
        const normalized = toCardDisplay(cardRecord.display ?? globalDisplay)
        const nextDisplay = idx === cardIndex ? { ...normalized, ...nextPatch } : normalized
        if (idx !== cardIndex) {
          return {
            ...cardRecord,
            display: nextDisplay,
          }
        }

        const nextCard: Record<string, unknown> = {
          ...cardRecord,
          display: nextDisplay,
        }

        if (nextPatch.bestForMode === "list") {
          const existingBestForList = asStringArray(cardRecord.bestForList).filter((item) => item.trim().length > 0)
          const bestForText = asString(cardRecord.bestFor).trim()
          if (!existingBestForList.length && bestForText) {
            nextCard.bestForList = [bestForText]
          }
        }

        return {
          ...nextCard,
        }
      })
      return {
        ...c,
        cards: nextCards,
      }
    })
  }

  function getMergedCustomBlock(block: ComposerBlock): ComposerBlock {
    const customBlocks = asRecord(content.customBlocks)
    const override = asRecord(customBlocks[block.id])
    return {
      ...block,
      ...override,
    }
  }

  function setCustomBlockPatch(blockId: string, patch: Record<string, unknown>) {
    setContent((prev) => {
      const existingCustomBlocks = asRecord(prev.customBlocks)
      const current = asRecord(existingCustomBlocks[blockId])
      return {
        ...prev,
        customBlocks: {
          ...existingCustomBlocks,
          [blockId]: {
            ...current,
            ...patch,
          },
        },
      }
    })
  }

  function applyCustomBlockImageUrl(blockId: string, url: string) {
    setCustomBlockPatch(blockId, { imageUrl: url })
  }

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
        zIndex={1500}
        styles={{
          content: {
            top: `${ADMIN_SHELL_HEADER_HEIGHT_PX}px`,
            height: `calc(100dvh - ${ADMIN_SHELL_HEADER_HEIGHT_PX}px)`,
          },
          header: {
            position: "sticky",
            top: 0,
            zIndex: 2,
            backgroundColor: "var(--mantine-color-body)",
          },
        }}
        classNames={{
          content: "editor-drawer-content",
          body: "editor-drawer-body",
        }}
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

                <Menu withinPortal={false} position="bottom-end" shadow="md">
                  <Menu.Target>
                    <Button
                      size="xs"
                      variant="default"
                      rightSection={<IconChevronDown size={14} />}
                      disabled={loading}
                    >
                      Actions
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Actions</Menu.Label>
                    <Menu.Item
                      closeMenuOnClick
                      onClick={() => void onSaveDraft()}
                      disabled={!isDirty || loading}
                    >
                      Save draft
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      closeMenuOnClick
                      onClick={() => setDeleteDraftOpen(true)}
                      disabled={!activeDraft || loading}
                    >
                      Delete draft
                    </Menu.Item>
                    <Menu.Item
                      closeMenuOnClick
                      onClick={() => void onPublishDraft()}
                      disabled={!activeDraft || isDirty || loading}
                    >
                      Publish
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
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
                  <LinkMenuField
                    label="Primary CTA link"
                    value={ctaPrimaryHref}
                    onChange={setCtaPrimaryHref}
                    currentPageId={section?.page_id ?? ""}
                    pages={pages}
                    pagesLoading={pagesLoading}
                    anchorsByPageId={anchorsByPageId}
                    anchorsLoadingByPageId={anchorsLoadingByPageId}
                    ensurePagesLoaded={ensurePagesLoaded}
                    ensureAnchorsLoaded={ensureAnchorsLoaded}
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
                  <LinkMenuField
                    label="Secondary CTA link"
                    value={ctaSecondaryHref}
                    onChange={setCtaSecondaryHref}
                    currentPageId={section?.page_id ?? ""}
                    pages={pages}
                    pagesLoading={pagesLoading}
                    anchorsByPageId={anchorsByPageId}
                    anchorsLoadingByPageId={anchorsLoadingByPageId}
                    ensurePagesLoaded={ensurePagesLoaded}
                    ensureAnchorsLoaded={ensureAnchorsLoaded}
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
                  <MediaPickerMenu
                    label="Choose image"
                    withinPortal={false}
                    disabled={loading}
                    onUploadFile={onUploadBackground}
                    onChooseFromLibrary={() => setBackgroundLibraryOpen(true)}
                    onError={setError}
                  />
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
                  label="Content spacing (inner)"
                  comboboxProps={{ withinPortal: false }}
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
                  comboboxProps={{ withinPortal: false }}
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
                  comboboxProps={{ withinPortal: false }}
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
                {type === "hero_cta" ? (
                  <>
                    <Select
                      label="Hero width mode"
                      comboboxProps={{ withinPortal: false }}
                      data={[
                        { value: "content", label: "Contained" },
                        { value: "full", label: "Full-bleed" },
                      ]}
                      value={formatting.widthMode}
                      onChange={(v) =>
                        setFormatting((s) => ({
                          ...s,
                          widthMode: v === "full" ? "full" : "content",
                        }))
                      }
                    />
                    <Select
                      label="Hero min height"
                      comboboxProps={{ withinPortal: false }}
                      data={[
                        { value: "auto", label: "Auto" },
                        { value: "70svh", label: "70% viewport" },
                        { value: "100svh", label: "100% viewport" },
                      ]}
                      value={formatting.heroMinHeight}
                      onChange={(v) =>
                        setFormatting((s) => ({
                          ...s,
                          heroMinHeight: v === "70svh" || v === "100svh" ? v : "auto",
                        }))
                      }
                    />
                  </>
                ) : null}
                <Select
                  label="Section shadow"
                  comboboxProps={{ withinPortal: false }}
                  data={[
                    { value: "inherit", label: "Inherit site setting" },
                    { value: "on", label: "On" },
                    { value: "off", label: "Off" },
                  ]}
                  value={formatting.shadowMode}
                  onChange={(v) =>
                    setFormatting((s) => ({
                      ...s,
                      shadowMode:
                        v === "on" || v === "off" ? v : "inherit",
                    }))
                  }
                />
                <Select
                  label="Inner bevel/glow"
                  comboboxProps={{ withinPortal: false }}
                  data={[
                    { value: "inherit", label: "Inherit site setting" },
                    { value: "on", label: "On" },
                    { value: "off", label: "Off" },
                  ]}
                  value={formatting.innerShadowMode}
                  onChange={(v) =>
                    setFormatting((s) => ({
                      ...s,
                      innerShadowMode: v === "on" || v === "off" ? v : "inherit",
                    }))
                  }
                />
                <Select
                  label="Section spacing (outer)"
                  comboboxProps={{ withinPortal: false }}
                  data={[
                    { value: "", label: "(default)" },
                    { value: "my-2", label: "my-2" },
                    { value: "my-4", label: "my-4" },
                    { value: "my-6", label: "my-6" },
                    { value: "my-8", label: "my-8" },
                    { value: "my-10", label: "my-10" },
                    { value: "my-12", label: "my-12" },
                  ]}
                  value={formatting.outerSpacing}
                  onChange={(v) =>
                    setFormatting((s) => ({
                      ...s,
                      outerSpacing: ((v ?? "") as FormattingState["outerSpacing"]) || "",
                    }))
                  }
                />
              </SimpleGrid>

              <Slider
                label={(v) => `Inner bevel/glow strength ${v.toFixed(2)}x`}
                min={0}
                max={1.8}
                step={0.05}
                value={formatting.innerShadowStrength}
                onChange={(v) =>
                  setFormatting((s) => ({
                    ...s,
                    innerShadowStrength: Math.min(1.8, Math.max(0, v)),
                  }))
                }
              />

              <Textarea
                label="containerClass (whitelisted Tailwind tokens)"
                value={formatting.containerClass}
                onChange={(e) => {
                  const nextValue = inputValueFromEvent(e)
                  setFormatting((s) => ({ ...s, containerClass: nextValue }))
                }}
                autosize
                minRows={2}
              />
              <Textarea
                label="sectionClass (whitelisted Tailwind tokens)"
                value={formatting.sectionClass}
                onChange={(e) => {
                  const nextValue = inputValueFromEvent(e)
                  setFormatting((s) => ({ ...s, sectionClass: nextValue }))
                }}
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
                    comboboxProps={{ withinPortal: false }}
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
                    onChange={(e) => {
                      const nextValue = inputValueFromEvent(e)
                      setFormatting((s) =>
                        s.mobile
                          ? {
                              ...s,
                              mobile: {
                                ...s.mobile,
                                containerClass: nextValue,
                              },
                            }
                          : s
                      )
                    }}
                    autosize
                    minRows={2}
                  />
                  <Textarea
                    label="Mobile sectionClass"
                    value={formatting.mobile.sectionClass}
                    onChange={(e) => {
                      const nextValue = inputValueFromEvent(e)
                      setFormatting((s) =>
                        s.mobile
                          ? {
                              ...s,
                              mobile: {
                                ...s.mobile,
                                sectionClass: nextValue,
                              },
                            }
                          : s
                      )
                    }}
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
                    onChange={(e) => {
                      const nextValue = inputValueFromEvent(e)
                      setContent((c) => ({ ...c, trustLine: nextValue }))
                    }}
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
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconPlus size={14} />}
                        onClick={() =>
                          setContent((c) => ({
                            ...c,
                            cards: [
                              ...whatCards,
                              {
                                title: "",
                                text: "",
                                textRichText: emptyRichTextDoc(),
                                image: { url: "", alt: "", widthPx: DEFAULT_CARD_IMAGE_WIDTH },
                                display: toCardDisplay(undefined),
                                youGet: [],
                                bestFor: "",
                                bestForList: [],
                              },
                            ],
                          }))
                        }
                      >
                        Add card
                      </Button>
                    </Group>
                  </Group>
                  <Stack gap="xs">
                    {whatCards.map((card, idx) => {
                      const r = asRecord(card)
                      const cardDisplay = toCardDisplay(r.display ?? content.cardDisplay)
                      const youGet = asStringArray(r.youGet)
                      const bestFor = asString(r.bestFor)
                      const bestForList = asStringArray(r.bestForList)
                      const cardImage = asRecord(r.image)
                      const cardImageUrl = asString(cardImage.url)
                      const cardImageWidthRaw = Number(cardImage.widthPx)
                      const cardImageWidth = Number.isFinite(cardImageWidthRaw)
                        ? Math.min(420, Math.max(80, Math.round(cardImageWidthRaw)))
                        : DEFAULT_CARD_IMAGE_WIDTH
                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                Card {idx + 1}
                              </Badge>
                              <Group gap="xs">
                                <Popover withinPortal={false} position="bottom-end" width={220} shadow="md">
                                  <Popover.Target>
                                    <Button
                                      size="xs"
                                      variant="default"
                                      leftSection={<IconAdjustmentsHorizontal size={14} />}
                                    >
                                      Fields
                                    </Button>
                                  </Popover.Target>
                                  <Popover.Dropdown>
                                    <Stack gap={8}>
                                      <Checkbox
                                        label="Title"
                                        checked={cardDisplay.showTitle}
                                        onChange={(e) =>
                                          setCardDisplayForCard(idx, { showTitle: e.currentTarget.checked })
                                        }
                                      />
                                      <Checkbox
                                        label="Text"
                                        checked={cardDisplay.showText}
                                        onChange={(e) =>
                                          setCardDisplayForCard(idx, { showText: e.currentTarget.checked })
                                        }
                                      />
                                      <Checkbox
                                        label="Image"
                                        checked={cardDisplay.showImage}
                                        onChange={(e) =>
                                          setCardDisplayForCard(idx, { showImage: e.currentTarget.checked })
                                        }
                                      />
                                      <Checkbox
                                        label="You get"
                                        checked={cardDisplay.showYouGet}
                                        onChange={(e) =>
                                          setCardDisplayForCard(idx, { showYouGet: e.currentTarget.checked })
                                        }
                                      />
                                      <Checkbox
                                        label="Best for"
                                        checked={cardDisplay.showBestFor}
                                        onChange={(e) =>
                                          setCardDisplayForCard(idx, { showBestFor: e.currentTarget.checked })
                                        }
                                      />
                                    </Stack>
                                  </Popover.Dropdown>
                                </Popover>
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
                            </Group>
                            {cardDisplay.showTitle ? (
                              <TextInput
                                label="Title"
                                value={asString(r.title)}
                                onChange={(e) => {
                                  const next = whatCards.slice()
                                  next[idx] = { ...r, title: e.currentTarget.value }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                              />
                            ) : null}
                            {cardDisplay.showText ? (
                              <TipTapJsonEditor
                                label="Text"
                                value={richTextWithFallback(r.textRichText, r.text)}
                                onChange={(nextJson) => {
                                  const next = whatCards.slice()
                                  next[idx] = { ...r, textRichText: nextJson }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                                onError={setError}
                              />
                            ) : null}
                            {cardDisplay.showImage ? (
                              <ImageFieldPicker
                                title="Card image"
                                value={cardImageUrl}
                                urlLabel="Image URL"
                                onChange={(nextUrl) => applyCardImageUrl(idx, nextUrl)}
                                onRemove={() => applyCardImageUrl(idx, "")}
                                onUploadFile={async (file) => {
                                  const { publicUrl } = await uploadToCmsMedia(file)
                                  applyCardImageUrl(idx, publicUrl)
                                }}
                                onChooseFromLibrary={() => setCardImageLibraryTarget(idx)}
                                disabled={loading}
                                onError={setError}
                                withinPortal={false}
                                compact
                                advancedUrl
                                previewHeight={132}
                              >
                                <Stack gap={4}>
                                  <Group justify="space-between">
                                    <Text size="sm">Width</Text>
                                    <Text size="sm" c="dimmed">
                                      {cardImageWidth}px
                                    </Text>
                                  </Group>
                                  <Slider
                                    min={80}
                                    max={420}
                                    step={1}
                                    value={cardImageWidth}
                                    onChange={(nextWidth) => applyCardImageWidth(idx, nextWidth)}
                                  />
                                </Stack>
                              </ImageFieldPicker>
                            ) : null}
                            {cardDisplay.showYouGet ? (
                              <Stack gap="xs">
                                <Group justify="space-between" align="center" wrap="nowrap">
                                  <Text size="sm" fw={500}>
                                    You get
                                  </Text>
                                  <SegmentedControl
                                    size="xs"
                                    value={cardDisplay.youGetMode}
                                    data={[
                                      { label: "Block", value: "block" },
                                      { label: "List", value: "list" },
                                    ]}
                                    onChange={(nextMode) =>
                                      setCardDisplayForCard(idx, {
                                        youGetMode: nextMode === "list" ? "list" : "block",
                                      })
                                    }
                                  />
                                </Group>
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
                              </Stack>
                            ) : null}
                            {cardDisplay.showBestFor ? (
                              <Stack gap="xs">
                                <Group justify="space-between" align="center" wrap="nowrap">
                                  <Text size="sm" fw={500}>
                                    Best for
                                  </Text>
                                  <SegmentedControl
                                    size="xs"
                                    value={cardDisplay.bestForMode}
                                    data={[
                                      { label: "Block", value: "block" },
                                      { label: "List", value: "list" },
                                    ]}
                                    onChange={(nextMode) =>
                                      setCardDisplayForCard(idx, {
                                        bestForMode: nextMode === "list" ? "list" : "block",
                                      })
                                    }
                                  />
                                </Group>
                                {cardDisplay.bestForMode === "list" ? (
                                  <ListEditor
                                    label="Best for (list)"
                                    items={bestForList}
                                    onChange={(nextList) => {
                                      const next = whatCards.slice()
                                      next[idx] = { ...r, bestForList: nextList }
                                      setContent((c) => ({ ...c, cards: next }))
                                    }}
                                    placeholder="teams with repetitive manual workflows"
                                  />
                                ) : (
                                  <TextInput
                                    label="Best for"
                                    value={bestFor}
                                    onChange={(e) => {
                                      const next = whatCards.slice()
                                      next[idx] = { ...r, bestFor: e.currentTarget.value }
                                      setContent((c) => ({ ...c, cards: next }))
                                    }}
                                  />
                                )}
                              </Stack>
                            ) : null}
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
                          steps: [...howSteps, { title: "", body: "", bodyRichText: emptyRichTextDoc() }],
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
                            <TipTapJsonEditor
                              label="Body"
                              value={richTextWithFallback(r.bodyRichText, r.body)}
                              onChange={(nextJson) => {
                                const next = howSteps.slice()
                                next[idx] = { ...r, bodyRichText: nextJson }
                                setContent((c) => ({ ...c, steps: next }))
                              }}
                              onError={setError}
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
                          items: [...workflowItems, { title: "", body: "", bodyRichText: emptyRichTextDoc() }],
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
                            <TipTapJsonEditor
                              label="Body"
                              value={richTextWithFallback(r.bodyRichText, r.body)}
                              onChange={(nextJson) => {
                                const next = workflowItems.slice()
                                next[idx] = { ...r, bodyRichText: nextJson }
                                setContent((c) => ({ ...c, items: next }))
                              }}
                              onError={setError}
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
                  onError={setError}
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
                              onError={setError}
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {type === "cta_block" ? (
                <TipTapJsonEditor
                  label="Body"
                  value={richTextWithFallback(content.bodyRichText, content.body)}
                  onChange={(next) => setContent((c) => ({ ...c, bodyRichText: next }))}
                  onError={setError}
                />
              ) : null}

              {type === "footer_grid" ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Footer cards (1-2)
                    </Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      disabled={footerCards.length >= 2}
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          cards: [
                            ...footerCards,
                            {
                              title: "",
                              body: "",
                              linksMode: "flat",
                              links: [{ label: "New link", href: "#" }],
                              groups: [],
                              subscribe: { enabled: false, placeholder: "Email Address", buttonLabel: "Subscribe" },
                              ctaPrimary: { label: "", href: "" },
                              ctaSecondary: { label: "", href: "" },
                            },
                          ],
                        }))
                      }
                    >
                      Add card
                    </Button>
                  </Group>

                  <Stack gap="xs">
                    {footerCards.map((card, idx) => {
                      const r = asRecord(card)
                      const cardTitle = asString(r.title)
                      const linksMode = asString(r.linksMode) === "grouped" ? "grouped" : "flat"
                      const flatLinks = asArray<Record<string, unknown>>(r.links)
                      const groups = asArray<Record<string, unknown>>(r.groups)
                      const subscribe = asRecord(r.subscribe)
                      const ctaPrimary = asRecord(r.ctaPrimary)
                      const ctaSecondary = asRecord(r.ctaSecondary)

                      return (
                        <Paper key={idx} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Badge size="sm" variant="default">
                                {cardTitle.trim() || "Footer"}
                              </Badge>
                              <ActionIcon
                                variant="default"
                                aria-label="Remove card"
                                disabled={footerCards.length <= 1}
                                onClick={() =>
                                  setContent((c) => ({
                                    ...c,
                                    cards: footerCards.filter((_, i) => i !== idx),
                                  }))
                                }
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>

                            <TextInput
                              label="Card title (optional)"
                              value={cardTitle}
                              onChange={(e) => {
                                const next = footerCards.slice()
                                next[idx] = { ...r, title: e.currentTarget.value }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                            />

                            <Textarea
                              label="Body"
                              value={asString(r.body)}
                              onChange={(e) => {
                                const next = footerCards.slice()
                                next[idx] = { ...r, body: e.currentTarget.value }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                              autosize
                              minRows={2}
                            />

                            <SegmentedControl
                              size="xs"
                              value={linksMode}
                              data={[
                                { label: "Flat links", value: "flat" },
                                { label: "Grouped links", value: "grouped" },
                              ]}
                              onChange={(mode) => {
                                const next = footerCards.slice()
                                next[idx] = { ...r, linksMode: mode === "grouped" ? "grouped" : "flat" }
                                setContent((c) => ({ ...c, cards: next }))
                              }}
                            />

                            {linksMode === "flat" ? (
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text size="sm" fw={500}>Links</Text>
                                  <Button
                                    size="xs"
                                    variant="default"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={() => {
                                      const next = footerCards.slice()
                                      next[idx] = { ...r, links: [...flatLinks, { label: "", href: "" }] }
                                      setContent((c) => ({ ...c, cards: next }))
                                    }}
                                  >
                                    Add link
                                  </Button>
                                </Group>
                                {flatLinks.map((lnk, linkIdx) => {
                                  const link = asRecord(lnk)
                                  return (
                                    <Paper key={linkIdx} withBorder p="xs" radius="md">
                                      <Group grow align="end">
                                        <TextInput
                                          label="Label"
                                          value={asString(link.label)}
                                          onChange={(e) => {
                                            const nextLinks = flatLinks.slice()
                                            nextLinks[linkIdx] = { ...link, label: e.currentTarget.value }
                                            const nextCards = footerCards.slice()
                                            nextCards[idx] = { ...r, links: nextLinks }
                                            setContent((c) => ({ ...c, cards: nextCards }))
                                          }}
                                        />
                                        <LinkMenuField
                                          label="Link"
                                          value={asString(link.href)}
                                          onChange={(nextHref) => {
                                            const nextLinks = flatLinks.slice()
                                            nextLinks[linkIdx] = { ...link, href: nextHref }
                                            const nextCards = footerCards.slice()
                                            nextCards[idx] = { ...r, links: nextLinks }
                                            setContent((c) => ({ ...c, cards: nextCards }))
                                          }}
                                          currentPageId={section?.page_id ?? ""}
                                          pages={pages}
                                          pagesLoading={pagesLoading}
                                          anchorsByPageId={anchorsByPageId}
                                          anchorsLoadingByPageId={anchorsLoadingByPageId}
                                          ensurePagesLoaded={ensurePagesLoaded}
                                          ensureAnchorsLoaded={ensureAnchorsLoaded}
                                        />
                                        <ActionIcon
                                          variant="default"
                                          aria-label="Remove link"
                                          onClick={() => {
                                            const nextLinks = flatLinks.filter((_, i) => i !== linkIdx)
                                            const nextCards = footerCards.slice()
                                            nextCards[idx] = { ...r, links: nextLinks }
                                            setContent((c) => ({ ...c, cards: nextCards }))
                                          }}
                                        >
                                          <IconX size={16} />
                                        </ActionIcon>
                                      </Group>
                                    </Paper>
                                  )
                                })}
                              </Stack>
                            ) : (
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text size="sm" fw={500}>Link groups</Text>
                                  <Button
                                    size="xs"
                                    variant="default"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={() => {
                                      const next = footerCards.slice()
                                      next[idx] = { ...r, groups: [...groups, { title: "", links: [{ label: "", href: "" }] }] }
                                      setContent((c) => ({ ...c, cards: next }))
                                    }}
                                  >
                                    Add group
                                  </Button>
                                </Group>

                                {groups.map((grp, groupIdx) => {
                                  const group = asRecord(grp)
                                  const groupLinks = asArray<Record<string, unknown>>(group.links)
                                  return (
                                    <Paper key={groupIdx} withBorder p="xs" radius="md">
                                      <Stack gap="xs">
                                        <Group justify="space-between">
                                          <TextInput
                                            label="Group title"
                                            value={asString(group.title)}
                                            onChange={(e) => {
                                              const nextGroups = groups.slice()
                                              nextGroups[groupIdx] = { ...group, title: e.currentTarget.value }
                                              const nextCards = footerCards.slice()
                                              nextCards[idx] = { ...r, groups: nextGroups }
                                              setContent((c) => ({ ...c, cards: nextCards }))
                                            }}
                                          />
                                          <ActionIcon
                                            variant="default"
                                            aria-label="Remove group"
                                            onClick={() => {
                                              const nextGroups = groups.filter((_, i) => i !== groupIdx)
                                              const nextCards = footerCards.slice()
                                              nextCards[idx] = { ...r, groups: nextGroups }
                                              setContent((c) => ({ ...c, cards: nextCards }))
                                            }}
                                          >
                                            <IconX size={16} />
                                          </ActionIcon>
                                        </Group>

                                        <Button
                                          size="xs"
                                          variant="default"
                                          leftSection={<IconPlus size={14} />}
                                          onClick={() => {
                                            const nextLinks = [...groupLinks, { label: "", href: "" }]
                                            const nextGroups = groups.slice()
                                            nextGroups[groupIdx] = { ...group, links: nextLinks }
                                            const nextCards = footerCards.slice()
                                            nextCards[idx] = { ...r, groups: nextGroups }
                                            setContent((c) => ({ ...c, cards: nextCards }))
                                          }}
                                        >
                                          Add group link
                                        </Button>

                                        {groupLinks.map((lnk, linkIdx) => {
                                          const link = asRecord(lnk)
                                          return (
                                            <Group key={linkIdx} grow align="end">
                                              <TextInput
                                                label="Label"
                                                value={asString(link.label)}
                                                onChange={(e) => {
                                                  const nextLinks = groupLinks.slice()
                                                  nextLinks[linkIdx] = { ...link, label: e.currentTarget.value }
                                                  const nextGroups = groups.slice()
                                                  nextGroups[groupIdx] = { ...group, links: nextLinks }
                                                  const nextCards = footerCards.slice()
                                                  nextCards[idx] = { ...r, groups: nextGroups }
                                                  setContent((c) => ({ ...c, cards: nextCards }))
                                                }}
                                              />
                                              <LinkMenuField
                                                label="Link"
                                                value={asString(link.href)}
                                                onChange={(nextHref) => {
                                                  const nextLinks = groupLinks.slice()
                                                  nextLinks[linkIdx] = { ...link, href: nextHref }
                                                  const nextGroups = groups.slice()
                                                  nextGroups[groupIdx] = { ...group, links: nextLinks }
                                                  const nextCards = footerCards.slice()
                                                  nextCards[idx] = { ...r, groups: nextGroups }
                                                  setContent((c) => ({ ...c, cards: nextCards }))
                                                }}
                                                currentPageId={section?.page_id ?? ""}
                                                pages={pages}
                                                pagesLoading={pagesLoading}
                                                anchorsByPageId={anchorsByPageId}
                                                anchorsLoadingByPageId={anchorsLoadingByPageId}
                                                ensurePagesLoaded={ensurePagesLoaded}
                                                ensureAnchorsLoaded={ensureAnchorsLoaded}
                                              />
                                              <ActionIcon
                                                variant="default"
                                                aria-label="Remove group link"
                                                onClick={() => {
                                                  const nextLinks = groupLinks.filter((_, i) => i !== linkIdx)
                                                  const nextGroups = groups.slice()
                                                  nextGroups[groupIdx] = { ...group, links: nextLinks }
                                                  const nextCards = footerCards.slice()
                                                  nextCards[idx] = { ...r, groups: nextGroups }
                                                  setContent((c) => ({ ...c, cards: nextCards }))
                                                }}
                                              >
                                                <IconX size={16} />
                                              </ActionIcon>
                                            </Group>
                                          )
                                        })}
                                      </Stack>
                                    </Paper>
                                  )
                                })}
                              </Stack>
                            )}

                            <Group align="center" gap="xs">
                              <Checkbox
                                label="Show subscribe input"
                                checked={subscribe.enabled === true}
                                onChange={(e) => {
                                  const next = footerCards.slice()
                                  next[idx] = {
                                    ...r,
                                    subscribe: {
                                      ...subscribe,
                                      enabled: e.currentTarget.checked,
                                      placeholder: asString(subscribe.placeholder) || "Email Address",
                                      buttonLabel: asString(subscribe.buttonLabel) || "Subscribe",
                                    },
                                  }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                              />
                            </Group>

                            {subscribe.enabled === true ? (
                              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <TextInput
                                  label="Subscribe placeholder"
                                  value={asString(subscribe.placeholder)}
                                  onChange={(e) => {
                                    const next = footerCards.slice()
                                    next[idx] = { ...r, subscribe: { ...subscribe, placeholder: e.currentTarget.value } }
                                    setContent((c) => ({ ...c, cards: next }))
                                  }}
                                />
                                <TextInput
                                  label="Subscribe button label"
                                  value={asString(subscribe.buttonLabel)}
                                  onChange={(e) => {
                                    const next = footerCards.slice()
                                    next[idx] = { ...r, subscribe: { ...subscribe, buttonLabel: e.currentTarget.value } }
                                    setContent((c) => ({ ...c, cards: next }))
                                  }}
                                />
                              </SimpleGrid>
                            ) : null}

                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                              <TextInput
                                label="CTA 1 label"
                                value={asString(ctaPrimary.label)}
                                onChange={(e) => {
                                  const next = footerCards.slice()
                                  next[idx] = { ...r, ctaPrimary: { ...ctaPrimary, label: e.currentTarget.value } }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                              />
                              <LinkMenuField
                                label="CTA 1 link"
                                value={asString(ctaPrimary.href)}
                                onChange={(nextHref) => {
                                  const next = footerCards.slice()
                                  next[idx] = { ...r, ctaPrimary: { ...ctaPrimary, href: nextHref } }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                                currentPageId={section?.page_id ?? ""}
                                pages={pages}
                                pagesLoading={pagesLoading}
                                anchorsByPageId={anchorsByPageId}
                                anchorsLoadingByPageId={anchorsLoadingByPageId}
                                ensurePagesLoaded={ensurePagesLoaded}
                                ensureAnchorsLoaded={ensureAnchorsLoaded}
                              />
                              <TextInput
                                label="CTA 2 label"
                                value={asString(ctaSecondary.label)}
                                onChange={(e) => {
                                  const next = footerCards.slice()
                                  next[idx] = { ...r, ctaSecondary: { ...ctaSecondary, label: e.currentTarget.value } }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                              />
                              <LinkMenuField
                                label="CTA 2 link"
                                value={asString(ctaSecondary.href)}
                                onChange={(nextHref) => {
                                  const next = footerCards.slice()
                                  next[idx] = { ...r, ctaSecondary: { ...ctaSecondary, href: nextHref } }
                                  setContent((c) => ({ ...c, cards: next }))
                                }}
                                currentPageId={section?.page_id ?? ""}
                                pages={pages}
                                pagesLoading={pagesLoading}
                                anchorsByPageId={anchorsByPageId}
                                anchorsLoadingByPageId={anchorsLoadingByPageId}
                                ensurePagesLoaded={ensurePagesLoaded}
                                ensureAnchorsLoaded={ensureAnchorsLoaded}
                              />
                            </SimpleGrid>
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>

                  <Divider />

                  <TextInput
                    label="Brand watermark text"
                    value={footerBrandText}
                    onChange={(e) => {
                      const nextValue = inputValueFromEvent(e)
                      setContent((c) => ({ ...c, brandText: nextValue }))
                    }}
                    placeholder="YourBrand"
                  />

                  <TextInput
                    label="Copyright"
                    value={asString(footerLegal.copyright)}
                    onChange={(e) => {
                      const nextLegal = { ...footerLegal, copyright: e.currentTarget.value }
                      setContent((c) => ({ ...c, legal: nextLegal }))
                    }}
                    placeholder="© 2026 Your Company"
                  />

                  <Group justify="space-between">
                    <Text size="sm" fw={600}>Legal links</Text>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => {
                        const nextLegal = { ...footerLegal, links: [...footerLegalLinks, { label: "", href: "" }] }
                        setContent((c) => ({ ...c, legal: nextLegal }))
                      }}
                    >
                      Add legal link
                    </Button>
                  </Group>

                  <Stack gap="xs">
                    {footerLegalLinks.map((lnk, idx) => {
                      const r = asRecord(lnk)
                      return (
                        <Group key={idx} grow align="end">
                          <TextInput
                            label="Label"
                            value={asString(r.label)}
                            onChange={(e) => {
                              const nextLinks = footerLegalLinks.slice()
                              nextLinks[idx] = { ...r, label: e.currentTarget.value }
                              const nextLegal = { ...footerLegal, links: nextLinks }
                              setContent((c) => ({ ...c, legal: nextLegal }))
                            }}
                          />
                          <LinkMenuField
                            label="Link"
                            value={asString(r.href)}
                            onChange={(nextHref) => {
                              const nextLinks = footerLegalLinks.slice()
                              nextLinks[idx] = { ...r, href: nextHref }
                              const nextLegal = { ...footerLegal, links: nextLinks }
                              setContent((c) => ({ ...c, legal: nextLegal }))
                            }}
                            currentPageId={section?.page_id ?? ""}
                            pages={pages}
                            pagesLoading={pagesLoading}
                            anchorsByPageId={anchorsByPageId}
                            anchorsLoadingByPageId={anchorsLoadingByPageId}
                            ensurePagesLoaded={ensurePagesLoaded}
                            ensureAnchorsLoaded={ensureAnchorsLoaded}
                          />
                          <ActionIcon
                            variant="default"
                            aria-label="Remove legal link"
                            onClick={() => {
                              const nextLinks = footerLegalLinks.filter((_, i) => i !== idx)
                              const nextLegal = { ...footerLegal, links: nextLinks }
                              setContent((c) => ({ ...c, legal: nextLegal }))
                            }}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {type === "nav_links" ? (
                <Stack gap="sm">
                  <ImageFieldPicker
                    title="Logo"
                    value={navLogoUrl}
                    urlLabel="Logo URL"
                    placeholder="https://.../logo.png"
                    onChange={applyNavLogoUrl}
                    onRemove={() =>
                      setContent((c) => {
                        const existing = asRecord(c.logo)
                        return {
                          ...c,
                          logo: {
                            ...existing,
                            url: "",
                          },
                        }
                      })
                    }
                    onUploadFile={async (file) => {
                      const { publicUrl } = await uploadToCmsMedia(file)
                      applyNavLogoUrl(publicUrl)
                    }}
                    onChooseFromLibrary={() => setNavLogoLibraryOpen(true)}
                    disabled={loading}
                    onError={setError}
                    withinPortal={false}
                  >
                    <TextInput
                      label="Alt text"
                      value={navLogoAlt}
                      onChange={(e) => {
                        const nextValue = inputValueFromEvent(e)
                        setContent((c) => {
                          const existing = asRecord(c.logo)
                          return {
                            ...c,
                            logo: {
                              ...existing,
                              alt: nextValue,
                            },
                          }
                        })
                      }}
                      placeholder="Site logo"
                    />

                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="sm">Width</Text>
                        <Text size="sm" c="dimmed">
                          {navLogoWidth}px
                        </Text>
                      </Group>
                      <Slider
                        min={60}
                        max={320}
                        step={1}
                        value={navLogoWidth}
                        onChange={(nextWidth) =>
                          setContent((c) => {
                            const existing = asRecord(c.logo)
                            return {
                              ...c,
                              logo: {
                                ...existing,
                                widthPx: nextWidth,
                              },
                            }
                          })
                        }
                      />
                    </Stack>
                  </ImageFieldPicker>

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
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                              <TextInput
                                label="Label"
                                value={asString(r.label)}
                                onChange={(e) => {
                                  const next = navLinks.slice()
                                  next[idx] = { ...r, label: e.currentTarget.value }
                                  setContent((c) => ({ ...c, links: next }))
                                }}
                              />
                              <LinkMenuField
                                label="Link"
                                value={asString(r.href)}
                                onChange={(nextHref) => {
                                  const next = navLinks.slice()
                                  next[idx] = { ...r, href: nextHref }
                                  setContent((c) => ({ ...c, links: next }))
                                }}
                                currentPageId={section?.page_id ?? ""}
                                pages={pages}
                                pagesLoading={pagesLoading}
                                anchorsByPageId={anchorsByPageId}
                                anchorsLoadingByPageId={anchorsLoadingByPageId}
                                ensurePagesLoaded={ensurePagesLoaded}
                                ensureAnchorsLoaded={ensureAnchorsLoaded}
                              />
                            </SimpleGrid>
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}

              {isCustomComposedType ? (
                <Stack gap="sm">
                  {flattenedCustomBlocks.length ? (
                    flattenedCustomBlocks.map(({ rowIndex, columnIndex, block }) => {
                      const merged = getMergedCustomBlock(block)
                      const listStyle = asString(merged.listStyle) === "basic" ? "basic" : "steps"
                      const listItems = asStringArray(merged.items)
                      const listSteps = asArray<Record<string, unknown>>(merged.steps)
                      const cards = asArray<Record<string, unknown>>(merged.cards)
                      const faqs = asArray<Record<string, unknown>>(merged.faqs)
                      const imageUrl = asString(merged.imageUrl)

                      return (
                        <Paper key={`custom-${block.id}`} withBorder p="sm" radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between" align="center">
                              <Group gap="xs">
                                <Badge size="xs" variant="default">Row {rowIndex + 1}</Badge>
                                <Badge size="xs" variant="default">Column {columnIndex + 1}</Badge>
                              </Group>
                              <Badge size="sm" color="violet" variant="light">
                                {block.type.replaceAll("_", " ")}
                              </Badge>
                            </Group>

                            {block.type === "heading" ? (
                              <TextInput
                                label="Heading"
                                value={asString(merged.title)}
                                onChange={(e) => setCustomBlockPatch(block.id, { title: e.currentTarget.value })}
                              />
                            ) : null}

                            {block.type === "subtitle" ? (
                              <Textarea
                                label="Subtitle"
                                value={asString(merged.body)}
                                onChange={(e) => setCustomBlockPatch(block.id, { body: inputValueFromEvent(e) })}
                                autosize
                                minRows={2}
                              />
                            ) : null}

                            {block.type === "rich_text" ? (
                              <TipTapJsonEditor
                                label="Body"
                                value={richTextWithFallback((merged as Record<string, unknown>).bodyRichText, merged.body)}
                                onChange={(nextJson) =>
                                  setCustomBlockPatch(block.id, {
                                    bodyRichText: nextJson,
                                    body: richTextDocToPlainText(nextJson),
                                  })
                                }
                                onError={setError}
                              />
                            ) : null}

                            {block.type === "image" ? (
                              <ImageFieldPicker
                                title="Image"
                                value={imageUrl}
                                urlLabel="Image URL"
                                onChange={(nextUrl) => applyCustomBlockImageUrl(block.id, nextUrl)}
                                onRemove={() => applyCustomBlockImageUrl(block.id, "")}
                                onUploadFile={async (file) => {
                                  const { publicUrl } = await uploadToCmsMedia(file)
                                  applyCustomBlockImageUrl(block.id, publicUrl)
                                }}
                                onChooseFromLibrary={() => setCustomImageLibraryTargetId(block.id)}
                                disabled={loading}
                                onError={setError}
                                withinPortal={false}
                                compact
                                advancedUrl
                              >
                                <TextInput
                                  label="Alt text"
                                  value={asString(merged.title)}
                                  onChange={(e) => setCustomBlockPatch(block.id, { title: e.currentTarget.value })}
                                />
                              </ImageFieldPicker>
                            ) : null}

                            {block.type === "cards" ? (
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text size="sm" fw={600}>Cards</Text>
                                  <Button
                                    size="xs"
                                    variant="default"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={() =>
                                      setCustomBlockPatch(block.id, {
                                        cards: [...cards, { title: "", body: "" }],
                                      })
                                    }
                                  >
                                    Add card
                                  </Button>
                                </Group>
                                {cards.map((card, cardIndex) => {
                                  const cardRecord = asRecord(card)
                                  return (
                                    <Paper key={`${block.id}-card-${cardIndex}`} withBorder p="sm" radius="md">
                                      <Stack gap="xs">
                                        <Group justify="space-between">
                                          <Badge size="sm" variant="default">Card {cardIndex + 1}</Badge>
                                          <ActionIcon
                                            variant="default"
                                            aria-label="Remove card"
                                            onClick={() =>
                                              setCustomBlockPatch(block.id, {
                                                cards: cards.filter((_, i) => i !== cardIndex),
                                              })
                                            }
                                          >
                                            <IconX size={16} />
                                          </ActionIcon>
                                        </Group>
                                        <TextInput
                                          label="Title"
                                          value={asString(cardRecord.title)}
                                          onChange={(e) => {
                                            const next = cards.slice()
                                            next[cardIndex] = { ...cardRecord, title: e.currentTarget.value }
                                            setCustomBlockPatch(block.id, { cards: next })
                                          }}
                                        />
                                        <Textarea
                                          label="Body"
                                          value={asString(cardRecord.body)}
                                          onChange={(e) => {
                                            const next = cards.slice()
                                            next[cardIndex] = { ...cardRecord, body: inputValueFromEvent(e) }
                                            setCustomBlockPatch(block.id, { cards: next })
                                          }}
                                          autosize
                                          minRows={2}
                                        />
                                      </Stack>
                                    </Paper>
                                  )
                                })}
                                {!cards.length ? <Text c="dimmed" size="sm">No cards.</Text> : null}
                              </Stack>
                            ) : null}

                            {block.type === "faq" ? (
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text size="sm" fw={600}>FAQ</Text>
                                  <Button
                                    size="xs"
                                    variant="default"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={() =>
                                      setCustomBlockPatch(block.id, {
                                        faqs: [...faqs, { q: "", a: "" }],
                                      })
                                    }
                                  >
                                    Add FAQ
                                  </Button>
                                </Group>
                                {faqs.map((faq, faqIndex) => {
                                  const faqRecord = asRecord(faq)
                                  return (
                                    <Paper key={`${block.id}-faq-${faqIndex}`} withBorder p="sm" radius="md">
                                      <Stack gap="xs">
                                        <Group justify="space-between">
                                          <Badge size="sm" variant="default">FAQ {faqIndex + 1}</Badge>
                                          <ActionIcon
                                            variant="default"
                                            aria-label="Remove FAQ"
                                            onClick={() =>
                                              setCustomBlockPatch(block.id, {
                                                faqs: faqs.filter((_, i) => i !== faqIndex),
                                              })
                                            }
                                          >
                                            <IconX size={16} />
                                          </ActionIcon>
                                        </Group>
                                        <TextInput
                                          label="Question"
                                          value={asString(faqRecord.q)}
                                          onChange={(e) => {
                                            const next = faqs.slice()
                                            next[faqIndex] = { ...faqRecord, q: e.currentTarget.value }
                                            setCustomBlockPatch(block.id, { faqs: next })
                                          }}
                                        />
                                        <TipTapJsonEditor
                                          label="Answer"
                                          value={richTextWithFallback((faqRecord as Record<string, unknown>).aRichText, faqRecord.a)}
                                          onChange={(nextJson) => {
                                            const next = faqs.slice()
                                            next[faqIndex] = {
                                              ...faqRecord,
                                              aRichText: nextJson,
                                              a: richTextDocToPlainText(nextJson),
                                            }
                                            setCustomBlockPatch(block.id, { faqs: next })
                                          }}
                                          onError={setError}
                                        />
                                      </Stack>
                                    </Paper>
                                  )
                                })}
                                {!faqs.length ? <Text c="dimmed" size="sm">No FAQs.</Text> : null}
                              </Stack>
                            ) : null}

                            {block.type === "list" ? (
                              <Stack gap="xs">
                                <SegmentedControl
                                  size="xs"
                                  value={listStyle}
                                  data={[
                                    { label: "Steps", value: "steps" },
                                    { label: "Basic list", value: "basic" },
                                  ]}
                                  onChange={(nextStyle) => setCustomBlockPatch(block.id, { listStyle: nextStyle === "basic" ? "basic" : "steps" })}
                                />

                                {listStyle === "basic" ? (
                                  <ListEditor
                                    label="List items"
                                    items={listItems}
                                    onChange={(next) => setCustomBlockPatch(block.id, { items: next })}
                                    placeholder="List item"
                                  />
                                ) : (
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="sm" fw={600}>Steps</Text>
                                      <Button
                                        size="xs"
                                        variant="default"
                                        leftSection={<IconPlus size={14} />}
                                        onClick={() =>
                                          setCustomBlockPatch(block.id, {
                                            steps: [...listSteps, { title: "", body: "" }],
                                          })
                                        }
                                      >
                                        Add step
                                      </Button>
                                    </Group>
                                    {listSteps.map((step, stepIndex) => {
                                      const stepRecord = asRecord(step)
                                      return (
                                        <Paper key={`${block.id}-step-${stepIndex}`} withBorder p="sm" radius="md">
                                          <Stack gap="xs">
                                            <Group justify="space-between">
                                              <Badge size="sm" variant="default">Step {stepIndex + 1}</Badge>
                                              <ActionIcon
                                                variant="default"
                                                aria-label="Remove step"
                                                onClick={() =>
                                                  setCustomBlockPatch(block.id, {
                                                    steps: listSteps.filter((_, i) => i !== stepIndex),
                                                  })
                                                }
                                              >
                                                <IconX size={16} />
                                              </ActionIcon>
                                            </Group>
                                            <TextInput
                                              label="Title"
                                              value={asString(stepRecord.title)}
                                              onChange={(e) => {
                                                const next = listSteps.slice()
                                                next[stepIndex] = { ...stepRecord, title: e.currentTarget.value }
                                                setCustomBlockPatch(block.id, { steps: next })
                                              }}
                                            />
                                            <Textarea
                                              label="Body"
                                              value={asString(stepRecord.body)}
                                              onChange={(e) => {
                                                const next = listSteps.slice()
                                                next[stepIndex] = { ...stepRecord, body: inputValueFromEvent(e) }
                                                setCustomBlockPatch(block.id, { steps: next })
                                              }}
                                              autosize
                                              minRows={2}
                                            />
                                          </Stack>
                                        </Paper>
                                      )
                                    })}
                                    {!listSteps.length ? <Text c="dimmed" size="sm">No steps.</Text> : null}
                                  </Stack>
                                )}
                              </Stack>
                            ) : null}

                            {block.type === "cta" ? (
                              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <TextInput
                                  label="Primary CTA label"
                                  value={asString(merged.ctaPrimaryLabel)}
                                  onChange={(e) => setCustomBlockPatch(block.id, { ctaPrimaryLabel: e.currentTarget.value })}
                                />
                                <LinkMenuField
                                  label="Primary CTA link"
                                  value={asString(merged.ctaPrimaryHref)}
                                  onChange={(nextHref) => setCustomBlockPatch(block.id, { ctaPrimaryHref: nextHref })}
                                  currentPageId={section?.page_id ?? ""}
                                  pages={pages}
                                  pagesLoading={pagesLoading}
                                  anchorsByPageId={anchorsByPageId}
                                  anchorsLoadingByPageId={anchorsLoadingByPageId}
                                  ensurePagesLoaded={ensurePagesLoaded}
                                  ensureAnchorsLoaded={ensureAnchorsLoaded}
                                />
                                <TextInput
                                  label="Secondary CTA label"
                                  value={asString(merged.ctaSecondaryLabel)}
                                  onChange={(e) => setCustomBlockPatch(block.id, { ctaSecondaryLabel: e.currentTarget.value })}
                                />
                                <LinkMenuField
                                  label="Secondary CTA link"
                                  value={asString(merged.ctaSecondaryHref)}
                                  onChange={(nextHref) => setCustomBlockPatch(block.id, { ctaSecondaryHref: nextHref })}
                                  currentPageId={section?.page_id ?? ""}
                                  pages={pages}
                                  pagesLoading={pagesLoading}
                                  anchorsByPageId={anchorsByPageId}
                                  anchorsLoadingByPageId={anchorsLoadingByPageId}
                                  ensurePagesLoaded={ensurePagesLoaded}
                                  ensureAnchorsLoaded={ensureAnchorsLoaded}
                                />
                              </SimpleGrid>
                            ) : null}
                          </Stack>
                        </Paper>
                      )
                    })
                  ) : (
                    <Text c="dimmed" size="sm">
                      No blocks found for this custom section type. Add blocks in Section Library first.
                    </Text>
                  )}
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
              <ScrollArea type="auto" offsetScrollbars="x">
                <Table withTableBorder withColumnBorders striped style={{ minWidth: 760 }}>
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
                          <Group justify="end" style={{ whiteSpace: "nowrap" }}>
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
              </ScrollArea>
            </Stack>
          </Paper>

          <Text c="dimmed" size="xs">
            Publish and restore are done via secure RPC functions. Only admins can mutate content.
          </Text>
        </Stack>
      </Drawer>

      <Modal
        opened={deleteDraftOpen}
        onClose={() => (deleteDraftLoading ? null : setDeleteDraftOpen(false))}
        title="Delete draft?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This permanently deletes the current draft version(s) for this section. Published content is unchanged.
          </Text>
          {isDirty ? (
            <Text size="sm" c="dimmed">
              Your unsaved changes in this editor will be discarded.
            </Text>
          ) : null}

          {section && activeDraft ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="default">
                    {type ? formatType(type, typeDefaults ?? undefined) : "Section"}
                  </Badge>
                  {section.key ? (
                    <Text c="dimmed" size="xs">
                      #{section.key}
                    </Text>
                  ) : null}
                  <Badge size="xs" color="yellow" variant="light">
                    draft v{activeDraft.version}
                  </Badge>
                </Group>
              </Stack>
            </Paper>
          ) : null}

          <Group justify="end">
            <Button
              variant="default"
              onClick={() => setDeleteDraftOpen(false)}
              disabled={deleteDraftLoading}
            >
              Cancel
            </Button>
            <Button color="red" onClick={() => void onConfirmDeleteDraft()} loading={deleteDraftLoading}>
              Delete draft
            </Button>
          </Group>
        </Stack>
      </Modal>

      <MediaLibraryModal
        opened={backgroundLibraryOpen}
        onClose={() => setBackgroundLibraryOpen(false)}
        onSelect={(item) => {
          setBackgroundMediaUrl(item.url)
          setBackgroundLibraryOpen(false)
        }}
      />

      <MediaLibraryModal
        opened={navLogoLibraryOpen}
        onClose={() => setNavLogoLibraryOpen(false)}
        onSelect={(item) => {
          applyNavLogoUrl(item.url)
          setNavLogoLibraryOpen(false)
        }}
      />

      <MediaLibraryModal
        opened={cardImageLibraryTarget !== null}
        onClose={() => setCardImageLibraryTarget(null)}
        onSelect={(item) => {
          if (cardImageLibraryTarget !== null) {
            applyCardImageUrl(cardImageLibraryTarget, item.url)
          }
          setCardImageLibraryTarget(null)
        }}
      />

      <MediaLibraryModal
        opened={customImageLibraryTargetId !== null}
        onClose={() => setCustomImageLibraryTargetId(null)}
        onSelect={(item) => {
          if (customImageLibraryTargetId) {
            applyCustomBlockImageUrl(customImageLibraryTargetId, item.url)
          }
          setCustomImageLibraryTargetId(null)
        }}
      />
    </>
  )
}
