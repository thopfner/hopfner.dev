import type { FormattingState } from "@/components/admin/formatting-controls"
import type {
  BuiltinCmsSectionType,
  CardDisplayState,
  ComposerBlock,
  ComposerBlockType,
  ComposerColumn,
  ComposerRow,
  ComposerSchema,
  CmsPageRow,
  EditorDraft,
  FlattenedComposerBlock,
  ParsedLinkTarget,
  SectionTypeDefault,
  SectionVersionRow,
  VersionPayload,
} from "@/components/admin/section-editor/types"

// ---------------------------------------------------------------------------
// Safe accessors
// ---------------------------------------------------------------------------

export function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

export function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

export function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === "string") : []
}

export function inputValueFromEvent(e: unknown): string {
  if (e && typeof e === "object") {
    const ev = e as { currentTarget?: { value?: unknown }; target?: { value?: unknown } }
    if (ev.currentTarget && typeof ev.currentTarget.value === "string") {
      return ev.currentTarget.value
    }
    if (ev.target && typeof ev.target.value === "string") {
      return ev.target.value
    }
  }
  return ""
}

// ---------------------------------------------------------------------------
// Section type helpers
// ---------------------------------------------------------------------------

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
  "social_proof_strip",
  "proof_cluster",
  "case_study_split",
  "booking_scheduler",
])

export function isBuiltinSectionType(type: string): type is BuiltinCmsSectionType {
  return BUILTIN_SECTION_TYPES.has(type as BuiltinCmsSectionType)
}

