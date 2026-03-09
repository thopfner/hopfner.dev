"use client"

import { useCallback } from "react"
import {
  Button,
  Group,
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

const CARD_GRID_VARIANT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "value_pillars", label: "Value pillars" },
  { value: "services", label: "Services" },
  { value: "problem_cards", label: "Problem cards" },
  { value: "proof_cards", label: "Proof cards" },
  { value: "logo_tiles", label: "Logo tiles" },
] as const

const CARD_GRID_COLUMNS_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
] as const

const CARD_GRID_TONE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "elevated", label: "Elevated" },
  { value: "muted", label: "Muted" },
  { value: "contrast", label: "Contrast" },
] as const

const BLOCK_LIST_MODE_OPTIONS = [
  { label: "Block", value: "block" },
  { label: "List", value: "list" },
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

  // ---- Section-level controls ----

  const globalCardDisplay = content.cardDisplay as Record<string, unknown> | undefined

  return (
    <Stack gap="sm">
      <Select
        label="Section variant"
        comboboxProps={{ withinPortal: false }}
        data={CARD_GRID_VARIANT_OPTIONS as unknown as { value: string; label: string }[]}
        value={asString(content.sectionVariant, "default")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, sectionVariant: v || "default" }))}
      />
      <SimpleGrid cols={2}>
        <Select
          label="Columns"
          comboboxProps={{ withinPortal: false }}
          data={CARD_GRID_COLUMNS_OPTIONS as unknown as { value: string; label: string }[]}
          value={String(content.columns ?? "")}
          onChange={(v: string) => onContentChange((c) => ({ ...c, columns: v ? Number(v) : undefined }))}
        />
        <Select
          label="Card tone"
          comboboxProps={{ withinPortal: false }}
          data={CARD_GRID_TONE_OPTIONS as unknown as { value: string; label: string }[]}
          value={asString(content.cardTone, "default")}
          onChange={(v: string) => onContentChange((c) => ({ ...c, cardTone: v || "default" }))}
        />
      </SimpleGrid>
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
            globalCardDisplay={globalCardDisplay}
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
    </Stack>
  )
}
