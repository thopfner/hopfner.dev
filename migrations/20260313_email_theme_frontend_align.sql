-- Migration: Add accent_light_color column to email_theme_settings
-- Apply via Supabase dashboard SQL editor

ALTER TABLE public.email_theme_settings
  ADD COLUMN IF NOT EXISTS accent_light_color text DEFAULT '#7a82e8';
