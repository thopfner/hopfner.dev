"use client"

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  inputValueFromEvent,
  emptyRichTextDoc,
  richTextWithFallback,
} from "../payload"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import type { ContentEditorProps } from "../types"

const TITLE_BODY_LIST_LAYOUT_OPTIONS = [
  { value: "accordion", label: "Accordion (default)" },
  { value: "stacked", label: "Stacked list" },
  { value: "two_column", label: "Two-column grid" },
  { value: "cards", label: "Cards" },
] as const

export function TitleBodyListEditor({ content, onContentChange, onError }: ContentEditorProps) {
  const workflowItems = asArray<Record<string, unknown>>(content.items)

  return (
    <Stack gap="sm">
      <Select
        label="Layout variant"
        comboboxProps={{ withinPortal: false }}
        data={TITLE_BODY_LIST_LAYOUT_OPTIONS as unknown as { value: string; label: string }[]}
        value={asString(content.layoutVariant, "accordion")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, layoutVariant: v || "accordion" }))}
      />
      <TextInput
        label="Section eyebrow"
        placeholder="e.g. Who It's For"
        value={asString(content.eyebrow)}
        onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))}
      />
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          Items
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            onContentChange((c) => ({
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
                      onContentChange((c) => ({
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
                    next[idx] = { ...r, title: inputValueFromEvent(e) }
                    onContentChange((c) => ({ ...c, items: next }))
                  }}
                />
                <TipTapJsonEditor
                  label="Body"
                  value={richTextWithFallback(r.bodyRichText, r.body)}
                  onChange={(nextJson) => {
                    const next = workflowItems.slice()
                    next[idx] = { ...r, bodyRichText: nextJson }
                    onContentChange((c) => ({ ...c, items: next }))
                  }}
                  onError={onError}
                />
              </Stack>
            </Paper>
          )
        })}
      </Stack>
    </Stack>
  )
}
