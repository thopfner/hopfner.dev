"use client"

import { useId, useRef, useState, type MouseEvent } from "react"
import {
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from "@mui/material"
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
  const menuId = useId()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
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

  function handleMenuOpen(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleMenuClose() {
    setAnchorEl(null)
  }

  function handleUploadNew() {
    handleMenuClose()
    fileRef.current?.click()
  }

  function handleChooseFromLibrary() {
    handleMenuClose()
    onChooseFromLibrary()
  }

  const isDisabled = disabled || uploading
  const menuOpen = Boolean(anchorEl)

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

      {iconTarget ? (
        <IconButton
          size="small"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={menuOpen ? "true" : undefined}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={handleMenuOpen}
          disabled={isDisabled}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        >
          {uploading ? <CircularProgress size={14} color="inherit" /> : <IconPhoto size={16} />}
        </IconButton>
      ) : (
        <Button
          size="small"
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <IconPhoto size={14} />}
          endIcon={<IconChevronDown size={14} />}
          aria-haspopup="menu"
          aria-expanded={menuOpen ? "true" : undefined}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={handleMenuOpen}
          disabled={isDisabled}
        >
          {label}
        </Button>
      )}

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        disablePortal={!withinPortal}
        slotProps={{ paper: { sx: { width: 220 } } }}
      >
        <ListSubheader disableSticky>Choose image</ListSubheader>
        <MenuItem onClick={handleUploadNew} disabled={isDisabled}>
          <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
            <IconUpload size={14} />
          </ListItemIcon>
          <ListItemText>Upload new</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleChooseFromLibrary} disabled={isDisabled}>
          <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
            <IconPhotoSearch size={14} />
          </ListItemIcon>
          <ListItemText>Choose from library</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
