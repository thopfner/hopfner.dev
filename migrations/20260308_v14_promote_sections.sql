-- v14: Promote custom/composed homepage sections to permanent built-in types
-- trust_strip    → social_proof_strip
-- proof_cluster  → proof_cluster (built-in)
-- split_story    → case_study_split
-- workflow_visual → steps_list with layoutVariant = workflow_visual

-- 1. Add permanent registry entries (source='builtin', renderer='legacy')
insert into public.section_type_registry (key, label, source, renderer, is_active)
values
  ('social_proof_strip', 'Social Proof Strip', 'builtin', 'legacy', true),
  ('case_study_split', 'Case Study Split', 'builtin', 'legacy', true)
on conflict (key) do update set source = 'builtin', renderer = 'legacy', is_active = true;

-- proof_cluster already exists as custom/composed; promote to builtin/legacy
update public.section_type_registry
set source = 'builtin', renderer = 'legacy'
where key = 'proof_cluster';

-- 2. Add section_type_defaults entries
insert into public.section_type_defaults (section_type, label, description, default_title, default_subtitle, default_formatting, default_content, capabilities)
values
  (
    'social_proof_strip',
    'Social Proof Strip',
    'Logo strip with trust badges and optional eyebrow',
    'Trusted by industry leaders',
    null,
    '{"maxWidth":"max-w-5xl","paddingY":"py-4","textAlign":"center"}'::jsonb,
    '{"logos":[{"label":"Company 1"},{"label":"Company 2"},{"label":"Company 3"}],"badges":[{"text":"SOC 2"},{"text":"ISO 27001"},{"text":"GDPR"}],"layoutVariant":"inline"}'::jsonb,
    '{"supported":["sectionRhythm","sectionSurface","headingTreatment","labelStyle"]}'::jsonb
  ),
  (
    'proof_cluster',
    'Proof Cluster',
    'Metrics, proof card, and testimonial in a structured cluster',
    'Results that speak',
    null,
    '{"maxWidth":"max-w-5xl","paddingY":"py-8","textAlign":"left"}'::jsonb,
    '{"metrics":[{"value":"10x","label":"Faster processing"},{"value":"50%","label":"Cost reduction"},{"value":"99.9%","label":"Uptime"}],"proofCard":{"title":"Enterprise automation","body":"Automated manual workflows for a Fortune 500 client","stats":[{"value":"3x","label":"throughput"},{"value":"60%","label":"less errors"}]},"testimonial":{"quote":"Transformed our operations completely.","author":"CTO","role":"Enterprise Client"}}'::jsonb,
    '{"supported":["sectionRhythm","sectionSurface","contentDensity","headingTreatment","labelStyle","cardFamily","cardChrome","accentRule"]}'::jsonb
  ),
  (
    'case_study_split',
    'Case Study Split',
    'Split layout with narrative, before/after comparison, and media',
    'The challenge',
    null,
    '{"maxWidth":"max-w-5xl","paddingY":"py-8","textAlign":"left"}'::jsonb,
    '{"narrative":"Describe the problem or challenge your client faced.","beforeLabel":"Before","afterLabel":"After","beforeItems":["Manual data entry","Slow turnaround","Error-prone"],"afterItems":["Fully automated","Real-time processing","99.9% accuracy"],"mediaTitle":"Solution overview","stats":[{"value":"5x","label":"faster"},{"value":"$2M","label":"saved"}]}'::jsonb,
    '{"supported":["sectionRhythm","sectionSurface","contentDensity","headingTreatment","cardFamily","cardChrome","accentRule"]}'::jsonb
  )
on conflict (section_type) do update set
  label = excluded.label,
  description = excluded.description,
  default_title = excluded.default_title,
  default_formatting = excluded.default_formatting,
  default_content = excluded.default_content,
  capabilities = excluded.capabilities;

-- 3. Mark old custom registry entries as legacy
update public.section_type_registry
set label = label || ' (legacy)', is_active = false
where key = 'trust_strip' and source = 'custom';

update public.section_type_registry
set label = label || ' (legacy)', is_active = false
where key = 'split_story' and source = 'custom';

update public.section_type_registry
set label = label || ' (legacy)', is_active = false
where key = 'workflow_visual' and source = 'custom';
