"use client"

import {
  ActionIcon,
  Badge,
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
import { IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  inputValueFromEvent,
} from "../payload"
import type { ContentEditorProps } from "../types"

const LABEL_VALUE_LIST_LAYOUT_OPTIONS = [
  { value: "default", label: "Default (label/value tiles)" },
  { value: "metrics_grid", label: "Metrics grid" },
  { value: "trust_strip", label: "Trust strip (compact horizontal)" },
  { value: "tool_badges", label: "Tool badges" },
  { value: "logo_row", label: "Logo row" },
] as const

export function LabelValueListEditor({ content, onContentChange }: ContentEditorProps) {
  const techItems = asArray<Record<string, unknown>>(content.items)

  return (
    <Stack gap="sm">
      {/* --- Content first --- */}
      <TextInput
        label="Section eyebrow"
        placeholder="e.g. Trusted By"
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
              items: [...techItems, { label: "", value: "" }],
            }))
          }
        >
          Add item
        </Button>
      </Group>
      <Stack gap="xs">
        {techItems.map((item, idx) => {
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
                        items: techItems.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
                <SimpleGrid cols={2}>
                  <TextInput
                    label="Label"
                    value={asString(r.label)}
                    onChange={(e) => {
                      const next = techItems.slice()
                      next[idx] = { ...r, label: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, items: next }))
                    }}
                  />
                  <TextInput
                    label="Value"
                    value={asString(r.value)}
                    onChange={(e) => {
                      const next = techItems.slice()
                      next[idx] = { ...r, value: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, items: next }))
                    }}
                  />
                </SimpleGrid>
                <SimpleGrid cols={2}>
                  <TextInput
                    label="Icon"
                    placeholder="emoji or symbol"
                    value={asString(r.icon)}
                    onChange={(e) => {
                      const next = techItems.slice()
                      next[idx] = { ...r, icon: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, items: next }))
                    }}
                  />
                  <TextInput
                    label="Image URL"
                    placeholder="logo or badge URL"
                    value={asString(r.imageUrl)}
                    onChange={(e) => {
                      const next = techItems.slice()
                      next[idx] = { ...r, imageUrl: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, items: next }))
                    }}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>
          )
        })}
      </Stack>

      {/* --- Layout & display last --- */}
      <Divider />
      <Text size="xs" c="dimmed" fw={500}>Layout & display</Text>
      <Select
        label="Layout variant"
        comboboxProps={{ withinPortal: false }}
        data={LABEL_VALUE_LIST_LAYOUT_OPTIONS as unknown as { value: string; label: string }[]}
        value={asString(content.layoutVariant, "default")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, layoutVariant: v || "default" }))}
      />
      <Checkbox
        label="Compact mode"
        checked={content.compact === true}
        onChange={(e) => onContentChange((c) => ({ ...c, compact: e.currentTarget.checked }))}
      />
    </Stack>
  )
}
