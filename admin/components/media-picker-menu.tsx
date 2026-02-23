"use client"

import { useRef, useState } from "react"
import { ActionIcon, Button, Loader, Menu } from "@mantine/core"
import { IconChevronDown, IconPhoto, IconPhotoSearch, IconUpload } from "@tabler/icons-react"

type MediaPickerMenuProps = {
  disabled?: boolean
  label?: string
  iconTarget?: boolean
  withinPortal?: boolean
  onUploadFile: (file: File) => Promise<void>
  onChooseFromLibrary: () => void
  onError?: (message: string) => void
}

export function MediaPickerMenu({
  disabled,
  label = "Choose image",
  iconTarget = false,
  withinPortal = true,
  onUploadFile,
  onChooseFromLibrary,
  onError,
}: MediaPickerMenuProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handlePickFile(file: File | null) {
    if (!file) return
    try {
      setUploading(true)
      await onUploadFile(file)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed."
      onError?.(message)
    } finally {
      setUploading(false)
    }
  }

  const isDisabled = disabled || uploading

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0] ?? null
          e.currentTarget.value = ""
          void handlePickFile(file)
        }}
      />

      <Menu withinPortal={withinPortal} position="bottom-end" shadow="md" width={220}>
        <Menu.Target>
          {iconTarget ? (
            <ActionIcon variant="default" size="sm" aria-label={label} disabled={isDisabled}>
              {uploading ? <Loader size={14} /> : <IconPhoto size={16} />}
            </ActionIcon>
          ) : (
            <Button
              size="xs"
              variant="default"
              leftSection={uploading ? <Loader size={14} /> : <IconPhoto size={14} />}
              rightSection={<IconChevronDown size={14} />}
              disabled={isDisabled}
            >
              {label}
            </Button>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Choose image</Menu.Label>
          <Menu.Item
            leftSection={<IconUpload size={14} />}
            onClick={() => fileRef.current?.click()}
            disabled={isDisabled}
          >
            Upload new
          </Menu.Item>
          <Menu.Item
            leftSection={<IconPhotoSearch size={14} />}
            onClick={onChooseFromLibrary}
            disabled={isDisabled}
          >
            Choose from library
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
