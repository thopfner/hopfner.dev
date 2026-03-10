"use client"

import { memo, useCallback, useMemo } from "react"
import {
  Divider,
  Paper,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Text,
} from "@/components/mui-compat"
import type { SemanticControl } from "@/lib/design-system/capabilities"
import type { SectionPreset } from "@/lib/design-system/presets"

// Re-export the FormattingState type shape for the parent to use
export type FormattingState = {
  containerClass: string
  sectionClass: string
  paddingY: "" | "py-4" | "py-6" | "py-8" | "py-10" | "py-12"
  outerSpacing: "" | "my-2" | "my-4" | "my-6" | "my-8" | "my-10" | "my-12"
  spacingTop: string
  spacingBottom: string
  maxWidth: "" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl"
  textAlign: "" | "left" | "center"
  heroRightAlign: "" | "left" | "center"
  widthMode: "content" | "full"
  heroMinHeight: "auto" | "70svh" | "100svh"
  shadowMode: "inherit" | "on" | "off"
  innerShadowMode: "inherit" | "on" | "off"
  innerShadowStrength: number
  sectionRhythm?: string
  contentDensity?: string
  gridGap?: string
  sectionSurface?: string
  cardFamily?: string
  cardChrome?: string
  accentRule?: string
  dividerMode?: string
  headingTreatment?: string
  labelStyle?: string
  sectionPresetKey?: string
  mobile?: {
    containerClass: string
    sectionClass: string
    paddingY: "" | "py-4" | "py-6" | "py-8" | "py-10" | "py-12"
  }
}

// ---------- Static dropdown data (never changes, defined once) ----------

const RHYTHM_DATA = [
  { value: "", label: "Default" },
  { value: "hero", label: "Hero" },
  { value: "statement", label: "Statement" },
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "proof", label: "Proof" },
  { value: "cta", label: "CTA" },
  { value: "footer", label: "Footer" },
] as const

const SURFACE_DATA = [
  { value: "", label: "Default" },
  { value: "none", label: "None" },
  { value: "panel", label: "Panel (card-like)" },
  { value: "soft_band", label: "Soft band (subtle tonal shift)" },
  { value: "contrast_band", label: "Contrast band (strong shift)" },
  { value: "spotlight_stage", label: "Spotlight (accent gradient)" },
  { value: "grid_stage", label: "Grid stage (radial dome)" },
  { value: "gradient_mesh", label: "Gradient mesh (animated)" },
  { value: "accent_glow", label: "Accent glow (edge glow)" },
  { value: "dark_elevated", label: "Dark elevated (raised)" },
  { value: "dot_grid", label: "Dot grid (pattern)" },
] as const

const DENSITY_DATA = [
  { value: "", label: "Default" },
  { value: "tight", label: "Tight" },
  { value: "standard", label: "Standard" },
  { value: "airy", label: "Airy" },
] as const

const GRID_GAP_DATA = [
  { value: "", label: "Default" },
  { value: "tight", label: "Tight" },
  { value: "standard", label: "Standard" },
  { value: "wide", label: "Wide" },
] as const

const HEADING_DATA = [
  { value: "", label: "Default" },
  { value: "default", label: "Default (explicit)" },
  { value: "display", label: "Display" },
  { value: "mono", label: "Mono" },
  { value: "gradient", label: "Gradient" },
  { value: "gradient_accent", label: "Gradient accent" },
  { value: "display_xl", label: "Display XL" },
  { value: "display_lg", label: "Display LG" },
  { value: "display_md", label: "Display MD" },
] as const

const LABEL_DATA = [
  { value: "", label: "Default" },
  { value: "default", label: "Default (explicit)" },
  { value: "mono", label: "Mono" },
  { value: "pill", label: "Pill" },
  { value: "micro", label: "Micro" },
] as const

const DIVIDER_DATA = [
  { value: "", label: "Default" },
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "strong", label: "Strong" },
] as const

const FAMILY_DATA = [
  { value: "", label: "Default" },
  { value: "quiet", label: "Quiet" },
  { value: "service", label: "Service" },
  { value: "metric", label: "Metric" },
  { value: "process", label: "Process" },
  { value: "proof", label: "Proof" },
  { value: "logo_tile", label: "Logo tile" },
  { value: "cta", label: "CTA" },
] as const

