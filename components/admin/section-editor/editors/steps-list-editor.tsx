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

const STEPS_LIST_LAYOUT_OPTIONS = [
  { value: "grid", label: "Grid (default)" },
  { value: "timeline", label: "Timeline" },
  { value: "connected_flow", label: "Connected flow" },
  { value: "workflow_visual", label: "Workflow visual" },
] as const

export function StepsListEditor({ content, onContentChange, onError }: ContentEditorProps) {
  const howSteps = asArray<Record<string, unknown>>(content.steps)

  return (
    <Stack gap="sm">
      <Select
        label="Layout variant"
        comboboxProps={{ withinPortal: false }}
        data={STEPS_LIST_LAYOUT_OPTIONS as unknown as { value: string; label: string }[]}
        value={asString(content.layoutVariant, "grid")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, layoutVariant: v || "grid" }))}
      />
      <TextInput
        label="Section eyebrow"
        placeholder="e.g. How It Works"
        value={asString(content.eyebrow)}
        onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))}
      />
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          Steps
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            onContentChange((c) => ({
              ...c,
              steps: [...howSteps, { title: "", body: "", bodyRichText: emptyRichTextDoc() }],
            }))
          }
        >
          Add step
        </Button>
      </Group>
      <Stack gap="xs">
        {howSteps.map((step, idx) => {
          const r = asRecord(step)
          return (
            <Paper key={idx} withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge size="sm" variant="default">
                    Step {idx + 1}
                  </Badge>
                  <ActionIcon
                    variant="default"
                    aria-label="Remove step"
                    onClick={() =>
                      onContentChange((c) => ({
                        ...c,
                        steps: howSteps.filter((_, i) => i !== idx),
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
                    const next = howSteps.slice()
                    next[idx] = { ...r, title: inputValueFromEvent(e) }
                    onContentChange((c) => ({ ...c, steps: next }))
                  }}
                />
                <TipTapJsonEditor
                  label="Body"
                  value={richTextWithFallback(r.bodyRichText, r.body)}
                  onChange={(nextJson) => {
                    const next = howSteps.slice()
                    next[idx] = { ...r, bodyRichText: nextJson }
                    onContentChange((c) => ({ ...c, steps: next }))
                  }}
                  onError={onError}
                />
                <Group grow>
                  <TextInput
                    label="Icon (emoji)"
                    placeholder="e.g. &#x1F50D;"
                    value={asString(r.icon)}
                    onChange={(e) => {
                      const next = howSteps.slice()
                      next[idx] = { ...r, icon: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, steps: next }))
                    }}
                  />
                  <TextInput
                    label="Stat"
                    placeholder="e.g. 3x"
                    value={asString(r.stat)}
                    onChange={(e) => {
                      const next = howSteps.slice()
                      next[idx] = { ...r, stat: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, steps: next }))
                    }}
                  />
                </Group>
              </Stack>
            </Paper>
          )
        })}
      </Stack>
    </Stack>
  )
}
