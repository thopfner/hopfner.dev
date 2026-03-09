"use client"

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
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
} from "../payload"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import type { ContentEditorProps } from "../types"

export function FaqListEditor({ content, onContentChange, onError }: ContentEditorProps) {
  const faqItems = asArray<Record<string, unknown>>(content.items)

  return (
    <Stack gap="sm">
      <TextInput
        label="Eyebrow"
        placeholder="e.g. Frequently Asked Questions"
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
              items: [...faqItems, { question: "", answerRichText: { type: "doc", content: [] } }],
            }))
          }
        >
          Add FAQ
        </Button>
      </Group>
      <Stack gap="xs">
        {faqItems.map((item, idx) => {
          const r = asRecord(item)
          return (
            <Paper key={idx} withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge size="sm" variant="default">
                    FAQ {idx + 1}
                  </Badge>
                  <ActionIcon
                    variant="default"
                    aria-label="Remove FAQ"
                    onClick={() =>
                      onContentChange((c) => ({
                        ...c,
                        items: faqItems.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
                <TextInput
                  label="Question"
                  value={asString(r.question)}
                  onChange={(e) => {
                    const next = faqItems.slice()
                    next[idx] = { ...r, question: inputValueFromEvent(e) }
                    onContentChange((c) => ({ ...c, items: next }))
                  }}
                />
                <TipTapJsonEditor
                  label="Answer"
                  value={asRecord(r.answerRichText)}
                  onChange={(nextJson) => {
                    const next = faqItems.slice()
                    next[idx] = { ...r, answerRichText: nextJson }
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
