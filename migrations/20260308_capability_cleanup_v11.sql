-- v11 Phase 5: Capability cleanup — align DB with actual renderer support
-- hero_cta and footer_grid have no design-system integration (no ui prop)
-- steps_list now supports density, chrome, headingTreatment
-- rich_text_block, cta_block, faq_list now support density
-- faq_list and label_value_list now support headingTreatment

INSERT INTO public.section_control_capabilities
  (section_type, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta',        false,false,false, false, false, false, false, false, false, false),
  ('card_grid',       true, true, true,  true,  true,  true,  true,  true,  false, true),
  ('steps_list',      true, true, true,  false, true,  true,  true,  true,  true,  true),
  ('title_body_list', true, true, true,  false, false, false, false, true,  true,  false),
  ('rich_text_block', true, true, true,  false, false, false, false, false, true,  false),
  ('label_value_list',true, true, true,  false, false, false, false, false, true,  true),
  ('faq_list',        true, true, true,  false, false, false, false, true,  true,  false),
  ('cta_block',       true, true, true,  false, false, false, false, false, true,  false),
  ('footer_grid',     false,false,false, false, false, false, false, false, false, false),
  ('nav_links',       false,false,false, false, false, false, false, false, false, false)
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
