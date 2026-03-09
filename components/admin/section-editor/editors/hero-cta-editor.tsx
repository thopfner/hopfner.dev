"use client"

import { useCallback } from "react"
import {
  Button,
  Divider,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@/components/mui-compat"
import { IconPlus } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  inputValueFromEvent,
} from "../payload"
import { ListEditor } from "../fields/list-editor"
import type { ContentEditorProps } from "../types"
import { HeroTrustItemRow } from "./hero-trust-item-row"
import { HeroStatRow } from "./hero-stat-row"
import { HeroProofPanelRow } from "./hero-proof-panel-row"
import { useBufferedField } from "../hooks/use-buffered-field"

const HERO_LAYOUT_OPTIONS = [
  { value: "centered", label: "Centered" },
  { value: "split", label: "Split (text left, proof right)" },
  { value: "split_reversed", label: "Split reversed (proof left, text right)" },
] as const

const HERO_PROOF_PANEL_OPTIONS = [
  { value: "", label: "None" },
  { value: "stats", label: "Stats grid" },
  { value: "mockup", label: "Mockup / screenshot" },
  { value: "image", label: "Image" },
] as const

const HERO_MOCKUP_VARIANT_OPTIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "workflow", label: "Workflow" },
  { value: "terminal", label: "Terminal" },
] as const

