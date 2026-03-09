"use client"

import { useState, useRef, useCallback, useEffect, memo } from "react"
import {
  Group,
  Stack,
  Text,
} from "@/components/mui-compat"
import { RichTextEditor } from "@/components/rich-text-editor-compat"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { useEditor } from "@tiptap/react"
import { uploadMedia } from "@/lib/media/upload"
import { createClient } from "@/lib/supabase/browser"
import type { MediaItem } from "@/lib/media/types"
import { MediaLibraryModal } from "@/components/media-library-modal"
import { MediaPickerMenu } from "@/components/media-picker-menu"
import { getImageSize } from "../payload"

async function uploadToCmsMedia(file: File) {
  const supabase = createClient()
  const { bucket, path, url } = await uploadMedia(file)
  const publicUrl = url ?? ""
  if (!publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.")
  }

  const { width, height } = await getImageSize(file)

  const { error: mediaError } = await supabase.from("media").insert({
    bucket,
    path,
    mime_type: file.type,
    size_bytes: file.size,
    width: width ?? null,
    height: height ?? null,
    alt: null,
  })
  if (mediaError) {
    console.warn("Failed to insert media metadata:", mediaError.message)
  }

  return { publicUrl, bucket, path }
}

export const TipTapJsonEditor = memo(function TipTapJsonEditor({
  label,
  value,
  onChange,
  onError,
}: {
  label: string
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  onError?: (message: string) => void
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)

  // Keep a stable ref to onChange so the editor onUpdate closure doesn't go stale
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Track whether we're currently pushing external content into the editor
  // to prevent echo loops (external update → setContent → onUpdate → onChange)
  const suppressUpdateRef = useRef(false)

  // Track serialized JSON that the editor itself emitted via onUpdate, so the
  // external sync effect can distinguish "value came from my own typing" from
  // "value came from hydrate/restore/section switch".
  const lastEditorEmittedRef = useRef<string>("")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: false }),
    ],
    content: value,
    onUpdate({ editor: ed }) {
      if (suppressUpdateRef.current) return
      const json = ed.getJSON() as Record<string, unknown>
      lastEditorEmittedRef.current = JSON.stringify(json)
      onChangeRef.current(json)
    },
  })

  // Push external content changes (hydrate, restore, section switch) into the
  // TipTap instance. useEditor's `content` only runs on creation, so we need
  // this effect for subsequent value changes. Skip when the incoming value
  // matches what the editor itself last emitted (normal typing flow).
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const incomingJson = JSON.stringify(value)
    // Value originated from editor's own onUpdate — skip to avoid cursor reset
    if (incomingJson === lastEditorEmittedRef.current) return
    // Value already matches editor state (e.g. initial mount)
    const currentJson = JSON.stringify(editor.getJSON())
    if (incomingJson === currentJson) return
    // Truly external change — push into editor
    suppressUpdateRef.current = true
    editor.commands.setContent(value, { emitUpdate: false })
    suppressUpdateRef.current = false
  }, [editor, value])

  const onPickImage = useCallback(async (file: File) => {
    if (!editor) return
    const { publicUrl } = await uploadToCmsMedia(file)
    editor.chain().focus().setImage({ src: publicUrl }).run()
  }, [editor])

  const onPickFromLibrary = useCallback((item: MediaItem) => {
    if (!editor) return
    editor.chain().focus().setImage({ src: item.url }).run()
    setLibraryOpen(false)
  }, [editor])

  const openLibrary = useCallback(() => setLibraryOpen(true), [])
  const closeLibrary = useCallback(() => setLibraryOpen(false), [])

  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Group gap="xs">
          <MediaPickerMenu
            iconTarget
            label="Insert image"
            withinPortal={false}
            onUploadFile={onPickImage}
            onChooseFromLibrary={openLibrary}
            onError={onError}
          />
        </Group>
      </Group>

      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>

      <MediaLibraryModal
        opened={libraryOpen}
        onClose={closeLibrary}
        onSelect={onPickFromLibrary}
      />
    </Stack>
  )
})