const CHROME_DATA = [
  { value: "", label: "Default" },
  { value: "flat", label: "Flat" },
  { value: "outlined", label: "Outlined" },
  { value: "elevated", label: "Elevated" },
  { value: "inset", label: "Inset" },
  { value: "glow", label: "Glow" },
] as const

const ACCENT_DATA = [
  { value: "", label: "Default" },
  { value: "none", label: "None" },
  { value: "top", label: "Top" },
  { value: "left", label: "Left" },
  { value: "inline", label: "Inline" },
] as const

const PADDING_DATA = ["", "py-4", "py-6", "py-8", "py-10", "py-12"] as const

const MAX_WIDTH_DATA = ["", "max-w-3xl", "max-w-4xl", "max-w-5xl", "max-w-6xl"] as const

const TEXT_ALIGN_DATA = [
  { value: "", label: "(default)" },
  { value: "left", label: "left" },
  { value: "center", label: "center" },
] as const

const HERO_WIDTH_DATA = [
  { value: "content", label: "Contained" },
  { value: "full", label: "Full-bleed" },
] as const

const HERO_HEIGHT_DATA = [
  { value: "auto", label: "Auto" },
  { value: "70svh", label: "70% viewport" },
  { value: "100svh", label: "100% viewport" },
] as const

const SHADOW_DATA = [
  { value: "inherit", label: "Inherit site setting" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
] as const

const OUTER_SPACING_DATA = [
  { value: "", label: "(default)" },
  { value: "my-2", label: "my-2" },
  { value: "my-4", label: "my-4" },
  { value: "my-6", label: "my-6" },
  { value: "my-8", label: "my-8" },
  { value: "my-10", label: "my-10" },
  { value: "my-12", label: "my-12" },
] as const

const SPACING_TOP_DATA = [
  { value: "", label: "(default)" },
  { value: "pt-0", label: "None (pt-0)" },
  { value: "pt-2", label: "pt-2" },
  { value: "pt-4", label: "pt-4" },
  { value: "pt-6", label: "pt-6" },
  { value: "pt-8", label: "pt-8" },
  { value: "pt-10", label: "pt-10" },
  { value: "pt-12", label: "pt-12" },
  { value: "pt-16", label: "pt-16" },
  { value: "pt-20", label: "pt-20" },
  { value: "pt-24", label: "pt-24" },
] as const

const SPACING_BOTTOM_DATA = [
  { value: "", label: "(default)" },
  { value: "pb-0", label: "None (pb-0)" },
  { value: "pb-2", label: "pb-2" },
  { value: "pb-4", label: "pb-4" },
  { value: "pb-6", label: "pb-6" },
  { value: "pb-8", label: "pb-8" },
  { value: "pb-10", label: "pb-10" },
  { value: "pb-12", label: "pb-12" },
  { value: "pb-16", label: "pb-16" },
  { value: "pb-20", label: "pb-20" },
  { value: "pb-24", label: "pb-24" },
] as const

// ---------- Semantic Controls (memoized) ----------

const SemanticControls = memo(function SemanticControls({
  formatting,
  onFormattingChange,
  isControlSupported,
  sectionType,
}: {
  formatting: FormattingState
  onFormattingChange: (updater: (f: FormattingState) => FormattingState) => void
  isControlSupported: (type: string, control: SemanticControl) => boolean
  sectionType: string
}) {
  const has = useCallback(
    (c: SemanticControl) => isControlSupported(sectionType, c),
    [isControlSupported, sectionType]
  )

  const hasPresentationControls = has("sectionRhythm") || has("sectionSurface") || has("contentDensity") || has("gridGap") || has("headingTreatment") || has("labelStyle") || has("dividerMode")
  const hasComponentControls = has("cardFamily") || has("cardChrome") || has("accentRule")

  if (!hasPresentationControls && !hasComponentControls) {
    return <Text size="xs" c="dimmed">No semantic controls for this section type.</Text>
  }

  return (
    <Stack gap="sm">
      {hasPresentationControls ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {has("sectionRhythm") ? (
            <Select
              label="Section rhythm"
              comboboxProps={{ withinPortal: false }}
              value={formatting.sectionRhythm || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, sectionRhythm: val || "" }))}
              data={RHYTHM_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
          {has("sectionSurface") ? (
            <Select
              label="Section surface"
              comboboxProps={{ withinPortal: false }}
              value={formatting.sectionSurface || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, sectionSurface: val || "" }))}
              data={SURFACE_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
          {has("contentDensity") ? (
            <Select
              label="Content density"
              comboboxProps={{ withinPortal: false }}
              value={formatting.contentDensity || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, contentDensity: val || "" }))}
              data={DENSITY_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
          {has("gridGap") ? (
            <Select
              label="Grid gap"
              comboboxProps={{ withinPortal: false }}
              value={formatting.gridGap || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, gridGap: val || "" }))}
              data={GRID_GAP_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
          {has("headingTreatment") ? (
            <Select
              label="Heading treatment"
              comboboxProps={{ withinPortal: false }}
              value={formatting.headingTreatment || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, headingTreatment: val || "" }))}
              data={HEADING_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
          {has("labelStyle") ? (
            <Select
              label="Label style"
              comboboxProps={{ withinPortal: false }}
              value={formatting.labelStyle || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, labelStyle: val || "" }))}
              data={LABEL_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
          {has("dividerMode") ? (
            <Select
              label="Divider mode"
              comboboxProps={{ withinPortal: false }}
              value={formatting.dividerMode || ""}
              onChange={(val: string) => onFormattingChange((f) => ({ ...f, dividerMode: val || "" }))}
              data={DIVIDER_DATA as unknown as { value: string; label: string }[]}
            />
          ) : null}
        </SimpleGrid>
      ) : null}
      {hasComponentControls ? (
        <>
          <Text fw={500} size="xs" mt="sm">Component family</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {has("cardFamily") ? (
              <Select
                label="Card family"
                comboboxProps={{ withinPortal: false }}
                value={formatting.cardFamily || ""}
                onChange={(val: string) => onFormattingChange((f) => ({ ...f, cardFamily: val || "" }))}
                data={FAMILY_DATA as unknown as { value: string; label: string }[]}
              />
            ) : null}
            {has("cardChrome") ? (
              <Select
                label="Card chrome"
                description="Modifies the card family base style"
                comboboxProps={{ withinPortal: false }}
                value={formatting.cardChrome || ""}
                onChange={(val: string) => onFormattingChange((f) => ({ ...f, cardChrome: val || "" }))}
                data={CHROME_DATA as unknown as { value: string; label: string }[]}
              />
            ) : null}
            {has("accentRule") ? (
              <Select
                label="Accent rule"
                comboboxProps={{ withinPortal: false }}
                value={formatting.accentRule || ""}
                onChange={(val: string) => onFormattingChange((f) => ({ ...f, accentRule: val || "" }))}
                data={ACCENT_DATA as unknown as { value: string; label: string }[]}
              />
            ) : null}
          </SimpleGrid>
        </>
      ) : null}
    </Stack>
  )
})

