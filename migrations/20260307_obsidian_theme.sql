-- Add Obsidian dark theme to formatting_templates
-- Design brief: dark obsidian base, high-contrast typography,
-- electric cobalt accent, premium restrained feel

insert into public.formatting_templates (name, description, is_system, settings)
values
  (
    'Obsidian (Dark)',
    'Premium dark obsidian base with electric cobalt accent. Bold, executive, precise.',
    true,
    '{
      "fontFamily":"Inter, system-ui, sans-serif",
      "fontScale":1.05,
      "tokens":{
        "fontFamily":"Inter, system-ui, sans-serif",
        "fontScale":1.05,
        "spaceScale":1.1,
        "spacingScale":1.1,
        "radiusScale":0.8,
        "shadowScale":1.2,
        "innerShadowScale":0.15,
        "textColor":"#e8edf4",
        "mutedTextColor":"#8a95a8",
        "accentColor":"#3b82f6",
        "shadowColor":"#000000",
        "backgroundColor":"#0B0F14",
        "cardBackgroundColor":"#131920"
      }
    }'::jsonb
  )
on conflict (lower(name)) do nothing;
