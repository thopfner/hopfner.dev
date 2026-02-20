"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from "@mantine/core"
import { createClient } from "@/lib/supabase/browser"

const SECTION_TYPES = ["nav_links","hero_cta","card_grid","steps_list","title_body_list","rich_text_block","label_value_list","faq_list","cta_block"]

type Row = { id: string; key: string; label: string | null; section_type: string; enabled: boolean }

export function GlobalSectionsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState("")
  const [label, setLabel] = useState("")
  const [type, setType] = useState("hero_cta")
  const [error, setError] = useState<string | null>(null)
  const [fontFamily, setFontFamily] = useState("Inter, system-ui, sans-serif")
  const [fontScale, setFontScale] = useState("1")

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from("global_sections")
      .select("id,key,label,section_type,enabled")
      .order("key", { ascending: true })
    if (error) setError(error.message)
    setRows((data ?? []) as Row[])

    const { data: fmt } = await supabase.from("site_formatting_settings").select("settings").eq("id", "default").maybeSingle()
    const settings = (fmt?.settings ?? {}) as Record<string, unknown>
    setFontFamily(String(settings.fontFamily ?? "Inter, system-ui, sans-serif"))
    setFontScale(String(settings.fontScale ?? 1))

    setLoading(false)
  }

  async function saveFormatting() {
    await supabase.from("site_formatting_settings").upsert({
      id: "default",
      settings: {
        fontFamily: fontFamily.trim() || "Inter, system-ui, sans-serif",
        fontScale: Number(fontScale) || 1,
      },
    })
  }

  async function createGlobal() {
    setError(null)
    const cleanKey = key.trim().toLowerCase()
    if (!cleanKey) return setError("Key required")
    const { data, error } = await supabase
      .from("global_sections")
      .insert({ key: cleanKey, label: label.trim() || null, section_type: type, enabled: true })
      .select("id")
      .single()
    if (error || !data) return setError(error?.message ?? "Create failed")

    await supabase.from("global_section_versions").insert({
      global_section_id: data.id,
      version: 1,
      status: "published",
      formatting: {},
      content: {},
    })
    setKey("")
    setLabel("")
    await load()
  }

  async function toggle(row: Row) {
    await supabase.from("global_sections").update({ enabled: !row.enabled }).eq("id", row.id)
    await load()
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack gap="md">
      <div>
        <Title order={2} size="h3">Global sections</Title>
        <Text c="dimmed" size="sm">Reusable sections shared across pages. Publishing updates propagates automatically.</Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Group align="end">
          <TextInput label="Key" placeholder="global-hero" value={key} onChange={(e) => setKey(e.currentTarget.value)} />
          <TextInput label="Label" placeholder="Global Hero" value={label} onChange={(e) => setLabel(e.currentTarget.value)} />
          <Select label="Type" value={type} onChange={(v) => setType(v ?? "hero_cta")} data={SECTION_TYPES} />
          <Button onClick={createGlobal}>Create</Button>
        </Group>
        {error ? <Text c="red" size="sm" mt="sm">{error}</Text> : null}
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack>
          <Title order={4}>Global formatting defaults</Title>
          <Group align="end">
            <TextInput label="Font family" value={fontFamily} onChange={(e) => setFontFamily(e.currentTarget.value)} style={{ flex: 1 }} />
            <TextInput label="Font scale" value={fontScale} onChange={(e) => setFontScale(e.currentTarget.value)} w={120} />
            <Button variant="default" onClick={saveFormatting}>Save formatting</Button>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack>
          {loading ? <Text c="dimmed" size="sm">Loading…</Text> : rows.map((row) => (
            <Group key={row.id} justify="space-between">
              <Group>
                <Badge variant="default">{row.section_type}</Badge>
                <Text fw={600}>{row.key}</Text>
                {row.label ? <Text c="dimmed" size="sm">{row.label}</Text> : null}
              </Group>
              <Button size="xs" variant={row.enabled ? "default" : "outline"} onClick={() => toggle(row)}>{row.enabled ? "Disable" : "Enable"}</Button>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}
