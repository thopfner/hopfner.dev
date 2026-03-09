"use client"

import {
  Select,
  Stack,
  TextInput,
} from "@/components/mui-compat"
import {
  asString,
  inputValueFromEvent,
  richTextWithFallback,
} from "../payload"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import type { ContentEditorProps } from "../types"

const CTA_BLOCK_LAYOUT_OPTIONS = [
  { value: "centered", label: "Centered (default)" },
  { value: "split", label: "Split (text left, CTAs right)" },
  { value: "compact", label: "Compact inline" },
  { value: "high_contrast", label: "High contrast" },
] as const

export function CtaBlockEditor({ content, onContentChange, onError }: ContentEditorProps) {
  return (
    <Stack gap="sm">
      <Select
        label="Layout variant"
        comboboxProps={{ withinPortal: false }}
        data={CTA_BLOCK_LAYOUT_OPTIONS as unknown as { value: string; label: string }[]}
        value={asString(content.layoutVariant, "centered")}
        onChange={(v: string) => onContentChange((c) => ({ ...c, layoutVariant: v || "centered" }))}
      />
      <TextInput
        label="Eyebrow"
        placeholder="e.g. Ready to start?"
        value={asString(content.eyebrow)}
        onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))}
      />
      <TipTapJsonEditor
        label="Body"
        value={richTextWithFallback(content.bodyRichText, content.body)}
        onChange={(next) => onContentChange((c) => ({ ...c, bodyRichText: next }))}
        onError={onError}
      />
    </Stack>
  )
}
