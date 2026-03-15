-- Theme Expansion: 8 new color theme presets
-- Brings total from 5 to 13, covering full color spectrum
-- No code changes needed — system is fully data-driven

INSERT INTO public.design_theme_presets (key, name, description, tokens) VALUES

-- ═══════════════════════════════════════════════════════════
-- DARK THEMES (4)
-- ═══════════════════════════════════════════════════════════

('ember_forge', 'Ember Forge', 'Bold orange accent on deep charcoal. Restaurants, fitness, creative agencies, construction.', '{
  "colorMode": "dark",
  "textColor": "oklch(0.94 0.01 50)",
  "mutedTextColor": "oklch(0.62 0.02 50)",
  "backgroundColor": "oklch(0.14 0.015 40)",
  "cardBackgroundColor": "oklch(0.18 0.018 40)",
  "accentColor": "oklch(0.65 0.20 35)",
  "shadowColor": "oklch(0.08 0.03 35)",
  "signatureColor": "rgba(255,140,50,0.06)",
  "displayFontFamily": "var(--font-poppins), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-source-sans-3), system-ui, sans-serif",
  "monoFontFamily": "var(--font-jetbrains-mono), monospace",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.03em",
  "signatureStyle": "obsidian_signal",
  "signatureGridOpacity": 0.05,
  "signatureGlowOpacity": 0.10,
  "signatureNoiseOpacity": 0.02
}'::jsonb),

('violet_noir', 'Violet Noir', 'Rich purple accent on deep violet. Luxury brands, beauty, wellness, creative agencies.', '{
  "colorMode": "dark",
  "textColor": "oklch(0.94 0.01 290)",
  "mutedTextColor": "oklch(0.60 0.025 285)",
  "backgroundColor": "oklch(0.13 0.02 280)",
  "cardBackgroundColor": "oklch(0.17 0.025 280)",
  "accentColor": "oklch(0.58 0.22 290)",
  "shadowColor": "oklch(0.08 0.04 285)",
  "signatureColor": "rgba(160,80,255,0.07)",
  "displayFontFamily": "var(--font-manrope), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-nunito-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-jetbrains-mono), monospace",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.025em",
  "radiusScale": 1.1,
  "shadowScale": 1.2,
  "signatureStyle": "topographic_dark",
  "signatureGridOpacity": 0.04,
  "signatureGlowOpacity": 0.06,
  "signatureNoiseOpacity": 0.01
}'::jsonb),

('crimson_counsel', 'Crimson Counsel', 'Deep crimson accent with serif display. Law firms, wine/spirits, automotive, luxury real estate.', '{
  "colorMode": "dark",
  "textColor": "oklch(0.93 0.008 30)",
  "mutedTextColor": "oklch(0.60 0.015 25)",
  "backgroundColor": "oklch(0.15 0.01 20)",
  "cardBackgroundColor": "oklch(0.19 0.012 20)",
  "accentColor": "oklch(0.50 0.18 15)",
  "shadowColor": "oklch(0.08 0.02 15)",
  "signatureColor": "rgba(180,50,50,0.05)",
  "displayFontFamily": "var(--font-merriweather), Georgia, serif",
  "bodyFontFamily": "var(--font-lato), system-ui, sans-serif",
  "monoFontFamily": "var(--font-jetbrains-mono), monospace",
  "displayWeight": 700,
  "headingWeight": 700,
  "bodyWeight": 400,
  "displayTracking": "-0.015em",
  "radiusScale": 0.6,
  "shadowScale": 0.8,
  "signatureStyle": "off",
  "signatureNoiseOpacity": 0
}'::jsonb),

('forest_canopy', 'Forest Canopy', 'Emerald green accent on deep forest. Healthcare, finance, sustainability, real estate.', '{
  "colorMode": "dark",
  "textColor": "oklch(0.94 0.008 150)",
  "mutedTextColor": "oklch(0.62 0.015 150)",
  "backgroundColor": "oklch(0.14 0.012 150)",
  "cardBackgroundColor": "oklch(0.18 0.015 150)",
  "accentColor": "oklch(0.62 0.19 145)",
  "shadowColor": "oklch(0.08 0.025 145)",
  "signatureColor": "rgba(40,180,100,0.05)",
  "displayFontFamily": "var(--font-work-sans), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-open-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-jetbrains-mono), monospace",
  "displayWeight": 600,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.02em",
  "radiusScale": 0.9,
  "shadowScale": 0.7,
  "signatureStyle": "topographic_dark",
  "signatureGridOpacity": 0.05,
  "signatureGlowOpacity": 0.04,
  "signatureNoiseOpacity": 0.02
}'::jsonb),

