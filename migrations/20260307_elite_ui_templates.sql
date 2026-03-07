-- Elite UI System: Premium formatting templates and section defaults
-- Part of enhancements_v4 (Obsidian Operator design system)

-- 1. Insert three premium formatting templates

INSERT INTO public.formatting_templates (name, description, settings, is_system)
VALUES
  (
    'Obsidian Operator',
    'Premium dark AI/automation consultancy. Space Grotesk display, IBM Plex Sans body, IBM Plex Mono data. Obsidian signal brand signature.',
    '{
      "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
      "fontScale": 1,
      "tokens": {
        "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "fontScale": 1,
        "displayFontFamily": "var(--font-space-grotesk), system-ui, sans-serif",
        "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
        "displayWeight": 700,
        "headingWeight": 600,
        "bodyWeight": 400,
        "displayTracking": "-0.035em",
        "eyebrowTracking": "0.12em",
        "metricTracking": "-0.02em",
        "displayScale": 1.1,
        "headingScale": 1,
        "bodyScale": 1,
        "eyebrowScale": 0.8,
        "metricScale": 1.1,
        "spaceScale": 1,
        "radiusScale": 0.9,
        "shadowScale": 0.8,
        "innerShadowScale": 0.4,
        "shadowColor": "#1a1a3e",
        "textColor": "#e8eaf0",
        "mutedTextColor": "#8b90a0",
        "accentColor": "#7b8aff",
        "backgroundColor": "#0a0d14",
        "cardBackgroundColor": "#10141e",
        "signatureStyle": "obsidian_signal",
        "signatureIntensity": 0.5,
        "signatureColor": "rgba(120,140,255,0.06)",
        "signatureGridOpacity": 0.05,
        "signatureGlowOpacity": 0.06
      }
    }'::jsonb,
    true
  ),
  (
    'Executive Slate',
    'Clean corporate dark with DM Sans typography. Understated and professional.',
    '{
      "fontFamily": "var(--font-dm-sans), system-ui, sans-serif",
      "fontScale": 1,
      "tokens": {
        "fontFamily": "var(--font-dm-sans), system-ui, sans-serif",
        "fontScale": 1,
        "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
        "bodyFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
        "monoFontFamily": "var(--font-jetbrains-mono), monospace",
        "displayWeight": 700,
        "headingWeight": 600,
        "bodyWeight": 400,
        "displayTracking": "-0.025em",
        "eyebrowTracking": "0.1em",
        "metricTracking": "-0.015em",
        "displayScale": 1,
        "headingScale": 1,
        "bodyScale": 1,
        "eyebrowScale": 0.8,
        "metricScale": 1,
        "spaceScale": 1,
        "radiusScale": 1,
        "shadowScale": 0.6,
        "innerShadowScale": 0.3,
        "shadowColor": "#1a1a2a",
        "textColor": "#dfe2ea",
        "mutedTextColor": "#8890a4",
        "accentColor": "#6b7eb8",
        "backgroundColor": "#0e1118",
        "cardBackgroundColor": "#141820"
      }
    }'::jsonb,
    true
  ),
  (
    'Signal Grid',
    'Technical data-forward dark theme. IBM Plex Mono heavy, grid rays signature.',
    '{
      "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
      "fontScale": 0.95,
      "tokens": {
        "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "fontScale": 0.95,
        "displayFontFamily": "var(--font-ibm-plex-mono), monospace",
        "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
        "displayWeight": 600,
        "headingWeight": 600,
        "bodyWeight": 400,
        "displayTracking": "-0.02em",
        "eyebrowTracking": "0.15em",
        "metricTracking": "-0.025em",
        "displayScale": 1,
        "headingScale": 0.95,
        "bodyScale": 0.95,
        "eyebrowScale": 0.75,
        "metricScale": 1.1,
        "spaceScale": 0.95,
        "radiusScale": 0.7,
        "shadowScale": 0.5,
        "innerShadowScale": 0.2,
        "shadowColor": "#0a0f18",
        "textColor": "#c8d0e0",
        "mutedTextColor": "#707890",
        "accentColor": "#50e0a0",
        "backgroundColor": "#080c12",
        "cardBackgroundColor": "#0e1218",
        "signatureStyle": "grid_rays",
        "signatureIntensity": 0.6,
        "signatureColor": "rgba(80,224,160,0.04)",
        "signatureGridOpacity": 0.08,
        "signatureGlowOpacity": 0.04
      }
    }'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;

-- 2. Update section_type_defaults with semantic rhythm/surface defaults
-- These set the default formatting so sections have distinct visual personalities

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "hero", "sectionSurface": "spotlight_stage", "headingTreatment": "display"}'::jsonb
WHERE section_type = 'hero_cta';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard", "contentDensity": "standard", "cardFamily": "service", "cardChrome": "outlined"}'::jsonb
WHERE section_type = 'card_grid';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard", "contentDensity": "standard", "cardFamily": "process", "labelStyle": "mono"}'::jsonb
WHERE section_type = 'steps_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard", "contentDensity": "standard"}'::jsonb
WHERE section_type = 'title_body_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "compact", "contentDensity": "tight", "labelStyle": "mono"}'::jsonb
WHERE section_type = 'label_value_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard"}'::jsonb
WHERE section_type = 'faq_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "cta", "sectionSurface": "contrast_band", "headingTreatment": "display"}'::jsonb
WHERE section_type = 'cta_block';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "footer"}'::jsonb
WHERE section_type = 'footer_grid';
