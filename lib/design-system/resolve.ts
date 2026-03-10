// Main resolver — produces a ResolvedSectionUi from raw formatting values.
// This is the single entry point for the backend-to-frontend token pipeline.

import {
  validateToken,
  RHYTHMS,
  SURFACES,
  DENSITIES,
  GRID_GAPS,
  HEADING_TREATMENTS,
  LABEL_STYLES,
  DIVIDER_MODES,
  CARD_FAMILIES,
  CARD_CHROMES,
  ACCENT_RULES,
  SUBTITLE_SIZES,
  type ResolvedSectionUi,
  type Rhythm,
  type CardFamily,
  type CardChrome,
  type AccentRule,
} from "./tokens"
import { lookupSectionPreset, type SectionPreset } from "./presets"

type RawSectionFormatting = {
  sectionRhythm?: string
  sectionSurface?: string
  contentDensity?: string
  gridGap?: string
  headingTreatment?: string
  labelStyle?: string
  dividerMode?: string
  cardFamily?: string
  cardChrome?: string
  accentRule?: string
  subtitleSize?: string
  sectionPresetKey?: string
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : ""
}

type ResolveOptions = {
  /** DB-loaded presets — when provided, these are used instead of code constants. */
  presets?: Record<string, SectionPreset>
}

/**
 * Resolves raw CMS formatting into a validated ResolvedSectionUi.
 *
 * Resolution order:
 *   1. Lookup preset defaults (if sectionPresetKey provided)
 *   2. Override with explicit per-field values
 *   3. Validate all values against canonical token sets
 *   4. Apply section-type default rhythm if unset
 */
export function resolveSectionUi(
  raw: Record<string, unknown>,
  sectionType?: string,
  options?: ResolveOptions
): ResolvedSectionUi {
  const f: RawSectionFormatting = {
    sectionRhythm: asString(raw.sectionRhythm),
    sectionSurface: asString(raw.sectionSurface),
    contentDensity: asString(raw.contentDensity),
    gridGap: asString(raw.gridGap),
    headingTreatment: asString(raw.headingTreatment),
    labelStyle: asString(raw.labelStyle),
    dividerMode: asString(raw.dividerMode),
    cardFamily: asString(raw.cardFamily),
    cardChrome: asString(raw.cardChrome),
    accentRule: asString(raw.accentRule),
    subtitleSize: asString(raw.subtitleSize),
    sectionPresetKey: asString(raw.sectionPresetKey),
  }

  // Step 1: Resolve preset defaults — DB-loaded presets take priority over code constants
  let preset: SectionPreset | undefined
  if (f.sectionPresetKey) {
    preset = options?.presets?.[f.sectionPresetKey] ?? lookupSectionPreset(f.sectionPresetKey)
  }

  // Step 2: Merge — explicit values take priority over preset
  const rhythm = f.sectionRhythm || preset?.presentation.rhythm || ""
  const surface = f.sectionSurface || preset?.presentation.surface || ""
  const density = f.contentDensity || preset?.presentation.density || ""
  const gridGap = f.gridGap || preset?.presentation.gridGap || ""
  const headingTreatment = f.headingTreatment || preset?.presentation.headingTreatment || ""
  const labelStyle = f.labelStyle || preset?.presentation.labelStyle || ""
  const dividerMode = f.dividerMode || preset?.presentation.dividerMode || ""
  const componentFamily = f.cardFamily || preset?.component?.family || ""
  const componentChrome = f.cardChrome || preset?.component?.chrome || ""
  const accentRule = f.accentRule || preset?.component?.accentRule || ""
  const subtitleSize = f.subtitleSize || ""

  // Step 3: Section-type default rhythm
  const defaultRhythm: Record<string, Rhythm> = {
    hero_cta: "hero",
    cta_block: "cta",
    footer_grid: "footer",
    social_proof_strip: "compact",
    label_value_list: "compact",
  }
  const effectiveRhythm = rhythm || (sectionType ? defaultRhythm[sectionType] : "") || "standard"

  // Step 4: Validate
  return {
    rhythm: validateToken(effectiveRhythm, RHYTHMS, "standard"),
    surface: validateToken(surface, SURFACES, "none"),
    density: validateToken(density, DENSITIES, "standard"),
    gridGap: validateToken(gridGap, GRID_GAPS, "standard"),
    headingTreatment: validateToken(headingTreatment, HEADING_TREATMENTS, "default"),
    labelStyle: validateToken(labelStyle, LABEL_STYLES, "default"),
    dividerMode: validateToken(dividerMode, DIVIDER_MODES, "none"),
    subtitleSize: validateToken(subtitleSize, SUBTITLE_SIZES, "sm"),
    componentFamily: componentFamily
      ? validateToken<CardFamily>(componentFamily, CARD_FAMILIES, "quiet")
      : undefined,
    componentChrome: componentChrome
      ? validateToken<CardChrome>(componentChrome, CARD_CHROMES, "outlined")
      : undefined,
    accentRule: accentRule
      ? validateToken<AccentRule>(accentRule, ACCENT_RULES, "none")
      : undefined,
  }
}
