-- Design System Token Registries (v7)
-- Adds formal persistence for design-system presets and capabilities.

-- 1. Design theme presets (site-wide design-system presets)
CREATE TABLE IF NOT EXISTS public.design_theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Section presentation presets (layout/surface/rhythm bundles)
CREATE TABLE IF NOT EXISTS public.section_presentation_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Component family presets (card/component style bundles)
CREATE TABLE IF NOT EXISTS public.component_family_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Section preset registry (maps a semantic preset to section type + variant)
CREATE TABLE IF NOT EXISTS public.section_preset_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  section_type text NOT NULL,
  variant_key text,
  presentation_preset_key text REFERENCES public.section_presentation_presets(key),
  component_family_key text REFERENCES public.component_family_presets(key),
  default_content_variant text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Section control capabilities (what controls each section type supports)
CREATE TABLE IF NOT EXISTS public.section_control_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  variant_key text,
  supports_rhythm boolean NOT NULL DEFAULT true,
  supports_surface boolean NOT NULL DEFAULT true,
  supports_density boolean NOT NULL DEFAULT false,
  supports_grid_gap boolean NOT NULL DEFAULT false,
  supports_card_family boolean NOT NULL DEFAULT false,
  supports_card_chrome boolean NOT NULL DEFAULT false,
  supports_accent_rule boolean NOT NULL DEFAULT false,
  supports_divider_mode boolean NOT NULL DEFAULT false,
  supports_heading_treatment boolean NOT NULL DEFAULT false,
  supports_label_style boolean NOT NULL DEFAULT false,
  UNIQUE (section_type, variant_key)
);

-- Enable RLS
ALTER TABLE public.design_theme_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_presentation_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_family_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_preset_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_control_capabilities ENABLE ROW LEVEL SECURITY;

-- Public read for all preset tables (needed by frontend resolver)
CREATE POLICY "Public read design_theme_presets"
  ON public.design_theme_presets FOR SELECT USING (true);
CREATE POLICY "Public read section_presentation_presets"
  ON public.section_presentation_presets FOR SELECT USING (true);
CREATE POLICY "Public read component_family_presets"
  ON public.component_family_presets FOR SELECT USING (true);
CREATE POLICY "Public read section_preset_registry"
  ON public.section_preset_registry FOR SELECT USING (true);
CREATE POLICY "Public read section_control_capabilities"
  ON public.section_control_capabilities FOR SELECT USING (true);

