"use client"

import { memo } from "react"
import {
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { MediaPickerMenu } from "@/components/media-picker-menu"
import { LinkMenuField } from "./fields/link-menu-field"
import type { EditorDraftMeta, LinkMenuResourceProps } from "./types"
import { inputValueFromEvent } from "./payload"

// ---------------------------------------------------------------------------
// Section basics — title + subtitle
// ---------------------------------------------------------------------------

type SectionBasicsPanelProps = {
  meta: EditorDraftMeta
  onMetaField: (field: keyof EditorDraftMeta, value: string) => void
  showTitle: boolean
  showSubtitle: boolean
}

export const SectionBasicsPanel = memo(function SectionBasicsPanel({
  meta,
  onMetaField,
  showTitle,
  showSubtitle,
}: SectionBasicsPanelProps) {
  if (!showTitle && !showSubtitle) return null
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Section basics
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {showTitle ? (
            <TextInput
              label="Title"
              value={meta.title}
              onChange={(e) => onMetaField("title", inputValueFromEvent(e))}
            />
          ) : null}
          {showSubtitle ? (
            <TextInput
              label="Subtitle"
              value={meta.subtitle}
              onChange={(e) => onMetaField("subtitle", inputValueFromEvent(e))}
            />
          ) : null}
        </SimpleGrid>
      </Stack>
    </Paper>
  )
})

// ---------------------------------------------------------------------------
// Shared actions — CTA primary + CTA secondary
// ---------------------------------------------------------------------------

type SectionActionsPanelProps = {
  meta: EditorDraftMeta
  onMetaField: (field: keyof EditorDraftMeta, value: string) => void
  showCtaPrimary: boolean
  showCtaSecondary: boolean
  linkMenuProps: LinkMenuResourceProps
}

export const SectionActionsPanel = memo(function SectionActionsPanel({
  meta,
  onMetaField,
  showCtaPrimary,
  showCtaSecondary,
  linkMenuProps,
}: SectionActionsPanelProps) {
  if (!showCtaPrimary && !showCtaSecondary) return null
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Actions
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {showCtaPrimary ? (
            <TextInput
              label="Primary CTA label"
              value={meta.ctaPrimaryLabel}
              onChange={(e) => onMetaField("ctaPrimaryLabel", inputValueFromEvent(e))}
            />
          ) : null}
          {showCtaPrimary ? (
            <LinkMenuField
              label="Primary CTA link"
              value={meta.ctaPrimaryHref}
              onChange={(nextHref) => onMetaField("ctaPrimaryHref", nextHref)}
              currentPageId={linkMenuProps.currentPageId}
              pages={linkMenuProps.pages}
              pagesLoading={linkMenuProps.pagesLoading}
              anchorsByPageId={linkMenuProps.anchorsByPageId}
              anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
              ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
              ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
            />
          ) : null}
          {showCtaSecondary ? (
            <TextInput
              label="Secondary CTA label"
              value={meta.ctaSecondaryLabel}
              onChange={(e) => onMetaField("ctaSecondaryLabel", inputValueFromEvent(e))}
            />
          ) : null}
          {showCtaSecondary ? (
            <LinkMenuField
              label="Secondary CTA link"
              value={meta.ctaSecondaryHref}
              onChange={(nextHref) => onMetaField("ctaSecondaryHref", nextHref)}
              currentPageId={linkMenuProps.currentPageId}
              pages={linkMenuProps.pages}
              pagesLoading={linkMenuProps.pagesLoading}
              anchorsByPageId={linkMenuProps.anchorsByPageId}
              anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
              ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
              ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
            />
          ) : null}
        </SimpleGrid>
      </Stack>
    </Paper>
  )
})

// ---------------------------------------------------------------------------
// Background media
// ---------------------------------------------------------------------------

type BackgroundMediaPanelProps = {
  meta: EditorDraftMeta
  onMetaField: (field: keyof EditorDraftMeta, value: string) => void
  showBackgroundMedia: boolean
  loading: boolean
  onUploadBackground: (file: File) => Promise<void>
  onOpenBackgroundLibrary: () => void
  onError: (message: string) => void
}

export const BackgroundMediaPanel = memo(function BackgroundMediaPanel({
  meta,
  onMetaField,
  showBackgroundMedia,
  loading,
  onUploadBackground,
  onOpenBackgroundLibrary,
  onError,
}: BackgroundMediaPanelProps) {
  if (!showBackgroundMedia) return null
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Background media
        </Text>
        <Group align="end" gap="sm" wrap="wrap">
          <TextInput
            label="Background media URL"
            value={meta.backgroundMediaUrl}
            onChange={(e) => onMetaField("backgroundMediaUrl", inputValueFromEvent(e))}
            placeholder="https://..."
            style={{ flex: 1 }}
          />
          <MediaPickerMenu
            label="Choose image"
            withinPortal={false}
            disabled={loading}
            onUploadFile={onUploadBackground}
            onChooseFromLibrary={onOpenBackgroundLibrary}
            onError={onError}
          />
        </Group>
      </Stack>
    </Paper>
  )
})

// ---------------------------------------------------------------------------
// Legacy combined panel — kept for backward compat if needed, but the shell
// should use the individual panels above.
// ---------------------------------------------------------------------------

type CommonFieldsPanelProps = {
  meta: EditorDraftMeta
  onMetaField: (field: keyof EditorDraftMeta, value: string) => void
  showTitle: boolean
  showSubtitle: boolean
  showCtaPrimary: boolean
  showCtaSecondary: boolean
  showBackgroundMedia: boolean
  loading: boolean
  onUploadBackground: (file: File) => Promise<void>
  onOpenBackgroundLibrary: () => void
  onError: (message: string) => void
  linkMenuProps: LinkMenuResourceProps
}

export const CommonFieldsPanel = memo(function CommonFieldsPanel(props: CommonFieldsPanelProps) {
  return (
    <>
      <SectionBasicsPanel
        meta={props.meta}
        onMetaField={props.onMetaField}
        showTitle={props.showTitle}
        showSubtitle={props.showSubtitle}
      />
      <SectionActionsPanel
        meta={props.meta}
        onMetaField={props.onMetaField}
        showCtaPrimary={props.showCtaPrimary}
        showCtaSecondary={props.showCtaSecondary}
        linkMenuProps={props.linkMenuProps}
      />
      <BackgroundMediaPanel
        meta={props.meta}
        onMetaField={props.onMetaField}
        showBackgroundMedia={props.showBackgroundMedia}
        loading={props.loading}
        onUploadBackground={props.onUploadBackground}
        onOpenBackgroundLibrary={props.onOpenBackgroundLibrary}
        onError={props.onError}
      />
    </>
  )
})
