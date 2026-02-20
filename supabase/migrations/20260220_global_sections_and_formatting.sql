begin;

create table if not exists public.global_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text,
  section_type text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  constraint global_sections_section_type_check check (
    section_type in (
      'nav_links','hero_cta','card_grid','steps_list','title_body_list','rich_text_block','label_value_list','faq_list','cta_block'
    )
  )
);

create table if not exists public.global_section_versions (
  id uuid primary key default gen_random_uuid(),
  global_section_id uuid not null references public.global_sections (id) on delete cascade,
  version int not null,
  status text not null,
  title text,
  subtitle text,
  cta_primary_label text,
  cta_primary_href text,
  cta_secondary_label text,
  cta_secondary_href text,
  background_media_url text,
  formatting jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  published_at timestamptz,
  published_by uuid references auth.users (id),
  constraint global_section_versions_status_check check (status in ('draft','published','archived')),
  constraint global_section_versions_version_positive check (version > 0),
  constraint global_section_versions_unique_per_section unique (global_section_id, version)
);

create unique index if not exists global_section_versions_one_published_per_section
  on public.global_section_versions (global_section_id)
  where status = 'published';

alter table public.sections add column if not exists global_section_id uuid references public.global_sections(id) on delete set null;
alter table public.sections add column if not exists formatting_override jsonb not null default '{}'::jsonb;

alter table public.pages add column if not exists formatting_override jsonb not null default '{}'::jsonb;

create table if not exists public.site_formatting_settings (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

insert into public.site_formatting_settings (id, settings)
values ('default', jsonb_build_object('fontFamily', 'Inter, system-ui, sans-serif', 'fontScale', 1))
on conflict (id) do nothing;

update public.sections s
set formatting_override = coalesce(v.formatting, '{}'::jsonb)
from public.section_versions v
where v.section_id = s.id
  and s.formatting_override = '{}'::jsonb
  and v.status in ('draft','published');

alter table public.global_sections enable row level security;
alter table public.global_section_versions enable row level security;
alter table public.site_formatting_settings enable row level security;

create policy "global_sections_select_public_enabled" on public.global_sections
for select to anon, authenticated
using (enabled = true);

create policy "global_sections_select_admin" on public.global_sections
for select to authenticated
using (public.is_admin());

create policy "global_sections_write_admin" on public.global_sections
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "global_section_versions_select_public_published" on public.global_section_versions
for select to anon, authenticated
using (status = 'published');

create policy "global_section_versions_select_admin" on public.global_section_versions
for select to authenticated
using (public.is_admin());

create policy "global_section_versions_write_admin" on public.global_section_versions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "site_formatting_settings_select_public" on public.site_formatting_settings
for select to anon, authenticated
using (true);

create policy "site_formatting_settings_write_admin" on public.site_formatting_settings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.global_sections, public.global_section_versions, public.site_formatting_settings to anon, authenticated;
grant insert, update, delete on public.global_sections, public.global_section_versions, public.site_formatting_settings to authenticated;

commit;
