-- Migration: Enrich existing dark themes with full color palettes and add 2 light themes.
-- Each theme now specifies colorMode, textColor, mutedTextColor, backgroundColor,
-- cardBackgroundColor, accentColor, shadowColor, and signatureColor so that switching
-- themes produces a fully distinct visual identity.

-- Update existing dark themes with complete palettes
UPDATE public.design_theme_presets
SET tokens = '{
  "colorMode": "dark",
  "textColor": "oklch(0.95 0.01 264)",
  "mutedTextColor": "oklch(0.65 0.02 264)",
  "backgroundColor": "oklch(0.145 0.015 264)",
  "cardBackgroundColor": "oklch(0.19 0.018 264)",
  "accentColor": "oklch(0.55 0.20 264)",
  "shadowColor": "oklch(0.10 0.03 264)",
  "signatureColor": "rgba(100,130,255,0.08)",
  "displayFontFamily": "var(--font-space-grotesk), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.035em",
  "signatureStyle": "obsidian_signal",
  "signatureGridOpacity": 0.06,
  "signatureGlowOpacity": 0.08,
  "signatureNoiseOpacity": 0.02
}'::jsonb,
updated_at = now()
WHERE key = 'obsidian_operator';

UPDATE public.design_theme_presets
SET tokens = '{
  "colorMode": "dark",
  "textColor": "oklch(0.92 0.005 240)",
  "mutedTextColor": "oklch(0.62 0.01 240)",
  "backgroundColor": "oklch(0.16 0.008 240)",
  "cardBackgroundColor": "oklch(0.20 0.010 240)",
  "accentColor": "oklch(0.55 0.10 240)",
  "shadowColor": "oklch(0.08 0.02 240)",
  "signatureColor": "rgba(100,130,180,0.06)",
  "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.025em",
  "signatureStyle": "off",
  "signatureNoiseOpacity": 0
}'::jsonb,
updated_at = now()
WHERE key = 'executive_slate';

UPDATE public.design_theme_presets
SET tokens = '{
  "colorMode": "dark",
  "textColor": "oklch(0.93 0.01 170)",
  "mutedTextColor": "oklch(0.60 0.02 170)",
  "backgroundColor": "oklch(0.13 0.02 200)",
  "cardBackgroundColor": "oklch(0.17 0.025 200)",
  "accentColor": "oklch(0.65 0.18 165)",
  "shadowColor": "oklch(0.08 0.03 200)",
  "signatureColor": "rgba(50,200,160,0.06)",
  "displayFontFamily": "var(--font-ibm-plex-mono), monospace",
  "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
  "displayWeight": 600,
  "headingWeight": 500,
  "bodyWeight": 400,
  "displayTracking": "-0.02em",
  "signatureStyle": "grid_rays",
  "signatureGridOpacity": 0.08,
  "signatureGlowOpacity": 0.05,
  "signatureNoiseOpacity": 0
}'::jsonb,
updated_at = now()
WHERE key = 'signal_grid';

-- Insert 2 new light themes
INSERT INTO public.design_theme_presets (key, name, description, tokens) VALUES
  ('paper_craft', 'Paper & Craft', 'Warm light theme with earthy tones — approachable, editorial, trustworthy', '{
    "colorMode": "light",
    "textColor": "oklch(0.22 0.02 65)",
    "mutedTextColor": "oklch(0.48 0.02 65)",
    "backgroundColor": "oklch(0.97 0.008 85)",
    "cardBackgroundColor": "oklch(1.0 0 0)",
    "accentColor": "oklch(0.55 0.16 45)",
    "shadowColor": "oklch(0.40 0.04 65)",
    "signatureColor": "rgba(180,140,80,0.04)",
    "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-source-sans-3), system-ui, sans-serif",
    "monoFontFamily": "var(--font-jetbrains-mono), monospace",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "displayTracking": "-0.02em",
    "radiusScale": 1.2,
    "shadowScale": 0.6,
    "signatureStyle": "off",
    "signatureNoiseOpacity": 0.01
  }'::jsonb),
  ('arctic_blue', 'Arctic Blue', 'Clean light theme with cool blue accents — clinical, modern, professional', '{
    "colorMode": "light",
    "textColor": "oklch(0.20 0.015 250)",
    "mutedTextColor": "oklch(0.45 0.02 250)",
    "backgroundColor": "oklch(0.98 0.005 250)",
    "cardBackgroundColor": "oklch(1.0 0 0)",
    "accentColor": "oklch(0.52 0.20 255)",
    "shadowColor": "oklch(0.35 0.04 250)",
    "signatureColor": "rgba(80,100,220,0.03)",
    "displayFontFamily": "var(--font-inter), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-inter), system-ui, sans-serif",
    "monoFontFamily": "var(--font-jetbrains-mono), monospace",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "displayTracking": "-0.025em",
    "radiusScale": 0.8,
    "shadowScale": 0.5,
    "signatureStyle": "off",
    "signatureNoiseOpacity": 0
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();