export function HeroCtaEditor({ content, onContentChange, setContentPath, loading }: ContentEditorProps) {
  const heroBullets = asArray<string>(content.bullets)
  const heroTrust = asString(content.trustLine)
  const heroLayoutVariant = asString(content.layoutVariant, "centered")
  const heroEyebrow = asString(content.eyebrow)
  const heroProofPanel = asRecord(content.proofPanel)
  const heroTrustItems = asArray<Record<string, unknown>>(content.trustItems)
  const heroStats = asArray<Record<string, unknown>>(content.heroStats)

  // --- Buffered fields for scalar inputs ---
  const eyebrowField = useBufferedField(
    heroEyebrow,
    useCallback((v: string) => setContentPath("eyebrow", v), [setContentPath]),
    300
  )
  const trustLineField = useBufferedField(
    heroTrust,
    useCallback((v: string) => setContentPath("trustLine", v), [setContentPath]),
    300
  )
  const proofHeadlineField = useBufferedField(
    asString(heroProofPanel.headline),
    useCallback(
      (v: string) =>
        onContentChange((c) => ({
          ...c,
          proofPanel: { ...asRecord(c.proofPanel), headline: v },
        })),
      [onContentChange]
    ),
    300
  )
  const proofImageUrlField = useBufferedField(
    asString(heroProofPanel.imageUrl),
    useCallback(
      (v: string) =>
        onContentChange((c) => ({
          ...c,
          proofPanel: { ...asRecord(c.proofPanel), imageUrl: v },
        })),
      [onContentChange]
    ),
    300
  )

  // --- Trust item callbacks ---
  const onChangeTrustItemText = useCallback(
    (index: number, value: string) => {
      onContentChange((c) => {
        const items = asArray<Record<string, unknown>>(c.trustItems).slice()
        items[index] = { ...items[index], text: value }
        return { ...c, trustItems: items }
      })
    },
    [onContentChange]
  )
  const onRemoveTrustItem = useCallback(
    (index: number) => {
      onContentChange((c) => ({
        ...c,
        trustItems: asArray<Record<string, unknown>>(c.trustItems).filter((_, i) => i !== index),
      }))
    },
    [onContentChange]
  )
  const onAddTrustItem = useCallback(() => {
    onContentChange((c) => ({
      ...c,
      trustItems: [...asArray<Record<string, unknown>>(c.trustItems), { text: "" }],
    }))
  }, [onContentChange])

  // --- Hero stat callbacks ---
  const onChangeStatValue = useCallback(
    (index: number, value: string) => {
      onContentChange((c) => {
        const stats = asArray<Record<string, unknown>>(c.heroStats).slice()
        stats[index] = { ...stats[index], value }
        return { ...c, heroStats: stats }
      })
    },
    [onContentChange]
  )
  const onChangeStatLabel = useCallback(
    (index: number, value: string) => {
      onContentChange((c) => {
        const stats = asArray<Record<string, unknown>>(c.heroStats).slice()
        stats[index] = { ...stats[index], label: value }
        return { ...c, heroStats: stats }
      })
    },
    [onContentChange]
  )
  const onRemoveStat = useCallback(
    (index: number) => {
      onContentChange((c) => ({
        ...c,
        heroStats: asArray<Record<string, unknown>>(c.heroStats).filter((_, i) => i !== index),
      }))
    },
    [onContentChange]
  )
  const onAddStat = useCallback(() => {
    onContentChange((c) => ({
      ...c,
      heroStats: [...asArray<Record<string, unknown>>(c.heroStats), { value: "", label: "" }],
    }))
  }, [onContentChange])

  // --- Proof panel stat callbacks ---
  const onChangeProofStatValue = useCallback(
    (index: number, value: string) => {
      onContentChange((c) => {
        const panel = asRecord(c.proofPanel)
        const items = asArray<Record<string, unknown>>(panel.items).slice()
        items[index] = { ...items[index], value }
        return { ...c, proofPanel: { ...panel, items } }
      })
    },
    [onContentChange]
  )
  const onChangeProofStatLabel = useCallback(
    (index: number, value: string) => {
      onContentChange((c) => {
        const panel = asRecord(c.proofPanel)
        const items = asArray<Record<string, unknown>>(panel.items).slice()
        items[index] = { ...items[index], label: value }
        return { ...c, proofPanel: { ...panel, items } }
      })
    },
    [onContentChange]
  )
  const onRemoveProofStat = useCallback(
    (index: number) => {
      onContentChange((c) => {
        const panel = asRecord(c.proofPanel)
        const items = asArray<Record<string, unknown>>(panel.items).filter((_, i) => i !== index)
        return { ...c, proofPanel: { ...panel, items } }
      })
    },
    [onContentChange]
  )
  const onAddProofStat = useCallback(() => {
    onContentChange((c) => {
      const panel = asRecord(c.proofPanel)
      const items = [...asArray<Record<string, unknown>>(panel.items), { value: "", label: "" }]
      return { ...c, proofPanel: { ...panel, items } }
    })
  }, [onContentChange])

  const proofPanelType = asString(heroProofPanel.type)

  return (
    <>
      <Select
        label="Hero layout"
        comboboxProps={{ withinPortal: false }}
        data={HERO_LAYOUT_OPTIONS as unknown as { value: string; label: string }[]}
        value={heroLayoutVariant}
        onChange={(v: string) =>
          onContentChange((c) => ({ ...c, layoutVariant: v || "centered" }))
        }
      />
      <TextInput
        label="Eyebrow"
        placeholder="e.g. AI + Automation Consultancy"
        value={eyebrowField.value}
        onChange={(e) => eyebrowField.onChange(e.currentTarget.value)}
        onBlur={eyebrowField.onBlur}
      />
      <ListEditor
        label="Bullets"
        items={heroBullets}
        onChange={(next) => onContentChange((c) => ({ ...c, bullets: next }))}
        placeholder="..."
      />
      <Textarea
        label="Trust line"
        value={trustLineField.value}
        onChange={(e) => trustLineField.onChange(e.currentTarget.value)}
        onBlur={trustLineField.onBlur}
        autosize
        minRows={2}
      />

      <Divider />
      <Text size="xs" c="dimmed" fw={500}>Trust items (replaces trust line if set)</Text>
      <Stack gap="xs">
        {heroTrustItems.map((item, idx) => (
          <HeroTrustItemRow
            key={idx}
            index={idx}
            text={asString(item.text)}
            onChangeText={onChangeTrustItemText}
            onRemove={onRemoveTrustItem}
          />
        ))}
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={onAddTrustItem}
        >
          Add trust item
        </Button>
      </Stack>

      <Divider />
      <Text size="xs" c="dimmed" fw={500}>Hero stats</Text>
      <Stack gap="xs">
        {heroStats.map((stat, idx) => (
          <HeroStatRow
            key={idx}
            index={idx}
            value={asString(stat.value)}
            label={asString(stat.label)}
            onChangeValue={onChangeStatValue}
            onChangeLabel={onChangeStatLabel}
            onRemove={onRemoveStat}
          />
        ))}
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={onAddStat}
        >
          Add stat
        </Button>
      </Stack>

      {heroLayoutVariant === "split" || heroLayoutVariant === "split_reversed" ? (
        <>
          <Divider />
          <Text size="xs" c="dimmed" fw={500}>Proof panel (split layout)</Text>
          <Select
            label="Proof panel type"
            comboboxProps={{ withinPortal: false }}
            data={HERO_PROOF_PANEL_OPTIONS as unknown as { value: string; label: string }[]}
            value={proofPanelType}
            onChange={(v: string) =>
              onContentChange((c) => ({
                ...c,
                proofPanel: { ...asRecord(c.proofPanel), type: v || undefined },
              }))
            }
          />
          {proofPanelType ? (
            <>
              <TextInput
                label="Proof headline"
                value={proofHeadlineField.value}
                onChange={(e) => proofHeadlineField.onChange(e.currentTarget.value)}
                onBlur={proofHeadlineField.onBlur}
              />
              {proofPanelType === "stats" ? (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Proof stats</Text>
                  {asArray<Record<string, unknown>>(heroProofPanel.items).map((pi, idx) => (
                    <HeroProofPanelRow
                      key={idx}
                      index={idx}
                      value={asString(pi.value)}
                      label={asString(pi.label)}
                      onChangeValue={onChangeProofStatValue}
                      onChangeLabel={onChangeProofStatLabel}
                      onRemove={onRemoveProofStat}
                    />
                  ))}
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<IconPlus size={14} />}
                    onClick={onAddProofStat}
                  >
                    Add proof stat
                  </Button>
                </Stack>
              ) : null}
              {proofPanelType === "mockup" ? (
                <Select
                  label="Mockup variant"
                  comboboxProps={{ withinPortal: false }}
                  data={HERO_MOCKUP_VARIANT_OPTIONS as unknown as { value: string; label: string }[]}
                  value={asString(heroProofPanel.mockupVariant, "dashboard")}
                  onChange={(v: string) =>
                    onContentChange((c) => ({
                      ...c,
                      proofPanel: { ...asRecord(c.proofPanel), mockupVariant: v || "dashboard" },
                    }))
                  }
                />
              ) : null}
              {proofPanelType !== "stats" ? (
                <TextInput
                  label="Proof image URL"
                  value={proofImageUrlField.value}
                  onChange={(e) => proofImageUrlField.onChange(e.currentTarget.value)}
                  onBlur={proofImageUrlField.onBlur}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}
