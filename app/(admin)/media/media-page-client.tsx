"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import BrokenImageRoundedIcon from "@mui/icons-material/BrokenImageRounded"
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import UploadRoundedIcon from "@mui/icons-material/UploadRounded"

import { MediaLibraryModal } from "@/components/media-library-modal"
import { deleteMedia } from "@/lib/media/delete"
import { listMedia } from "@/lib/media/list"
import type { MediaItem } from "@/lib/media/types"
import { uploadMedia } from "@/lib/media/upload"
import { createClient } from "@/lib/supabase/browser"

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

async function getImageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {}
  const url = URL.createObjectURL(file)
  try {
    const img = document.createElement("img")
    img.src = url
    await img.decode()
    return { width: img.naturalWidth, height: img.naturalHeight }
  } catch {
    return {}
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function MediaPageClient() {
  const supabase = useMemo(() => createClient(), [])

  const [query, setQuery] = useState("")
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const fileRef = useRef<HTMLInputElement | null>(null)

  const load = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    try {
      const next = await listMedia({ q, limit: 200, offset: 0 })
      setItems(next)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      void load(query)
    }, 200)
    return () => clearTimeout(t)
  }, [query, load])

  useEffect(() => {
    void load("")
  }, [load])

  async function onUpload(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { bucket, path, url } = await uploadMedia(file)
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
        throw new Error(mediaError.message)
      }

      if (url) {
        setItems((prev) => [
          {
            id: crypto.randomUUID(),
            bucket,
            path,
            mime_type: file.type,
            size_bytes: file.size,
            width: width ?? null,
            height: height ?? null,
            alt: null,
            created_at: new Date().toISOString(),
            url,
          },
          ...prev,
        ])
      }

      await load(query)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(id: string) {
    setError(null)
    try {
      await deleteMedia(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete media")
    }
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Media
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload images and manage your media library. Removing images from sections will not delete files here.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 1.25 }}>
            <TextField
              label="Search"
              placeholder="Search by file path..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{ flex: "1 1 260px", minWidth: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.currentTarget.files?.[0] ?? null
                e.currentTarget.value = ""
                void onUpload(file)
              }}
            />

            <Button
              size="small"
              variant="contained"
              startIcon={<UploadRoundedIcon fontSize="small" />}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshRoundedIcon fontSize="small" />}
              onClick={() => void load(query)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
            <Chip size="small" variant="outlined" label={`${items.length}`} />
            <Button size="small" variant="text" onClick={() => setLibraryOpen(true)}>
              Open full library modal
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
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
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {items.map((item) => {
              const name = item.path.split("/").pop() || item.path
              return (
                <Paper key={item.id} variant="outlined" sx={{ p: 1 }}>
                  <Stack spacing={1}>
                    <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.alt || name}
                          style={{ display: "block", width: "100%", height: 140, objectFit: "cover" }}
                        />
                      ) : (
                        <Box sx={{ display: "grid", placeItems: "center", height: 140 }}>
                          <BrokenImageRoundedIcon />
                        </Box>
                      )}
                    </Paper>

                    <Typography variant="body2" fontWeight={700} noWrap>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.path}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                        <Chip size="small" variant="outlined" label={formatBytes(item.size_bytes)} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {formatDate(item.created_at)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Tooltip title="Copy URL">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Copy URL"
                              onClick={() => {
                                if (!item.url) return
                                void navigator.clipboard.writeText(item.url)
                              }}
                              disabled={!item.url}
                            >
                              <ContentCopyRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete media">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete media"
                            onClick={() => void onDelete(item.id)}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No media uploaded yet.
          </Typography>
        )}
      </Paper>

      <MediaLibraryModal opened={libraryOpen} onClose={() => setLibraryOpen(false)} allowDelete />
    </Stack>
  )
}