// ---------- Low-Level Overrides (memoized) ----------

const LowLevelOverrides = memo(function LowLevelOverrides({
  formatting,
  onFormattingChange,
  sectionType,
}: {
  formatting: FormattingState
  onFormattingChange: (updater: (f: FormattingState) => FormattingState) => void
  sectionType: string | null
}) {
  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Select
          label="Content spacing (inner)"
          comboboxProps={{ withinPortal: false }}
          data={PADDING_DATA as unknown as string[]}
          value={formatting.paddingY}
          onChange={(v: string) => onFormattingChange((s) => ({ ...s, paddingY: (v ?? "") as FormattingState["paddingY"] || "" }))}
        />
        <Select
          label="Max width"
          comboboxProps={{ withinPortal: false }}
          data={MAX_WIDTH_DATA as unknown as string[]}
          value={formatting.maxWidth}
          onChange={(v: string) => onFormattingChange((s) => ({ ...s, maxWidth: (v ?? "") as FormattingState["maxWidth"] || "" }))}
        />
        <Select
          label="Text align"
          comboboxProps={{ withinPortal: false }}
          data={TEXT_ALIGN_DATA as unknown as { value: string; label: string }[]}
          value={formatting.textAlign}
          onChange={(v: string) => onFormattingChange((s) => ({ ...s, textAlign: (v ?? "") as FormattingState["textAlign"] || "" }))}
        />
        {sectionType === "hero_cta" ? (
          <>
            <Select
              label="Right column align (split)"
              comboboxProps={{ withinPortal: false }}
              data={TEXT_ALIGN_DATA as unknown as { value: string; label: string }[]}
              value={formatting.heroRightAlign}
              onChange={(v: string) => onFormattingChange((s) => ({ ...s, heroRightAlign: (v ?? "") as FormattingState["heroRightAlign"] || "" }))}
            />
            <Select
              label="Hero width mode"
              comboboxProps={{ withinPortal: false }}
              data={HERO_WIDTH_DATA as unknown as { value: string; label: string }[]}
              value={formatting.widthMode}
              onChange={(v: string) => onFormattingChange((s) => ({ ...s, widthMode: v === "full" ? "full" : "content" }))}
            />
            <Select
              label="Hero min height"
              comboboxProps={{ withinPortal: false }}
              data={HERO_HEIGHT_DATA as unknown as { value: string; label: string }[]}
              value={formatting.heroMinHeight}
              onChange={(v: string) => onFormattingChange((s) => ({ ...s, heroMinHeight: v === "70svh" || v === "100svh" ? v : "auto" }))}
            />
          </>
        ) : null}
        <Select
          label="Section shadow"
          comboboxProps={{ withinPortal: false }}
          data={SHADOW_DATA as unknown as { value: string; label: string }[]}
          value={formatting.shadowMode}
          onChange={(v: string) => onFormattingChange((s) => ({ ...s, shadowMode: v === "on" || v === "off" ? v : "inherit" }))}
        />
        <Select
          label="Inner bevel/glow"
          comboboxProps={{ withinPortal: false }}
          data={SHADOW_DATA as unknown as { value: string; label: string }[]}
          value={formatting.innerShadowMode}
          onChange={(v: string) => onFormattingChange((s) => ({ ...s, innerShadowMode: v === "on" || v === "off" ? v : "inherit" }))}
        />
      </SimpleGrid>

      {formatting.innerShadowMode === "on" ? (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Inner bevel/glow scale ({formatting.innerShadowStrength.toFixed(2)}x)
          </Text>
          <Slider
            label={(v: number) => `${v.toFixed(2)}x`}
            min={0}
            max={1.8}
            step={0.05}
            value={formatting.innerShadowStrength}
            onChange={(v: number) => onFormattingChange((s) => ({ ...s, innerShadowStrength: Math.min(1.8, Math.max(0, v)) }))}
          />
        </Stack>
      ) : null}
    </>
  )
})

