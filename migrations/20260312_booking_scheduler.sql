-- Migration: Add booking_scheduler section type
-- Apply via Supabase dashboard SQL editor

-- 1. Drop and recreate the section_type check constraint to include booking_scheduler
ALTER TABLE public.sections DROP CONSTRAINT IF EXISTS sections_section_type_check;
ALTER TABLE public.sections ADD CONSTRAINT sections_section_type_check CHECK (
  section_type IN (
    'nav_links',
    'hero_cta',
    'card_grid',
    'steps_list',
    'title_body_list',
    'rich_text_block',
    'label_value_list',
    'faq_list',
    'cta_block',
    'footer_grid',
    'social_proof_strip',
    'proof_cluster',
    'case_study_split',
    'booking_scheduler'
  )
);

-- 2. Seed section_type_defaults for the new type
INSERT INTO public.section_type_defaults (
  section_type, label, description,
  default_title, default_subtitle,
  default_cta_primary_label, default_cta_primary_href,
  default_cta_secondary_label, default_cta_secondary_href,
  default_background_media_url,
  default_formatting, default_content, capabilities
) VALUES (
  'booking_scheduler',
  'Booking Scheduler',
  'Intake qualification form with inline Cal.com scheduling widget',
  'Book Your Call',
  NULL,
  'Continue to scheduling',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}'::jsonb,
  '{
    "calLink": "hopfner/workflow-review",
    "formHeading": "Tell us about your workflow",
    "submitLabel": "Continue to scheduling",
    "intakeFields": {
      "fullName": { "label": "Full name", "helpText": "" },
      "workEmail": { "label": "Work email", "helpText": "" },
      "company": { "label": "Company", "helpText": "" },
      "jobTitle": { "label": "Job title", "helpText": "" },
      "teamSize": { "label": "Team size", "helpText": "" },
      "functionArea": { "label": "Function area", "helpText": "operations, finance, treasury, founder, other" },
      "currentTools": { "label": "Current tools", "helpText": "" },
      "mainBottleneck": { "label": "Main bottleneck", "helpText": "" },
      "desiredOutcome90d": { "label": "Desired outcome (90 days)", "helpText": "" }
    }
  }'::jsonb,
  '{"supported":["sectionRhythm","sectionSurface","contentDensity","headingTreatment","subtitleSize"]}'::jsonb
) ON CONFLICT (section_type) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  default_content = EXCLUDED.default_content,
  capabilities = EXCLUDED.capabilities,
  updated_at = now();

-- 3. Seed section_type_registry if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'section_type_registry') THEN
    INSERT INTO public.section_type_registry (key, label, source, renderer)
    VALUES ('booking_scheduler', 'Booking Scheduler', 'builtin', 'legacy')
    ON CONFLICT (key) DO NOTHING;
  END IF;
END $$;
