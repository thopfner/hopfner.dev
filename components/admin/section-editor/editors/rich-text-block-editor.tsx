"use client"

import { asRecord } from "../payload"
import { TipTapJsonEditor } from "../fields/tiptap-json-editor"
import type { ContentEditorProps } from "../types"

export function RichTextBlockEditor({ content, onContentChange, onError }: ContentEditorProps) {
  return (
    <TipTapJsonEditor
      label="Body"
      value={asRecord(content.bodyRichText)}
      onChange={(next) => onContentChange((c) => ({ ...c, bodyRichText: next }))}
      onError={onError}
    />
  )
}
