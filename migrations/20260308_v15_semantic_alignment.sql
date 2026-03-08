-- v15: Semantic alignment for promoted sections
-- Updates capabilities to match renderer implementations

-- proof_cluster: add gridGap
update public.section_type_defaults
set capabilities = '{"supported":["sectionRhythm","sectionSurface","contentDensity","gridGap","headingTreatment","labelStyle","cardFamily","cardChrome","accentRule"]}'::jsonb
where section_type = 'proof_cluster';

-- case_study_split: add gridGap, labelStyle
update public.section_type_defaults
set capabilities = '{"supported":["sectionRhythm","sectionSurface","contentDensity","gridGap","headingTreatment","labelStyle","cardFamily","cardChrome","accentRule"]}'::jsonb
where section_type = 'case_study_split';

-- steps_list: add gridGap
update public.section_type_defaults
set capabilities = '{"supported":["sectionRhythm","sectionSurface","contentDensity","gridGap","headingTreatment","cardFamily","cardChrome","accentRule","labelStyle","dividerMode"]}'::jsonb
where section_type = 'steps_list';
