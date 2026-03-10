"use client"

import { useCallback } from "react"
import {
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconPlus } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  asStringArray,
  inputValueFromEvent,
  emptyRichTextDoc,
  toCardDisplay,
} from "../payload"
import type { ContentEditorProps, CardDisplayState } from "../types"
import { DEFAULT_CARD_IMAGE_WIDTH } from "../types"
import { CardGridRow } from "./card-grid-row"

const CARD_GRID_COLUMNS_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
] as const

type CardGridEditorProps = ContentEditorProps & {
  onOpenCardImageLibrary: (idx: number) => void
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string }>
}

export function CardGridEditor({
  content,
  onContentChange,
  onError,
  loading,
  onOpenCardImageLibrary,
  uploadToCmsMedia,
}: CardGridEditorProps) {
  const whatCards = asArray<Record<string, unknown>>(content.cards)

  // ---- Stable callbacks for row component ----

  const handlePatchCard = useCallback(
    (index: number, patch: Record<string, unknown>) => {
      onContentChange((c) => {
        const cards = asArray<Record<string, unknown>>(c.cards)
        if (index < 0 || index >= cards.length) return c
        const nextCards = cards.slice()
        nextCards[index] = { ...asRecord(nextCards[index]), ...patch }
        return { ...c, cards: nextCards }
      })
    },
    [onContentChange]
  )

  const handleRemoveCard = useCallback(
    (index: number) => {
      onContentChange((c) => {
        const cards = asArray<Record<string, unknown>>(c.cards)
        return { ...c, cards: cards.filter((_, i) => i !== index) }
      })
    },
    [onContentChange]
  )

  const handleSetCardDisplay = useCallback(
    (cardIndex: number, nextPatch: Partial<CardDisplayState>) => {
      onContentChange((c) => {
        const cards = asArray<Record<string, unknown>>(c.cards)
        if (!cards.length || cardIndex < 0 || cardIndex >= cards.length) return c
        const globalDisplay = toCardDisplay(c.cardDisplay)
        const nextCards = cards.map((card, idx) => {
          const cardRecord = asRecord(card)
          const normalized = toCardDisplay(cardRecord.display ?? globalDisplay)
          const nextDisplay = idx === cardIndex ? { ...normalized, ...nextPatch } : normalized
          if (idx !== cardIndex) {
            return { ...cardRecord, display: nextDisplay }
          }

          const nextCard: Record<string, unknown> = {
            ...cardRecord,
            display: nextDisplay,
          }

          if (nextPatch.bestForMode === "list") {
            const existingBestForList = asStringArray(cardRecord.bestForList).filter(
              (item) => item.trim().length > 0
            )
            const bestForText = asString(cardRecord.bestFor).trim()
            if (!existingBestForList.length && bestForText) {
              nextCard.bestForList = [bestForText]
            }
          }

          return { ...nextCard }
        })
        return { ...c, cards: nextCards }
      })
    },
    [onContentChange]
  )

  const handleSetCardImageUrl = useCallback(
    (cardIndex: number, url: string) => {
      onContentChange((c) => {
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
        return { ...c, cards: nextCards }
      })
    },
    [onContentChange]
  )

  const handleSetCardImageWidth = useCallback(
    (cardIndex: number, widthPx: number) => {
      onContentChange((c) => {
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
        return { ...c, cards: nextCards }
      })
    },
    [onContentChange]
  )

  const handleAddCard = useCallback(() => {
    onContentChange((c) => ({
      ...c,
      cards: [
        ...asArray<Record<string, unknown>>(c.cards),
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
  }, [onContentChange])

  // ---- Section-level cardDisplay defaults ----

  const globalCardDisplay = toCardDisplay(content.cardDisplay)

  const handleGlobalDisplayChange = useCallback(
    (patch: Partial<CardDisplayState>) => {
      onContentChange((c) => ({
        ...c,
        cardDisplay: { ...toCardDisplay(c.cardDisplay), ...patch },
      }))
    },
    [onContentChange]
  )

  return (
    <Stack gap="sm">
      {/* --- Content first --- */}
      <TextInput
        label="Section eyebrow"
        placeholder="e.g. Our Services"
        value={asString(content.eyebrow)}
        onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))}
      />
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          Cards
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddCard}
          >
            Add card
          </Button>
        </Group>
      </Group>
      <Stack gap="xs">
        {whatCards.map((card, idx) => (
          <CardGridRow
            key={idx}
            index={idx}
            card={asRecord(card)}
            globalCardDisplay={content.cardDisplay as Record<string, unknown> | undefined}
            onPatchCard={handlePatchCard}
            onRemoveCard={handleRemoveCard}
            onSetCardDisplay={handleSetCardDisplay}
            onSetCardImageUrl={handleSetCardImageUrl}
            onSetCardImageWidth={handleSetCardImageWidth}
            onOpenCardImageLibrary={onOpenCardImageLibrary}
            uploadToCmsMedia={uploadToCmsMedia}
            onError={onError}
            loading={loading}
          />
        ))}
        {!whatCards.length ? (
          <Text c="dimmed" size="sm">
            No cards.
          </Text>
        ) : null}
      </Stack>

      {/* --- Layout & display last --- */}
      <Divider />
      <Text size="xs" c="dimmed" fw={500}>Layout & display</Text>
      <Select
        label="Columns"
        comboboxProps={{ withinPortal: false }}
        data={CARD_GRID_COLUMNS_OPTIONS as unknown as { value: string; label: string }[]}
        value={String(content.columns ?? "")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, columns: v ? Number(v) : undefined }))}
      />

      {/* Section-level card display defaults */}
      <Paper withBorder p="sm" radius="md">
        <Stack gap="xs">
          <Text size="xs" fw={600}>Default card fields</Text>
          <Text size="xs" c="dimmed">Controls which fields new cards show by default.</Text>
          <SimpleGrid cols={2}>
            <Checkbox label="Title" size="xs" checked={globalCardDisplay.showTitle} onChange={(e) => handleGlobalDisplayChange({ showTitle: e.currentTarget.checked })} />
            <Checkbox label="Text" size="xs" checked={globalCardDisplay.showText} onChange={(e) => handleGlobalDisplayChange({ showText: e.currentTarget.checked })} />
            <Checkbox label="Image" size="xs" checked={globalCardDisplay.showImage} onChange={(e) => handleGlobalDisplayChange({ showImage: e.currentTarget.checked })} />
            <Checkbox label="You get" size="xs" checked={globalCardDisplay.showYouGet} onChange={(e) => handleGlobalDisplayChange({ showYouGet: e.currentTarget.checked })} />
            <Checkbox label="Best for" size="xs" checked={globalCardDisplay.showBestFor} onChange={(e) => handleGlobalDisplayChange({ showBestFor: e.currentTarget.checked })} />
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  )
}
