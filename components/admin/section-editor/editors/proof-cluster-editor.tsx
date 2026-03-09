"use client"

import {
  ActionIcon,
  Button,
  Group,
  Paper,
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
  inputValueFromEvent,
} from "../payload"
import type { ContentEditorProps } from "../types"

export function ProofClusterEditor({ content, onContentChange }: ContentEditorProps) {
  return (
    <Stack gap="sm">
      <TextInput label="Eyebrow" value={asString(content.eyebrow)} onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))} />
      <Group justify="space-between">
        <Text size="sm" fw={600}>Metrics</Text>
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
          onClick={() => onContentChange((c) => ({ ...c, metrics: [...asArray<Record<string, unknown>>(c.metrics), { value: "", label: "", icon: "" }] }))}
        >Add metric</Button>
      </Group>
      <Stack gap="xs">
        {asArray<Record<string, unknown>>(content.metrics).map((m, idx) => {
          const r = asRecord(m)
          return (
            <Paper key={idx} withBorder p="xs" radius="md">
              <Group>
                <TextInput style={{ flex: 1 }} label="Value" placeholder="e.g. 10x" value={asString(r.value)} onChange={(e) => { const next = asArray<Record<string, unknown>>(content.metrics).slice(); next[idx] = { ...r, value: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, metrics: next })) }} />
                <TextInput style={{ flex: 1 }} label="Label" value={asString(r.label)} onChange={(e) => { const next = asArray<Record<string, unknown>>(content.metrics).slice(); next[idx] = { ...r, label: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, metrics: next })) }} />
                <TextInput label="Icon" placeholder="emoji" style={{ width: 60 }} value={asString(r.icon)} onChange={(e) => { const next = asArray<Record<string, unknown>>(content.metrics).slice(); next[idx] = { ...r, icon: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, metrics: next })) }} />
                <ActionIcon variant="default" aria-label="Remove" mt={22} onClick={() => onContentChange((c) => ({ ...c, metrics: asArray<Record<string, unknown>>(c.metrics).filter((_, i) => i !== idx) }))}>
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          )
        })}
      </Stack>
      <Text size="sm" fw={600}>Proof Card</Text>
      <Paper withBorder p="sm" radius="md">
        <Stack gap="xs">
          <TextInput label="Title" value={asString(asRecord(content.proofCard).title)} onChange={(e) => onContentChange((c) => ({ ...c, proofCard: { ...asRecord(c.proofCard), title: inputValueFromEvent(e) } }))} />
          <Textarea label="Body" autosize minRows={2} value={asString(asRecord(content.proofCard).body)} onChange={(e) => onContentChange((c) => ({ ...c, proofCard: { ...asRecord(c.proofCard), body: inputValueFromEvent(e) } }))} />
          <Group justify="space-between">
            <Text size="xs" fw={500}>Stats</Text>
            <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
              onClick={() => { const pc = asRecord(content.proofCard); onContentChange((c) => ({ ...c, proofCard: { ...pc, stats: [...asArray<Record<string, unknown>>(pc.stats), { value: "", label: "" }] } })) }}
            >Add</Button>
          </Group>
          {asArray<Record<string, unknown>>(asRecord(content.proofCard).stats).map((s, si) => {
            const sr = asRecord(s)
            return (
              <Group key={si}>
                <TextInput style={{ flex: 1 }} label="Value" value={asString(sr.value)} onChange={(e) => { const pc = asRecord(content.proofCard); const stats = asArray<Record<string, unknown>>(pc.stats).slice(); stats[si] = { ...sr, value: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, proofCard: { ...pc, stats } })) }} />
                <TextInput style={{ flex: 1 }} label="Label" value={asString(sr.label)} onChange={(e) => { const pc = asRecord(content.proofCard); const stats = asArray<Record<string, unknown>>(pc.stats).slice(); stats[si] = { ...sr, label: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, proofCard: { ...pc, stats } })) }} />
                <ActionIcon variant="default" mt={22} onClick={() => { const pc = asRecord(content.proofCard); onContentChange((c) => ({ ...c, proofCard: { ...pc, stats: asArray<Record<string, unknown>>(pc.stats).filter((_, i) => i !== si) } })) }}><IconX size={16} /></ActionIcon>
              </Group>
            )
          })}
        </Stack>
      </Paper>
      <Text size="sm" fw={600}>Testimonial</Text>
      <Paper withBorder p="sm" radius="md">
        <Stack gap="xs">
          <Textarea label="Quote" autosize minRows={2} value={asString(asRecord(content.testimonial).quote)} onChange={(e) => onContentChange((c) => ({ ...c, testimonial: { ...asRecord(c.testimonial), quote: inputValueFromEvent(e) } }))} />
          <Group grow>
            <TextInput label="Author" value={asString(asRecord(content.testimonial).author)} onChange={(e) => onContentChange((c) => ({ ...c, testimonial: { ...asRecord(c.testimonial), author: inputValueFromEvent(e) } }))} />
            <TextInput label="Role" value={asString(asRecord(content.testimonial).role)} onChange={(e) => onContentChange((c) => ({ ...c, testimonial: { ...asRecord(c.testimonial), role: inputValueFromEvent(e) } }))} />
          </Group>
          <TextInput label="Image URL" value={asString(asRecord(content.testimonial).imageUrl)} onChange={(e) => onContentChange((c) => ({ ...c, testimonial: { ...asRecord(c.testimonial), imageUrl: inputValueFromEvent(e) } }))} />
        </Stack>
      </Paper>
    </Stack>
  )
}
