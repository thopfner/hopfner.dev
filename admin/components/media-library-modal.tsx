"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
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
          <Paper key={item.id} withBorder p="xs" radius="md">
            <Stack gap="xs">
              <Paper withBorder radius="sm" p={0} style={{ overflow: "hidden" }}>
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || name}
                    style={{ display: "block", width: "100%", height: 120, objectFit: "cover" }}
                  />
                ) : (
                  <Group justify="center" h={120}>
                    <IconPhotoOff size={28} />
                  </Group>
                )}
              </Paper>

              <Stack gap={2}>
                <Text size="sm" fw={600} lineClamp={1}>
                  {name}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {item.path}
                </Text>
                <Group gap={6}>
                  <Badge size="xs" variant="light">
                    {formatBytes(item.size_bytes)}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {formatDate(item.created_at)}
                  </Text>
                </Group>
              </Stack>

              <Group justify="space-between" gap="xs">
                {onSelect ? (
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => onSelect(item)}
                    disabled={!item.url}
                  >
                    Use image
                  </Button>
                ) : (
                  <div />
                )}
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
                  {allowDelete ? (
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      aria-label="Delete media"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  ) : null}
                </Group>
              </Group>
            </Stack>
          </Paper>
        )
      }),
    [allowDelete, items, onSelect]
  )

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={title} size="xl" centered>
        <Stack gap="sm">
          <Group justify="space-between" align="end" gap="sm">
            <TextInput
              label="Search"
              placeholder="Search by file path..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={14} />}
              style={{ flex: 1 }}
            />
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

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {filteredCount} item{filteredCount === 1 ? "" : "s"}
            </Text>
          </Group>

          {error ? (
            <Text size="sm" c="red">
              {error}
            </Text>
          ) : null}

          {loading ? (
            <Group justify="center" py="lg">
              <Loader size="sm" />
            </Group>
          ) : items.length ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
              {cards}
            </SimpleGrid>
          ) : (
            <Text size="sm" c="dimmed">
              No media found.
            </Text>
          )}
        </Stack>
      </Modal>

      <Modal
        opened={deleteTarget !== null}
        onClose={() => (deleteLoading ? null : setDeleteTarget(null))}
        title="Delete media?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This permanently deletes the file from storage and removes it from the media library.
          </Text>
          {deleteTarget ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={2}>
                <Text size="sm" fw={600} lineClamp={1}>
                  {deleteTarget.path.split("/").pop() || deleteTarget.path}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {deleteTarget.path}
                </Text>
              </Stack>
            </Paper>
          ) : null}
          <Group justify="end">
            <Button variant="default" disabled={deleteLoading} onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button color="red" loading={deleteLoading} onClick={() => void onConfirmDelete()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
