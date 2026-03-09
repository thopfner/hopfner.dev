"use client"

import React, { useCallback } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Paper,
  Popover,
  SegmentedControl,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asStringArray,
  richTextWithFallback,
  toCardDisplay,
} from "../payload"
import { ListEditor } from "../fields/list-editor"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import { ImageFieldPicker } from "@/components/image-field-picker"
import type { CardDisplayState } from "../types"
import { DEFAULT_CARD_IMAGE_WIDTH } from "../types"
import { useBufferedField } from "../hooks/use-buffered-field"

const BLOCK_LIST_MODE_OPTIONS = [
  { label: "Block", value: "block" },
  { label: "List", value: "list" },
] as const

export type CardGridRowProps = {
  index: number
  card: Record<string, unknown>
  globalCardDisplay: Record<string, unknown> | undefined
  onPatchCard: (index: number, patch: Record<string, unknown>) => void
  onRemoveCard: (index: number) => void
  onSetCardDisplay: (index: number, patch: Partial<CardDisplayState>) => void
  onSetCardImageUrl: (index: number, url: string) => void
  onSetCardImageWidth: (index: number, width: number) => void
  onOpenCardImageLibrary: (index: number) => void
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string }>
  onError: (message: string) => void
  loading: boolean
}

export const CardGridRow = React.memo(function CardGridRow({
  index,
  card,
  globalCardDisplay,
  onPatchCard,
  onRemoveCard,
  onSetCardDisplay,
  onSetCardImageUrl,
  onSetCardImageWidth,
  onOpenCardImageLibrary,
  uploadToCmsMedia,
  onError,
  loading,
}: CardGridRowProps) {
  const r = card
  const cardDisplay = toCardDisplay(r.display ?? globalCardDisplay)
  const youGet = asStringArray(r.youGet)
  const bestForList = asStringArray(r.bestForList)
  const cardImage = asRecord(r.image)
  const cardImageUrl = asString(cardImage.url)
  const cardImageWidthRaw = Number(cardImage.widthPx)
  const cardImageWidth = Number.isFinite(cardImageWidthRaw)
    ? Math.min(420, Math.max(80, Math.round(cardImageWidthRaw)))
    : DEFAULT_CARD_IMAGE_WIDTH

  // ---- Buffered text fields ----

  const titleField = useBufferedField(
    asString(r.title),
    useCallback((v: string) => onPatchCard(index, { title: v }), [onPatchCard, index]),
    300
  )

  const iconField = useBufferedField(
    asString(r.icon),
    useCallback((v: string) => onPatchCard(index, { icon: v }), [onPatchCard, index]),
    300
  )

  const statField = useBufferedField(
    asString(r.stat),
    useCallback((v: string) => onPatchCard(index, { stat: v }), [onPatchCard, index]),
    300
  )

  const tagField = useBufferedField(
    asString(r.tag),
    useCallback((v: string) => onPatchCard(index, { tag: v }), [onPatchCard, index]),
    300
  )

  const bestForTextField = useBufferedField(
    asString(r.bestFor),
    useCallback((v: string) => onPatchCard(index, { bestFor: v }), [onPatchCard, index]),
    300
  )

  // ---- Stable callbacks ----

  const handleRemove = useCallback(() => onRemoveCard(index), [onRemoveCard, index])

  const handleTextRichTextChange = useCallback(
    (nextJson: unknown) => onPatchCard(index, { textRichText: nextJson }),
    [onPatchCard, index]
  )

  const handleYouGetChange = useCallback(
    (nextList: string[]) => onPatchCard(index, { youGet: nextList }),
    [onPatchCard, index]
  )

  const handleBestForListChange = useCallback(
    (nextList: string[]) => onPatchCard(index, { bestForList: nextList }),
    [onPatchCard, index]
  )

  const handleImageUrlChange = useCallback(
    (nextUrl: string) => onSetCardImageUrl(index, nextUrl),
    [onSetCardImageUrl, index]
  )

  const handleImageRemove = useCallback(
    () => onSetCardImageUrl(index, ""),
    [onSetCardImageUrl, index]
  )

  const handleImageUpload = useCallback(
    async (file: File) => {
      const { publicUrl } = await uploadToCmsMedia(file)
      onSetCardImageUrl(index, publicUrl)
    },
    [uploadToCmsMedia, onSetCardImageUrl, index]
  )

  const handleChooseFromLibrary = useCallback(
    () => onOpenCardImageLibrary(index),
    [onOpenCardImageLibrary, index]
  )

  const handleImageWidthChange = useCallback(
    (nextWidth: number) => onSetCardImageWidth(index, nextWidth),
    [onSetCardImageWidth, index]
  )

  // ---- Display toggle callbacks ----

  const handleShowTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onSetCardDisplay(index, { showTitle: e.currentTarget.checked }),
    [onSetCardDisplay, index]
  )

  const handleShowText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onSetCardDisplay(index, { showText: e.currentTarget.checked }),
    [onSetCardDisplay, index]
  )

  const handleShowImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onSetCardDisplay(index, { showImage: e.currentTarget.checked }),
    [onSetCardDisplay, index]
  )

  const handleShowYouGet = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onSetCardDisplay(index, { showYouGet: e.currentTarget.checked }),
    [onSetCardDisplay, index]
  )

  const handleShowBestFor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onSetCardDisplay(index, { showBestFor: e.currentTarget.checked }),
    [onSetCardDisplay, index]
  )

  const handleYouGetModeChange = useCallback(
    (nextMode: string) =>
      onSetCardDisplay(index, { youGetMode: nextMode === "list" ? "list" : "block" }),
    [onSetCardDisplay, index]
  )

  const handleBestForModeChange = useCallback(
    (nextMode: string) =>
      onSetCardDisplay(index, { bestForMode: nextMode === "list" ? "list" : "block" }),
    [onSetCardDisplay, index]
  )

  return (
    <Paper withBorder p="sm" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Badge size="sm" variant="default">
            Card {index + 1}
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
                    onChange={handleShowTitle}
                  />
                  <Checkbox
                    label="Text"
                    checked={cardDisplay.showText}
                    onChange={handleShowText}
                  />
                  <Checkbox
                    label="Image"
                    checked={cardDisplay.showImage}
                    onChange={handleShowImage}
                  />
                  <Checkbox
                    label="You get"
                    checked={cardDisplay.showYouGet}
                    onChange={handleShowYouGet}
                  />
                  <Checkbox
                    label="Best for"
                    checked={cardDisplay.showBestFor}
                    onChange={handleShowBestFor}
                  />
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <ActionIcon
              variant="default"
              aria-label="Remove card"
              onClick={handleRemove}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>
        {cardDisplay.showTitle ? (
          <TextInput
            label="Title"
            value={titleField.value}
            onChange={(e) => titleField.onChange(e.currentTarget.value)}
            onBlur={titleField.onBlur}
          />
        ) : null}
        {cardDisplay.showText ? (
          <TipTapJsonEditor
            label="Text"
            value={richTextWithFallback(r.textRichText, r.text)}
            onChange={handleTextRichTextChange}
            onError={onError}
          />
        ) : null}
        {cardDisplay.showImage ? (
          <ImageFieldPicker
            title="Card image"
            value={cardImageUrl}
            urlLabel="Image URL"
            onChange={handleImageUrlChange}
            onRemove={handleImageRemove}
            onUploadFile={handleImageUpload}
            onChooseFromLibrary={handleChooseFromLibrary}
            disabled={loading}
            onError={onError}
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
                onChange={handleImageWidthChange}
              />
            </Stack>
          </ImageFieldPicker>
        ) : null}
        {cardDisplay.showYouGet ? (
          <Stack gap="xs">
            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" fw={500}>
                You get
              </Text>
              <SegmentedControl
                size="xs"
                value={cardDisplay.youGetMode}
                data={BLOCK_LIST_MODE_OPTIONS as unknown as { label: string; value: string }[]}
                onChange={handleYouGetModeChange}
              />
            </Group>
            <ListEditor
              label="You get (list)"
              items={youGet}
              onChange={handleYouGetChange}
              placeholder="workflow map"
            />
          </Stack>
        ) : null}
        {cardDisplay.showBestFor ? (
          <Stack gap="xs">
            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" fw={500}>
                Best for
              </Text>
              <SegmentedControl
                size="xs"
                value={cardDisplay.bestForMode}
                data={BLOCK_LIST_MODE_OPTIONS as unknown as { label: string; value: string }[]}
                onChange={handleBestForModeChange}
              />
            </Group>
            {cardDisplay.bestForMode === "list" ? (
              <ListEditor
                label="Best for (list)"
                items={bestForList}
                onChange={handleBestForListChange}
                placeholder="teams with repetitive manual workflows"
              />
            ) : (
              <TextInput
                label="Best for"
                value={bestForTextField.value}
                onChange={(e) => bestForTextField.onChange(e.currentTarget.value)}
                onBlur={bestForTextField.onBlur}
              />
            )}
          </Stack>
        ) : null}
        <SimpleGrid cols={3}>
          <TextInput
            label="Icon"
            placeholder="e.g. emoji"
            value={iconField.value}
            onChange={(e) => iconField.onChange(e.currentTarget.value)}
            onBlur={iconField.onBlur}
          />
          <TextInput
            label="Stat"
            placeholder="e.g. 50+"
            value={statField.value}
            onChange={(e) => statField.onChange(e.currentTarget.value)}
            onBlur={statField.onBlur}
          />
          <TextInput
            label="Tag"
            placeholder="e.g. NEW"
            value={tagField.value}
            onChange={(e) => tagField.onChange(e.currentTarget.value)}
            onBlur={tagField.onBlur}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  )
})
