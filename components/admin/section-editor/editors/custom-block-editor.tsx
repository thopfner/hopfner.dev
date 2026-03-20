"use client"

import React, { useCallback, useMemo } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@/components/mui-compat"
import { IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  asStringArray,
  inputValueFromEvent,
  richTextWithFallback,
  richTextDocToPlainText,
} from "../payload"
import { ListEditor } from "../fields/list-editor"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import { LinkMenuField } from "../fields/link-menu-field"
import { ImageFieldPicker } from "@/components/image-field-picker"
import { useBufferedField } from "../hooks/use-buffered-field"
import type { ComposerBlock, LinkMenuResourceProps } from "../types"
import {
  getComposerBlockCtaEnabled,
} from "@/lib/cms/cta-visibility"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const COMPOSER_LIST_STYLE_OPTIONS = [
  { label: "Steps", value: "steps" },
  { label: "Basic list", value: "basic" },
] as const

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type CustomBlockEditorProps = {
  block: ComposerBlock
  blockOverride: Record<string, unknown>
  rowIndex: number
  columnIndex: number
  setCustomBlockPatch: (blockId: string, patch: Record<string, unknown>) => void
  applyCustomBlockImageUrl: (blockId: string, url: string) => void
  onOpenCustomImageLibrary: (blockId: string) => void
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string }>
  onError: (message: string) => void
  loading: boolean
  linkMenuProps: LinkMenuResourceProps
}

// ---------------------------------------------------------------------------
// Buffered text field helpers — thin wrappers around useBufferedField for the
// most common single-field patterns (heading title, subtitle body, etc.)
// ---------------------------------------------------------------------------

function BufferedTextInput({
  label,
  value,
  onCommit,
  placeholder,
}: {
  label: string
  value: string
  onCommit: (v: string) => void
  placeholder?: string
}) {
  const field = useBufferedField(value, onCommit, 300)
  return (
    <TextInput
      label={label}
      value={field.value}
      onChange={(e) => field.onChange(inputValueFromEvent(e))}
      onBlur={field.onBlur}
      placeholder={placeholder}
    />
  )
}

function BufferedTextarea({
  label,
  value,
  onCommit,
  minRows = 2,
  placeholder,
}: {
  label: string
  value: string
  onCommit: (v: string) => void
  minRows?: number
  placeholder?: string
}) {
  const field = useBufferedField(value, onCommit, 300)
  return (
    <Textarea
      label={label}
      value={field.value}
      onChange={(e) => field.onChange(inputValueFromEvent(e))}
      onBlur={field.onBlur}
      autosize
      minRows={minRows}
      placeholder={placeholder}
    />
  )
}

// ---------------------------------------------------------------------------
// Block type sub-renderers
// ---------------------------------------------------------------------------

function HeadingBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const commit = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { title: v }),
    [block.id, setCustomBlockPatch]
  )
  return <BufferedTextInput label="Heading" value={asString(merged.title)} onCommit={commit} />
}

function SubtitleBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const commit = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { body: v }),
    [block.id, setCustomBlockPatch]
  )
  return <BufferedTextarea label="Subtitle" value={asString(merged.body)} onCommit={commit} />
}

function RichTextBlock({
  block,
  merged,
  setCustomBlockPatch,
  onError,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
  onError: (message: string) => void
}) {
  return (
    <TipTapJsonEditor
      label="Body"
      value={richTextWithFallback((merged as Record<string, unknown>).bodyRichText, merged.body)}
      onChange={(nextJson) =>
        setCustomBlockPatch(block.id, {
          bodyRichText: nextJson,
          body: richTextDocToPlainText(nextJson),
        })
      }
      onError={onError}
    />
  )
}

function ImageBlock({
  block,
  merged,
  imageUrl,
  setCustomBlockPatch,
  applyCustomBlockImageUrl,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
  loading,
  onError,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  imageUrl: string
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
  applyCustomBlockImageUrl: CustomBlockEditorProps["applyCustomBlockImageUrl"]
  onOpenCustomImageLibrary: CustomBlockEditorProps["onOpenCustomImageLibrary"]
  uploadToCmsMedia: CustomBlockEditorProps["uploadToCmsMedia"]
  loading: boolean
  onError: (message: string) => void
}) {
  const commitAlt = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { title: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
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
      onChooseFromLibrary={() => onOpenCustomImageLibrary(block.id)}
      disabled={loading}
      onError={onError}
      withinPortal={false}
      compact
      advancedUrl
    >
      <BufferedTextInput label="Alt text" value={asString(merged.title)} onCommit={commitAlt} />
    </ImageFieldPicker>
  )
}

function CardsBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const cards = asArray<Record<string, unknown>>(merged.cards)
  return (
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
                  next[cardIndex] = { ...cardRecord, title: inputValueFromEvent(e) }
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
  )
}

function FaqBlock({
  block,
  merged,
  setCustomBlockPatch,
  onError,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
  onError: (message: string) => void
}) {
  const faqs = asArray<Record<string, unknown>>(merged.faqs)
  return (
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
                  next[faqIndex] = { ...faqRecord, q: inputValueFromEvent(e) }
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
                onError={onError}
              />
            </Stack>
          </Paper>
        )
      })}
      {!faqs.length ? <Text c="dimmed" size="sm">No FAQs.</Text> : null}
    </Stack>
  )
}

function ListBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const listStyle = asString(merged.listStyle) === "basic" ? "basic" : "steps"
  const listItems = asStringArray(merged.items)
  const listSteps = asArray<Record<string, unknown>>(merged.steps)
  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        value={listStyle}
        data={COMPOSER_LIST_STYLE_OPTIONS as unknown as { label: string; value: string }[]}
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
                      next[stepIndex] = { ...stepRecord, title: inputValueFromEvent(e) }
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
  )
}

function CtaBlock({
  block,
  merged,
  setCustomBlockPatch,
  linkMenuProps,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
  linkMenuProps: LinkMenuResourceProps
}) {
  const priEnabled = getComposerBlockCtaEnabled(merged, "ctaPrimary")
  const secEnabled = getComposerBlockCtaEnabled(merged, "ctaSecondary")

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      <Group gap="xs" style={{ gridColumn: "1 / -1" }}>
        <Checkbox
          label="Show primary CTA"
          checked={priEnabled}
          onChange={(e) => setCustomBlockPatch(block.id, { ctaPrimaryEnabled: e.currentTarget.checked })}
        />
      </Group>
      <TextInput
        label="Primary CTA label"
        value={asString(merged.ctaPrimaryLabel)}
        onChange={(e) => setCustomBlockPatch(block.id, { ctaPrimaryLabel: inputValueFromEvent(e) })}
        disabled={!priEnabled}
      />
      <LinkMenuField
        label="Primary CTA link"
        value={asString(merged.ctaPrimaryHref)}
        onChange={(nextHref) => setCustomBlockPatch(block.id, { ctaPrimaryHref: nextHref })}
        currentPageId={linkMenuProps.currentPageId}
        pages={linkMenuProps.pages}
        pagesLoading={linkMenuProps.pagesLoading}
        anchorsByPageId={linkMenuProps.anchorsByPageId}
        anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
        ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
        ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
        disabled={!priEnabled}
      />
      <Group gap="xs" style={{ gridColumn: "1 / -1" }}>
        <Checkbox
          label="Show secondary CTA"
          checked={secEnabled}
          onChange={(e) => setCustomBlockPatch(block.id, { ctaSecondaryEnabled: e.currentTarget.checked })}
        />
      </Group>
      <TextInput
        label="Secondary CTA label"
        value={asString(merged.ctaSecondaryLabel)}
        onChange={(e) => setCustomBlockPatch(block.id, { ctaSecondaryLabel: inputValueFromEvent(e) })}
        disabled={!secEnabled}
      />
      <LinkMenuField
        label="Secondary CTA link"
        value={asString(merged.ctaSecondaryHref)}
        onChange={(nextHref) => setCustomBlockPatch(block.id, { ctaSecondaryHref: nextHref })}
        currentPageId={linkMenuProps.currentPageId}
        pages={linkMenuProps.pages}
        pagesLoading={linkMenuProps.pagesLoading}
        anchorsByPageId={linkMenuProps.anchorsByPageId}
        anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
        ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
        ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
        disabled={!secEnabled}
      />
    </SimpleGrid>
  )
}

function LogoStripBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const logos = asArray<Record<string, unknown>>(merged.logos)
  const commitTitle = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { title: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
    <Stack gap="xs">
      <BufferedTextInput
        label="Title"
        value={asString(merged.title)}
        onCommit={commitTitle}
        placeholder="Optional title"
      />
      <Group justify="space-between">
        <Text size="sm" fw={600}>Logos</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            setCustomBlockPatch(block.id, {
              logos: [...logos, { label: "", imageUrl: "" }],
            })
          }
        >
          Add logo
        </Button>
      </Group>
      {logos.map((logo, logoIndex) => {
        const logoRecord = asRecord(logo)
        return (
          <Paper key={`${block.id}-logo-${logoIndex}`} withBorder p="sm" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge size="sm" variant="default">Logo {logoIndex + 1}</Badge>
                <ActionIcon
                  variant="default"
                  aria-label="Remove logo"
                  onClick={() =>
                    setCustomBlockPatch(block.id, {
                      logos: logos.filter((_, i) => i !== logoIndex),
                    })
                  }
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Label"
                value={asString(logoRecord.label)}
                onChange={(e) => {
                  const next = logos.slice()
                  next[logoIndex] = { ...logoRecord, label: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { logos: next })
                }}
              />
              <TextInput
                label="Image URL"
                value={asString(logoRecord.imageUrl)}
                onChange={(e) => {
                  const next = logos.slice()
                  next[logoIndex] = { ...logoRecord, imageUrl: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { logos: next })
                }}
              />
            </Stack>
          </Paper>
        )
      })}
      {!logos.length ? <Text c="dimmed" size="sm">No logos.</Text> : null}
    </Stack>
  )
}

function MetricsRowBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const metrics = asArray<Record<string, unknown>>(merged.metrics)
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={600}>Metrics</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            setCustomBlockPatch(block.id, {
              metrics: [...metrics, { value: "", label: "" }],
            })
          }
        >
          Add metric
        </Button>
      </Group>
      {metrics.map((metric, metricIndex) => {
        const metricRecord = asRecord(metric)
        return (
          <Paper key={`${block.id}-metric-${metricIndex}`} withBorder p="sm" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge size="sm" variant="default">Metric {metricIndex + 1}</Badge>
                <ActionIcon
                  variant="default"
                  aria-label="Remove metric"
                  onClick={() =>
                    setCustomBlockPatch(block.id, {
                      metrics: metrics.filter((_, i) => i !== metricIndex),
                    })
                  }
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Value"
                value={asString(metricRecord.value)}
                onChange={(e) => {
                  const next = metrics.slice()
                  next[metricIndex] = { ...metricRecord, value: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { metrics: next })
                }}
              />
              <TextInput
                label="Label"
                value={asString(metricRecord.label)}
                onChange={(e) => {
                  const next = metrics.slice()
                  next[metricIndex] = { ...metricRecord, label: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { metrics: next })
                }}
              />
              <TextInput
                label="Icon"
                value={asString(metricRecord.icon)}
                onChange={(e) => {
                  const next = metrics.slice()
                  next[metricIndex] = { ...metricRecord, icon: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { metrics: next })
                }}
                placeholder="Optional icon name"
              />
            </Stack>
          </Paper>
        )
      })}
      {!metrics.length ? <Text c="dimmed" size="sm">No metrics.</Text> : null}
    </Stack>
  )
}

function BadgeGroupBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const badges = asArray<Record<string, unknown>>(merged.badges)
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={600}>Badges</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            setCustomBlockPatch(block.id, {
              badges: [...badges, { text: "" }],
            })
          }
        >
          Add badge
        </Button>
      </Group>
      {badges.map((badge, badgeIndex) => {
        const badgeRecord = asRecord(badge)
        return (
          <Paper key={`${block.id}-badge-${badgeIndex}`} withBorder p="sm" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge size="sm" variant="default">Badge {badgeIndex + 1}</Badge>
                <ActionIcon
                  variant="default"
                  aria-label="Remove badge"
                  onClick={() =>
                    setCustomBlockPatch(block.id, {
                      badges: badges.filter((_, i) => i !== badgeIndex),
                    })
                  }
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Text"
                value={asString(badgeRecord.text)}
                onChange={(e) => {
                  const next = badges.slice()
                  next[badgeIndex] = { ...badgeRecord, text: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { badges: next })
                }}
              />
              <TextInput
                label="Icon"
                value={asString(badgeRecord.icon)}
                onChange={(e) => {
                  const next = badges.slice()
                  next[badgeIndex] = { ...badgeRecord, icon: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { badges: next })
                }}
                placeholder="Optional icon name"
              />
            </Stack>
          </Paper>
        )
      })}
      {!badges.length ? <Text c="dimmed" size="sm">No badges.</Text> : null}
    </Stack>
  )
}

function ProofCardBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const stats = asArray<Record<string, unknown>>(merged.stats)
  const commitTitle = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { title: v }),
    [block.id, setCustomBlockPatch]
  )
  const commitBody = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { body: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
    <Stack gap="xs">
      <BufferedTextInput label="Title" value={asString(merged.title)} onCommit={commitTitle} />
      <BufferedTextarea label="Body" value={asString(merged.body)} onCommit={commitBody} />
      <Group justify="space-between">
        <Text size="sm" fw={600}>Stats</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            setCustomBlockPatch(block.id, {
              stats: [...stats, { value: "", label: "" }],
            })
          }
        >
          Add stat
        </Button>
      </Group>
      {stats.map((stat, statIndex) => {
        const statRecord = asRecord(stat)
        return (
          <Paper key={`${block.id}-stat-${statIndex}`} withBorder p="sm" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge size="sm" variant="default">Stat {statIndex + 1}</Badge>
                <ActionIcon
                  variant="default"
                  aria-label="Remove stat"
                  onClick={() =>
                    setCustomBlockPatch(block.id, {
                      stats: stats.filter((_, i) => i !== statIndex),
                    })
                  }
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Value"
                value={asString(statRecord.value)}
                onChange={(e) => {
                  const next = stats.slice()
                  next[statIndex] = { ...statRecord, value: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { stats: next })
                }}
              />
              <TextInput
                label="Label"
                value={asString(statRecord.label)}
                onChange={(e) => {
                  const next = stats.slice()
                  next[statIndex] = { ...statRecord, label: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { stats: next })
                }}
              />
            </Stack>
          </Paper>
        )
      })}
      {!stats.length ? <Text c="dimmed" size="sm">No stats.</Text> : null}
    </Stack>
  )
}

function TestimonialBlock({
  block,
  merged,
  imageUrl,
  setCustomBlockPatch,
  applyCustomBlockImageUrl,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
  loading,
  onError,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  imageUrl: string
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
  applyCustomBlockImageUrl: CustomBlockEditorProps["applyCustomBlockImageUrl"]
  onOpenCustomImageLibrary: CustomBlockEditorProps["onOpenCustomImageLibrary"]
  uploadToCmsMedia: CustomBlockEditorProps["uploadToCmsMedia"]
  loading: boolean
  onError: (message: string) => void
}) {
  const commitQuote = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { quote: v }),
    [block.id, setCustomBlockPatch]
  )
  const commitAuthor = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { author: v }),
    [block.id, setCustomBlockPatch]
  )
  const commitRole = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { role: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
    <ImageFieldPicker
      title="Avatar"
      value={imageUrl}
      urlLabel="Image URL"
      onChange={(nextUrl) => applyCustomBlockImageUrl(block.id, nextUrl)}
      onRemove={() => applyCustomBlockImageUrl(block.id, "")}
      onUploadFile={async (file) => {
        const { publicUrl } = await uploadToCmsMedia(file)
        applyCustomBlockImageUrl(block.id, publicUrl)
      }}
      onChooseFromLibrary={() => onOpenCustomImageLibrary(block.id)}
      disabled={loading}
      onError={onError}
      withinPortal={false}
      compact
      advancedUrl
    >
      <BufferedTextarea label="Quote" value={asString(merged.quote)} onCommit={commitQuote} />
      <BufferedTextInput label="Author" value={asString(merged.author)} onCommit={commitAuthor} />
      <BufferedTextInput label="Role" value={asString(merged.role)} onCommit={commitRole} />
    </ImageFieldPicker>
  )
}

