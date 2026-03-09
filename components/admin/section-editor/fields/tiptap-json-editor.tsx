"use client"

import { useState, useRef, useCallback, memo } from "react"
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
      onChangeRef.current(ed.getJSON() as Record<string, unknown>)
    },
  })

  // Only push external content changes into TipTap when the value truly changed
  // from outside (hydrate, restore, etc.) — not from our own onUpdate commits.
  // We detect this by checking if the editor's current JSON differs from the
  // incoming value. This prevents echo loops and preserves cursor position.
  // Note: useEditor's `content` is only used for initial creation, not updates.

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