-- Seed: Design theme presets
INSERT INTO public.design_theme_presets (key, name, description, tokens) VALUES
  ('obsidian_operator', 'Obsidian Operator', 'Premium dark operator aesthetic with Space Grotesk display, IBM Plex body', '{
    "displayFontFamily": "var(--font-space-grotesk), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
    "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "displayTracking": "-0.035em",
    "accentColor": "hsl(220 70% 55%)",
    "signatureStyle": "obsidian_signal",
    "signatureGridOpacity": 0.06,
    "signatureGlowOpacity": 0.08
  }'::jsonb),
  ('executive_slate', 'Executive Slate', 'Professional dark theme with DM Sans typography', '{
    "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "accentColor": "hsl(210 40% 50%)",
    "signatureStyle": "off"
  }'::jsonb),
  ('signal_grid', 'Signal Grid', 'Data-forward aesthetic with IBM Plex Mono heavy', '{
    "displayFontFamily": "var(--font-ibm-plex-mono), monospace",
    "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
    "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
    "displayWeight": 600,
    "headingWeight": 500,
    "displayTracking": "-0.02em",
    "accentColor": "hsl(160 60% 45%)",
    "signatureStyle": "grid_rays",
    "signatureGridOpacity": 0.08,
    "signatureGlowOpacity": 0.05
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Seed: Section presentation presets
INSERT INTO public.section_presentation_presets (key, name, description, tokens) VALUES
  ('hero_stage', 'Hero Stage', 'Primary hero section with full impact', '{
    "rhythm": "hero", "surface": "spotlight_stage", "density": "standard",
    "gridGap": "standard", "headingTreatment": "display",
    "labelStyle": "default", "dividerMode": "none"
  }'::jsonb),
  ('services_snapshot', 'Services Snapshot', 'Premium service offering cards', '{
    "rhythm": "standard", "surface": "spotlight_stage", "density": "airy",
    "gridGap": "wide", "headingTreatment": "default",
    "labelStyle": "pill", "dividerMode": "strong"
  }'::jsonb),
  ('proof_grid', 'Proof Grid', 'Evidence and metrics display', '{
    "rhythm": "proof", "surface": "soft_band", "density": "standard",
    "gridGap": "standard", "headingTreatment": "default",
    "labelStyle": "default", "dividerMode": "subtle"
  }'::jsonb),
  ('trust_strip', 'Trust Strip', 'Compact trust indicators', '{
    "rhythm": "compact", "surface": "soft_band", "density": "tight",
    "gridGap": "tight", "headingTreatment": "default",
    "labelStyle": "mono", "dividerMode": "none"
  }'::jsonb),
  ('process_flow', 'Process Flow', 'Step-by-step engagement', '{
    "rhythm": "standard", "surface": "none", "density": "standard",
    "gridGap": "standard", "headingTreatment": "default",
    "labelStyle": "mono", "dividerMode": "none"
  }'::jsonb),
  ('cta_close', 'CTA Close', 'Final call-to-action', '{
    "rhythm": "cta", "surface": "contrast_band", "density": "standard",
    "gridGap": "standard", "headingTreatment": "display",
    "labelStyle": "default", "dividerMode": "none"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Seed: Component family presets
INSERT INTO public.component_family_presets (key, name, description, tokens) VALUES
  ('service', 'Service', 'Premium service card with gradient depth', '{
    "chrome": "elevated", "accentRule": "left"
  }'::jsonb),
  ('proof', 'Proof', 'Evidence/testimonial card', '{
    "chrome": "outlined", "accentRule": "none"
  }'::jsonb),
  ('metric', 'Metric', 'Data-focused centered tile', '{
    "chrome": "flat", "accentRule": "none"
  }'::jsonb),
  ('process', 'Process', 'Step-indicator card with left accent', '{
    "chrome": "outlined", "accentRule": "left"
  }'::jsonb),
  ('logo_tile', 'Logo Tile', 'Minimal logo/badge container', '{
    "chrome": "flat", "accentRule": "none"
  }'::jsonb),
  ('cta', 'CTA', 'Action-oriented card', '{
    "chrome": "outlined", "accentRule": "none"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Seed: Section preset registry
INSERT INTO public.section_preset_registry (key, section_type, presentation_preset_key, component_family_key) VALUES
  ('services_snapshot', 'card_grid', 'services_snapshot', 'service'),
  ('proof_grid', 'card_grid', 'proof_grid', 'proof'),
  ('hero_stage', 'hero_cta', 'hero_stage', NULL),
  ('process_flow', 'steps_list', 'process_flow', 'process'),
  ('trust_strip', 'label_value_list', 'trust_strip', 'logo_tile'),
  ('cta_close', 'cta_block', 'cta_close', NULL)
ON CONFLICT (key) DO UPDATE SET
  section_type = EXCLUDED.section_type,
  presentation_preset_key = EXCLUDED.presentation_preset_key,
  component_family_key = EXCLUDED.component_family_key,
  updated_at = now();

-- Seed: Section control capabilities
INSERT INTO public.section_control_capabilities
  (section_type, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta',        true, true, false, false, false, false, false, false, true,  false),
  ('card_grid',       true, true, true,  true,  true,  true,  true,  true,  false,  true),
  ('steps_list',      true, true, false, false, true,  false, true,  true,  false, true),
  ('title_body_list', true, true, true,  false, false, false, false, true,  true,  false),
  ('rich_text_block', true, true, false, false, false, false, false, false, true,  false),
  ('label_value_list',true, true, true,  false, false, false, false, false, false, true),
  ('faq_list',        true, true, false, false, false, false, false, true,  false, false),
  ('cta_block',       true, true, false, false, false, false, false, false, true,  false),
  ('footer_grid',     true, false,false, false, false, false, false, false, false, false),
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
