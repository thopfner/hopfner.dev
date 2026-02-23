"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { Button, Collapse, Group, Paper, Stack, Text, TextInput } from "@mantine/core"
import { IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react"

import { MediaPickerMenu } from "@/components/media-picker-menu"

type ImageFieldPickerProps = {
  title: string
  value: string
  urlLabel?: string
  placeholder?: string
  removeLabel?: string
  disabled?: boolean
  withinPortal?: boolean
  compact?: boolean
  advancedUrl?: boolean
  showPreview?: boolean
  titleSize?: "xs" | "sm"
  previewHeight?: number
  onChange: (url: string) => void
  onRemove: () => void
  onUploadFile: (file: File) => Promise<void>
  onChooseFromLibrary: () => void
  onError?: (message: string) => void
  children?: ReactNode
}

export function ImageFieldPicker({
  title,
  value,
  urlLabel = "Image URL",
  placeholder = "https://.../image.png",
  removeLabel = "Remove",
  disabled,
  withinPortal = false,
  compact = false,
  advancedUrl = false,
  showPreview = true,
  titleSize = "sm",
  previewHeight = 180,
  onChange,
  onRemove,
  onUploadFile,
  onChooseFromLibrary,
  onError,
  children,
}: ImageFieldPickerProps) {
  const hasValue = value.trim().length > 0
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <Paper withBorder p={compact ? "xs" : "sm"} radius="md">
      <Stack gap={compact ? "xs" : "sm"}>
        <Group justify="space-between" align="center">
          <Text size={titleSize} fw={600}>
            {title}
          </Text>
          <Group gap="xs">
            <MediaPickerMenu
              label="Choose image"
              withinPortal={withinPortal}
              disabled={disabled}
              onUploadFile={onUploadFile}
              onChooseFromLibrary={onChooseFromLibrary}
              onError={onError}
            />
            <Button
              size="xs"
              color="red"
              variant="light"
              leftSection={<IconX size={14} />}
              onClick={onRemove}
              disabled={disabled || !hasValue}
            >
              {removeLabel}
            </Button>
          </Group>
        </Group>

        {advancedUrl ? (
          <>
            <Group justify="start">
              <Button
                size="xs"
                variant="subtle"
                rightSection={advancedOpen ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                onClick={() => setAdvancedOpen((v) => !v)}
                px={0}
              >
                Advanced
              </Button>
            </Group>
            <Collapse in={advancedOpen}>
              <TextInput
                label={urlLabel}
                value={value}
                onChange={(e) => onChange(e.currentTarget.value)}
                placeholder={placeholder}
                disabled={disabled}
              />
            </Collapse>
          </>
        ) : (
          <TextInput
            label={urlLabel}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {showPreview && hasValue ? (
          <Paper withBorder radius="sm" p={0} style={{ overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={title}
              style={{ display: "block", width: "100%", maxHeight: previewHeight, objectFit: "cover" }}
            />
          </Paper>
        ) : null}

        {children}
      </Stack>
    </Paper>
  )
}
