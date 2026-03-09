"use client"

import { memo, useMemo, useCallback } from "react"
import { Text } from "@/components/mui-compat"
import type { ContentEditorProps, FlattenedComposerBlock, ComposerBlock, LinkMenuResourceProps } from "./types"
import { HeroCtaEditor } from "./editors/hero-cta-editor"
import { CardGridEditor } from "./editors/card-grid-editor"
import { StepsListEditor } from "./editors/steps-list-editor"
import { TitleBodyListEditor } from "./editors/title-body-list-editor"
import { RichTextBlockEditor } from "./editors/rich-text-block-editor"
import { LabelValueListEditor } from "./editors/label-value-list-editor"
import { FaqListEditor } from "./editors/faq-list-editor"
import { CtaBlockEditor } from "./editors/cta-block-editor"
import { FooterGridEditor } from "./editors/footer-grid-editor"
import { NavLinksEditor } from "./editors/nav-links-editor"
import { SocialProofStripEditor } from "./editors/social-proof-strip-editor"
import { ProofClusterEditor } from "./editors/proof-cluster-editor"
import { CaseStudySplitEditor } from "./editors/case-study-split-editor"
import { CustomComposerEditor } from "./editors/custom-composer-editor"
import { asRecord } from "./payload"

type ContentEditorRouterProps = {
  sectionType: string | null
  isCustomComposedType: boolean
  content: Record<string, unknown>
  onContentChange: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void
  setContentPath: (path: string, value: unknown) => void
  onError: (message: string) => void
  loading: boolean
  linkMenuProps: LinkMenuResourceProps
  // Card grid specific
  onOpenCardImageLibrary: (idx: number) => void
  // Nav links specific
  onOpenNavLogoLibrary: () => void
  // Social proof strip specific
  onOpenLogoImageLibrary: (idx: number) => void
  // Custom composer specific
  flattenedCustomBlocks: FlattenedComposerBlock[]
  setCustomBlockPatch: (blockId: string, patch: Record<string, unknown>) => void
  onOpenCustomImageLibrary: (blockId: string) => void
  // Media upload
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string; bucket: string; path: string }>
}

export const ContentEditorRouter = memo(function ContentEditorRouter({
  sectionType,
  isCustomComposedType,
  content,
  onContentChange,
  setContentPath,
  onError,
  loading,
  linkMenuProps,
  onOpenCardImageLibrary,
  onOpenNavLogoLibrary,
  onOpenLogoImageLibrary,
  flattenedCustomBlocks,
  setCustomBlockPatch,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
}: ContentEditorRouterProps) {
  const editorProps: ContentEditorProps = useMemo(() => ({
    content,
    onContentChange,
    setContentPath,
    onError,
    loading,
    linkMenuProps,
  }), [content, onContentChange, setContentPath, onError, loading, linkMenuProps])

  // Pass the raw customBlocks record so CustomComposerEditor can look up
  // per-block overrides. Each CustomBlockEditor merges internally and is
  // memoized, so only the block whose override changed re-renders.
  const customBlockOverrides = useMemo(
    () => asRecord(content.customBlocks),
    [content.customBlocks]
  )

  const applyCustomBlockImageUrl = useCallback((blockId: string, url: string) => {
    setCustomBlockPatch(blockId, { imageUrl: url })
  }, [setCustomBlockPatch])

  if (!sectionType) {
    return (
      <Text c="dimmed" size="sm">
        Select a section.
      </Text>
    )
  }

  if (isCustomComposedType) {
    return (
      <CustomComposerEditor
        {...editorProps}
        flattenedCustomBlocks={flattenedCustomBlocks}
        customBlockOverrides={customBlockOverrides}
        setCustomBlockPatch={setCustomBlockPatch}
        applyCustomBlockImageUrl={applyCustomBlockImageUrl}
        onOpenCustomImageLibrary={onOpenCustomImageLibrary}
        uploadToCmsMedia={uploadToCmsMedia}
      />
    )
  }

  switch (sectionType) {
    case "hero_cta":
      return <HeroCtaEditor {...editorProps} />
    case "card_grid":
      return (
        <CardGridEditor
          {...editorProps}
          onOpenCardImageLibrary={onOpenCardImageLibrary}
          uploadToCmsMedia={uploadToCmsMedia}
        />
      )
    case "steps_list":
      return <StepsListEditor {...editorProps} />
    case "title_body_list":
      return <TitleBodyListEditor {...editorProps} />
    case "rich_text_block":
      return <RichTextBlockEditor {...editorProps} />
    case "label_value_list":
      return <LabelValueListEditor {...editorProps} />
    case "faq_list":
      return <FaqListEditor {...editorProps} />
    case "cta_block":
      return <CtaBlockEditor {...editorProps} />
    case "footer_grid":
      return <FooterGridEditor {...editorProps} />
    case "nav_links":
      return (
        <NavLinksEditor
          {...editorProps}
          onOpenNavLogoLibrary={onOpenNavLogoLibrary}
          uploadToCmsMedia={uploadToCmsMedia}
        />
      )
    case "social_proof_strip":
      return (
        <SocialProofStripEditor
          {...editorProps}
          onOpenLogoImageLibrary={onOpenLogoImageLibrary}
          uploadToCmsMedia={uploadToCmsMedia}
        />
      )
    case "proof_cluster":
      return <ProofClusterEditor {...editorProps} />
    case "case_study_split":
      return <CaseStudySplitEditor {...editorProps} />
    default:
      return (
        <Text c="dimmed" size="sm">
          No editor available for section type &quot;{sectionType}&quot;.
        </Text>
      )
  }
})