-- ═══════════════════════════════════════════════════════════
-- LIGHT THEMES (4)
-- ═══════════════════════════════════════════════════════════

('sunrise_studio', 'Sunrise Studio', 'Vibrant orange accent on warm white. Creative agencies, startups, food brands, events.', '{
  "colorMode": "light",
  "textColor": "oklch(0.20 0.02 40)",
  "mutedTextColor": "oklch(0.45 0.025 40)",
  "backgroundColor": "oklch(0.97 0.006 60)",
  "cardBackgroundColor": "oklch(1.0 0 0)",
  "accentColor": "oklch(0.60 0.20 30)",
  "shadowColor": "oklch(0.40 0.04 40)",
  "signatureColor": "rgba(255,140,50,0.03)",
  "displayFontFamily": "var(--font-montserrat), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-nunito-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-jetbrains-mono), monospace",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.02em",
  "radiusScale": 1.3,
  "shadowScale": 0.5,
  "signatureStyle": "off",
  "signatureNoiseOpacity": 0
}'::jsonb),

('lavender_bloom', 'Lavender Bloom', 'Purple-violet accent on soft lavender. Beauty brands, wellness, wedding planners, boutique agencies.', '{
  "colorMode": "light",
  "textColor": "oklch(0.18 0.02 280)",
  "mutedTextColor": "oklch(0.42 0.03 280)",
  "backgroundColor": "oklch(0.98 0.008 280)",
  "cardBackgroundColor": "oklch(1.0 0 0)",
  "accentColor": "oklch(0.50 0.20 280)",
  "shadowColor": "oklch(0.38 0.04 280)",
  "signatureColor": "rgba(140,80,220,0.03)",
  "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-inter), system-ui, sans-serif",
  "monoFontFamily": "var(--font-geist-mono), monospace",
  "displayWeight": 600,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.02em",
  "radiusScale": 1.2,
  "shadowScale": 0.4,
  "signatureStyle": "off",
  "signatureNoiseOpacity": 0
}'::jsonb),

('rose_terrace', 'Rose Terrace', 'Rose-pink accent on warm white. Hospitality, fashion, event venues, lifestyle brands.', '{
  "colorMode": "light",
  "textColor": "oklch(0.20 0.015 10)",
  "mutedTextColor": "oklch(0.45 0.02 10)",
  "backgroundColor": "oklch(0.98 0.005 10)",
  "cardBackgroundColor": "oklch(1.0 0 0)",
  "accentColor": "oklch(0.55 0.18 350)",
  "shadowColor": "oklch(0.40 0.03 350)",
  "signatureColor": "rgba(220,80,120,0.03)",
  "displayFontFamily": "var(--font-poppins), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-lato), system-ui, sans-serif",
  "monoFontFamily": "var(--font-geist-mono), monospace",
  "displayWeight": 600,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.02em",
  "radiusScale": 1.1,
  "shadowScale": 0.5,
  "signatureStyle": "off",
  "signatureNoiseOpacity": 0
}'::jsonb),

('sage_counsel', 'Sage Counsel', 'Sage green accent on cool white. Consulting, architecture, financial advisory, healthcare.', '{
  "colorMode": "light",
  "textColor": "oklch(0.18 0.01 160)",
  "mutedTextColor": "oklch(0.42 0.02 160)",
  "backgroundColor": "oklch(0.98 0.005 160)",
  "cardBackgroundColor": "oklch(1.0 0 0)",
  "accentColor": "oklch(0.52 0.14 155)",
  "shadowColor": "oklch(0.38 0.03 155)",
  "signatureColor": "rgba(80,160,120,0.03)",
  "displayFontFamily": "var(--font-manrope), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-roboto), system-ui, sans-serif",
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
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens      = EXCLUDED.tokens,
  updated_at  = now();
