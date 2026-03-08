// Runtime loaders for DB-backed design system registries.
// These are the primary data source; code constants in presets.ts/capabilities.ts are fallback only.

import type { SupabaseClient } from "@supabase/supabase-js"
import type { SectionPreset } from "./presets"
import { SECTION_PRESETS, COMPONENT_FAMILY_DEFAULTS } from "./presets"
import { SECTION_CAPABILITIES, type SectionCapability, type SemanticControl } from "./capabilities"
import type { CardFamily, CardChrome, AccentRule } from "./tokens"

// ---------- Section Presets ----------

type RegistryRow = {
  key: string
  section_type: string
  presentation_preset_key: string | null
  component_family_key: string | null
}

type PresentationRow = {
  key: string
  name: string
  description: string | null
  tokens: Record<string, unknown>
}

type FamilyRow = {
  key: string
  name: string
  description: string | null
  tokens: Record<string, unknown>
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

function normalizePresetFromDb(
  reg: RegistryRow,
  presentation: PresentationRow | undefined,
  family: FamilyRow | undefined
): SectionPreset {
  const pt = presentation?.tokens ?? {}
  const ft = family?.tokens ?? {}
  return {
    key: reg.key,
    name: presentation?.name ?? reg.key,
    description: presentation?.description ?? "",
    sectionType: reg.section_type,
    presentation: {
      rhythm: asString(pt.rhythm, "standard") as SectionPreset["presentation"]["rhythm"],
      surface: asString(pt.surface, "none") as SectionPreset["presentation"]["surface"],
      density: asString(pt.density, "standard") as SectionPreset["presentation"]["density"],
      gridGap: asString(pt.gridGap, "standard") as SectionPreset["presentation"]["gridGap"],
      headingTreatment: asString(pt.headingTreatment, "default") as SectionPreset["presentation"]["headingTreatment"],
      labelStyle: asString(pt.labelStyle, "default") as SectionPreset["presentation"]["labelStyle"],
      dividerMode: asString(pt.dividerMode, "none") as SectionPreset["presentation"]["dividerMode"],
    },
    component: reg.component_family_key
      ? {
          family: reg.component_family_key as CardFamily,
          chrome: asString(ft.chrome, "outlined") as CardChrome,
          accentRule: asString(ft.accentRule) as AccentRule | undefined,
        }
      : undefined,
  }
}

/**
 * Load section presets using an existing Supabase client (works for both server and browser).
 */
export async function loadSectionPresetsFromClient(
  supabase: SupabaseClient
): Promise<Record<string, SectionPreset>> {
  try {
    const [registryRes, presentationRes, familyRes] = await Promise.all([
      supabase.from("section_preset_registry").select("key, section_type, presentation_preset_key, component_family_key"),
      supabase.from("section_presentation_presets").select("key, name, description, tokens"),
      supabase.from("component_family_presets").select("key, name, description, tokens"),
    ])

    if (registryRes.error || !registryRes.data?.length) {
      return { ...SECTION_PRESETS }
    }

    const presentationMap = new Map<string, PresentationRow>()
    for (const row of (presentationRes.data ?? []) as PresentationRow[]) {
      presentationMap.set(row.key, row)
    }

    const familyMap = new Map<string, FamilyRow>()
    for (const row of (familyRes.data ?? []) as FamilyRow[]) {
      familyMap.set(row.key, row)
    }

    const result: Record<string, SectionPreset> = {}
    for (const reg of registryRes.data as RegistryRow[]) {
      const presentation = reg.presentation_preset_key ? presentationMap.get(reg.presentation_preset_key) : undefined
      const family = reg.component_family_key ? familyMap.get(reg.component_family_key) : undefined
      result[reg.key] = normalizePresetFromDb(reg, presentation, family)
    }

    return result
  } catch {
    return { ...SECTION_PRESETS }
  }
}

// ---------- Component Family Defaults ----------

export async function loadComponentFamilyDefaultsFromClient(
  supabase: SupabaseClient
): Promise<Record<string, { chrome: CardChrome; accentRule?: AccentRule }>> {
  try {
    const { data, error } = await supabase
      .from("component_family_presets")
      .select("key, tokens")

    if (error || !data?.length) {
      return { ...COMPONENT_FAMILY_DEFAULTS }
    }

    const result: Record<string, { chrome: CardChrome; accentRule?: AccentRule }> = {}
    for (const row of data as FamilyRow[]) {
      result[row.key] = {
        chrome: asString(row.tokens.chrome, "outlined") as CardChrome,
        accentRule: row.tokens.accentRule ? asString(row.tokens.accentRule) as AccentRule : undefined,
      }
    }
    return result
  } catch {
    return { ...COMPONENT_FAMILY_DEFAULTS }
  }
}

// ---------- Capabilities ----------

const CONTROL_COLUMN_MAP: Record<string, SemanticControl> = {
  supports_rhythm: "sectionRhythm",
  supports_surface: "sectionSurface",
  supports_density: "contentDensity",
  supports_grid_gap: "gridGap",
  supports_card_family: "cardFamily",
  supports_card_chrome: "cardChrome",
  supports_accent_rule: "accentRule",
  supports_divider_mode: "dividerMode",
  supports_heading_treatment: "headingTreatment",
  supports_label_style: "labelStyle",
}

type CapabilityRow = {
  section_type: string
  [key: string]: unknown
}

export async function loadCapabilitiesFromClient(
  supabase: SupabaseClient
): Promise<Record<string, SectionCapability>> {
  try {
    const { data, error } = await supabase
      .from("section_control_capabilities")
      .select("*")

    // Start from code constants, then overlay DB rows on top
    const result: Record<string, SectionCapability> = { ...SECTION_CAPABILITIES }

    if (error || !data?.length) {
      return result
    }

    for (const row of data as CapabilityRow[]) {
      const supported: SemanticControl[] = []
      for (const [col, control] of Object.entries(CONTROL_COLUMN_MAP)) {
        if (row[col] === true) supported.push(control)
      }
      result[row.section_type] = { supported }
    }
    return result
  } catch {
    return { ...SECTION_CAPABILITIES }
  }
}

// ---------- Theme Presets ----------

export type ThemePresetRow = {
  id: string
  key: string
  name: string
  description: string | null
  is_system: boolean
  tokens: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function loadThemePresetsFromClient(
  supabase: SupabaseClient
): Promise<ThemePresetRow[]> {
  try {
    const { data, error } = await supabase
      .from("design_theme_presets")
      .select("id, key, name, description, is_system, tokens, created_at, updated_at")
      .order("is_system", { ascending: false })
      .order("name", { ascending: true })

    if (error || !data) return []
    return data as ThemePresetRow[]
  } catch {
    return []
  }
}
