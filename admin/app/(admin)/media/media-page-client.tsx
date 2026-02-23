"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { IconCopy, IconPhotoOff, IconRefresh, IconSearch, IconTrash, IconUpload } from "@tabler/icons-react"

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

  async function load(q = query) {
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
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void load(query)
    }, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    void load("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <Stack gap="md">
      <div>
        <Title order={2} size="h3">
          Media
        </Title>
        <Text c="dimmed" size="sm">
          Upload images and manage your media library. Removing images from sections will not delete files here.
        </Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group align="end" gap="sm">
            <TextInput
              label="Search"
              placeholder="Search by file path..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={14} />}
              style={{ flex: 1 }}
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0] ?? null
                e.currentTarget.value = ""
                void onUpload(file)
              }}
            />

            <Button
              size="sm"
              leftSection={<IconUpload size={14} />}
              onClick={() => fileRef.current?.click()}
              loading={uploading}
            >
              Upload
            </Button>

            <Button
              size="sm"
              variant="default"
              leftSection={<IconRefresh size={14} />}
              onClick={() => void load(query)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Group>

          {error ? (
            <Text size="sm" c="red">
              {error}
            </Text>
          ) : null}

          <Group justify="space-between">
            <Badge variant="default">{items.length}</Badge>
            <Button size="xs" variant="subtle" onClick={() => setLibraryOpen(true)}>
              Open full library modal
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        {loading ? (
          <Group justify="center" py="lg">
            <Loader size="sm" />
          </Group>
        ) : items.length ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
            {items.map((item) => {
              const name = item.path.split("/").pop() || item.path
              return (
                <Paper key={item.id} withBorder p="xs" radius="md">
                  <Stack gap="xs">
                    <Paper withBorder radius="sm" p={0} style={{ overflow: "hidden" }}>
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.alt || name}
                          style={{ display: "block", width: "100%", height: 140, objectFit: "cover" }}
                        />
                      ) : (
                        <Group justify="center" h={140}>
                          <IconPhotoOff size={30} />
                        </Group>
                      )}
                    </Paper>

                    <Text size="sm" fw={600} lineClamp={1}>
                      {name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {item.path}
                    </Text>

                    <Group justify="space-between" gap="xs">
                      <Group gap={6}>
                        <Badge size="xs" variant="light">
                          {formatBytes(item.size_bytes)}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {formatDate(item.created_at)}
                        </Text>
                      </Group>

                      <Group gap={6}>
                        <ActionIcon
                          size="sm"
                          variant="default"
                          aria-label="Copy URL"
                          onClick={() => {
                            if (!item.url) return
                            void navigator.clipboard.writeText(item.url)
                          }}
                          disabled={!item.url}
                        >
                          <IconCopy size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="light"
                          aria-label="Delete media"
                          onClick={() => void onDelete(item.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        ) : (
          <Text size="sm" c="dimmed">
            No media uploaded yet.
          </Text>
        )}
      </Paper>

      <MediaLibraryModal opened={libraryOpen} onClose={() => setLibraryOpen(false)} allowDelete />
    </Stack>
  )
}