export function normalizeSectionType(raw: string): string | null {
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
    case "social_proof_strip":
    case "proof_cluster":
    case "case_study_split":
    case "booking_scheduler":
      return raw
    case "trust_strip":
      return "social_proof_strip"
    case "split_story":
      return "case_study_split"
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

export function formatType(type: string, defaults?: Partial<Record<string, SectionTypeDefault>>) {
  return defaults?.[type as BuiltinCmsSectionType]?.label ?? type.replaceAll("_", " ")
}

// ---------------------------------------------------------------------------
// Formatting normalization
// ---------------------------------------------------------------------------

export const DEFAULT_FORMATTING: FormattingState = {
  containerClass: "",
  sectionClass: "",
  paddingY: "py-6",
  outerSpacing: "",
  spacingTop: "",
  spacingBottom: "",
  maxWidth: "max-w-5xl",
  textAlign: "left",
  heroRightAlign: "",
  widthMode: "content",
  heroMinHeight: "auto",
  shadowMode: "inherit",
  innerShadowMode: "inherit",
  innerShadowStrength: 0,
}

export function normalizeFormatting(raw: Record<string, unknown>): FormattingState {
  const mobile = asRecord(raw.mobile)
  const rawShadowMode = asString(raw.shadowMode)
  const rawInnerShadowMode = asString(raw.innerShadowMode)
  const rawInnerShadowStrength = Number(raw.innerShadowStrength)
  const out: FormattingState = {
    containerClass: asString(raw.containerClass),
    sectionClass: asString(raw.sectionClass),
    paddingY: (asString(raw.paddingY) as FormattingState["paddingY"]) || "",
    outerSpacing: (asString(raw.outerSpacing) as FormattingState["outerSpacing"]) || "",
    spacingTop: asString(raw.spacingTop),
    spacingBottom: asString(raw.spacingBottom),
    maxWidth: (asString(raw.maxWidth) as FormattingState["maxWidth"]) || "",
    textAlign: (asString(raw.textAlign) as FormattingState["textAlign"]) || "",
    heroRightAlign: (asString(raw.heroRightAlign) as FormattingState["heroRightAlign"]) || "",
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
    sectionRhythm: (asString(raw.sectionRhythm) as FormattingState["sectionRhythm"]) || "",
    contentDensity: (asString(raw.contentDensity) as FormattingState["contentDensity"]) || "",
    gridGap: (asString(raw.gridGap) as FormattingState["gridGap"]) || "",
    sectionSurface: (asString(raw.sectionSurface) as FormattingState["sectionSurface"]) || "",
    cardFamily: (asString(raw.cardFamily) as FormattingState["cardFamily"]) || "",
    cardChrome: (asString(raw.cardChrome) as FormattingState["cardChrome"]) || "",
    accentRule: (asString(raw.accentRule) as FormattingState["accentRule"]) || "",
    dividerMode: (asString(raw.dividerMode) as FormattingState["dividerMode"]) || "",
    headingTreatment: (asString(raw.headingTreatment) as FormattingState["headingTreatment"]) || "",
    labelStyle: (asString(raw.labelStyle) as FormattingState["labelStyle"]) || "",
    subtitleSize: (asString(raw.subtitleSize) as FormattingState["subtitleSize"]) || "",
    sectionPresetKey: asString(raw.sectionPresetKey) || "",
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

export function formattingToJsonb(state: FormattingState) {
  const base: Record<string, unknown> = {
    containerClass: state.containerClass.trim(),
    sectionClass: state.sectionClass.trim(),
    paddingY: state.paddingY,
    outerSpacing: state.outerSpacing,
    spacingTop: state.spacingTop || "",
    spacingBottom: state.spacingBottom || "",
    maxWidth: state.maxWidth,
    textAlign: state.textAlign,
    heroRightAlign: state.heroRightAlign,
    widthMode: state.widthMode,
    heroMinHeight: state.heroMinHeight,
    shadowMode: state.shadowMode,
    innerShadowMode: state.innerShadowMode,
    innerShadowStrength: state.innerShadowStrength,
    sectionRhythm: state.sectionRhythm || "",
    contentDensity: state.contentDensity || "",
    gridGap: state.gridGap || "",
    sectionSurface: state.sectionSurface || "",
    cardFamily: state.cardFamily || "",
    cardChrome: state.cardChrome || "",
    accentRule: state.accentRule || "",
    dividerMode: state.dividerMode || "",
    headingTreatment: state.headingTreatment || "",
    labelStyle: state.labelStyle || "",
    subtitleSize: state.subtitleSize || "",
    sectionPresetKey: state.sectionPresetKey || "",
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

export function textOrNull(input: string) {
  const t = input.trim()
  return t ? t : null
}

// ---------------------------------------------------------------------------
// Merge helpers
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

export function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
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

// ---------------------------------------------------------------------------
// Version / payload conversion
// ---------------------------------------------------------------------------

export function versionRowToPayload(
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
  const normalizedFormattingState = normalizeFormatting(mergedFormatting)
  return {
    title: coalesceText(v.title, defaults?.default_title) || null,
    subtitle: coalesceText(v.subtitle, defaults?.default_subtitle) || null,
    cta_primary_label: coalesceText(v.cta_primary_label, defaults?.default_cta_primary_label) || null,
    cta_primary_href: coalesceText(v.cta_primary_href, defaults?.default_cta_primary_href) || null,
    cta_secondary_label: coalesceText(v.cta_secondary_label, defaults?.default_cta_secondary_label) || null,
    cta_secondary_href: coalesceText(v.cta_secondary_href, defaults?.default_cta_secondary_href) || null,
    background_media_url: coalesceText(v.background_media_url, defaults?.default_background_media_url) || null,
    formatting: formattingToJsonb(normalizedFormattingState),
    content: mergedContent,
  }
}

export function defaultsToPayload(defaults?: SectionTypeDefault): VersionPayload {
  const normalizedFormattingState = normalizeFormatting(asRecord(defaults?.default_formatting))
  return {
    title: coalesceText(null, defaults?.default_title) || null,
    subtitle: coalesceText(null, defaults?.default_subtitle) || null,
    cta_primary_label: coalesceText(null, defaults?.default_cta_primary_label) || null,
    cta_primary_href: coalesceText(null, defaults?.default_cta_primary_href) || null,
    cta_secondary_label: coalesceText(null, defaults?.default_cta_secondary_label) || null,
    cta_secondary_href: coalesceText(null, defaults?.default_cta_secondary_href) || null,
    background_media_url: coalesceText(null, defaults?.default_background_media_url) || null,
    formatting: formattingToJsonb(normalizedFormattingState),
    content: asRecord(defaults?.default_content),
  }
}

// ---------------------------------------------------------------------------
// Draft <-> Payload conversions
// ---------------------------------------------------------------------------

export function payloadToDraft(p: VersionPayload, sectionType?: string | null): EditorDraft {
  let subtitle = p.subtitle ?? ""

  if (sectionType && isBuiltinSectionType(sectionType) && !subtitle.trim()) {
    const contentSubtitle = asString(p.content.subtitle)
    if (contentSubtitle.trim()) {
      subtitle = contentSubtitle
    }
  }

  return {
    meta: {
      title: p.title ?? "",
      subtitle,
      ctaPrimaryLabel: p.cta_primary_label ?? "",
      ctaPrimaryHref: p.cta_primary_href ?? "",
      ctaSecondaryLabel: p.cta_secondary_label ?? "",
      ctaSecondaryHref: p.cta_secondary_href ?? "",
      backgroundMediaUrl: p.background_media_url ?? "",
    },
    formatting: normalizeFormatting(asRecord(p.formatting)),
    content: p.content,
  }
}

export function draftToPayload(d: EditorDraft, sectionType?: string | null): VersionPayload {
  let content = d.content

  if (sectionType && isBuiltinSectionType(sectionType) && "subtitle" in content) {
    const rest = { ...content }
    delete (rest as Record<string, unknown>).subtitle
    content = rest
  }

  return {
    title: textOrNull(d.meta.title),
    subtitle: textOrNull(d.meta.subtitle),
    cta_primary_label: textOrNull(d.meta.ctaPrimaryLabel),
    cta_primary_href: textOrNull(d.meta.ctaPrimaryHref),
    cta_secondary_label: textOrNull(d.meta.ctaSecondaryLabel),
    cta_secondary_href: textOrNull(d.meta.ctaSecondaryHref),
    background_media_url: textOrNull(d.meta.backgroundMediaUrl),
    formatting: formattingToJsonb(d.formatting),
    content,
  }
}

// ---------------------------------------------------------------------------
// CardDisplay helpers
// ---------------------------------------------------------------------------

const DEFAULT_CARD_DISPLAY: CardDisplayState = {
  showTitle: true,
  showText: true,
  showImage: false,
  showYouGet: false,
  showBestFor: false,
  youGetMode: "block",
  bestForMode: "block",
}

export function toCardDisplay(v: unknown): CardDisplayState {
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

// ---------------------------------------------------------------------------
// RichText helpers
// ---------------------------------------------------------------------------

export function emptyRichTextDoc(): Record<string, unknown> {
  return { type: "doc", content: [] }
}

export function plainTextToRichTextDoc(text: string): Record<string, unknown> {
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

export function richTextWithFallback(rich: unknown, fallbackText: unknown): Record<string, unknown> {
  const richRecord = asRecord(rich)
  if (Object.keys(richRecord).length > 0) return richRecord
  return plainTextToRichTextDoc(asString(fallbackText))
}

export function richTextDocToPlainText(input: unknown): string {
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

// ---------------------------------------------------------------------------
// Composer schema helpers
// ---------------------------------------------------------------------------

export function normalizeComposerSchema(input: unknown): ComposerSchema {
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

export function flattenComposerSchemaBlocks(schema: ComposerSchema | null): FlattenedComposerBlock[] {
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

// ---------------------------------------------------------------------------
// Stable stringify (used at save time, NOT on every keystroke)
// ---------------------------------------------------------------------------

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (!value || typeof value !== "object") return value
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(obj).sort()) out[key] = sortDeep(obj[key])
  return out
}

export function stableStringify(value: unknown) {
  return JSON.stringify(sortDeep(value))
}

// ---------------------------------------------------------------------------
// Link parsing
// ---------------------------------------------------------------------------

function pageSlugToPath(slug: string) {
  return `/${slug}`
}

export function parseHref(rawHref: string): ParsedLinkTarget {
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

export function buildHref(target: ParsedLinkTarget): string {
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

// ---------------------------------------------------------------------------
// Class validation
// ---------------------------------------------------------------------------

export function validateClassTokens(input: string, allowed: Set<string>) {
  const tokens = input
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
  const invalid = tokens.filter((t) => !allowed.has(t))
  return { tokens, invalid }
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

export function formatDateTime(ts: string | null) {
  if (!ts) return "—"
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "Z")
}

// ---------------------------------------------------------------------------
// Link menu resource compatibility
// ---------------------------------------------------------------------------

export type { CmsPageRow }
