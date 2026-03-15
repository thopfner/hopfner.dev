/**
 * Pure helper that computes effective preview data for a visual editor section.
 * Mirrors the merge semantics of the public renderer (page.tsx):
 *   1. site formatting → 2. type defaults → 3. row formatting_override → 4. version formatting
 *   content: type defaults → version content
 *
 * This helper can be tested directly without React context.
 */

import {
  versionRowToPayload,
  payloadToDraft,
  deepMerge,
  asRecord,
} from "@/components/admin/section-editor/payload"
import type { EditorDraft, SectionTypeDefault, SectionVersionRow } from "@/components/admin/section-editor/types"
import type { VisualSectionNode } from "@/components/admin/visual-editor/page-visual-editor-types"

export type EffectivePreviewData = {
  formatting: Record<string, unknown>
  content: Record<string, unknown>
  title: string
  subtitle: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  backgroundMediaUrl: string
}

/**
 * Resolve the effective preview data for a section node.
 * @param node - The visual section node
 * @param siteFormatting - Site-level formatting settings
 * @param typeDefaults - Section type defaults (may be undefined)
 * @param dirtyDraft - In-progress edits (null if clean)
 */
export function resolveEffectivePreview(
  node: VisualSectionNode,
  siteFormatting: Record<string, unknown>,
  typeDefaults: SectionTypeDefault | undefined,
  dirtyDraft: EditorDraft | null,
): EffectivePreviewData | null {
  // Base formatting: site → type defaults
  const baseFormatting = deepMerge(
    asRecord(siteFormatting),
    asRecord(typeDefaults?.default_formatting),
  )

  if (dirtyDraft) {
    const mergedFormatting = deepMerge(
      baseFormatting,
      deepMerge(asRecord(node.formattingOverride), asRecord(dirtyDraft.formatting)),
    )
    const mergedContent = deepMerge(
      asRecord(typeDefaults?.default_content),
      asRecord(dirtyDraft.content),
    )
    return {
      formatting: mergedFormatting,
      content: mergedContent,
      title: dirtyDraft.meta.title,
      subtitle: dirtyDraft.meta.subtitle,
      ctaPrimaryLabel: dirtyDraft.meta.ctaPrimaryLabel,
      ctaPrimaryHref: dirtyDraft.meta.ctaPrimaryHref,
      ctaSecondaryLabel: dirtyDraft.meta.ctaSecondaryLabel,
      ctaSecondaryHref: dirtyDraft.meta.ctaSecondaryHref,
      backgroundMediaUrl: dirtyDraft.meta.backgroundMediaUrl,
    }
  }

  // Use draft version if available, otherwise published
  const version = node.draftVersion ?? node.publishedVersion
  if (!version) return null

  const payload = versionRowToPayload(version, typeDefaults)
  const draft = payloadToDraft(payload, node.sectionType)

  // Use raw version formatting for merge (mirrors public renderer)
  // to avoid normalized empty strings overwriting override/base values
  const mergedFormatting = deepMerge(
    baseFormatting,
    deepMerge(asRecord(node.formattingOverride), asRecord(version.formatting)),
  )
  const mergedContent = deepMerge(
    asRecord(typeDefaults?.default_content),
    asRecord(version.content),
  )

  return {
    formatting: mergedFormatting,
    content: mergedContent,
    title: draft.meta.title,
    subtitle: draft.meta.subtitle,
    ctaPrimaryLabel: draft.meta.ctaPrimaryLabel,
    ctaPrimaryHref: draft.meta.ctaPrimaryHref,
    ctaSecondaryLabel: draft.meta.ctaSecondaryLabel,
    ctaSecondaryHref: draft.meta.ctaSecondaryHref,
    backgroundMediaUrl: draft.meta.backgroundMediaUrl,
  }
}
