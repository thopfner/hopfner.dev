"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core"

import { createClient } from "@/lib/supabase/browser"

function formatDateTime(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toISOString().replace("T", " ").replace(/\\.\\d{3}Z$/, "Z")
}

type PageRow = {
  id: string
  slug: string
  title: string
  updated_at: string
}

export function PagesList() {
  const supabase = useMemo(() => createClient(), [])

  const [pages, setPages] = useState<PageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newSlug, setNewSlug] = useState("home")
  const [newTitle, setNewTitle] = useState("Home")
  const [creating, setCreating] = useState(false)

  async function loadPages() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: selectError } = await supabase
        .from("pages")
        .select("id, slug, title, updated_at")
        .order("slug", { ascending: true })

      if (selectError) {
        setError(selectError.message)
        setPages([])
        return
      }

      setPages((data ?? []) as PageRow[])
    } finally {
      setLoading(false)
    }
  }

  async function onCreatePage() {
    setCreating(true)
    setError(null)
    try {
      const slug = newSlug.trim()
      const title = newTitle.trim()
      if (!slug || !title) {
        setError("Slug and title are required.")
        return
      }
      const { error: insertError } = await supabase
        .from("pages")
        .insert({ slug, title })

      if (insertError) {
        setError(insertError.message)
        return
      }

      await loadPages()
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    void loadPages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack gap="md">
      <div>
        <Title order={2} size="h3">
          Pages
        </Title>
        <Text c="dimmed" size="sm">
          Manage pages and their sections. Public site renders only published
          section versions.
        </Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group align="end" gap="sm">
            <TextInput
              label="Slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.currentTarget.value)}
              placeholder="home"
              w={200}
            />
            <TextInput
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.currentTarget.value)}
              placeholder="Home"
              w={260}
            />
            <Button size="sm" loading={creating} onClick={onCreatePage}>
              Create page
            </Button>
          </Group>

          {error ? (
            <Text size="sm" c="red">
              {error}
            </Text>
          ) : null}
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600} size="sm">
              All pages
            </Text>
            <Badge variant="default">{pages.length}</Badge>
          </Group>

          <Table
            highlightOnHover
            withTableBorder
            withColumnBorders
            striped
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Slug</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Updated</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" size="sm">
                      Loading…
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : pages.length ? (
                pages.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        {p.slug}
                      </Text>
                    </Table.Td>
                    <Table.Td>{p.title}</Table.Td>
                    <Table.Td>
                      <Text c="dimmed" size="sm">
                        {formatDateTime(p.updated_at)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="default"
                        component={Link}
                        href={`/pages/${p.id}`}
                      >
                        Edit
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" size="sm">
                      No pages yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  )
}
