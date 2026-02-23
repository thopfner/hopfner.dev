"use client"

import { useId, useState } from "react"
import type { ReactNode } from "react"
import { Button, Collapse, Paper, Stack, TextField, Typography } from "@mui/material"
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
  const advancedSectionId = useId()
  const titleFontSize = titleSize === "xs" ? 12 : 14

  return (
    <Paper variant="outlined" sx={{ p: compact ? 1 : 1.5, borderRadius: 2 }}>
      <Stack spacing={compact ? 1 : 1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h3" sx={{ fontSize: titleFontSize, fontWeight: 600 }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <MediaPickerMenu
              label="Choose image"
              withinPortal={withinPortal}
              disabled={disabled}
              onUploadFile={onUploadFile}
              onChooseFromLibrary={onChooseFromLibrary}
              onError={onError}
            />
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<IconX size={14} />}
              onClick={onRemove}
              disabled={disabled || !hasValue}
            >
              {removeLabel}
            </Button>
          </Stack>
        </Stack>

        {advancedUrl ? (
          <>
            <Stack direction="row" justifyContent="flex-start">
              <Button
                size="small"
                variant="text"
                endIcon={advancedOpen ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                onClick={() => setAdvancedOpen((v) => !v)}
                aria-expanded={advancedOpen}
                aria-controls={advancedSectionId}
                sx={{ px: 0, minWidth: 0 }}
              >
                Advanced
              </Button>
            </Stack>
            <Collapse in={advancedOpen} id={advancedSectionId}>
              <TextField
                fullWidth
                size="small"
                label={urlLabel}
                value={value}
                onChange={(e) => onChange(e.currentTarget.value)}
                placeholder={placeholder}
                disabled={disabled}
              />
            </Collapse>
          </>
        ) : (
          <TextField
            fullWidth
            size="small"
            label={urlLabel}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {showPreview && hasValue ? (
          <Paper variant="outlined" sx={{ p: 0, overflow: "hidden", borderRadius: 1 }}>
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
