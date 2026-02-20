"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Button,
  ColorInput,
  Divider,
  Drawer,
  Group,
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core"
import { createClient } from "@/lib/supabase/browser"

const SECTION_TYPES = ["nav_links", "hero_cta", "card_grid", "steps_list", "title_body_list", "rich_text_block", "label_value_list", "faq_list", "cta_block"]
const FONT_STACKS = [
  { value: "Inter, system-ui, sans-serif", label: "Inter (Sans)" },
  { value: "'Geist', Inter, system-ui, sans-serif", label: "Geist + Inter" },
  { value: "'IBM Plex Sans', Inter, system-ui, sans-serif", label: "IBM Plex Sans" },
  { value: "'Merriweather', Georgia, serif", label: "Merriweather (Serif)" },
  { value: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", label: "JetBrains Mono" },
]

type Row = {
  id: string
  key: string
  label: string | null
  section_type: string
  enabled: boolean
  lifecycle_state?: "draft" | "published" | "archived"
}

type GlobalVersionRow = {
  id: string
  global_section_id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  subtitle: string | null
  cta_primary_label: string | null
  cta_primary_href: string | null
  cta_secondary_label: string | null
  cta_secondary_href: string | null
  formatting: Record<string, unknown>
  content: Record<string, unknown>
  published_at: string | null
}

type ImpactRow = { total_references: number; enabled_references: number; distinct_pages: number }
type UsageRow = { global_section_id: string; page_slug: string; page_title: string; section_key: string | null }
type SectionTypeDefault = {
  section_type: string
  default_formatting: Record<string, unknown>
  default_content: Record<string, unknown>
}

function parseNum(v: string, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function deepMerge(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a }
  Object.entries(b).forEach(([key, value]) => {
    const prev = out[key]
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      prev &&
      typeof prev === "object" &&
      !Array.isArray(prev)
    ) {
      out[key] = deepMerge(prev as Record<string, unknown>, value as Record<string, unknown>)
      return
    }
    out[key] = value
  })
  return out
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
  const [customFontFamily, setCustomFontFamily] = useState("")
  const [fontScale, setFontScale] = useState(1)
  const [spaceScale, setSpaceScale] = useState(1)
  const [radiusScale, setRadiusScale] = useState(1)
  const [shadowScale, setShadowScale] = useState(1)
  const [shadowColor, setShadowColor] = useState("")
  const [textColor, setTextColor] = useState("")
  const [accentColor, setAccentColor] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("")

  const [impactByGlobalId, setImpactByGlobalId] = useState<Record<string, ImpactRow>>({})
  const [usageByGlobalId, setUsageByGlobalId] = useState<Record<string, UsageRow[]>>({})

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [sectionTypeDefaults, setSectionTypeDefaults] = useState<Record<string, SectionTypeDefault>>({})
  const [versions, setVersions] = useState<GlobalVersionRow[]>([])
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState("")
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState("")
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState("")
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState("")
  const [formattingText, setFormattingText] = useState("{}")
  const [contentText, setContentText] = useState("{}")

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

    const { data: defaultsRows } = await supabase
      .from("section_type_defaults")
      .select("section_type,default_formatting,default_content")

    const defaultsMap = Object.fromEntries(
      ((defaultsRows ?? []) as SectionTypeDefault[]).map((row) => [row.section_type, row])
    )
    setSectionTypeDefaults(defaultsMap)

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
        const { data: impact } = await supabase.rpc("global_section_impact_preview", { p_global_section_id: row.id })
        return [row.id, ((impact ?? [])[0] ?? { total_references: 0, enabled_references: 0, distinct_pages: 0 }) as ImpactRow] as const
      })
    )
    setImpactByGlobalId(Object.fromEntries(impacts))

    const { data: fmt } = await supabase.from("site_formatting_settings").select("settings").eq("id", "default").maybeSingle()
    const settings = (fmt?.settings ?? {}) as Record<string, unknown>
    const tokens = ((settings.tokens ?? {}) as Record<string, unknown>)

    const tokenFont = String(tokens.fontFamily ?? settings.fontFamily ?? "Inter, system-ui, sans-serif")
    const matchPreset = FONT_STACKS.find((f) => f.value === tokenFont)
    setFontFamily(matchPreset?.value ?? "__custom")
    setCustomFontFamily(matchPreset ? "" : tokenFont)
    setFontScale(parseNum(String(tokens.fontScale ?? settings.fontScale ?? 1), 1))
    setSpaceScale(parseNum(String(tokens.spaceScale ?? 1), 1))
    setRadiusScale(parseNum(String(tokens.radiusScale ?? 1), 1))
    setShadowScale(parseNum(String(tokens.shadowScale ?? 1), 1))
    setShadowColor(String(tokens.shadowColor ?? ""))
    setTextColor(String(tokens.textColor ?? ""))
    setAccentColor(String(tokens.accentColor ?? ""))
    setBackgroundColor(String(tokens.backgroundColor ?? ""))

    setLoading(false)
  }

  async function loadGlobalVersions(row: Row) {
    setEditing(row)
    const { data, error } = await supabase
      .from("global_section_versions")
      .select("id,global_section_id,version,status,title,subtitle,cta_primary_label,cta_primary_href,cta_secondary_label,cta_secondary_href,formatting,content,published_at")
      .eq("global_section_id", row.id)
      .order("version", { ascending: false })

    if (error) return setError(error.message)
    const rows = (data ?? []) as GlobalVersionRow[]
    setVersions(rows)
    const base = rows.find((v) => v.status === "draft") ?? rows.find((v) => v.status === "published") ?? null
    setTitle(base?.title ?? "")
    setSubtitle(base?.subtitle ?? "")
    setCtaPrimaryLabel(base?.cta_primary_label ?? "")
    setCtaPrimaryHref(base?.cta_primary_href ?? "")
    setCtaSecondaryLabel(base?.cta_secondary_label ?? "")
    setCtaSecondaryHref(base?.cta_secondary_href ?? "")
    const defaults = sectionTypeDefaults[row.section_type]
    const normalizedFormatting = deepMerge(asRecord(defaults?.default_formatting), asRecord(base?.formatting))
    const normalizedContent = deepMerge(asRecord(defaults?.default_content), asRecord(base?.content))
    setFormattingText(JSON.stringify(normalizedFormatting, null, 2))
    setContentText(JSON.stringify(normalizedContent, null, 2))
    setEditorOpen(true)
  }

  async function saveGlobalDraft() {
    if (!editing) return
    setError(null)
    try {
      const defaults = sectionTypeDefaults[editing.section_type]
      const formatting = deepMerge(asRecord(defaults?.default_formatting), asRecord(JSON.parse(formattingText || "{}")))
      const content = deepMerge(asRecord(defaults?.default_content), asRecord(JSON.parse(contentText || "{}")))
      await supabase.from("global_section_versions").update({ status: "archived" }).eq("global_section_id", editing.id).eq("status", "draft")
      const nextVersion = (versions[0]?.version ?? 0) + 1
      const { error } = await supabase.from("global_section_versions").insert({
        global_section_id: editing.id,
        version: nextVersion,
        status: "draft",
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        cta_primary_label: ctaPrimaryLabel.trim() || null,
        cta_primary_href: ctaPrimaryHref.trim() || null,
        cta_secondary_label: ctaSecondaryLabel.trim() || null,
        cta_secondary_href: ctaSecondaryHref.trim() || null,
        formatting,
        content,
      })
      if (error) throw new Error(error.message)
      await loadGlobalVersions(editing)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft")
    }
  }

  async function publishGlobalDraft() {
    if (!editing) return
    const draft = versions.find((v) => v.status === "draft")
    if (!draft) return setError("No draft to publish")
    const { error } = await supabase.rpc("publish_global_section_version", {
      p_global_section_id: editing.id,
      p_version_id: draft.id,
      p_publish_at: new Date().toISOString(),
    })
    if (error) return setError(error.message)
    await loadGlobalVersions(editing)
    await load()
  }

  async function rollbackFromVersion(versionId: string) {
    if (!editing) return
    const { error } = await supabase.rpc("rollback_global_section_to_version", {
      p_global_section_id: editing.id,
      p_from_version_id: versionId,
    })
    if (error) return setError(error.message)
    await loadGlobalVersions(editing)
  }

  async function saveFormatting() {
    setError(null)
    const selectedFont = fontFamily === "__custom" ? customFontFamily : fontFamily
    const { error } = await supabase.from("site_formatting_settings").upsert({
      id: "default",
      settings: {
        tokens: {
          fontFamily: selectedFont.trim() || "Inter, system-ui, sans-serif",
          fontScale,
          spaceScale,
          radiusScale,
          shadowScale,
          shadowColor: shadowColor.trim() || null,
          textColor: textColor.trim() || null,
          accentColor: accentColor.trim() || null,
          backgroundColor: backgroundColor.trim() || null,
        },
      },
    })
    if (error) return setError(error.message)
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

    const defaults = sectionTypeDefaults[type]
    await supabase.from("global_section_versions").insert({
      global_section_id: data.id,
      version: 1,
      status: "draft",
      formatting: asRecord(defaults?.default_formatting),
      content: asRecord(defaults?.default_content),
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

  const effectiveFontFamily = fontFamily === "__custom" ? customFontFamily : fontFamily

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
          <Select label="Font family" value={fontFamily} onChange={(v) => setFontFamily(v ?? FONT_STACKS[0].value)} data={[...FONT_STACKS, { value: "__custom", label: "Custom…" }]} />
          {fontFamily === "__custom" ? <TextInput label="Custom font stack" value={customFontFamily} onChange={(e) => setCustomFontFamily(e.currentTarget.value)} placeholder="'Your Font', Inter, system-ui, sans-serif" /> : null}
          <Slider label={(v) => `Font scale ${v.toFixed(2)}x`} min={0.8} max={1.4} step={0.05} value={fontScale} onChange={setFontScale} />
          <Slider label={(v) => `Space scale ${v.toFixed(2)}x`} min={0.7} max={1.6} step={0.05} value={spaceScale} onChange={setSpaceScale} />
          <Slider label={(v) => `Radius scale ${v.toFixed(2)}x`} min={0.5} max={1.8} step={0.05} value={radiusScale} onChange={setRadiusScale} />
          <Slider label={(v) => `Shadow scale ${v.toFixed(2)}x`} min={0.5} max={1.8} step={0.05} value={shadowScale} onChange={setShadowScale} />
          <Group grow>
            <ColorInput label="Text color" value={textColor} onChange={setTextColor} placeholder="#111827" />
            <ColorInput label="Accent color" value={accentColor} onChange={setAccentColor} placeholder="#4f46e5" />
            <ColorInput label="Shadow color" value={shadowColor} onChange={setShadowColor} placeholder="#111827" />
            <ColorInput label="Background color" value={backgroundColor} onChange={setBackgroundColor} placeholder="#ffffff" />
          </Group>

          <Paper withBorder p="sm" radius="md" style={{ fontFamily: effectiveFontFamily || undefined, fontSize: `${fontScale}rem`, color: textColor || undefined, background: backgroundColor || undefined }}>
            <Text fw={600}>Live preview (frontend token mapping)</Text>
            <Stack gap={Math.max(6, Math.round(spaceScale * 8))} mt={8}>
              <div style={{ padding: `${Math.round(spaceScale * 12)}px`, borderRadius: `${Math.round(radiusScale * 10)}px`, boxShadow: `0 ${Math.round(10 * shadowScale)}px ${Math.round(28 * shadowScale)}px color-mix(in srgb, ${shadowColor || accentColor || "#000"} 36%, transparent)`, border: `1px solid ${accentColor ? `color-mix(in srgb, ${accentColor} 45%, transparent)` : "rgba(127,127,127,.35)"}` }}>
                Shadow + radius sample card
              </div>
              <div style={{ paddingInline: `${Math.round(spaceScale * 16)}px`, paddingBlock: `${Math.round(spaceScale * 10)}px`, borderRadius: `${Math.round(radiusScale * 8)}px`, border: "1px dashed rgba(127,127,127,.45)" }}>
                Spacing sample block (tracks spaceScale)
              </div>
            </Stack>
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
              <Table.Thead><Table.Tr><Table.Th>Section</Table.Th><Table.Th>State</Table.Th><Table.Th>Impact</Table.Th><Table.Th>Used on</Table.Th><Table.Th /></Table.Tr></Table.Thead>
              <Table.Tbody>
                {rows.map((row) => {
                  const impact = impactByGlobalId[row.id]
                  const usage = usageByGlobalId[row.id] ?? []
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td>
                        <Group gap="xs"><Badge variant="default">{row.section_type}</Badge><Text fw={600}>{row.key}</Text></Group>
                        {row.label ? <Text size="xs" c="dimmed">{row.label}</Text> : null}
                      </Table.Td>
                      <Table.Td><Badge color={row.lifecycle_state === "published" ? "teal" : row.lifecycle_state === "archived" ? "gray" : "yellow"} variant="light">{row.lifecycle_state ?? "draft"}</Badge></Table.Td>
                      <Table.Td><Text size="sm">{impact?.enabled_references ?? 0} enabled refs</Text><Text size="xs" c="dimmed">{impact?.distinct_pages ?? 0} pages • {impact?.total_references ?? 0} total refs</Text></Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          {usage.slice(0, 3).map((u, idx) => <Text key={`${u.page_slug}-${idx}`} size="xs">/{u.page_slug}{u.section_key ? `#${u.section_key}` : ""}</Text>)}
                          {usage.length > 3 ? <Text size="xs" c="dimmed">+{usage.length - 3} more</Text> : null}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="end">
                          <Button size="xs" variant="default" onClick={() => void loadGlobalVersions(row)}>Edit</Button>
                          <Button size="xs" variant={row.enabled ? "default" : "outline"} onClick={() => void toggle(row)}>{row.enabled ? "Disable" : "Enable"}</Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
            </Table>
          )}
          <Divider />
          <Text size="xs" c="dimmed">Global editor supports draft → publish flow with version rollback.</Text>
        </Stack>
      </Paper>

      <Drawer opened={editorOpen} onClose={() => setEditorOpen(false)} position="right" size="xl" title={editing ? `Global section: ${editing.key}` : "Global section"}>
        <Stack>
          <Group justify="space-between">
            <Text fw={600}>Version workflow</Text>
            <Group>
              <Button variant="default" onClick={saveGlobalDraft}>Save draft</Button>
              <Button onClick={publishGlobalDraft}>Publish draft</Button>
            </Group>
          </Group>
          <Group grow>
            <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
            <TextInput label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.currentTarget.value)} />
          </Group>
          <Group grow>
            <TextInput label="Primary CTA label" value={ctaPrimaryLabel} onChange={(e) => setCtaPrimaryLabel(e.currentTarget.value)} />
            <TextInput label="Primary CTA href" value={ctaPrimaryHref} onChange={(e) => setCtaPrimaryHref(e.currentTarget.value)} />
          </Group>
          <Group grow>
            <TextInput label="Secondary CTA label" value={ctaSecondaryLabel} onChange={(e) => setCtaSecondaryLabel(e.currentTarget.value)} />
            <TextInput label="Secondary CTA href" value={ctaSecondaryHref} onChange={(e) => setCtaSecondaryHref(e.currentTarget.value)} />
          </Group>
          <Textarea label="Formatting JSON" minRows={8} autosize value={formattingText} onChange={(e) => setFormattingText(e.currentTarget.value)} />
          <Textarea label="Content JSON" minRows={12} autosize value={contentText} onChange={(e) => setContentText(e.currentTarget.value)} />

          <Divider my="xs" />
          <Text fw={600}>Versions</Text>
          <Stack gap={6}>
            {versions.map((v) => (
              <Paper withBorder p="sm" key={v.id}>
                <Group justify="space-between">
                  <Group gap="xs"><Badge variant="default">v{v.version}</Badge><Badge color={v.status === "published" ? "teal" : v.status === "draft" ? "yellow" : "gray"} variant="light">{v.status}</Badge></Group>
                  <Button size="xs" variant="subtle" onClick={() => void rollbackFromVersion(v.id)}>Restore as new draft</Button>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Drawer>
    </Stack>
  )
}
