-- Add subtitleSize capability column to section_control_capabilities
ALTER TABLE section_control_capabilities
  ADD COLUMN IF NOT EXISTS supports_subtitle_size boolean NOT NULL DEFAULT false;

-- Enable for sections that have subtitles
UPDATE section_control_capabilities
SET supports_subtitle_size = true
WHERE section_type IN (
  'hero_cta',
  'card_grid',
  'steps_list',
  'title_body_list',
  'label_value_list',
  'faq_list',
  'social_proof_strip',
  'proof_cluster',
  'case_study_split',
  'composed'
);
