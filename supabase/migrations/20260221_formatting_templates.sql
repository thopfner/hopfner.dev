begin;

create table if not exists public.formatting_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  settings jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists formatting_templates_name_unique on public.formatting_templates (lower(name));

create or replace function public.touch_formatting_templates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_formatting_templates_updated_at on public.formatting_templates;
create trigger trg_touch_formatting_templates_updated_at
before update on public.formatting_templates
for each row
execute function public.touch_formatting_templates_updated_at();

alter table public.formatting_templates enable row level security;

drop policy if exists formatting_templates_select on public.formatting_templates;
create policy formatting_templates_select on public.formatting_templates
for select to authenticated
using (true);

drop policy if exists formatting_templates_insert on public.formatting_templates;
create policy formatting_templates_insert on public.formatting_templates
for insert to authenticated
with check (true);

drop policy if exists formatting_templates_update on public.formatting_templates;
create policy formatting_templates_update on public.formatting_templates
for update to authenticated
using (true)
with check (true);

drop policy if exists formatting_templates_delete on public.formatting_templates;
create policy formatting_templates_delete on public.formatting_templates
for delete to authenticated
using (not is_system);

insert into public.formatting_templates (name, description, is_system, settings)
values
  (
    'Slate Executive (Dark)',
    'Neutral dark enterprise baseline with slate accents.',
    true,
    '{
      "fontFamily":"Inter, system-ui, sans-serif",
      "fontScale":1,
      "tokens":{
        "fontFamily":"Inter, system-ui, sans-serif",
        "fontScale":1,
        "spaceScale":1,
        "spacingScale":1,
        "radiusScale":1,
        "shadowScale":1,
        "innerShadowScale":0.2,
        "textColor":"#e5e7eb",
        "mutedTextColor":"#9ca3af",
        "accentColor":"#64748b",
        "shadowColor":"#111827",
        "backgroundColor":"#111827",
        "cardBackgroundColor":"#1f2937"
      }
    }'::jsonb
  ),
  (
    'Graphite Cyan (Dark)',
    'Premium charcoal with restrained cyan highlights.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":1,"innerShadowScale":0.25,"textColor":"#e6edf3","mutedTextColor":"#93a4b4","accentColor":"#22d3ee","shadowColor":"#0b1220","backgroundColor":"#0f172a","cardBackgroundColor":"#111827"}}'::jsonb
  ),
  (
    'Navy Indigo (Dark)',
    'Conservative dark navy with indigo emphasis.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":1,"innerShadowScale":0.2,"textColor":"#e2e8f0","mutedTextColor":"#94a3b8","accentColor":"#6366f1","shadowColor":"#0b1020","backgroundColor":"#0b1324","cardBackgroundColor":"#111b30"}}'::jsonb
  ),
  (
    'Deep Emerald (Dark)',
    'Professional dark scheme with green-teal trust cues.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":1,"innerShadowScale":0.2,"textColor":"#e7f0ee","mutedTextColor":"#9db3ae","accentColor":"#10b981","shadowColor":"#0b1513","backgroundColor":"#0f1f1c","cardBackgroundColor":"#14302a"}}'::jsonb
  ),
  (
    'Carbon Blue Steel (Dark)',
    'Dark carbon base with corporate steel-blue accents.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":1,"innerShadowScale":0.2,"textColor":"#e5eaf2","mutedTextColor":"#9aa6b7","accentColor":"#3b82f6","shadowColor":"#0a0f1a","backgroundColor":"#151a23","cardBackgroundColor":"#1f2632"}}'::jsonb
  ),
  (
    'Midnight Violet (Dark)',
    'Low-noise dark UI with subtle violet accent.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":1,"innerShadowScale":0.2,"textColor":"#ede9fe","mutedTextColor":"#b4abd8","accentColor":"#8b5cf6","shadowColor":"#131022","backgroundColor":"#181625","cardBackgroundColor":"#211f33"}}'::jsonb
  ),
  (
    'Light Neutral Corporate',
    'Clean light enterprise default with cool neutrals.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":0.7,"innerShadowScale":0,"textColor":"#111827","mutedTextColor":"#6b7280","accentColor":"#2563eb","shadowColor":"#0f172a","backgroundColor":"#f8fafc","cardBackgroundColor":"#ffffff"}}'::jsonb
  ),
  (
    'Ivory Slate',
    'Warm-light professional palette for consulting sites.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":0.6,"innerShadowScale":0,"textColor":"#1f2937","mutedTextColor":"#6b7280","accentColor":"#0ea5e9","shadowColor":"#334155","backgroundColor":"#f9fafb","cardBackgroundColor":"#ffffff"}}'::jsonb
  ),
  (
    'Sandstone Professional',
    'Soft neutral light scheme with restrained blue accent.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":0.55,"innerShadowScale":0,"textColor":"#1f2937","mutedTextColor":"#6b7280","accentColor":"#3b82f6","shadowColor":"#475569","backgroundColor":"#f5f5f4","cardBackgroundColor":"#ffffff"}}'::jsonb
  ),
  (
    'Mist Blue',
    'Airy light B2B look with calm blue accents.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":0.6,"innerShadowScale":0,"textColor":"#0f172a","mutedTextColor":"#64748b","accentColor":"#2563eb","shadowColor":"#1e293b","backgroundColor":"#eff6ff","cardBackgroundColor":"#ffffff"}}'::jsonb
  ),
  (
    'Monochrome Clean',
    'Minimal grayscale light theme for serious corporate tone.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":0.5,"innerShadowScale":0,"textColor":"#111111","mutedTextColor":"#666666","accentColor":"#2f2f2f","shadowColor":"#222222","backgroundColor":"#f7f7f7","cardBackgroundColor":"#ffffff"}}'::jsonb
  ),
  (
    'Cool Gray Pro',
    'Balanced light-neutral scheme with modern enterprise polish.',
    true,
    '{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"tokens":{"fontFamily":"Inter, system-ui, sans-serif","fontScale":1,"spaceScale":1,"spacingScale":1,"radiusScale":1,"shadowScale":0.65,"innerShadowScale":0,"textColor":"#1e293b","mutedTextColor":"#64748b","accentColor":"#0f766e","shadowColor":"#334155","backgroundColor":"#f1f5f9","cardBackgroundColor":"#ffffff"}}'::jsonb
  )
on conflict (lower(name)) do nothing;

commit;
