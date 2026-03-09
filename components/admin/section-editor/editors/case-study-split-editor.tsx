"use client"

import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  asStringArray,
  inputValueFromEvent,
  richTextWithFallback,
} from "../payload"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import type { ContentEditorProps } from "../types"

export function CaseStudySplitEditor({ content, onContentChange, onError }: ContentEditorProps) {
  return (
    <Stack gap="sm">
      <TextInput label="Eyebrow" value={asString(content.eyebrow)} onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))} />
      <TipTapJsonEditor
        label="Narrative"
        value={richTextWithFallback(content.narrativeRichText, content.narrative)}
        onChange={(next) => onContentChange((c) => ({ ...c, narrativeRichText: next }))}
        onError={onError}
      />
      <Group grow>
        <TextInput label="Before label" placeholder="Before" value={asString(content.beforeLabel)} onChange={(e) => onContentChange((c) => ({ ...c, beforeLabel: inputValueFromEvent(e) }))} />
        <TextInput label="After label" placeholder="After" value={asString(content.afterLabel)} onChange={(e) => onContentChange((c) => ({ ...c, afterLabel: inputValueFromEvent(e) }))} />
      </Group>
      <Text size="sm" fw={600}>Before items</Text>
      <Stack gap="xs">
        {asStringArray(content.beforeItems).map((item, idx) => (
          <Group key={idx}>
            <TextInput style={{ flex: 1 }} value={item} onChange={(e) => { const next = asStringArray(content.beforeItems).slice(); next[idx] = inputValueFromEvent(e); onContentChange((c) => ({ ...c, beforeItems: next })) }} />
            <ActionIcon variant="default" onClick={() => onContentChange((c) => ({ ...c, beforeItems: asStringArray(c.beforeItems).filter((_, i) => i !== idx) }))}><IconX size={16} /></ActionIcon>
          </Group>
        ))}
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
          onClick={() => onContentChange((c) => ({ ...c, beforeItems: [...asStringArray(c.beforeItems), ""] }))}
        >Add</Button>
      </Stack>
      <Text size="sm" fw={600}>After items</Text>
      <Stack gap="xs">
        {asStringArray(content.afterItems).map((item, idx) => (
          <Group key={idx}>
            <TextInput style={{ flex: 1 }} value={item} onChange={(e) => { const next = asStringArray(content.afterItems).slice(); next[idx] = inputValueFromEvent(e); onContentChange((c) => ({ ...c, afterItems: next })) }} />
            <ActionIcon variant="default" onClick={() => onContentChange((c) => ({ ...c, afterItems: asStringArray(c.afterItems).filter((_, i) => i !== idx) }))}><IconX size={16} /></ActionIcon>
          </Group>
        ))}
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
          onClick={() => onContentChange((c) => ({ ...c, afterItems: [...asStringArray(c.afterItems), ""] }))}
        >Add</Button>
      </Stack>
      <Text size="sm" fw={600}>Media</Text>
      <Group grow>
        <TextInput label="Media title" value={asString(content.mediaTitle)} onChange={(e) => onContentChange((c) => ({ ...c, mediaTitle: inputValueFromEvent(e) }))} />
        <TextInput label="Image URL" value={asString(content.mediaImageUrl)} onChange={(e) => onContentChange((c) => ({ ...c, mediaImageUrl: inputValueFromEvent(e) }))} />
      </Group>
      <Group justify="space-between">
        <Text size="sm" fw={600}>Stats</Text>
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
          onClick={() => onContentChange((c) => ({ ...c, stats: [...asArray<Record<string, unknown>>(c.stats), { value: "", label: "" }] }))}
        >Add stat</Button>
      </Group>
      <Stack gap="xs">
        {asArray<Record<string, unknown>>(content.stats).map((s, idx) => {
          const sr = asRecord(s)
          return (
            <Group key={idx}>
              <TextInput style={{ flex: 1 }} label="Value" value={asString(sr.value)} onChange={(e) => { const next = asArray<Record<string, unknown>>(content.stats).slice(); next[idx] = { ...sr, value: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, stats: next })) }} />
              <TextInput style={{ flex: 1 }} label="Label" value={asString(sr.label)} onChange={(e) => { const next = asArray<Record<string, unknown>>(content.stats).slice(); next[idx] = { ...sr, label: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, stats: next })) }} />
              <ActionIcon variant="default" mt={22} onClick={() => onContentChange((c) => ({ ...c, stats: asArray<Record<string, unknown>>(c.stats).filter((_, i) => i !== idx) }))}><IconX size={16} /></ActionIcon>
            </Group>
          )
        })}
      </Stack>
    </Stack>
  )
}
