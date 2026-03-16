"use client"

/**
 * Media field for the visual editor — uses the existing CMS media stack.
 * Supports: choose from library, upload, URL paste, clear, thumbnail preview.
 */

import { useState, useCallback } from "react"
import { ImageFieldPicker } from "@/components/image-field-picker"
import { MediaLibraryModal } from "@/components/media-library-modal"
import { uploadMedia } from "@/lib/media/upload"

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
}

export function MediaField({ label, value, onChange }: Props) {
  const [mediaLibOpen, setMediaLibOpen] = useState(false)

  const handleUpload = useCallback(async (file: File) => {
    const result = await uploadMedia(file)
    if (result.url) onChange(result.url)
  }, [onChange])

  return (
    <>
      <ImageFieldPicker
        title={label}
        value={value}
        onChange={(url) => onChange(url)}
        onRemove={() => onChange("")}
        onUploadFile={handleUpload}
        onChooseFromLibrary={() => setMediaLibOpen(true)}
        compact
        showPreview
        previewHeight={60}
        titleSize="xs"
      />

      <MediaLibraryModal
        opened={mediaLibOpen}
        onClose={() => setMediaLibOpen(false)}
        onSelect={(item) => {
          if (item.url) onChange(item.url)
          setMediaLibOpen(false)
        }}
        title={`Choose ${label}`}
      />
    </>
  )
}
