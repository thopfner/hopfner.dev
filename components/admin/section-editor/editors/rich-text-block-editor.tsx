"use client"

import { Stack, TextInput } from "@/components/mui-compat"
import { asString, asRecord, inputValueFromEvent } from "../payload"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import type { ContentEditorProps } from "../types"

export function RichTextBlockEditor({ content, onContentChange, onError }: ContentEditorProps) {
  return (
    <Stack gap="sm">
      <TextInput
        label="Eyebrow"
        placeholder="e.g. About Us"
        value={asString(content.eyebrow)}
        onChange={(e) => onContentChange((c) => ({ ...c, eyebrow: inputValueFromEvent(e) }))}
      />
      <TipTapJsonEditor
        label="Body"
        value={asRecord(content.bodyRichText)}
        onChange={(next) => onContentChange((c) => ({ ...c, bodyRichText: next }))}
        onError={onError}
      />
    </Stack>
  )
}