function MediaPanelBlock({
  block,
  merged,
  imageUrl,
  setCustomBlockPatch,
  applyCustomBlockImageUrl,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
  loading,
  onError,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  imageUrl: string
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
  applyCustomBlockImageUrl: CustomBlockEditorProps["applyCustomBlockImageUrl"]
  onOpenCustomImageLibrary: CustomBlockEditorProps["onOpenCustomImageLibrary"]
  uploadToCmsMedia: CustomBlockEditorProps["uploadToCmsMedia"]
  loading: boolean
  onError: (message: string) => void
}) {
  const commitTitle = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { title: v }),
    [block.id, setCustomBlockPatch]
  )
  const commitBody = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { body: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
    <ImageFieldPicker
      title="Media"
      value={imageUrl}
      urlLabel="Image URL"
      onChange={(nextUrl) => applyCustomBlockImageUrl(block.id, nextUrl)}
      onRemove={() => applyCustomBlockImageUrl(block.id, "")}
      onUploadFile={async (file) => {
        const { publicUrl } = await uploadToCmsMedia(file)
        applyCustomBlockImageUrl(block.id, publicUrl)
      }}
      onChooseFromLibrary={() => onOpenCustomImageLibrary(block.id)}
      disabled={loading}
      onError={onError}
      withinPortal={false}
      compact
      advancedUrl
    >
      <BufferedTextInput label="Title" value={asString(merged.title)} onCommit={commitTitle} />
      <BufferedTextarea label="Body" value={asString(merged.body)} onCommit={commitBody} />
    </ImageFieldPicker>
  )
}

function WorkflowDiagramBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const flowSteps = asArray<Record<string, unknown>>(merged.flowSteps)
  const commitTitle = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { title: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
    <Stack gap="xs">
      <BufferedTextInput
        label="Title"
        value={asString(merged.title)}
        onCommit={commitTitle}
        placeholder="Optional title"
      />
      <Group justify="space-between">
        <Text size="sm" fw={600}>Flow Steps</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            setCustomBlockPatch(block.id, {
              flowSteps: [...flowSteps, { label: "", description: "" }],
            })
          }
        >
          Add step
        </Button>
      </Group>
      {flowSteps.map((step, stepIndex) => {
        const stepRecord = asRecord(step)
        return (
          <Paper key={`${block.id}-flowstep-${stepIndex}`} withBorder p="sm" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge size="sm" variant="default">Step {stepIndex + 1}</Badge>
                <ActionIcon
                  variant="default"
                  aria-label="Remove step"
                  onClick={() =>
                    setCustomBlockPatch(block.id, {
                      flowSteps: flowSteps.filter((_, i) => i !== stepIndex),
                    })
                  }
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Label"
                value={asString(stepRecord.label)}
                onChange={(e) => {
                  const next = flowSteps.slice()
                  next[stepIndex] = { ...stepRecord, label: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { flowSteps: next })
                }}
              />
              <Textarea
                label="Description"
                value={asString(stepRecord.description)}
                onChange={(e) => {
                  const next = flowSteps.slice()
                  next[stepIndex] = { ...stepRecord, description: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { flowSteps: next })
                }}
                autosize
                minRows={2}
                placeholder="Optional description"
              />
            </Stack>
          </Paper>
        )
      })}
      {!flowSteps.length ? <Text c="dimmed" size="sm">No flow steps.</Text> : null}
    </Stack>
  )
}

function ComparisonBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const beforeItems = asStringArray(merged.beforeItems)
  const afterItems = asStringArray(merged.afterItems)
  const commitBeforeLabel = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { beforeLabel: v }),
    [block.id, setCustomBlockPatch]
  )
  const commitAfterLabel = useCallback(
    (v: string) => setCustomBlockPatch(block.id, { afterLabel: v }),
    [block.id, setCustomBlockPatch]
  )
  return (
    <Stack gap="xs">
      <BufferedTextInput label="Before label" value={asString(merged.beforeLabel)} onCommit={commitBeforeLabel} />
      <BufferedTextInput label="After label" value={asString(merged.afterLabel)} onCommit={commitAfterLabel} />
      <ListEditor
        label="Before items"
        items={beforeItems}
        onChange={(next) => setCustomBlockPatch(block.id, { beforeItems: next })}
        placeholder="Before item"
      />
      <ListEditor
        label="After items"
        items={afterItems}
        onChange={(next) => setCustomBlockPatch(block.id, { afterItems: next })}
        placeholder="After item"
      />
    </Stack>
  )
}

