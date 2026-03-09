"use client"

import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { MediaPickerMenu } from "@/components/media-picker-menu"
import { IconArrowDown, IconArrowUp, IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  inputValueFromEvent,
} from "../payload"
import type { ContentEditorProps } from "../types"

const SOCIAL_PROOF_LAYOUT_OPTIONS = [
  { value: "inline", label: "Inline (default)" },
  { value: "marquee", label: "Marquee / ticker" },
  { value: "grid", label: "Grid" },
] as const

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

type SocialProofStripEditorProps = ContentEditorProps & {
  onOpenLogoImageLibrary: (idx: number) => void
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string; bucket: string; path: string }>
}

export function SocialProofStripEditor({
  content,
  onContentChange,
  onError,
  onOpenLogoImageLibrary,
  uploadToCmsMedia,
}: SocialProofStripEditorProps) {
  const logos = asArray<Record<string, unknown>>(content.logos)
  const badges = asArray<Record<string, unknown>>(content.badges)

  function handleUploadLogoImage(idx: number) {
    return async (file: File) => {
      const { publicUrl } = await uploadToCmsMedia(file)
      const next = asArray<Record<string, unknown>>(content.logos).slice()
      const logo = asRecord(next[idx])
      next[idx] = { ...logo, imageUrl: publicUrl }
      onContentChange((c) => ({ ...c, logos: next }))
    }
  }

  return (
    <Stack gap="sm">
      {/* --- Content first --- */}
      <TextInput
        label="Eyebrow"
        placeholder="e.g. Trusted by"
        value={asString(content.eyebrow)}
        onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))}
      />
      <TextInput
        label="Trust note"
        placeholder="e.g. SOC 2 compliant"
        value={asString(content.trustNote)}
        onChange={(e) => onContentChange((c) => ({ ...c, trustNote: inputValueFromEvent(e) }))}
      />
      <Group justify="space-between">
        <Text size="sm" fw={600}>Logos</Text>
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
          onClick={() => onContentChange((c) => ({ ...c, logos: [...logos, { label: "", imageUrl: "", alt: "" }] }))}
        >Add logo</Button>
      </Group>
      <Stack gap="xs">
        {logos.map((logo, idx) => {
          const l = asRecord(logo)
          const imageUrl = asString(l.imageUrl)
          return (
            <Paper key={idx} withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap={4}>
                    <ActionIcon
                      variant="default"
                      size="sm"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => onContentChange((c) => ({ ...c, logos: moveItem(asArray<Record<string, unknown>>(c.logos), idx, idx - 1) }))}
                    >
                      <IconArrowUp size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      size="sm"
                      aria-label="Move down"
                      disabled={idx === logos.length - 1}
                      onClick={() => onContentChange((c) => ({ ...c, logos: moveItem(asArray<Record<string, unknown>>(c.logos), idx, idx + 1) }))}
                    >
                      <IconArrowDown size={14} />
                    </ActionIcon>
                    <Badge size="sm" variant="default">Logo {idx + 1}</Badge>
                  </Group>
                  <ActionIcon variant="default" aria-label="Remove" onClick={() => onContentChange((c) => ({ ...c, logos: asArray<Record<string, unknown>>(c.logos).filter((_, i) => i !== idx) }))}>
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
                <TextInput label="Label" value={asString(l.label)} onChange={(e) => { const next = logos.slice(); next[idx] = { ...l, label: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, logos: next })) }} />
                <Group gap="xs" align="end">
                  <TextInput
                    label="Image URL"
                    value={imageUrl}
                    onChange={(e) => { const next = logos.slice(); next[idx] = { ...l, imageUrl: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, logos: next })) }}
                    style={{ flex: 1 }}
                  />
                  <MediaPickerMenu
                    label="Choose image"
                    withinPortal={false}
                    onUploadFile={handleUploadLogoImage(idx)}
                    onChooseFromLibrary={() => onOpenLogoImageLibrary(idx)}
                    onError={onError}
                  />
                </Group>
                {imageUrl ? (
                  <Paper withBorder p={0} radius="sm" style={{ overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={asString(l.alt) || asString(l.label) || "Logo preview"}
                      style={{ display: "block", width: "100%", maxHeight: 80, objectFit: "contain", background: "#f5f5f5" }}
                    />
                  </Paper>
                ) : null}
                <TextInput label="Alt text" value={asString(l.alt)} onChange={(e) => { const next = logos.slice(); next[idx] = { ...l, alt: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, logos: next })) }} />
                <TextInput label="Link URL" placeholder="https://..." value={asString(l.href)} onChange={(e) => { const next = logos.slice(); next[idx] = { ...l, href: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, logos: next })) }} />
              </Stack>
            </Paper>
          )
        })}
      </Stack>
      <Group justify="space-between">
        <Text size="sm" fw={600}>Trust Badges</Text>
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />}
          onClick={() => onContentChange((c) => ({ ...c, badges: [...badges, { text: "", icon: "" }] }))}
        >Add badge</Button>
      </Group>
      <Stack gap="xs">
        {badges.map((badge, idx) => {
          const b = asRecord(badge)
          return (
            <Paper key={idx} withBorder p="xs" radius="md">
              <Group>
                <Group gap={4}>
                  <ActionIcon
                    variant="default"
                    size="sm"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => onContentChange((c) => ({ ...c, badges: moveItem(asArray<Record<string, unknown>>(c.badges), idx, idx - 1) }))}
                  >
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    size="sm"
                    aria-label="Move down"
                    disabled={idx === badges.length - 1}
                    onClick={() => onContentChange((c) => ({ ...c, badges: moveItem(asArray<Record<string, unknown>>(c.badges), idx, idx + 1) }))}
                  >
                    <IconArrowDown size={14} />
                  </ActionIcon>
                </Group>
                <TextInput style={{ flex: 1 }} label="Text" value={asString(b.text)} onChange={(e) => { const next = badges.slice(); next[idx] = { ...b, text: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, badges: next })) }} />
                <TextInput label="Icon" placeholder="emoji" style={{ width: 70 }} value={asString(b.icon)} onChange={(e) => { const next = badges.slice(); next[idx] = { ...b, icon: inputValueFromEvent(e) }; onContentChange((c) => ({ ...c, badges: next })) }} />
                <ActionIcon variant="default" aria-label="Remove" mt={22} onClick={() => onContentChange((c) => ({ ...c, badges: asArray<Record<string, unknown>>(c.badges).filter((_, i) => i !== idx) }))}>
                  <IconX size={16} />
                </ActionIcon>
              </Group>
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
        data={SOCIAL_PROOF_LAYOUT_OPTIONS as unknown as { value: string; label: string }[]}
        value={asString(content.layoutVariant, "inline")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, layoutVariant: v || "inline" }))}
      />
    </Stack>
  )
}
