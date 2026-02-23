begin;

-- 1) Dynamic section type registry (built-in + custom)
create table if not exists public.section_type_registry (
  key text primary key,
  label text not null,
  source text not null default 'builtin',
  renderer text not null default 'legacy',
  composer_schema jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  constraint section_type_registry_source_check check (source in ('builtin','custom')),
  constraint section_type_registry_renderer_check check (renderer in ('legacy','composed'))
);

create or replace function public.set_updated_at_now()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_section_type_registry_set_updated_at on public.section_type_registry;
create trigger trg_section_type_registry_set_updated_at
before update on public.section_type_registry
for each row
execute function public.set_updated_at_now();

insert into public.section_type_registry (key, label, source, renderer)
values
  ('nav_links','Navigation Links','builtin','legacy'),
  ('hero_cta','Hero + CTA','builtin','legacy'),
  ('card_grid','Card Grid','builtin','legacy'),
  ('steps_list','Steps List','builtin','legacy'),
  ('title_body_list','Title + Body List','builtin','legacy'),
  ('rich_text_block','Rich Text Block','builtin','legacy'),
  ('label_value_list','Label/Value List','builtin','legacy'),
  ('faq_list','FAQ List','builtin','legacy'),
  ('cta_block','CTA Block','builtin','legacy'),
  ('footer_grid','Footer Grid','builtin','legacy')
on conflict (key) do update
set label = excluded.label,
    source = excluded.source,
    renderer = excluded.renderer,
    is_active = true,
    updated_at = now();

alter table public.section_type_registry enable row level security;

drop policy if exists section_type_registry_select_public on public.section_type_registry;
create policy section_type_registry_select_public on public.section_type_registry
for select to anon, authenticated
using (is_active = true);

drop policy if exists section_type_registry_write_admin on public.section_type_registry;
create policy section_type_registry_write_admin on public.section_type_registry
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.section_type_registry to anon, authenticated;
grant insert, update, delete on public.section_type_registry to authenticated;

-- 2) Relax hardcoded section_type check constraints that block custom keys
alter table public.global_sections drop constraint if exists global_sections_section_type_check;

do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'sections'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%section_type%'
  loop
    execute format('alter table public.sections drop constraint if exists %I', r.conname);
  end loop;
end $$;

-- 3) Runtime validation trigger to ensure section_type exists in registry
create or replace function public.validate_section_type_registry_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.section_type is null or btrim(new.section_type) = '' then
    raise exception 'section_type is required' using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.section_type_registry str
    where str.key = new.section_type
      and str.is_active = true
  ) then
    raise exception 'unknown section_type: %', new.section_type using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_section_type_sections on public.sections;
create trigger trg_validate_section_type_sections
before insert or update of section_type on public.sections
for each row
execute function public.validate_section_type_registry_membership();

drop trigger if exists trg_validate_section_type_global_sections on public.global_sections;
create trigger trg_validate_section_type_global_sections
before insert or update of section_type on public.global_sections
for each row
execute function public.validate_section_type_registry_membership();

-- 4) Public sections policy supports composed section types (no version rows needed)

drop policy if exists sections_select_public_enabled on public.sections;
drop policy if exists sections_select_public_published on public.sections;
drop policy if exists sections_select_public on public.sections;
drop policy if exists sections_select_admin on public.sections;

create policy sections_select_public on public.sections
for select
to anon, authenticated
using (
  enabled = true
  and (
    exists (
      select 1
      from public.section_type_registry str
      where str.key = sections.section_type
        and str.renderer = 'composed'
        and str.is_active = true
    )
    or exists (
      select 1
      from public.section_versions sv
      where sv.section_id = sections.id
        and sv.status = 'published'
    )
    or (
      sections.global_section_id is not null
      and exists (
        select 1
        from public.global_section_versions gsv
        where gsv.global_section_id = sections.global_section_id
          and gsv.status = 'published'
      )
    )
  )
);

create policy sections_select_admin on public.sections
for select
to authenticated
using (public.is_admin());

commit;
