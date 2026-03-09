"use client"

import { memo, useCallback } from "react"
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

export const CommonFieldsPanel = memo(function CommonFieldsPanel({
  meta,
  onMetaField,
  showTitle,
  showSubtitle,
  showCtaPrimary,
  showCtaSecondary,
  showBackgroundMedia,
  loading,
  onUploadBackground,
  onOpenBackgroundLibrary,
  onError,
  linkMenuProps,
}: CommonFieldsPanelProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Fields
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

        {showBackgroundMedia ? (
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
        ) : null}
      </Stack>
    </Paper>
  )
})
