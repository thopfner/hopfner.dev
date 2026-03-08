-- v13: Elite UI Transformation — capability updates
-- Adds headingTreatment to hero_cta, marquee layout variant to tech_stack

-- hero_cta now supports headingTreatment (gradient, display_xl, etc.)
UPDATE section_control_capabilities
SET supported_controls = array_append(supported_controls, 'headingTreatment')
WHERE section_type = 'hero_cta'
  AND NOT ('headingTreatment' = ANY(supported_controls));

-- Update notes for hero_cta
UPDATE section_control_capabilities
SET notes = jsonb_set(
  COALESCE(notes, '{}'::jsonb),
  '{sectionRhythm}',
  '"Hero uses bespoke layout; rhythm/surface not applicable"'
)
WHERE section_type = 'hero_cta';

-- New token values for design_theme_presets reference
-- (These are code-level additions; no DB schema changes needed)
-- HeadingTreatment: gradient, gradient_accent, display_xl, display_lg
-- Surface: gradient_mesh, accent_glow, dark_elevated, dot_grid
-- CardChrome: glow
-- TechStack LayoutVariant: marquee (code-level only)