function StatChipRowBlock({
  block,
  merged,
  setCustomBlockPatch,
}: {
  block: ComposerBlock
  merged: Record<string, unknown>
  setCustomBlockPatch: CustomBlockEditorProps["setCustomBlockPatch"]
}) {
  const statChips = asArray<Record<string, unknown>>(merged.stats)
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={600}>Stats</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            setCustomBlockPatch(block.id, {
              stats: [...statChips, { value: "", label: "" }],
            })
          }
        >
          Add stat
        </Button>
      </Group>
      {statChips.map((stat, statIndex) => {
        const statRecord = asRecord(stat)
        return (
          <Paper key={`${block.id}-statchip-${statIndex}`} withBorder p="sm" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge size="sm" variant="default">Stat {statIndex + 1}</Badge>
                <ActionIcon
                  variant="default"
                  aria-label="Remove stat"
                  onClick={() =>
                    setCustomBlockPatch(block.id, {
                      stats: statChips.filter((_, i) => i !== statIndex),
                    })
                  }
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Value"
                value={asString(statRecord.value)}
                onChange={(e) => {
                  const next = statChips.slice()
                  next[statIndex] = { ...statRecord, value: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { stats: next })
                }}
              />
              <TextInput
                label="Label"
                value={asString(statRecord.label)}
                onChange={(e) => {
                  const next = statChips.slice()
                  next[statIndex] = { ...statRecord, label: inputValueFromEvent(e) }
                  setCustomBlockPatch(block.id, { stats: next })
                }}
              />
            </Stack>
          </Paper>
        )
      })}
      {!statChips.length ? <Text c="dimmed" size="sm">No stats.</Text> : null}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Main block editor component
// ---------------------------------------------------------------------------

function CustomBlockEditorInner({
  block,
  blockOverride,
  rowIndex,
  columnIndex,
  setCustomBlockPatch,
  applyCustomBlockImageUrl,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
  onError,
  loading,
  linkMenuProps,
}: CustomBlockEditorProps) {
  // Merge block schema defaults with per-block overrides. Memoized so that
  // siblings whose blockOverride didn't change skip re-render via React.memo.
  const merged = useMemo<Record<string, unknown>>(
    () => ({ ...block, ...blockOverride }),
    [block, blockOverride]
  )
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
          <HeadingBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "subtitle" ? (
          <SubtitleBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "rich_text" ? (
          <RichTextBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} onError={onError} />
        ) : null}

        {block.type === "image" ? (
          <ImageBlock
            block={block}
            merged={merged}
            imageUrl={imageUrl}
            setCustomBlockPatch={setCustomBlockPatch}
            applyCustomBlockImageUrl={applyCustomBlockImageUrl}
            onOpenCustomImageLibrary={onOpenCustomImageLibrary}
            uploadToCmsMedia={uploadToCmsMedia}
            loading={loading}
            onError={onError}
          />
        ) : null}

        {block.type === "cards" ? (
          <CardsBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "faq" ? (
          <FaqBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} onError={onError} />
        ) : null}

        {block.type === "list" ? (
          <ListBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "cta" ? (
          <CtaBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} linkMenuProps={linkMenuProps} />
        ) : null}

        {block.type === "logo_strip" ? (
          <LogoStripBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "metrics_row" ? (
          <MetricsRowBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "badge_group" ? (
          <BadgeGroupBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "proof_card" ? (
          <ProofCardBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "testimonial" ? (
          <TestimonialBlock
            block={block}
            merged={merged}
            imageUrl={imageUrl}
            setCustomBlockPatch={setCustomBlockPatch}
            applyCustomBlockImageUrl={applyCustomBlockImageUrl}
            onOpenCustomImageLibrary={onOpenCustomImageLibrary}
            uploadToCmsMedia={uploadToCmsMedia}
            loading={loading}
            onError={onError}
          />
        ) : null}

        {block.type === "media_panel" ? (
          <MediaPanelBlock
            block={block}
            merged={merged}
            imageUrl={imageUrl}
            setCustomBlockPatch={setCustomBlockPatch}
            applyCustomBlockImageUrl={applyCustomBlockImageUrl}
            onOpenCustomImageLibrary={onOpenCustomImageLibrary}
            uploadToCmsMedia={uploadToCmsMedia}
            loading={loading}
            onError={onError}
          />
        ) : null}

        {block.type === "workflow_diagram" ? (
          <WorkflowDiagramBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "comparison" ? (
          <ComparisonBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

        {block.type === "stat_chip_row" ? (
          <StatChipRowBlock block={block} merged={merged} setCustomBlockPatch={setCustomBlockPatch} />
        ) : null}

      </Stack>
    </Paper>
  )
}

export const CustomBlockEditor = React.memo(CustomBlockEditorInner)
