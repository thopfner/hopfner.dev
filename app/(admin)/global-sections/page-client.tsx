"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge, Button, Divider, Group, Paper, Select, Slider, Stack, Table, Text, TextInput, Title } from "@mantine/core"
import { createClient } from "@/lib/supabase/browser"

const SECTION_TYPES = ["nav_links", "hero_cta", "card_grid", "steps_list", "title_body_list", "rich_text_block", "label_value_list", "faq_list", "cta_block"]

type Row = {
  id: string
  key: string
  label: string | null
  section_type: string
  enabled: boolean
  lifecycle_state?: "draft" | "published" | "archived"
}

type ImpactRow = {
  total_references: number
  enabled_references: number
  distinct_pages: number
}

type UsageRow = {
  global_section_id: string
  page_slug: string
  page_title: string
  section_key: string | null
}

function parseNum(v: string, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function GlobalSectionsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState("")
  const [label, setLabel] = useState("")
  const [type, setType] = useState("hero_cta")
  const [error, setError] = useState<string | null>(null)

  const [fontFamily, setFontFamily] = useState("Inter, system-ui, sans-serif")
  const [fontScale, setFontScale] = useState(1)
  const [spaceScale, setSpaceScale] = useState(1)
  const [radiusScale, setRadiusScale] = useState(1)
  const [shadowScale, setShadowScale] = useState(1)

  const [impactByGlobalId, setImpactByGlobalId] = useState<Record<string, ImpactRow>>({})
  const [usageByGlobalId, setUsageByGlobalId] = useState<Record<string, UsageRow[]>>({})

  async function load() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("global_sections")
      .select("id,key,label,section_type,enabled,lifecycle_state")
      .order("key", { ascending: true })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const nextRows = (data ?? []) as Row[]
    setRows(nextRows)

    const { data: whereUsedRows } = await supabase
      .from("global_section_where_used")
      .select("global_section_id,page_slug,page_title,section_key")
      .order("page_slug", { ascending: true })

    const usageMap: Record<string, UsageRow[]> = {}
    ;((whereUsedRows ?? []) as UsageRow[]).forEach((u) => {
      usageMap[u.global_section_id] = usageMap[u.global_section_id] ?? []
      usageMap[u.global_section_id].push(u)
    })
    setUsageByGlobalId(usageMap)

    const impacts = await Promise.all(
      nextRows.map(async (row) => {
        const { data: impact } = await supabase.rpc("global_section_impact_preview", {
          p_global_section_id: row.id,
        })
        return [row.id, ((impact ?? [])[0] ?? { total_references: 0, enabled_references: 0, distinct_pages: 0 }) as ImpactRow] as const
      })
    )

    const impactMap = Object.fromEntries(impacts)
    setImpactByGlobalId(impactMap)

    const { data: fmt } = await supabase
      .from("site_formatting_settings")
      .select("settings")
      .eq("id", "default")
      .maybeSingle()

    const settings = (fmt?.settings ?? {}) as Record<string, unknown>
    const tokens = (settings.tokens ?? {}) as Record<string, unknown>

    setFontFamily(String(tokens.fontFamily ?? settings.fontFamily ?? "Inter, system-ui, sans-serif"))
    setFontScale(parseNum(String(tokens.fontScale ?? settings.fontScale ?? 1), 1))
    setSpaceScale(parseNum(String(tokens.spaceScale ?? 1), 1))
    setRadiusScale(parseNum(String(tokens.radiusScale ?? 1), 1))
    setShadowScale(parseNum(String(tokens.shadowScale ?? 1), 1))

    setLoading(false)
  }

  async function saveFormatting() {
    setError(null)
    const { error } = await supabase.from("site_formatting_settings").upsert({
      id: "default",
      settings: {
        tokens: {
          fontFamily: fontFamily.trim() || "Inter, system-ui, sans-serif",
          fontScale,
          spaceScale,
          radiusScale,
          shadowScale,
        },
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    await load()
  }

  async function createGlobal() {
    setError(null)
    const cleanKey = key.trim().toLowerCase()
    if (!cleanKey) return setError("Key required")

    const { data, error } = await supabase
      .from("global_sections")
      .insert({ key: cleanKey, label: label.trim() || null, section_type: type, enabled: true, lifecycle_state: "draft" })
      .select("id")
      .single()

    if (error || !data) return setError(error?.message ?? "Create failed")

    await supabase.from("global_section_versions").insert({
      global_section_id: data.id,
      version: 1,
      status: "draft",
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
        <Text c="dimmed" size="sm">Reusable sections with lifecycle, impact preview, and where-used map.</Text>
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
          <Title order={4}>Formatting tokens (site-wide)</Title>
          <TextInput label="Font family" value={fontFamily} onChange={(e) => setFontFamily(e.currentTarget.value)} />
          <Slider label={(v) => `Font scale ${v.toFixed(2)}x`} min={0.8} max={1.4} step={0.05} value={fontScale} onChange={setFontScale} />
          <Slider label={(v) => `Space scale ${v.toFixed(2)}x`} min={0.7} max={1.6} step={0.05} value={spaceScale} onChange={setSpaceScale} />
          <Slider label={(v) => `Radius scale ${v.toFixed(2)}x`} min={0.5} max={1.8} step={0.05} value={radiusScale} onChange={setRadiusScale} />
          <Slider label={(v) => `Shadow scale ${v.toFixed(2)}x`} min={0.5} max={1.8} step={0.05} value={shadowScale} onChange={setShadowScale} />

          <Paper withBorder p="sm" radius="md" style={{ fontFamily, fontSize: `${fontScale}rem` }}>
            <Text fw={600}>Live preview</Text>
            <div style={{ padding: `${Math.round(spaceScale * 12)}px`, borderRadius: `${Math.round(radiusScale * 10)}px`, boxShadow: `0 ${Math.round(8 * shadowScale)}px ${Math.round(20 * shadowScale)}px rgba(0,0,0,0.15)` }}>
              This preview reflects token sliders before saving.
            </div>
          </Paper>

          <Group justify="end">
            <Button variant="default" onClick={saveFormatting}>Save tokens</Button>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack>
          <Title order={4}>Where used + impact preview</Title>
          {loading ? <Text c="dimmed" size="sm">Loading…</Text> : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Section</Table.Th>
                  <Table.Th>State</Table.Th>
                  <Table.Th>Impact</Table.Th>
                  <Table.Th>Used on</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => {
                  const impact = impactByGlobalId[row.id]
                  const usage = usageByGlobalId[row.id] ?? []
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <Badge variant="default">{row.section_type}</Badge>
                          <Text fw={600}>{row.key}</Text>
                        </Group>
                        {row.label ? <Text size="xs" c="dimmed">{row.label}</Text> : null}
                      </Table.Td>
                      <Table.Td>
                        <Badge color={row.lifecycle_state === "published" ? "teal" : row.lifecycle_state === "archived" ? "gray" : "yellow"} variant="light">
                          {row.lifecycle_state ?? "draft"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{impact?.enabled_references ?? 0} enabled refs</Text>
                        <Text size="xs" c="dimmed">{impact?.distinct_pages ?? 0} pages • {impact?.total_references ?? 0} total refs</Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          {usage.slice(0, 3).map((u, idx) => (
                            <Text key={`${u.page_slug}-${idx}`} size="xs">/{u.page_slug}{u.section_key ? `#${u.section_key}` : ""}</Text>
                          ))}
                          {usage.length > 3 ? <Text size="xs" c="dimmed">+{usage.length - 3} more</Text> : null}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Button size="xs" variant={row.enabled ? "default" : "outline"} onClick={() => void toggle(row)}>
                          {row.enabled ? "Disable" : "Enable"}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
            </Table>
          )}

          <Divider />
          <Text size="xs" c="dimmed">Staged publish: use SQL function <code>publish_global_section_version(global_id, version_id, publish_at)</code> to schedule a timestamp.</Text>
        </Stack>
      </Paper>
    </Stack>
  )

}
