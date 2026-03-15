/**
 * Code-owned built-in shared-field visibility contract.
 *
 * For built-in section types the drawer uses this contract — not DB
 * capability rows alone — to decide which shared meta fields (title,
 * subtitle, CTA, background media) must appear in the editor.
 *
 * This prevents a bad or missing capability row from hiding a field
 * that the live renderer still consumes.
 */

export type BuiltinMetaFieldContract = {
  title: boolean
  subtitle: boolean
  ctaPrimary: boolean
  ctaSecondary: boolean
  backgroundMedia: boolean
}

const BUILTIN_SECTION_TYPES = [
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
  "footer_grid",
  "nav_links",
  "social_proof_strip",
  "proof_cluster",
  "case_study_split",
  "booking_scheduler",
] as const

export type BuiltinCmsSectionType = (typeof BUILTIN_SECTION_TYPES)[number]

export const BUILTIN_EDITOR_META_CONTRACT: Record<BuiltinCmsSectionType, BuiltinMetaFieldContract> = {
  hero_cta:           { title: true,  subtitle: true,  ctaPrimary: true,  ctaSecondary: true,  backgroundMedia: true  },
  card_grid:          { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  steps_list:         { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  title_body_list:    { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  rich_text_block:    { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  label_value_list:   { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  faq_list:           { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  cta_block:          { title: true,  subtitle: false, ctaPrimary: true,  ctaSecondary: true,  backgroundMedia: false },
  footer_grid:        { title: false, subtitle: false, ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  nav_links:          { title: false, subtitle: false, ctaPrimary: true,  ctaSecondary: false, backgroundMedia: false },
  social_proof_strip: { title: true,  subtitle: true,  ctaPrimary: false, ctaSecondary: false, backgroundMedia: false },
  proof_cluster:      { title: true,  subtitle: true,  ctaPrimary: true,  ctaSecondary: false, backgroundMedia: false },
  case_study_split:   { title: true,  subtitle: true,  ctaPrimary: true,  ctaSecondary: false, backgroundMedia: false },
  booking_scheduler:  { title: true,  subtitle: true,  ctaPrimary: true,  ctaSecondary: false, backgroundMedia: false },
}

export function isBuiltinSectionType(type: string | null): type is BuiltinCmsSectionType {
  return type !== null && type in BUILTIN_EDITOR_META_CONTRACT
}

/**
 * Resolve shared-field visibility for a section type.
 *
 * For built-in types the code contract is the final truth.
 * For custom/composed types we fall back to DB capability fields.
 */
export function resolveMetaFieldVisibility(
  sectionType: string | null,
  dbFieldCaps: Record<string, unknown>,
): BuiltinMetaFieldContract {
  if (sectionType && isBuiltinSectionType(sectionType)) {
    return BUILTIN_EDITOR_META_CONTRACT[sectionType]
  }
  // Custom/composed types — fall back to DB capabilities
  return {
    title: dbFieldCaps.title !== false,
    subtitle: dbFieldCaps.subtitle !== false,
    ctaPrimary: dbFieldCaps.cta_primary !== false,
    ctaSecondary: dbFieldCaps.cta_secondary !== false,
    backgroundMedia: dbFieldCaps.background_media === true,
  }
}
