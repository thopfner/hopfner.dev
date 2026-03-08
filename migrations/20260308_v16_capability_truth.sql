-- v16: Capability Truth Backfill
-- Ensures section_control_capabilities rows exist and are truthful
-- for all homepage-relevant permanent section types.
-- Uses ON CONFLICT to upsert — safe to run multiple times.

-- hero_cta: headingTreatment + labelStyle only (bespoke layout, no rhythm/surface)
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta', NULL, false, false, false, false, false, false, false, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- social_proof_strip: rhythm, surface, density, gridGap, headingTreatment, labelStyle
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('social_proof_strip', NULL, true, true, true, true, false, false, false, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- proof_cluster: full semantic support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('proof_cluster', NULL, true, true, true, true, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- case_study_split: full semantic support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('case_study_split', NULL, true, true, true, true, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- steps_list: ensure gridGap is included
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('steps_list', NULL, true, true, true, true, true, true, true, true, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- card_grid: full card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('card_grid', NULL, true, true, true, true, true, true, true, true, false, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- title_body_list: gridGap, dividerMode, headingTreatment, labelStyle, card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('title_body_list', NULL, true, true, true, true, true, true, true, true, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- label_value_list: gridGap, headingTreatment, labelStyle, card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('label_value_list', NULL, true, true, true, true, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- cta_block: headingTreatment, labelStyle, card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('cta_block', NULL, true, true, true, false, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- rich_text_block
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('rich_text_block', NULL, true, true, true, false, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- faq_list
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('faq_list', NULL, true, true, true, false, true, true, true, true, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;