// ---------- Advanced Spacing (memoized) ----------

const AdvancedSpacing = memo(function AdvancedSpacing({
  formatting,
  onFormattingChange,
}: {
  formatting: FormattingState
  onFormattingChange: (updater: (f: FormattingState) => FormattingState) => void
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      <Select
        label="Top spacing"
        comboboxProps={{ withinPortal: false }}
        data={SPACING_TOP_DATA as unknown as { value: string; label: string }[]}
        value={formatting.spacingTop}
        onChange={(v: string) => onFormattingChange((s) => ({ ...s, spacingTop: v ?? "" }))}
      />
      <Select
        label="Bottom spacing"
        comboboxProps={{ withinPortal: false }}
        data={SPACING_BOTTOM_DATA as unknown as { value: string; label: string }[]}
        value={formatting.spacingBottom}
        onChange={(v: string) => onFormattingChange((s) => ({ ...s, spacingBottom: v ?? "" }))}
      />
      <Select
        label="Section spacing (outer)"
        comboboxProps={{ withinPortal: false }}
        data={OUTER_SPACING_DATA as unknown as { value: string; label: string }[]}
        value={formatting.outerSpacing}
        onChange={(v: string) => onFormattingChange((s) => ({ ...s, outerSpacing: (v ?? "") as FormattingState["outerSpacing"] || "" }))}
      />
    </SimpleGrid>
  )
})

