"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { IconCopy, IconPhotoOff, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react"

import { deleteMedia } from "@/lib/media/delete"
import { listMedia } from "@/lib/media/list"
import type { MediaItem } from "@/lib/media/types"

function formatDate(ts: string): string {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d)
}

function formatBytes(value: number | null): string {
  if (!value || value <= 0) return "-"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibraryModal({
  opened,
  onClose,
  onSelect,
  allowDelete = false,
  title = "Media library",
}: {
  opened: boolean
  onClose: () => void
  onSelect?: (item: MediaItem) => void
  allowDelete?: boolean
  title?: string
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filteredCount = items.length

  async function load(q: string) {
    setLoading(true)
    setError(null)
    try {
      const nextItems = await listMedia({ q, limit: 200, offset: 0 })
      setItems(nextItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!opened) return
    const t = setTimeout(() => {
      void load(query)
    }, 200)
    return () => clearTimeout(t)
  }, [opened, query])

  async function onConfirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setError(null)
    try {
      await deleteMedia(deleteTarget.id)
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete media.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const cards = useMemo(
    () =>
      items.map((item) => {
        const name = item.path.split("/").pop() || item.path
        return (
          <Paper key={item.id} variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
            <Stack spacing={1}>
              <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || name}
                    style={{ display: "block", width: "100%", height: 120, objectFit: "cover" }}
                  />
                ) : (
                  <Box sx={{ display: "grid", placeItems: "center", height: 120 }}>
                    <IconPhotoOff size={28} />
                  </Box>
                )}
              </Paper>

              <Stack spacing={0.25}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.path}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Chip size="small" variant="outlined" label={formatBytes(item.size_bytes)} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {formatDate(item.created_at)}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                {onSelect ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onSelect(item)}
                    disabled={!item.url}
                  >
                    Use image
                  </Button>
                ) : (
                  <Box sx={{ flex: 1 }} />
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    aria-label="Copy URL"
                    onClick={() => {
                      if (!item.url) return
                      void navigator.clipboard.writeText(item.url)
                    }}
                    disabled={!item.url}
                    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                  >
                    <IconCopy size={14} />
                  </IconButton>
                  {allowDelete ? (
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="Delete media"
                      onClick={() => setDeleteTarget(item)}
                      sx={{ border: "1px solid", borderColor: "error.light", borderRadius: 1 }}
                    >
                      <IconTrash size={14} />
                    </IconButton>
                  ) : null}
                </Box>
              </Box>
            </Stack>
          </Paper>
        )
      }),
    [allowDelete, items, onSelect]
  )

  return (
    <>
      <Dialog
        open={opened}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        aria-labelledby="media-library-dialog-title"
        sx={{ zIndex: 1600 }}
      >
        <DialogTitle id="media-library-dialog-title">{title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 1 }}>
              <TextField
              label="Search"
              placeholder="Search by file path..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{ flex: "1 1 240px", minWidth: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={14} />
                  </InputAdornment>
                ),
              }}
            />
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconRefresh size={14} />}
                onClick={() => void load(query)}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {filteredCount} item{filteredCount === 1 ? "" : "s"}
              </Typography>
            </Box>

            {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={20} />
              </Box>
            ) : items.length ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                  },
                }}
              >
                {cards}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No media found.
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onClose={(_, reason) => {
          if (deleteLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return
          if (deleteLoading) return
          setDeleteTarget(null)
        }}
        disableEscapeKeyDown={deleteLoading}
        fullWidth
        maxWidth="xs"
        aria-labelledby="delete-media-dialog-title"
        sx={{ zIndex: 1600 }}
      >
        <DialogTitle id="delete-media-dialog-title">Delete media?</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2">
            This permanently deletes the file from storage and removes it from the media library.
            </Typography>
            {deleteTarget ? (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {deleteTarget.path.split("/").pop() || deleteTarget.path}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {deleteTarget.path}
                  </Typography>
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button variant="outlined" disabled={deleteLoading} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void onConfirmDelete()}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
