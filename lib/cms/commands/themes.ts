import type { SupabaseClient } from "@supabase/supabase-js"

import { asRecord, deepMerge } from "@/lib/cms/payload"

export type DesignThemePresetRecord = {
  id: string
  key: string
  name: string
  description: string | null
  tokens: Record<string, unknown>
  is_system: boolean
  created_at: string
  updated_at: string
}

export type CreateDesignThemePresetInput = {
  key?: string | null
  name: string
  description?: string | null
  settings: Record<string, unknown>
}

export type UpdateDesignThemePresetInput = {
  id: string
  name: string
  description?: string | null
  settings: Record<string, unknown>
}

export type ApplySiteThemeSettingsInput = {
  settings: Record<string, unknown>
  presetId?: string | null
}

function normalizeThemePresetKey(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function normalizeThemePresetTokens(settings: Record<string, unknown>) {
  const record = asRecord(settings)
  const tokens = asRecord(record.tokens)
  return Object.keys(tokens).length > 0 ? tokens : record
}

export async function createDesignThemePreset(
  supabase: SupabaseClient,
  input: CreateDesignThemePresetInput
) {
  const name = input.name.trim()
  if (!name) {
    throw new Error("Theme preset name is required.")
  }

  const key = normalizeThemePresetKey(input.key?.trim() || name)
  if (!key) {
    throw new Error("Theme preset key is required.")
  }

  const { data, error } = await supabase
    .from("design_theme_presets")
    .insert({
      key,
      name,
      description: input.description?.trim() || null,
      tokens: normalizeThemePresetTokens(input.settings),
      is_system: false,
    })
    .select("id, key, name, description, tokens, is_system, created_at, updated_at")
    .single<DesignThemePresetRecord>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create theme preset.")
  }

  return data
}

export async function updateDesignThemePreset(
  supabase: SupabaseClient,
  input: UpdateDesignThemePresetInput
) {
  const name = input.name.trim()
  if (!name) {
    throw new Error("Theme preset name is required.")
  }

  const { data, error } = await supabase
    .from("design_theme_presets")
    .update({
      name,
      description: input.description?.trim() || null,
      tokens: normalizeThemePresetTokens(input.settings),
    })
    .eq("id", input.id)
    .select("id, key, name, description, tokens, is_system, created_at, updated_at")
    .single<DesignThemePresetRecord>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update theme preset.")
  }

  return data
}

export async function applyDesignThemePreset(
  supabase: SupabaseClient,
  presetId: string
) {
  const { data: preset, error: presetError } = await supabase
    .from("design_theme_presets")
    .select("id, tokens")
    .eq("id", presetId)
    .maybeSingle<{ id: string; tokens: Record<string, unknown> | null }>()

  if (presetError) {
    throw new Error(presetError.message)
  }

  if (!preset) {
    throw new Error("Theme preset not found.")
  }

  const { data: existing, error: existingError } = await supabase
    .from("site_formatting_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle<{ settings: Record<string, unknown> | null }>()

  if (existingError) {
    throw new Error(existingError.message)
  }

  const merged = deepMerge(asRecord(existing?.settings), { tokens: asRecord(preset.tokens) })
  merged._appliedTemplateId = preset.id

  const { error } = await supabase.from("site_formatting_settings").upsert({
    id: "default",
    settings: merged,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    presetId: preset.id,
    settings: merged,
  }
}

export async function applySiteThemeSettings(
  supabase: SupabaseClient,
  input: ApplySiteThemeSettingsInput
) {
  const { data: existing, error: existingError } = await supabase
    .from("site_formatting_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle<{ settings: Record<string, unknown> | null }>()

  if (existingError) {
    throw new Error(existingError.message)
  }

  const merged = deepMerge(asRecord(existing?.settings), asRecord(input.settings))

  if (input.presetId !== undefined) {
    merged._appliedTemplateId = input.presetId
  }

  const { error } = await supabase.from("site_formatting_settings").upsert({
    id: "default",
    settings: merged,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    presetId: input.presetId ?? null,
    settings: merged,
  }
}