// ---------- Preset Selector (memoized) ----------

const PresetSelector = memo(function PresetSelector({
  formatting,
  onFormattingChange,
  activePresets,
  sectionType,
}: {
  formatting: FormattingState
  onFormattingChange: (updater: (f: FormattingState) => FormattingState) => void
  activePresets: Record<string, SectionPreset>
  sectionType: string | null
}) {
  const presetOptions = useMemo(
    () =>
      Object.values(activePresets)
        .filter((p) => !sectionType || p.sectionType === sectionType || sectionType === "composed")
        .map((p) => ({ value: p.key, label: p.name })),
    [activePresets, sectionType]
  )

  const handleChange = useCallback(
    (val: string) => {
      const preset = val ? activePresets[val] : undefined
      if (preset) {
        onFormattingChange((f) => ({
          ...f,
          sectionPresetKey: val,
          sectionRhythm: preset.presentation.rhythm || f.sectionRhythm || "",
          sectionSurface: preset.presentation.surface || f.sectionSurface || "",
          contentDensity: preset.presentation.density || f.contentDensity || "",
          gridGap: preset.presentation.gridGap || f.gridGap || "",
          headingTreatment: preset.presentation.headingTreatment || f.headingTreatment || "",
          labelStyle: preset.presentation.labelStyle || f.labelStyle || "",
          dividerMode: preset.presentation.dividerMode || f.dividerMode || "",
          cardFamily: preset.component?.family || f.cardFamily || "",
          cardChrome: preset.component?.chrome || f.cardChrome || "",
          accentRule: preset.component?.accentRule || f.accentRule || "",
        }))
      } else {
        onFormattingChange((f) => ({ ...f, sectionPresetKey: "" }))
      }
    },
    [activePresets, onFormattingChange]
  )

  if (presetOptions.length === 0) {
    return <Text size="xs" c="dimmed">No presets for this section type.</Text>
  }

  return (
    <Select
      label="Apply preset"
      description="Prefills presentation and component tokens"
      comboboxProps={{ withinPortal: false }}
      value={formatting.sectionPresetKey || ""}
      onChange={handleChange}
      data={[{ value: "", label: "None (manual)" }, ...presetOptions]}
      clearable
    />
  )
})

// ---------- Main Exported Component ----------

export const FormattingControls = memo(function FormattingControls({
  formatting,
  onFormattingChange,
  isControlSupported,
  activePresets,
  sectionType,
}: {
  formatting: FormattingState
  onFormattingChange: (updater: (f: FormattingState) => FormattingState) => void
  isControlSupported: (type: string, control: SemanticControl) => boolean
  activePresets: Record<string, SectionPreset>
  sectionType: string | null
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={600} size="sm">Formatting</Text>

        <Text fw={600} size="sm">Section preset</Text>
        <PresetSelector
          formatting={formatting}
          onFormattingChange={onFormattingChange}
          activePresets={activePresets}
          sectionType={sectionType}
        />

        <Divider style={{ marginTop: 4, marginBottom: 4 }} />

        <Text fw={600} size="sm">Presentation</Text>
        <SemanticControls
          formatting={formatting}
          onFormattingChange={onFormattingChange}
          isControlSupported={isControlSupported}
          sectionType={sectionType ?? ""}
        />

        <Divider style={{ marginTop: 4, marginBottom: 4 }} />

        <Text fw={600} size="sm">Advanced spacing</Text>
        <AdvancedSpacing
          formatting={formatting}
          onFormattingChange={onFormattingChange}
        />

        <Divider style={{ marginTop: 4, marginBottom: 4 }} />

        <Text fw={600} size="sm">Low-level overrides</Text>
        <LowLevelOverrides
          formatting={formatting}
          onFormattingChange={onFormattingChange}
          sectionType={sectionType}
        />
      </Stack>
    </Paper>
  )
})
