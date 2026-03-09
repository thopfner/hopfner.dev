-- =============================================================================
-- CONSOLIDATED SCHEMA
-- =============================================================================
-- Generated: 2026-03-09
--
-- This file contains the complete database schema for a fresh install.
-- It concatenates the base schema (supabase/cms.sql) with all migrations
-- from both supabase/migrations/ and migrations/ in chronological order.
--
-- For fresh deployments: run this single file in the Supabase SQL editor.
-- For existing deployments: apply only new files from migrations/ incrementally.
--
-- All operations are idempotent (IF NOT EXISTS, ON CONFLICT, etc.).
-- =============================================================================


-- =============================================================================
-- BASE SCHEMA (supabase/cms.sql)
-- =============================================================================

-- SCHEMA
-- =============================================================================
-- Supabase hosted (run manually in Supabase SQL editor)
-- CMS schema: pages -> sections -> immutable section_versions with per-section publish
--
-- Section types (enum-like via CHECK on sections.section_type):
--   nav_links, hero_cta, card_grid, steps_list, title_body_list, rich_text_block,
--   label_value_list, faq_list, cta_block
--
-- Hybrid content model:
--   section_versions has common typed columns (title/subtitle/ctas/background_media_url)
--   plus JSONB:
--     formatting: responsive layout + safe Tailwind class strings (whitelisted)
--     content: type-specific payload (arrays, TipTap JSON, etc.)
--
-- TipTap JSON is stored as JSON (not HTML).
-- Public site renders only published section_versions.
--
-- NOTE: This script intentionally does NOT seed an admin user. Admin bootstrap is
-- done by app code calling public.bootstrap_make_admin().

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Supabase Storage bucket bootstrap (idempotent)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

-- -----------------------------------------------------------------------------
-- Utility: safe Tailwind class whitelist (DB-side validation)
-- -----------------------------------------------------------------------------
create table if not exists public.tailwind_class_whitelist (
  class text primary key
);

-- -----------------------------------------------------------------------------
-- Section type defaults (capabilities + default content/formatting)
-- -----------------------------------------------------------------------------
create table if not exists public.section_type_defaults (
  section_type text primary key,
  label text not null,
  description text,
  default_title text,
  default_subtitle text,
  default_cta_primary_label text,
  default_cta_primary_href text,
  default_cta_secondary_label text,
  default_cta_secondary_href text,
  default_background_media_url text,
  default_formatting jsonb not null default '{}'::jsonb,
  default_content jsonb not null default '{}'::jsonb,
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Profiles (admin flag)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper: is current user an admin? (required by policies below)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  );
$$;

-- -----------------------------------------------------------------------------
-- Pages
-- -----------------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

-- -----------------------------------------------------------------------------
-- Sections (reorderable per page)
-- -----------------------------------------------------------------------------
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  section_type text not null,
  key text,
  enabled boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  constraint sections_section_type_check check (
    section_type in (
      'nav_links',
      'hero_cta',
      'card_grid',
      'steps_list',
      'title_body_list',
      'rich_text_block',
      'label_value_list',
      'faq_list',
      'cta_block'
    )
  ),
  constraint sections_position_nonneg check (position >= 0)
);

-- Optional uniqueness for anchor keys per page (allows duplicates of section_type).
do $$
begin
  create unique index if not exists sections_page_key_unique
    on public.sections (page_id, key)
    where key is not null;
exception when others then
  -- ignore (older Postgres may not support IF NOT EXISTS for this shape)
end $$;

create index if not exists sections_page_position_idx on public.sections (page_id, position);

-- -----------------------------------------------------------------------------
-- Section versions (immutable)
-- -----------------------------------------------------------------------------
create table if not exists public.section_versions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
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
  constraint section_versions_status_check check (status in ('draft', 'published', 'archived')),
  constraint section_versions_version_positive check (version > 0),
  constraint section_versions_unique_per_section unique (section_id, version)
);

-- At most one published version per section.
do $$
begin
  create unique index if not exists section_versions_one_published_per_section
    on public.section_versions (section_id)
    where status = 'published';
exception when others then
end $$;

create index if not exists section_versions_section_idx on public.section_versions (section_id, status, version desc);

-- -----------------------------------------------------------------------------
-- Audit log (pages/sections/section_versions only)
-- -----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id bigserial primary key,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid references auth.users (id),
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  constraint audit_log_entity_type_check check (entity_type in ('page', 'section', 'section_version')),
  constraint audit_log_action_check check (
    action in (
      'insert',
      'update',
      'delete',
      'publish',
      'restore',
      'reorder',
      'toggle_enabled'
    )
  )
);

create index if not exists audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Media metadata (no auditing in v1)
-- -----------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'cms-media',
  path text not null,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  alt text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  constraint media_unique_path unique (bucket, path)
);

commit;

-- MIGRATION
-- =============================================================================
begin;

-- Temporarily drop section_type check to allow renames on existing data.
do $$
begin
  alter table public.sections
    drop constraint if exists sections_section_type_check;
exception when others then
end $$;

-- Rename existing section types to functional names.
update public.sections
set section_type = case section_type
  when 'header_nav' then 'nav_links'
  when 'hero' then 'hero_cta'
  when 'what_i_deliver' then 'card_grid'
  when 'how_it_works' then 'steps_list'
  when 'workflows' then 'title_body_list'
  when 'why_this_approach' then 'rich_text_block'
  when 'tech_stack' then 'label_value_list'
  when 'faq' then 'faq_list'
  when 'final_cta' then 'cta_block'
  else section_type
end
where section_type in (
  'header_nav',
  'hero',
  'what_i_deliver',
  'how_it_works',
  'workflows',
  'why_this_approach',
  'tech_stack',
  'faq',
  'final_cta'
);

-- Re-add updated CHECK constraint for section_type.
do $$
begin
  alter table public.sections
    add constraint sections_section_type_check check (
      section_type in (
        'nav_links',
        'hero_cta',
        'card_grid',
        'steps_list',
        'title_body_list',
        'rich_text_block',
        'label_value_list',
        'faq_list',
        'cta_block'
      )
    );
exception when others then
end $$;

commit;

-- RLS
-- =============================================================================
begin;

-- Grants (required for RLS policies to be effective for anon/authenticated).
grant usage on schema public to anon, authenticated;
grant select on public.pages to anon, authenticated;
grant select on public.sections to anon, authenticated;
grant select on public.section_versions to anon, authenticated;
grant select on public.media to anon, authenticated;
grant select on public.section_type_defaults to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select on public.tailwind_class_whitelist to anon, authenticated;
grant insert, update, delete on public.tailwind_class_whitelist to authenticated;

grant insert, update, delete on public.pages to authenticated;
grant insert, update, delete on public.sections to authenticated;
grant insert, update, delete on public.section_versions to authenticated;
grant insert, update, delete on public.media to authenticated;
grant insert, update, delete on public.section_type_defaults to authenticated;

grant select, insert on public.audit_log to authenticated;

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.sections enable row level security;
alter table public.section_versions enable row level security;
alter table public.audit_log enable row level security;
alter table public.media enable row level security;
alter table public.tailwind_class_whitelist enable row level security;
alter table public.section_type_defaults enable row level security;
alter table storage.objects enable row level security;

-- storage.objects (public read, admin write) for cms-media bucket
drop policy if exists "cms_media_public_read" on storage.objects;
create policy "cms_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cms-media');

drop policy if exists "cms_media_admin_write" on storage.objects;
create policy "cms_media_admin_write"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'cms-media' and public.is_admin())
  with check (bucket_id = 'cms-media' and public.is_admin());
-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid() and is_admin = false);

drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- pages (public readable)
drop policy if exists "pages_select_public" on public.pages;
create policy "pages_select_public"
  on public.pages
  for select
  to anon, authenticated
  using (true);

drop policy if exists "pages_write_admin_only" on public.pages;
create policy "pages_write_admin_only"
  on public.pages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- sections
drop policy if exists "sections_select_public_published_enabled" on public.sections;
create policy "sections_select_public_published_enabled"
  on public.sections
  for select
  to anon, authenticated
  using (
    enabled = true
    and exists (
      select 1
      from public.section_versions sv
      where sv.section_id = sections.id
        and sv.status = 'published'
    )
  );

drop policy if exists "sections_select_admin" on public.sections;
create policy "sections_select_admin"
  on public.sections
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "sections_write_admin_only" on public.sections;
create policy "sections_write_admin_only"
  on public.sections
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- section_versions
drop policy if exists "section_versions_select_public_published" on public.section_versions;
create policy "section_versions_select_public_published"
  on public.section_versions
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "section_versions_select_admin" on public.section_versions;
create policy "section_versions_select_admin"
  on public.section_versions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "section_versions_write_admin_only" on public.section_versions;
create policy "section_versions_write_admin_only"
  on public.section_versions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- audit_log (admin only)
drop policy if exists "audit_log_select_admin_only" on public.audit_log;
create policy "audit_log_select_admin_only"
  on public.audit_log
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "audit_log_insert_admin_only" on public.audit_log;
create policy "audit_log_insert_admin_only"
  on public.audit_log
  for insert
  to authenticated
  with check (public.is_admin());

-- media (public readable, admin write)
drop policy if exists "media_select_public" on public.media;
create policy "media_select_public"
  on public.media
  for select
  to anon, authenticated
  using (true);

drop policy if exists "media_write_admin_only" on public.media;
create policy "media_write_admin_only"
  on public.media
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- section_type_defaults: public read, admin write
drop policy if exists "section_type_defaults_select_public" on public.section_type_defaults;
create policy "section_type_defaults_select_public"
  on public.section_type_defaults
  for select
  to anon, authenticated
  using (true);

drop policy if exists "section_type_defaults_write_admin_only" on public.section_type_defaults;
create policy "section_type_defaults_write_admin_only"
  on public.section_type_defaults
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- tailwind whitelist: public read (for validation) + admin manage
drop policy if exists "tw_whitelist_select_public" on public.tailwind_class_whitelist;
create policy "tw_whitelist_select_public"
  on public.tailwind_class_whitelist
  for select
  to anon, authenticated
  using (true);

drop policy if exists "tw_whitelist_write_admin_only" on public.tailwind_class_whitelist;
create policy "tw_whitelist_write_admin_only"
  on public.tailwind_class_whitelist
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;

-- FUNCTIONS
-- =============================================================================
begin;

-- Helper: is current user an admin?
-- Validate Tailwind classes against strict whitelist (space-delimited tokens).
create or replace function public.tailwind_classes_allowed(p_classes text)
returns boolean
language plpgsql
stable
as $$
declare
  token text;
begin
  if p_classes is null or btrim(p_classes) = '' then
    return true;
  end if;

  foreach token in array regexp_split_to_array(btrim(p_classes), '\\s+') loop
    if token is null or token = '' then
      continue;
    end if;

    if not exists (
      select 1 from public.tailwind_class_whitelist w where w.class = token
    ) then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- DB-side formatting validation (common keys only; app enforces deeper rules).
create or replace function public.formatting_is_valid(p_formatting jsonb)
returns boolean
language plpgsql
stable
as $$
declare
  container_class text;
  section_class text;
  padding_y text;
  max_width text;
  text_align text;
  mobile jsonb;
  mobile_container text;
  mobile_section text;
  mobile_padding_y text;
begin
  if p_formatting is null then
    return true;
  end if;

  container_class := coalesce(p_formatting->>'containerClass', '');
  section_class := coalesce(p_formatting->>'sectionClass', '');
  padding_y := coalesce(p_formatting->>'paddingY', '');
  max_width := coalesce(p_formatting->>'maxWidth', '');
  text_align := coalesce(p_formatting->>'textAlign', '');

  if not public.tailwind_classes_allowed(container_class) then
    return false;
  end if;
  if not public.tailwind_classes_allowed(section_class) then
    return false;
  end if;

  if padding_y not in ('', 'py-4', 'py-6', 'py-8', 'py-10', 'py-12') then
    return false;
  end if;

  if max_width not in ('', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl') then
    return false;
  end if;

  if text_align not in ('', 'left', 'center') then
    return false;
  end if;

  mobile := p_formatting->'mobile';
  if mobile is not null then
    mobile_container := coalesce(mobile->>'containerClass', '');
    mobile_section := coalesce(mobile->>'sectionClass', '');
    mobile_padding_y := coalesce(mobile->>'paddingY', '');

    if not public.tailwind_classes_allowed(mobile_container) then
      return false;
    end if;
    if not public.tailwind_classes_allowed(mobile_section) then
      return false;
    end if;
    if mobile_padding_y not in ('', 'py-4', 'py-6', 'py-8', 'py-10', 'py-12') then
      return false;
    end if;
  end if;

  return true;
end;
$$;

-- Ensure section_versions.formatting passes DB validation.
do $$
begin
  alter table public.section_versions
    drop constraint if exists section_versions_formatting_valid;
  alter table public.section_versions
    add constraint section_versions_formatting_valid
      check (public.formatting_is_valid(formatting));
exception when others then
end $$;

-- One-time bootstrap: first logged-in user can make themselves admin only when no admin exists.
create or replace function public.bootstrap_make_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text;
  v_admin_exists boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select exists(select 1 from public.profiles where is_admin = true) into v_admin_exists;
  if v_admin_exists then
    return false;
  end if;

  select u.email into v_email from auth.users u where u.id = v_user_id;

  insert into public.profiles (id, email, is_admin)
  values (v_user_id, v_email, true)
  on conflict (id)
  do update set
    email = excluded.email,
    is_admin = true,
    updated_at = now();

  return true;
end;
$$;

grant execute on function public.bootstrap_make_admin() to authenticated;

-- Publish: archive any current published version for section, publish selected version.
create or replace function public.publish_section_version(p_section_id uuid, p_version_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1 from public.section_versions
    where id = p_version_id and section_id = p_section_id
  ) then
    raise exception 'section_version not found for section';
  end if;

  update public.section_versions
    set status = 'archived'
  where section_id = p_section_id
    and status = 'published';

  update public.section_versions
    set status = 'published',
        published_at = now(),
        published_by = v_user_id
  where id = p_version_id;
end;
$$;

grant execute on function public.publish_section_version(uuid, uuid) to authenticated;

-- Restore: copy an older version into a new draft with version+1 (does not publish).
create or replace function public.restore_section_version(p_section_id uuid, p_from_version_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_next_version int;
  v_from record;
  v_new_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select *
    into v_from
  from public.section_versions
  where id = p_from_version_id
    and section_id = p_section_id;

  if not found then
    raise exception 'source version not found for section';
  end if;

  select coalesce(max(version), 0) + 1
    into v_next_version
  from public.section_versions
  where section_id = p_section_id;

  perform set_config('app.audit_action', 'restore', true);

  insert into public.section_versions (
    section_id,
    version,
    status,
    title,
    subtitle,
    cta_primary_label,
    cta_primary_href,
    cta_secondary_label,
    cta_secondary_href,
    background_media_url,
    formatting,
    content,
    created_by
  ) values (
    p_section_id,
    v_next_version,
    'draft',
    v_from.title,
    v_from.subtitle,
    v_from.cta_primary_label,
    v_from.cta_primary_href,
    v_from.cta_secondary_label,
    v_from.cta_secondary_href,
    v_from.background_media_url,
    v_from.formatting,
    v_from.content,
    v_user_id
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;

grant execute on function public.restore_section_version(uuid, uuid) to authenticated;

-- Trigger helper: auto-create profile on auth signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id)
  do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

-- Trigger helper: updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger helper: created_by/updated_by
create or replace function public.set_actor_ids()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.created_by is null then
      new.created_by = auth.uid();
    end if;
    new.updated_by = auth.uid();
  elsif tg_op = 'UPDATE' then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.set_created_by()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

-- Audit trigger (writes to public.audit_log).
create or replace function public.audit_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_type text;
  v_entity_id uuid;
  v_action text;
  v_before jsonb;
  v_after jsonb;
  v_ctx_action text;
begin
  if tg_table_name = 'pages' then
    v_entity_type := 'page';
  elsif tg_table_name = 'sections' then
    v_entity_type := 'section';
  elsif tg_table_name = 'section_versions' then
    v_entity_type := 'section_version';
  else
    return null;
  end if;

  if tg_op = 'INSERT' then
    v_entity_id := new.id;
    v_before := null;
    v_after := to_jsonb(new);
    v_ctx_action := coalesce(nullif(current_setting('app.audit_action', true), ''), '');
    if v_entity_type = 'section_version' and v_ctx_action <> '' then
      v_action := v_ctx_action;
    else
      v_action := 'insert';
    end if;
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);

    if v_entity_type = 'section' then
      if old.enabled is distinct from new.enabled then
        v_action := 'toggle_enabled';
      elsif old.position is distinct from new.position then
        v_action := 'reorder';
      else
        v_action := 'update';
      end if;
    elsif v_entity_type = 'section_version' then
      if (old.status is distinct from new.status) and new.status = 'published' then
        v_action := 'publish';
      else
        v_action := 'update';
      end if;
    else
      v_action := 'update';
    end if;
  elsif tg_op = 'DELETE' then
    v_entity_id := old.id;
    v_before := to_jsonb(old);
    v_after := null;
    v_action := 'delete';
  end if;

  insert into public.audit_log (
    entity_type,
    entity_id,
    action,
    actor_id,
    before,
    after
  ) values (
    v_entity_type,
    v_entity_id,
    v_action,
    auth.uid(),
    v_before,
    v_after
  );

  return null;
end;
$$;

commit;

-- TRIGGERS
-- =============================================================================
begin;

-- updated_at triggers
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at
before update on public.sections
for each row execute function public.set_updated_at();

drop trigger if exists section_type_defaults_set_updated_at on public.section_type_defaults;
create trigger section_type_defaults_set_updated_at
before update on public.section_type_defaults
for each row execute function public.set_updated_at();

-- actor id triggers
drop trigger if exists pages_set_actor_ids on public.pages;
create trigger pages_set_actor_ids
before insert or update on public.pages
for each row execute function public.set_actor_ids();

drop trigger if exists sections_set_actor_ids on public.sections;
create trigger sections_set_actor_ids
before insert or update on public.sections
for each row execute function public.set_actor_ids();

drop trigger if exists section_versions_set_created_by on public.section_versions;
create trigger section_versions_set_created_by
before insert on public.section_versions
for each row execute function public.set_created_by();

drop trigger if exists media_set_created_by on public.media;
create trigger media_set_created_by
before insert on public.media
for each row execute function public.set_created_by();

-- auth.users -> profiles
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- audit triggers
drop trigger if exists pages_audit_changes on public.pages;
create trigger pages_audit_changes
after insert or update or delete on public.pages
for each row execute function public.audit_changes();

drop trigger if exists sections_audit_changes on public.sections;
create trigger sections_audit_changes
after insert or update or delete on public.sections
for each row execute function public.audit_changes();

drop trigger if exists section_versions_audit_changes on public.section_versions;
create trigger section_versions_audit_changes
after insert or update or delete on public.section_versions
for each row execute function public.audit_changes();

commit;

-- SEED
-- =============================================================================
begin;

-- Tailwind whitelist: keep small and safe for outer layout formatting.
-- Admin app also enforces this list; DB is the source of truth.
insert into public.tailwind_class_whitelist (class) values
  ('mx-auto'),
  ('px-4'),
  ('px-6'),
  ('py-4'),
  ('py-6'),
  ('py-8'),
  ('py-10'),
  ('py-12'),
  ('max-w-3xl'),
  ('max-w-4xl'),
  ('max-w-5xl'),
  ('max-w-6xl'),
  ('text-left'),
  ('text-center'),
  ('sm:px-6'),
  ('sm:py-6'),
  ('sm:py-8'),
  ('sm:py-10'),
  ('sm:py-12')
on conflict (class) do nothing;

-- Section type defaults (content + formatting + capabilities).
insert into public.section_type_defaults (
  section_type,
  label,
  description,
  default_title,
  default_subtitle,
  default_cta_primary_label,
  default_cta_primary_href,
  default_cta_secondary_label,
  default_cta_secondary_href,
  default_background_media_url,
  default_formatting,
  default_content,
  capabilities
) values
(
  'nav_links',
  'Nav links',
  'Header navigation links with optional CTA.',
  null,
  null,
  'Book a 15-min call',
  '#contact',
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-4',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'links', jsonb_build_array(
      jsonb_build_object('label', 'How it works', 'href', '#how-it-works', 'anchorId', 'how-it-works'),
      jsonb_build_object('label', 'Services', 'href', '#services', 'anchorId', 'services'),
      jsonb_build_object('label', 'Examples', 'href', '#examples', 'anchorId', 'examples'),
      jsonb_build_object('label', 'FAQ', 'href', '#faq', 'anchorId', 'faq'),
      jsonb_build_object('label', 'Contact', 'href', '#contact', 'anchorId', 'contact')
    ),
    'logo', jsonb_build_object(
      'url', '',
      'alt', 'Site logo',
      'widthPx', 140
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', false,
      'subtitle', false,
      'cta_primary', true,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'links', 'links[]',
      'logo', 'object(url,alt,widthPx)'
    )
  )
),
(
  'hero_cta',
  'Hero with CTAs',
  'Headline + subheadline with bullets and CTA buttons.',
  'Ops & Finance Automations for SMEs — shipped in 10 days',
  'I help finance and operations teams eliminate manual reporting, reconciliations, approvals, and tool-to-tool busywork using n8n + Postgres (and a lightweight web app when you need a UI).',
  'Book a 15-min call',
  '#contact',
  'Get a 48-hour Automation Audit',
  '#services',
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'center'
  ),
  jsonb_build_object(
    'bullets', jsonb_build_array(
      '✅ One workflow end-to-end per sprint (fixed scope, clear outcome)',
      '✅ Audit trail, logging, retries, and alerts included',
      '✅ Automations first; web app only when it truly needs a UI'
    ),
    'trustLine', 'Built for modern SMEs using tools like Slack/Teams, HubSpot, Stripe, QuickBooks/Xero, Jira, Notion, Google Workspace.'
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', true,
      'cta_primary', true,
      'cta_secondary', true,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'bullets', 'string[]',
      'trustLine', 'string'
    )
  )
),
(
  'card_grid',
  'Card grid',
  'Card list with title, text, list, and best-for.',
  'What I deliver',
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'cardDisplay', jsonb_build_object(
      'showTitle', true,
      'showText', true,
      'showImage', false,
      'showYouGet', false,
      'showBestFor', false,
      'youGetMode', 'block',
      'bestForMode', 'block'
    ),
    'cards', jsonb_build_array(
      jsonb_build_object(
        'title', '48-Hour Automation Audit',
        'text', 'A rapid assessment of one workflow with a prioritized plan and ROI estimate.',
        'display', jsonb_build_object(
          'showTitle', true,
          'showText', true,
          'showImage', false,
          'showYouGet', false,
          'showBestFor', false,
          'youGetMode', 'block',
          'bestForMode', 'block'
        ),
        'image', jsonb_build_object('url', '', 'alt', '', 'widthPx', 240),
        'youGet', jsonb_build_array('workflow map', 'backlog of fixes', 'architecture sketch', 'rough hours saved/week'),
        'bestFor', 'deciding what to automate first (and what not to)',
        'bestForList', jsonb_build_array()
      ),
      jsonb_build_object(
        'title', '10-Day Automation Sprint',
        'text', 'One production-ready workflow shipped end-to-end using n8n + Postgres.',
        'display', jsonb_build_object(
          'showTitle', true,
          'showText', true,
          'showImage', false,
          'showYouGet', false,
          'showBestFor', false,
          'youGetMode', 'block',
          'bestForMode', 'block'
        ),
        'image', jsonb_build_object('url', '', 'alt', '', 'widthPx', 240),
        'youGet', jsonb_build_array('automation + monitoring', 'audit logs', 'handover docs + walkthrough video'),
        'bestFor', 'removing a recurring bottleneck immediately',
        'bestForList', jsonb_build_array()
      ),
      jsonb_build_object(
        'title', 'Ongoing Automation Retainer',
        'text', 'Monthly improvements + maintenance for your automation layer.',
        'display', jsonb_build_object(
          'showTitle', true,
          'showText', true,
          'showImage', false,
          'showYouGet', false,
          'showBestFor', false,
          'youGetMode', 'block',
          'bestForMode', 'block'
        ),
        'image', jsonb_build_object('url', '', 'alt', '', 'widthPx', 240),
        'youGet', jsonb_build_array('new workflows + enhancements', 'reliability fixes', 'monitoring and support'),
        'bestFor', 'continuous ops/finance efficiency gains',
        'bestForList', jsonb_build_array()
      )
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'cards', 'cards[]',
      'cardDisplay', 'cardDisplay',
      'cards.display', 'cardDisplay',
      'cards.image', 'image',
      'cards.image.widthPx', 'number',
      'cards.display.youGetMode', '"block"|"list"',
      'cards.display.bestForMode', '"block"|"list"',
      'cards.bestForList', 'string[]'
    )
  )
),
(
  'steps_list',
  'Steps list',
  'Numbered steps with title and optional body.',
  'How it works',
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('title', 'Pick one workflow', 'body', ''),
      jsonb_build_object('title', 'Confirm scope + success metric (include example: “Reduce weekly reporting from 4 hours to 20 minutes” or “Cut invoice exceptions by 60%.”)', 'body', ''),
      jsonb_build_object('title', 'Build & ship (n8n + Postgres, logging/retries/alerts)', 'body', ''),
      jsonb_build_object('title', 'Handover + iterate (docs + walkthrough video)', 'body', '')
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'steps', 'steps[]'
    )
  )
),
(
  'title_body_list',
  'Title/body list',
  'List of items with title and body.',
  'Common workflows',
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('title', 'Weekly finance reporting pack', 'body', 'Pull data from key tools → normalize in Postgres → scheduled report + anomaly alerts.'),
      jsonb_build_object('title', 'Invoice/payment reconciliation + exception queue', 'body', 'Match records → flag mismatches → notify finance → keep an audit trail.'),
      jsonb_build_object('title', 'Approvals with audit trail (Slack/Teams)', 'body', 'Request → approve/deny → log decision → update downstream systems.'),
      jsonb_build_object('title', 'Customer/vendor onboarding', 'body', 'Collect inputs → validate → create records → notify stakeholders → track status.'),
      jsonb_build_object('title', 'Collections nudges', 'body', 'Overdue triggers → reminders + internal escalation → log outcomes.'),
      jsonb_build_object('title', 'Tool-to-tool integration', 'body', 'Connect systems safely with rate limits, retries, and observability.')
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'items', 'items[]'
    )
  )
),
(
  'rich_text_block',
  'Rich text block',
  'Rich text body with optional subtitle.',
  'Why this approach',
  'Automations first, UI only when needed.',
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'bodyRichText', jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'text',
              'text', 'Most SMEs don’t need a full platform on day one. They need the manual work gone, reliably. When a workflow needs a dashboard, queue view, or admin tools, I wrap it in a lightweight Next.js full-stack app.'
            )
          )
        )
      )
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', true,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'bodyRichText', 'tiptap'
    )
  )
),
(
  'label_value_list',
  'Label/value list',
  'List of label/value pairs.',
  'Tech stack',
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('label', 'Automations:', 'value', 'n8n'),
      jsonb_build_object('label', 'Data layer:', 'value', 'Postgres'),
      jsonb_build_object('label', 'Web app (when required):', 'value', 'Next.js / React (full stack)'),
      jsonb_build_object('label', 'Ops:', 'value', 'logging, alerts, retries, role-based access where needed')
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'items', 'labelValue[]'
    )
  )
),
(
  'faq_list',
  'FAQ list',
  'Question/answer list with rich text answers.',
  'FAQ',
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object(
        'question', 'Do you do design?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'I don’t provide visual design services. I build clean, functional interfaces using component libraries (like shadcn) and focus on reliability, usability, and speed.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'How do you price?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'Most clients start with the 48-Hour Audit, then move into a 10-Day Sprint. Pricing depends on workflow complexity and integrations.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'What access do you need?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'Typically tool admin/API access for systems involved in the workflow, plus a process owner who can validate edge cases.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'How do you handle security?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'Least-privilege access, audit logs, and no storing of sensitive data unless required. Clear documentation of what runs where.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'What can be done in 10 days?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'A single workflow end-to-end, production-ready, with monitoring. If it’s bigger, we break it into sprints.'
                )
              )
            )
          )
        )
      )
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'items', 'faq[]'
    )
  )
),
(
  'cta_block',
  'CTA block',
  'Call-to-action block with body text.',
  'Ready to remove a recurring ops/finance bottleneck?',
  null,
  'Book a 15-min call',
  '#contact',
  'Get the 48-hour Audit',
  '#services',
  null,
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'body', 'Book a 15-minute call and tell me the workflow that steals the most time each week.'
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', true,
      'cta_secondary', true,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'body', 'string'
    )
  )
)
on conflict (section_type) do update set
  label = excluded.label,
  description = excluded.description,
  default_title = excluded.default_title,
  default_subtitle = excluded.default_subtitle,
  default_cta_primary_label = excluded.default_cta_primary_label,
  default_cta_primary_href = excluded.default_cta_primary_href,
  default_cta_secondary_label = excluded.default_cta_secondary_label,
  default_cta_secondary_href = excluded.default_cta_secondary_href,
  default_background_media_url = excluded.default_background_media_url,
  default_formatting = excluded.default_formatting,
  default_content = excluded.default_content,
  capabilities = excluded.capabilities,
  updated_at = now();

-- Seed a single "home" page + one section per type.
with home_page as (
  insert into public.pages (slug, title)
  values ('home', 'Home')
  on conflict (slug) do update set title = excluded.title
  returning id
),
seed_sections as (
  insert into public.sections (page_id, section_type, key, enabled, position)
  select hp.id, s.section_type, s.key, true, s.position
  from home_page hp
  cross join (
    values
      ('nav_links', 'header', 0),
      ('hero_cta', null, 1),
      ('card_grid', 'services', 2),
      ('steps_list', 'how-it-works', 3),
      ('title_body_list', 'examples', 4),
      ('rich_text_block', null, 5),
      ('label_value_list', null, 6),
      ('faq_list', 'faq', 7),
      ('cta_block', 'contact', 8)
  ) as s(section_type, key, position)
  on conflict (page_id, key) where key is not null
    do update set
      section_type = excluded.section_type,
      enabled = excluded.enabled,
      position = excluded.position
  returning id, section_type
)
-- nav_links
insert into public.section_versions (
  section_id,
  version,
  status,
  cta_primary_label,
  cta_primary_href,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'Book a 15-min call',
  '#contact',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-4',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'links', jsonb_build_array(
      jsonb_build_object('label', 'How it works', 'href', '#how-it-works', 'anchorId', 'how-it-works'),
      jsonb_build_object('label', 'Services', 'href', '#services', 'anchorId', 'services'),
      jsonb_build_object('label', 'Examples', 'href', '#examples', 'anchorId', 'examples'),
      jsonb_build_object('label', 'FAQ', 'href', '#faq', 'anchorId', 'faq'),
      jsonb_build_object('label', 'Contact', 'href', '#contact', 'anchorId', 'contact')
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'nav_links'
on conflict (section_id, version) do nothing;

-- hero_cta
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  subtitle,
  cta_primary_label,
  cta_primary_href,
  cta_secondary_label,
  cta_secondary_href,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'Ops & Finance Automations for SMEs — shipped in 10 days',
  'I help finance and operations teams eliminate manual reporting, reconciliations, approvals, and tool-to-tool busywork using n8n + Postgres (and a lightweight web app when you need a UI).',
  'Book a 15-min call',
  '#contact',
  'Get a 48-hour Automation Audit',
  '#services',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'center'
  ),
  jsonb_build_object(
    'bullets', jsonb_build_array(
      '✅ One workflow end-to-end per sprint (fixed scope, clear outcome)',
      '✅ Audit trail, logging, retries, and alerts included',
      '✅ Automations first; web app only when it truly needs a UI'
    ),
    'trustLine', 'Built for modern SMEs using tools like Slack/Teams, HubSpot, Stripe, QuickBooks/Xero, Jira, Notion, Google Workspace.'
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'hero_cta'
on conflict (section_id, version) do nothing;

-- card_grid
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'What I deliver',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'cardDisplay', jsonb_build_object(
      'showTitle', true,
      'showText', true,
      'showImage', false,
      'showYouGet', false,
      'showBestFor', false,
      'youGetMode', 'block',
      'bestForMode', 'block'
    ),
    'cards', jsonb_build_array(
      jsonb_build_object(
        'title', '48-Hour Automation Audit',
        'text', 'A rapid assessment of one workflow with a prioritized plan and ROI estimate.',
        'display', jsonb_build_object(
          'showTitle', true,
          'showText', true,
          'showImage', false,
          'showYouGet', false,
          'showBestFor', false,
          'youGetMode', 'block',
          'bestForMode', 'block'
        ),
        'image', jsonb_build_object('url', '', 'alt', '', 'widthPx', 240),
        'youGet', jsonb_build_array('workflow map', 'backlog of fixes', 'architecture sketch', 'rough hours saved/week'),
        'bestFor', 'deciding what to automate first (and what not to)',
        'bestForList', jsonb_build_array()
      ),
      jsonb_build_object(
        'title', '10-Day Automation Sprint',
        'text', 'One production-ready workflow shipped end-to-end using n8n + Postgres.',
        'display', jsonb_build_object(
          'showTitle', true,
          'showText', true,
          'showImage', false,
          'showYouGet', false,
          'showBestFor', false,
          'youGetMode', 'block',
          'bestForMode', 'block'
        ),
        'image', jsonb_build_object('url', '', 'alt', '', 'widthPx', 240),
        'youGet', jsonb_build_array('automation + monitoring', 'audit logs', 'handover docs + walkthrough video'),
        'bestFor', 'removing a recurring bottleneck immediately',
        'bestForList', jsonb_build_array()
      ),
      jsonb_build_object(
        'title', 'Ongoing Automation Retainer',
        'text', 'Monthly improvements + maintenance for your automation layer.',
        'display', jsonb_build_object(
          'showTitle', true,
          'showText', true,
          'showImage', false,
          'showYouGet', false,
          'showBestFor', false,
          'youGetMode', 'block',
          'bestForMode', 'block'
        ),
        'image', jsonb_build_object('url', '', 'alt', '', 'widthPx', 240),
        'youGet', jsonb_build_array('new workflows + enhancements', 'reliability fixes', 'monitoring and support'),
        'bestFor', 'continuous ops/finance efficiency gains',
        'bestForList', jsonb_build_array()
      )
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'card_grid'
on conflict (section_id, version) do nothing;

-- steps_list
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'How it works',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('title', 'Pick one workflow', 'body', ''),
      jsonb_build_object('title', 'Confirm scope + success metric (include example: “Reduce weekly reporting from 4 hours to 20 minutes” or “Cut invoice exceptions by 60%.”)', 'body', ''),
      jsonb_build_object('title', 'Build & ship (n8n + Postgres, logging/retries/alerts)', 'body', ''),
      jsonb_build_object('title', 'Handover + iterate (docs + walkthrough video)', 'body', '')
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'steps_list'
on conflict (section_id, version) do nothing;

-- title_body_list
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'Common workflows',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('title', 'Weekly finance reporting pack', 'body', 'Pull data from key tools → normalize in Postgres → scheduled report + anomaly alerts.'),
      jsonb_build_object('title', 'Invoice/payment reconciliation + exception queue', 'body', 'Match records → flag mismatches → notify finance → keep an audit trail.'),
      jsonb_build_object('title', 'Approvals with audit trail (Slack/Teams)', 'body', 'Request → approve/deny → log decision → update downstream systems.'),
      jsonb_build_object('title', 'Customer/vendor onboarding', 'body', 'Collect inputs → validate → create records → notify stakeholders → track status.'),
      jsonb_build_object('title', 'Collections nudges', 'body', 'Overdue triggers → reminders + internal escalation → log outcomes.'),
      jsonb_build_object('title', 'Tool-to-tool integration', 'body', 'Connect systems safely with rate limits, retries, and observability.')
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'title_body_list'
on conflict (section_id, version) do nothing;

-- rich_text_block (rich text)
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  subtitle,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'Why this approach',
  'Automations first, UI only when needed.',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'bodyRichText', jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'text',
              'text', 'Most SMEs don’t need a full platform on day one. They need the manual work gone, reliably. When a workflow needs a dashboard, queue view, or admin tools, I wrap it in a lightweight Next.js full-stack app.'
            )
          )
        )
      )
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'rich_text_block'
on conflict (section_id, version) do nothing;

-- label_value_list
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'Tech stack',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('label', 'Automations:', 'value', 'n8n'),
      jsonb_build_object('label', 'Data layer:', 'value', 'Postgres'),
      jsonb_build_object('label', 'Web app (when required):', 'value', 'Next.js / React (full stack)'),
      jsonb_build_object('label', 'Ops:', 'value', 'logging, alerts, retries, role-based access where needed')
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'label_value_list'
on conflict (section_id, version) do nothing;

-- faq_list (rich text)
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'FAQ',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object(
        'question', 'Do you do design?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'I don’t provide visual design services. I build clean, functional interfaces using component libraries (like shadcn) and focus on reliability, usability, and speed.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'How do you price?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'Most clients start with the 48-Hour Audit, then move into a 10-Day Sprint. Pricing depends on workflow complexity and integrations.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'What access do you need?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'Typically tool admin/API access for systems involved in the workflow, plus a process owner who can validate edge cases.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'How do you handle security?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'Least-privilege access, audit logs, and no storing of sensitive data unless required. Clear documentation of what runs where.'
                )
              )
            )
          )
        )
      ),
      jsonb_build_object(
        'question', 'What can be done in 10 days?',
        'answerRichText', jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', 'A single workflow end-to-end, production-ready, with monitoring. If it’s bigger, we break it into sprints.'
                )
              )
            )
          )
        )
      )
    )
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'faq_list'
on conflict (section_id, version) do nothing;

-- cta_block (also acts as #contact anchor via sections.key)
insert into public.section_versions (
  section_id,
  version,
  status,
  title,
  cta_primary_label,
  cta_primary_href,
  cta_secondary_label,
  cta_secondary_href,
  formatting,
  content
)
select
  s.id,
  v.version,
  v.status,
  'Ready to remove a recurring ops/finance bottleneck?',
  'Book a 15-min call',
  '#contact',
  'Get the 48-hour Audit',
  '#services',
  jsonb_build_object(
    'maxWidth', 'max-w-5xl',
    'paddingY', 'py-6',
    'textAlign', 'left'
  ),
  jsonb_build_object(
    'body', 'Book a 15-minute call and tell me the workflow that steals the most time each week.'
  )
from public.sections s
cross join (
  values
    (1, 'published'::text),
    (2, 'draft'::text)
) as v(version, status)
where s.section_type = 'cta_block'
on conflict (section_id, version) do nothing;

commit;


-- =============================================================================
-- MIGRATION: content_snapshots (2026-02-19)
-- =============================================================================

begin;

create table if not exists public.cms_content_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  label text,
  target_page_slugs text[] not null,
  payload jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists cms_content_snapshots_created_at_idx
  on public.cms_content_snapshots (created_at desc);

alter table public.cms_content_snapshots enable row level security;

drop policy if exists "cms_content_snapshots_admin_select" on public.cms_content_snapshots;
create policy "cms_content_snapshots_admin_select"
  on public.cms_content_snapshots
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "cms_content_snapshots_admin_insert" on public.cms_content_snapshots;
create policy "cms_content_snapshots_admin_insert"
  on public.cms_content_snapshots
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "cms_content_snapshots_admin_delete" on public.cms_content_snapshots;
create policy "cms_content_snapshots_admin_delete"
  on public.cms_content_snapshots
  for delete
  to authenticated
  using (public.is_admin());

grant select, insert, delete on public.cms_content_snapshots to authenticated;

commit;


-- =============================================================================
-- MIGRATION: global_sections_and_formatting (2026-02-20)
-- =============================================================================

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

-- basic backfill for section-level overrides from historical formatting
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


-- =============================================================================
-- MIGRATION: v2_foundations (2026-02-20)
-- =============================================================================

begin;

-- A) Global section lifecycle + impact mapping
alter table public.global_sections
  add column if not exists lifecycle_state text not null default 'draft',
  add column if not exists published_version_id uuid,
  add column if not exists last_published_at timestamptz,
  add column if not exists last_published_by uuid references auth.users (id);

alter table public.global_sections
  drop constraint if exists global_sections_lifecycle_state_check;
alter table public.global_sections
  add constraint global_sections_lifecycle_state_check
  check (lifecycle_state in ('draft','published','archived'));

create index if not exists sections_global_section_id_idx on public.sections (global_section_id);

create or replace view public.global_section_where_used as
select
  gs.id as global_section_id,
  gs.key as global_section_key,
  s.id as section_id,
  p.id as page_id,
  p.slug as page_slug,
  p.title as page_title,
  s.key as section_key,
  s.enabled as section_enabled,
  s.position
from public.global_sections gs
join public.sections s on s.global_section_id = gs.id
join public.pages p on p.id = s.page_id;

grant select on public.global_section_where_used to authenticated;

create or replace function public.global_section_impact_preview(p_global_section_id uuid)
returns table(total_references int, enabled_references int, distinct_pages int)
language sql
stable
set search_path = public
as $$
  select
    count(*)::int as total_references,
    count(*) filter (where s.enabled = true)::int as enabled_references,
    count(distinct s.page_id)::int as distinct_pages
  from public.sections s
  where s.global_section_id = p_global_section_id;
$$;

grant execute on function public.global_section_impact_preview(uuid) to authenticated;

create or replace function public.detach_global_section_to_local(p_section_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_section record;
  v_global_published record;
  v_next_version int;
  v_new_version_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_section
  from public.sections s
  where s.id = p_section_id;

  if not found then
    raise exception 'section not found';
  end if;

  if v_section.global_section_id is null then
    raise exception 'section is not attached to a global section';
  end if;

  select * into v_global_published
  from public.global_section_versions gsv
  where gsv.global_section_id = v_section.global_section_id
    and gsv.status = 'published'
  order by gsv.version desc
  limit 1;

  update public.sections
  set global_section_id = null,
      updated_at = now(),
      updated_by = v_user_id
  where id = p_section_id;

  if found and v_global_published.id is not null then
    select coalesce(max(version), 0) + 1 into v_next_version
    from public.section_versions
    where section_id = p_section_id;

    insert into public.section_versions (
      section_id, version, status,
      title, subtitle,
      cta_primary_label, cta_primary_href,
      cta_secondary_label, cta_secondary_href,
      background_media_url, formatting, content,
      created_by
    ) values (
      p_section_id, v_next_version, 'draft',
      v_global_published.title, v_global_published.subtitle,
      v_global_published.cta_primary_label, v_global_published.cta_primary_href,
      v_global_published.cta_secondary_label, v_global_published.cta_secondary_href,
      v_global_published.background_media_url,
      coalesce(v_global_published.formatting, '{}'::jsonb),
      coalesce(v_global_published.content, '{}'::jsonb),
      v_user_id
    ) returning id into v_new_version_id;
  end if;

  return v_new_version_id;
end;
$$;

grant execute on function public.detach_global_section_to_local(uuid) to authenticated;

-- B + C) Design tokens / formatting schema extension defaults
update public.site_formatting_settings
set settings = coalesce(settings, '{}'::jsonb)
  || jsonb_build_object(
    'tokens', coalesce(settings->'tokens', '{}'::jsonb)
      || jsonb_build_object(
        'fontFamily', coalesce(settings->'tokens'->>'fontFamily', settings->>'fontFamily', 'Inter, system-ui, sans-serif'),
        'fontScale', coalesce((settings->'tokens'->>'fontScale')::numeric, (settings->>'fontScale')::numeric, 1),
        'spaceScale', coalesce((settings->'tokens'->>'spaceScale')::numeric, 1),
        'radiusScale', coalesce((settings->'tokens'->>'radiusScale')::numeric, 1),
        'shadowScale', coalesce((settings->'tokens'->>'shadowScale')::numeric, 1)
      )
  ),
  updated_at = now()
where id = 'default';

-- D) Schema registry + server-side validation foundation
create table if not exists public.cms_schema_registry (
  id bigserial primary key,
  scope text not null,
  section_type text,
  version int not null default 1,
  schema jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  constraint cms_schema_registry_scope_check check (scope in ('section_content', 'section_formatting', 'site_formatting'))
);

create unique index if not exists cms_schema_registry_unique_active
  on public.cms_schema_registry (scope, coalesce(section_type, ''), version)
  where is_active = true;

alter table public.cms_schema_registry enable row level security;

drop policy if exists cms_schema_registry_select_admin on public.cms_schema_registry;
create policy cms_schema_registry_select_admin
  on public.cms_schema_registry
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists cms_schema_registry_write_admin on public.cms_schema_registry;
create policy cms_schema_registry_write_admin
  on public.cms_schema_registry
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.cms_schema_registry to authenticated;
grant usage, select on sequence public.cms_schema_registry_id_seq to authenticated;

create or replace function public.validate_section_version_payload(
  p_section_type text,
  p_content jsonb,
  p_formatting jsonb
)
returns table(valid boolean, errors jsonb)
language plpgsql
stable
set search_path = public
as $$
declare
  v_errors jsonb := '[]'::jsonb;
  v_schema_content jsonb;
  v_schema_formatting jsonb;
begin
  if p_section_type is null or btrim(p_section_type) = '' then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('field','section_type','error','missing'));
  end if;

  if jsonb_typeof(coalesce(p_content, '{}'::jsonb)) <> 'object' then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('field','content','error','must_be_object'));
  end if;

  if jsonb_typeof(coalesce(p_formatting, '{}'::jsonb)) <> 'object' then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('field','formatting','error','must_be_object'));
  end if;

  if not public.formatting_is_valid(coalesce(p_formatting, '{}'::jsonb)) then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object('field','formatting','error','tailwind_or_enum_invalid'));
  end if;

  select schema into v_schema_content
  from public.cms_schema_registry
  where scope = 'section_content'
    and section_type = p_section_type
    and is_active = true
  order by version desc
  limit 1;

  if v_schema_content is not null and (v_schema_content ? 'required') then
    for i in 0..coalesce(jsonb_array_length(v_schema_content->'required') - 1, -1) loop
      if not (coalesce(p_content, '{}'::jsonb) ? (v_schema_content->'required'->>i)) then
        v_errors := v_errors || jsonb_build_array(
          jsonb_build_object('field', 'content.' || (v_schema_content->'required'->>i), 'error', 'required')
        );
      end if;
    end loop;
  end if;

  select schema into v_schema_formatting
  from public.cms_schema_registry
  where scope = 'section_formatting'
    and section_type = p_section_type
    and is_active = true
  order by version desc
  limit 1;

  if v_schema_formatting is not null and (v_schema_formatting ? 'allowedBackgroundTypes') then
    if not exists (
      select 1
      from jsonb_array_elements_text(v_schema_formatting->'allowedBackgroundTypes') t(value)
      where t.value = coalesce(p_formatting->>'backgroundType', 'none')
    ) then
      v_errors := v_errors || jsonb_build_array(
        jsonb_build_object('field', 'formatting.backgroundType', 'error', 'not_allowed')
      );
    end if;
  end if;

  return query select (jsonb_array_length(v_errors) = 0), v_errors;
end;
$$;

grant execute on function public.validate_section_version_payload(text, jsonb, jsonb) to authenticated;

-- E) Audit / diff / rollback foundation for global sections
create table if not exists public.global_section_version_audit (
  id bigserial primary key,
  global_section_id uuid not null references public.global_sections(id) on delete cascade,
  global_section_version_id uuid references public.global_section_versions(id) on delete set null,
  action text not null,
  actor_id uuid references auth.users(id),
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  constraint global_section_version_audit_action_check check (action in ('insert','update','delete','publish','rollback'))
);

create index if not exists global_section_version_audit_idx
  on public.global_section_version_audit (global_section_id, created_at desc);

alter table public.global_section_version_audit enable row level security;

drop policy if exists global_section_version_audit_select_admin on public.global_section_version_audit;
create policy global_section_version_audit_select_admin
  on public.global_section_version_audit
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists global_section_version_audit_insert_admin on public.global_section_version_audit;
create policy global_section_version_audit_insert_admin
  on public.global_section_version_audit
  for insert
  to authenticated
  with check (public.is_admin());

grant select, insert on public.global_section_version_audit to authenticated;

-- helper functions
create or replace function public.publish_global_section_version(
  p_global_section_id uuid,
  p_version_id uuid,
  p_publish_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_valid boolean;
  v_errors jsonb;
  v_section_type text;
  v_target record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select gs.section_type into v_section_type
  from public.global_sections gs
  where gs.id = p_global_section_id;

  select * into v_target
  from public.global_section_versions
  where id = p_version_id
    and global_section_id = p_global_section_id;

  if not found then
    raise exception 'global section version not found';
  end if;

  select valid, errors into v_valid, v_errors
  from public.validate_section_version_payload(v_section_type, v_target.content, v_target.formatting);

  if not v_valid then
    raise exception 'publish validation failed: %', v_errors::text;
  end if;

  update public.global_section_versions
    set status = 'archived'
  where global_section_id = p_global_section_id
    and status = 'published';

  update public.global_section_versions
    set status = 'published',
        published_at = p_publish_at,
        published_by = v_user_id
  where id = p_version_id;

  update public.global_sections
    set lifecycle_state = 'published',
        published_version_id = p_version_id,
        last_published_at = p_publish_at,
        last_published_by = v_user_id,
        updated_at = now(),
        updated_by = v_user_id
  where id = p_global_section_id;
end;
$$;

grant execute on function public.publish_global_section_version(uuid, uuid, timestamptz) to authenticated;

create or replace function public.rollback_global_section_to_version(
  p_global_section_id uuid,
  p_from_version_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_from record;
  v_next_version int;
  v_new_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_from
  from public.global_section_versions
  where id = p_from_version_id
    and global_section_id = p_global_section_id;

  if not found then
    raise exception 'source version not found';
  end if;

  select coalesce(max(version), 0) + 1 into v_next_version
  from public.global_section_versions
  where global_section_id = p_global_section_id;

  insert into public.global_section_versions (
    global_section_id, version, status,
    title, subtitle,
    cta_primary_label, cta_primary_href,
    cta_secondary_label, cta_secondary_href,
    background_media_url, formatting, content,
    created_by
  ) values (
    p_global_section_id, v_next_version, 'draft',
    v_from.title, v_from.subtitle,
    v_from.cta_primary_label, v_from.cta_primary_href,
    v_from.cta_secondary_label, v_from.cta_secondary_href,
    v_from.background_media_url, v_from.formatting, v_from.content,
    v_user_id
  ) returning id into v_new_id;

  return v_new_id;
end;
$$;

grant execute on function public.rollback_global_section_to_version(uuid, uuid) to authenticated;

-- lightweight schema seeds for migration-safe defaults
insert into public.cms_schema_registry (scope, section_type, version, schema, is_active)
values
  ('section_content', 'hero_cta', 1, jsonb_build_object('required', jsonb_build_array('bullets')), true),
  ('section_content', 'card_grid', 1, jsonb_build_object('required', jsonb_build_array('cards')), true),
  ('section_formatting', 'hero_cta', 1, jsonb_build_object('allowedBackgroundTypes', jsonb_build_array('none','color','gradient','image')), true),
  ('site_formatting', null, 1, jsonb_build_object('required', jsonb_build_array('tokens')), true)
on conflict do nothing;

commit;


-- =============================================================================
-- MIGRATION: footer_grid_section (2026-02-20)
-- =============================================================================

begin;

-- Allow new footer section type on page sections
do $$
begin
  alter table public.sections
    drop constraint if exists sections_section_type_check;
exception when others then
end $$;

alter table public.sections
  add constraint sections_section_type_check check (
    section_type in (
      'nav_links',
      'hero_cta',
      'card_grid',
      'steps_list',
      'title_body_list',
      'rich_text_block',
      'label_value_list',
      'faq_list',
      'cta_block',
      'footer_grid'
    )
  );

-- Allow new footer section type on global sections
do $$
begin
  alter table public.global_sections
    drop constraint if exists global_sections_section_type_check;
exception when others then
end $$;

alter table public.global_sections
  add constraint global_sections_section_type_check check (
    section_type in (
      'nav_links',
      'hero_cta',
      'card_grid',
      'steps_list',
      'title_body_list',
      'rich_text_block',
      'label_value_list',
      'faq_list',
      'cta_block',
      'footer_grid'
    )
  );

-- Seed defaults/capabilities for footer_grid (idempotent)
insert into public.section_type_defaults (
  section_type,
  label,
  description,
  default_title,
  default_subtitle,
  default_cta_primary_label,
  default_cta_primary_href,
  default_cta_secondary_label,
  default_cta_secondary_href,
  default_background_media_url,
  default_formatting,
  default_content,
  capabilities
)
values (
  'footer_grid',
  'Footer grid',
  'Professional footer with 1-2 cards, links, optional subscribe UI, and legal row.',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'widthMode', 'full',
    'maxWidth', 'max-w-6xl',
    'paddingY', 'py-8',
    'textAlign', 'left',
    'shadowMode', 'off',
    'innerShadowMode', 'off',
    'innerShadowStrength', 0
  ),
  jsonb_build_object(
    'brandText', 'The Resonance',
    'cards', jsonb_build_array(
      jsonb_build_object(
        'title', 'Studio',
        'body', '',
        'linksMode', 'grouped',
        'groups', jsonb_build_array(
          jsonb_build_object('title', 'Studio', 'links', jsonb_build_array(
            jsonb_build_object('label', 'Brand Sprint', 'href', '#'),
            jsonb_build_object('label', 'Product Sprint', 'href', '#')
          )),
          jsonb_build_object('title', 'AI', 'links', jsonb_build_array(
            jsonb_build_object('label', 'AI Upskill', 'href', '#'),
            jsonb_build_object('label', 'Vibegen', 'href', '#')
          )),
          jsonb_build_object('title', 'Connect', 'links', jsonb_build_array(
            jsonb_build_object('label', 'Thoughts', 'href', '#'),
            jsonb_build_object('label', 'Contact Us', 'href', '#')
          ))
        ),
        'links', jsonb_build_array(),
        'subscribe', jsonb_build_object('enabled', false, 'placeholder', 'Email Address', 'buttonLabel', 'Subscribe'),
        'ctaPrimary', jsonb_build_object('label', '', 'href', ''),
        'ctaSecondary', jsonb_build_object('label', '', 'href', '')
      ),
      jsonb_build_object(
        'title', 'Subscribe',
        'body', '',
        'linksMode', 'flat',
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Privacy Policy', 'href', '#'),
          jsonb_build_object('label', 'Sitemap', 'href', '#')
        ),
        'groups', jsonb_build_array(),
        'subscribe', jsonb_build_object('enabled', true, 'placeholder', 'Email Address', 'buttonLabel', 'Subscribe'),
        'ctaPrimary', jsonb_build_object('label', '', 'href', ''),
        'ctaSecondary', jsonb_build_object('label', '', 'href', '')
      )
    ),
    'legal', jsonb_build_object(
      'copyright', '© 2026 Your Company',
      'links', jsonb_build_array(
        jsonb_build_object('label', 'Privacy Policy', 'href', '#'),
        jsonb_build_object('label', 'Terms', 'href', '#'),
        jsonb_build_object('label', 'Sitemap', 'href', '#')
      )
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'cards', 'cards[] (1..2)',
      'cards.linksMode', '"flat"|"grouped"',
      'cards.links', 'links[]',
      'cards.groups', 'groups[]',
      'cards.subscribe', 'object(enabled,placeholder,buttonLabel)',
      'cards.ctaPrimary', 'object(label,href)',
      'cards.ctaSecondary', 'object(label,href)',
      'brandText', 'string',
      'legal', 'object(copyright,links[])'
    )
  )
)
on conflict (section_type) do update
set
  label = excluded.label,
  description = excluded.description,
  default_title = excluded.default_title,
  default_subtitle = excluded.default_subtitle,
  default_cta_primary_label = excluded.default_cta_primary_label,
  default_cta_primary_href = excluded.default_cta_primary_href,
  default_cta_secondary_label = excluded.default_cta_secondary_label,
  default_cta_secondary_href = excluded.default_cta_secondary_href,
  default_background_media_url = excluded.default_background_media_url,
  default_formatting = excluded.default_formatting,
  default_content = excluded.default_content,
  capabilities = excluded.capabilities,
  updated_at = now();

-- Optional schema registry seed for required content key
insert into public.cms_schema_registry (scope, section_type, version, schema, is_active)
values
  ('section_content', 'footer_grid', 1, jsonb_build_object('required', jsonb_build_array('cards', 'legal')), true),
  ('section_formatting', 'footer_grid', 1, jsonb_build_object('allowedBackgroundTypes', jsonb_build_array('none','color','gradient','image')), true)
on conflict do nothing;

commit;


-- =============================================================================
-- MIGRATION: formatting_templates (2026-02-21)
-- =============================================================================

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


-- =============================================================================
-- MIGRATION: pages_bg_image (2026-02-21)
-- =============================================================================

begin;

alter table public.pages
  add column if not exists bg_image_url text;

commit;


-- =============================================================================
-- MIGRATION: global_local_invariant_guardrails (2026-02-22)
-- =============================================================================

begin;

-- Guardrail #1:
-- Global-linked sections must never get local section_versions.
create or replace function public.enforce_no_local_versions_for_global_sections()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_global_section_id uuid;
begin
  select s.global_section_id
  into v_global_section_id
  from public.sections s
  where s.id = new.section_id;

  if v_global_section_id is not null then
    raise exception 'global-linked sections cannot have local section_versions (section_id=%)', new.section_id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_no_local_versions_for_global_sections on public.section_versions;
create trigger trg_enforce_no_local_versions_for_global_sections
before insert or update of section_id
on public.section_versions
for each row
execute function public.enforce_no_local_versions_for_global_sections();

-- Guardrail #2:
-- Prevent linking a section to a global section while local versions still exist.
create or replace function public.enforce_no_global_link_if_local_versions_exist()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.global_section_id is not null
     and (old.global_section_id is distinct from new.global_section_id)
     and exists (
       select 1
       from public.section_versions sv
       where sv.section_id = new.id
     ) then
    raise exception 'cannot link section to global while local section_versions exist (section_id=%)', new.id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_no_global_link_if_local_versions_exist on public.sections;
create trigger trg_enforce_no_global_link_if_local_versions_exist
before update of global_section_id
on public.sections
for each row
execute function public.enforce_no_global_link_if_local_versions_exist();

commit;


-- =============================================================================
-- MIGRATION: section_library_foundation (2026-02-22)
-- =============================================================================

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


-- =============================================================================
-- MIGRATION: sections_public_select_global_support (2026-02-22)
-- =============================================================================

-- Ensure public section visibility includes global-linked sections
-- when a published global version exists.

alter table public.sections enable row level security;

-- Recreate public + admin SELECT policies deterministically.
-- (Avoid relying on legacy policy names.)
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


-- =============================================================================
-- MIGRATION: blog_foundation (2026-02-23)
-- =============================================================================

begin;

create extension if not exists pgcrypto;

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create table if not exists public.blog_articles (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  slug text not null unique,
  current_published_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create table if not exists public.blog_article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.blog_articles (id) on delete cascade,
  version int not null,
  status text not null,
  title text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  cover_image_url text,
  cover_image_path text,
  cover_image_prompt text,
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid references auth.users (id),
  published_at timestamptz,
  published_by uuid references auth.users (id),
  rejected_at timestamptz,
  rejected_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  constraint blog_article_versions_status_check check (status in ('draft', 'approved', 'published', 'rejected')),
  constraint blog_article_versions_version_positive check (version > 0),
  constraint blog_article_versions_unique_per_article unique (article_id, version),
  constraint blog_article_versions_rejection_reason_required check (
    status <> 'rejected' or char_length(btrim(coalesce(rejection_reason, ''))) > 0
  )
);

create table if not exists public.blog_article_version_categories (
  version_id uuid not null references public.blog_article_versions (id) on delete cascade,
  category_id uuid not null references public.blog_categories (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (version_id, category_id)
);

create table if not exists public.blog_article_version_tags (
  version_id uuid not null references public.blog_article_versions (id) on delete cascade,
  tag_id uuid not null references public.blog_tags (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (version_id, tag_id)
);

create table if not exists public.blog_status_audit (
  id bigserial primary key,
  article_id uuid not null references public.blog_articles (id) on delete cascade,
  version_id uuid not null references public.blog_article_versions (id) on delete cascade,
  from_status text,
  to_status text not null,
  reason text,
  changed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists blog_article_versions_article_status_idx
  on public.blog_article_versions (article_id, status, version desc);

create index if not exists blog_article_versions_status_created_idx
  on public.blog_article_versions (status, created_at desc);

create index if not exists blog_article_versions_title_idx
  on public.blog_article_versions (title);

create index if not exists blog_articles_slug_idx
  on public.blog_articles (slug);

create index if not exists blog_articles_updated_idx
  on public.blog_articles (updated_at desc);

create index if not exists blog_status_audit_article_created_idx
  on public.blog_status_audit (article_id, created_at desc);

create index if not exists blog_status_audit_version_created_idx
  on public.blog_status_audit (version_id, created_at desc);

create unique index if not exists blog_article_versions_one_published_per_article
  on public.blog_article_versions (article_id)
  where status = 'published';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_articles_current_published_fkey'
      and conrelid = 'public.blog_articles'::regclass
  ) then
    alter table public.blog_articles
      add constraint blog_articles_current_published_fkey
      foreign key (current_published_version_id)
      references public.blog_article_versions (id)
      on delete set null;
  end if;
end
$$;

create or replace function public.blog_slugify(p_input text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  v := lower(coalesce(p_input, ''));
  v := regexp_replace(v, '[^a-z0-9]+', '-', 'g');
  v := regexp_replace(v, '(^-|-$)', '', 'g');
  if v = '' then
    v := 'blog-post';
  end if;
  return v;
end;
$$;

create or replace function public.blog_set_taxonomy_slug()
returns trigger
language plpgsql
as $$
begin
  if coalesce(btrim(new.name), '') = '' then
    raise exception 'name is required';
  end if;

  if coalesce(btrim(new.slug), '') = '' then
    new.slug := public.blog_slugify(new.name);
  else
    new.slug := public.blog_slugify(new.slug);
  end if;

  return new;
end;
$$;

create or replace function public.blog_articles_slug_immutable_after_publish()
returns trigger
language plpgsql
as $$
begin
  if old.current_published_version_id is not null and new.slug is distinct from old.slug then
    raise exception 'slug is immutable once article has been published';
  end if;
  return new;
end;
$$;

create or replace function public.blog_status_audit_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.blog_status_audit (
      article_id,
      version_id,
      from_status,
      to_status,
      reason,
      changed_by
    )
    values (
      new.article_id,
      new.id,
      old.status,
      new.status,
      case when new.status = 'rejected' then new.rejection_reason else null end,
      auth.uid()
    );
  end if;

  return null;
end;
$$;

drop trigger if exists blog_categories_set_slug on public.blog_categories;
create trigger blog_categories_set_slug
before insert or update on public.blog_categories
for each row execute function public.blog_set_taxonomy_slug();

drop trigger if exists blog_tags_set_slug on public.blog_tags;
create trigger blog_tags_set_slug
before insert or update on public.blog_tags
for each row execute function public.blog_set_taxonomy_slug();

drop trigger if exists blog_articles_enforce_slug_immutable on public.blog_articles;
create trigger blog_articles_enforce_slug_immutable
before update on public.blog_articles
for each row execute function public.blog_articles_slug_immutable_after_publish();

drop trigger if exists blog_article_versions_status_audit on public.blog_article_versions;
create trigger blog_article_versions_status_audit
after update on public.blog_article_versions
for each row execute function public.blog_status_audit_changes();

do $$
begin
  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_updated_at'
  ) then
    drop trigger if exists blog_categories_set_updated_at on public.blog_categories;
    create trigger blog_categories_set_updated_at
    before update on public.blog_categories
    for each row execute function public.set_updated_at();

    drop trigger if exists blog_tags_set_updated_at on public.blog_tags;
    create trigger blog_tags_set_updated_at
    before update on public.blog_tags
    for each row execute function public.set_updated_at();

    drop trigger if exists blog_articles_set_updated_at on public.blog_articles;
    create trigger blog_articles_set_updated_at
    before update on public.blog_articles
    for each row execute function public.set_updated_at();
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_actor_ids'
  ) then
    drop trigger if exists blog_categories_set_actor_ids on public.blog_categories;
    create trigger blog_categories_set_actor_ids
    before insert or update on public.blog_categories
    for each row execute function public.set_actor_ids();

    drop trigger if exists blog_tags_set_actor_ids on public.blog_tags;
    create trigger blog_tags_set_actor_ids
    before insert or update on public.blog_tags
    for each row execute function public.set_actor_ids();

    drop trigger if exists blog_articles_set_actor_ids on public.blog_articles;
    create trigger blog_articles_set_actor_ids
    before insert or update on public.blog_articles
    for each row execute function public.set_actor_ids();
  end if;

  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_created_by'
  ) then
    drop trigger if exists blog_article_versions_set_created_by on public.blog_article_versions;
    create trigger blog_article_versions_set_created_by
    before insert on public.blog_article_versions
    for each row execute function public.set_created_by();
  end if;
end
$$;

create or replace view public.blog_published_posts as
select
  a.id as article_id,
  a.external_id,
  a.slug,
  v.id as version_id,
  v.version,
  v.title,
  v.excerpt,
  v.content,
  v.cover_image_url,
  v.seo_title,
  v.seo_description,
  v.published_at,
  a.updated_at,
  coalesce(
    (
      select array_agg(c.slug order by c.slug)
      from public.blog_article_version_categories bvc
      join public.blog_categories c on c.id = bvc.category_id
      where bvc.version_id = v.id
    ),
    array[]::text[]
  ) as category_slugs,
  coalesce(
    (
      select array_agg(c.name order by c.name)
      from public.blog_article_version_categories bvc
      join public.blog_categories c on c.id = bvc.category_id
      where bvc.version_id = v.id
    ),
    array[]::text[]
  ) as category_names,
  coalesce(
    (
      select array_agg(t.slug order by t.slug)
      from public.blog_article_version_tags bvt
      join public.blog_tags t on t.id = bvt.tag_id
      where bvt.version_id = v.id
    ),
    array[]::text[]
  ) as tag_slugs,
  coalesce(
    (
      select array_agg(t.name order by t.name)
      from public.blog_article_version_tags bvt
      join public.blog_tags t on t.id = bvt.tag_id
      where bvt.version_id = v.id
    ),
    array[]::text[]
  ) as tag_names,
  trim(
    both ' ' from (
      coalesce(v.title, '') || ' ' ||
      coalesce(v.excerpt, '') || ' ' ||
      coalesce(v.content::text, '')
    )
  ) as search_text
from public.blog_articles a
join public.blog_article_versions v
  on v.id = a.current_published_version_id
where v.status = 'published';

commit;

begin;

grant usage on schema public to anon, authenticated;

grant select on public.blog_categories to anon, authenticated;
grant select on public.blog_tags to anon, authenticated;
grant select on public.blog_articles to anon, authenticated;
grant select on public.blog_article_versions to anon, authenticated;
grant select on public.blog_article_version_categories to anon, authenticated;
grant select on public.blog_article_version_tags to anon, authenticated;
grant select on public.blog_published_posts to anon, authenticated;

grant insert, update, delete on public.blog_categories to authenticated;
grant insert, update, delete on public.blog_tags to authenticated;
grant insert, update, delete on public.blog_articles to authenticated;
grant insert, update, delete on public.blog_article_versions to authenticated;
grant insert, update, delete on public.blog_article_version_categories to authenticated;
grant insert, update, delete on public.blog_article_version_tags to authenticated;
grant select, insert on public.blog_status_audit to authenticated;

alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_articles enable row level security;
alter table public.blog_article_versions enable row level security;
alter table public.blog_article_version_categories enable row level security;
alter table public.blog_article_version_tags enable row level security;
alter table public.blog_status_audit enable row level security;

drop policy if exists "blog_categories_select_public" on public.blog_categories;
create policy "blog_categories_select_public"
  on public.blog_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "blog_categories_write_admin_only" on public.blog_categories;
create policy "blog_categories_write_admin_only"
  on public.blog_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_tags_select_public" on public.blog_tags;
create policy "blog_tags_select_public"
  on public.blog_tags
  for select
  to anon, authenticated
  using (true);

drop policy if exists "blog_tags_write_admin_only" on public.blog_tags;
create policy "blog_tags_write_admin_only"
  on public.blog_tags
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_articles_select_public" on public.blog_articles;
create policy "blog_articles_select_public"
  on public.blog_articles
  for select
  to anon, authenticated
  using (current_published_version_id is not null);

drop policy if exists "blog_articles_select_admin" on public.blog_articles;
create policy "blog_articles_select_admin"
  on public.blog_articles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "blog_articles_write_admin_only" on public.blog_articles;
create policy "blog_articles_write_admin_only"
  on public.blog_articles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_article_versions_select_public" on public.blog_article_versions;
create policy "blog_article_versions_select_public"
  on public.blog_article_versions
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "blog_article_versions_select_admin" on public.blog_article_versions;
create policy "blog_article_versions_select_admin"
  on public.blog_article_versions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "blog_article_versions_write_admin_only" on public.blog_article_versions;
create policy "blog_article_versions_write_admin_only"
  on public.blog_article_versions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_article_version_categories_select_public" on public.blog_article_version_categories;
create policy "blog_article_version_categories_select_public"
  on public.blog_article_version_categories
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.blog_article_versions v
      where v.id = blog_article_version_categories.version_id
        and v.status = 'published'
    )
  );

drop policy if exists "blog_article_version_categories_select_admin" on public.blog_article_version_categories;
create policy "blog_article_version_categories_select_admin"
  on public.blog_article_version_categories
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "blog_article_version_categories_write_admin_only" on public.blog_article_version_categories;
create policy "blog_article_version_categories_write_admin_only"
  on public.blog_article_version_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_article_version_tags_select_public" on public.blog_article_version_tags;
create policy "blog_article_version_tags_select_public"
  on public.blog_article_version_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.blog_article_versions v
      where v.id = blog_article_version_tags.version_id
        and v.status = 'published'
    )
  );

drop policy if exists "blog_article_version_tags_select_admin" on public.blog_article_version_tags;
create policy "blog_article_version_tags_select_admin"
  on public.blog_article_version_tags
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "blog_article_version_tags_write_admin_only" on public.blog_article_version_tags;
create policy "blog_article_version_tags_write_admin_only"
  on public.blog_article_version_tags
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_status_audit_select_admin_only" on public.blog_status_audit;
create policy "blog_status_audit_select_admin_only"
  on public.blog_status_audit
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "blog_status_audit_insert_admin_only" on public.blog_status_audit;
create policy "blog_status_audit_insert_admin_only"
  on public.blog_status_audit
  for insert
  to authenticated
  with check (public.is_admin());

commit;


-- =============================================================================
-- MIGRATION: custom_section_types (2026-03-07)
-- =============================================================================

-- Add 4 new custom (composed) section types to the registry
-- These use the generic composed renderer with composer_schema

insert into public.section_type_registry (key, label, source, renderer, is_active, composer_schema)
values
  (
    'trust_strip',
    'Trust Strip',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "full", "textAlign": "center", "spacingY": "py-4" },
      "rows": [{
        "id": "r1",
        "columns": [{
          "id": "c1",
          "blocks": [
            { "id": "b1", "type": "heading", "title": "Trusted by industry leaders" },
            { "id": "b2", "type": "logo_strip", "title": "", "logos": [{"label":"Company 1"},{"label":"Company 2"},{"label":"Company 3"}] },
            { "id": "b3", "type": "badge_group", "badges": [{"text":"SOC 2"},{"text":"ISO 27001"},{"text":"GDPR"}] }
          ]
        }]
      }]
    }'::jsonb
  ),
  (
    'workflow_visual',
    'Workflow Visual',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "content", "textAlign": "left", "spacingY": "py-8" },
      "rows": [{
        "id": "r1",
        "columns": [{
          "id": "c1",
          "blocks": [
            { "id": "b1", "type": "heading", "title": "How it works" },
            { "id": "b2", "type": "subtitle", "body": "A streamlined process from discovery to deployment" },
            { "id": "b3", "type": "workflow_diagram", "title": "", "flowSteps": [{"label":"Discovery","description":"Understand your needs"},{"label":"Design","description":"Architecture & planning"},{"label":"Build","description":"Iterative development"},{"label":"Deploy","description":"Launch & monitor"}] }
          ]
        }]
      }]
    }'::jsonb
  ),
  (
    'proof_cluster',
    'Proof Cluster',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "content", "textAlign": "left", "spacingY": "py-8" },
      "rows": [
        {
          "id": "r1",
          "columns": [{
            "id": "c1",
            "blocks": [
              { "id": "b1", "type": "heading", "title": "Results that speak" },
              { "id": "b2", "type": "metrics_row", "metrics": [{"value":"10x","label":"Faster processing"},{"value":"50%","label":"Cost reduction"},{"value":"99.9%","label":"Uptime"}] }
            ]
          }]
        },
        {
          "id": "r2",
          "columns": [
            {
              "id": "c2",
              "blocks": [
                { "id": "b3", "type": "proof_card", "title": "Enterprise automation", "body": "Automated manual workflows for a Fortune 500 client", "stats": [{"value":"3x","label":"throughput"},{"value":"60%","label":"less errors"}] }
              ]
            },
            {
              "id": "c3",
              "blocks": [
                { "id": "b4", "type": "testimonial", "quote": "Transformed our operations completely.", "author": "CTO", "role": "Enterprise Client" }
              ]
            }
          ]
        }
      ]
    }'::jsonb
  ),
  (
    'split_story',
    'Split Story',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "content", "textAlign": "left", "spacingY": "py-8" },
      "rows": [{
        "id": "r1",
        "columns": [
          {
            "id": "c1",
            "blocks": [
              { "id": "b1", "type": "heading", "title": "The challenge" },
              { "id": "b2", "type": "rich_text", "body": "Describe the problem or challenge your client faced." },
              { "id": "b3", "type": "comparison", "beforeLabel": "Before", "afterLabel": "After", "beforeItems": ["Manual data entry","Slow turnaround","Error-prone"], "afterItems": ["Fully automated","Real-time processing","99.9% accuracy"] }
            ]
          },
          {
            "id": "c2",
            "blocks": [
              { "id": "b4", "type": "media_panel", "title": "Solution overview", "imageUrl": "" },
              { "id": "b5", "type": "stat_chip_row", "stats": [{"value":"5x","label":"faster"},{"value":"$2M","label":"saved"}] }
            ]
          }
        ]
      }]
    }'::jsonb
  )
on conflict (key) do nothing;


-- =============================================================================
-- MIGRATION: design_system_registries (2026-03-07)
-- =============================================================================

-- Design System Token Registries (v7)
-- Adds formal persistence for design-system presets and capabilities.

-- 1. Design theme presets (site-wide design-system presets)
CREATE TABLE IF NOT EXISTS public.design_theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Section presentation presets (layout/surface/rhythm bundles)
CREATE TABLE IF NOT EXISTS public.section_presentation_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Component family presets (card/component style bundles)
CREATE TABLE IF NOT EXISTS public.component_family_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Section preset registry (maps a semantic preset to section type + variant)
CREATE TABLE IF NOT EXISTS public.section_preset_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  section_type text NOT NULL,
  variant_key text,
  presentation_preset_key text REFERENCES public.section_presentation_presets(key),
  component_family_key text REFERENCES public.component_family_presets(key),
  default_content_variant text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Section control capabilities (what controls each section type supports)
CREATE TABLE IF NOT EXISTS public.section_control_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  variant_key text,
  supports_rhythm boolean NOT NULL DEFAULT true,
  supports_surface boolean NOT NULL DEFAULT true,
  supports_density boolean NOT NULL DEFAULT false,
  supports_grid_gap boolean NOT NULL DEFAULT false,
  supports_card_family boolean NOT NULL DEFAULT false,
  supports_card_chrome boolean NOT NULL DEFAULT false,
  supports_accent_rule boolean NOT NULL DEFAULT false,
  supports_divider_mode boolean NOT NULL DEFAULT false,
  supports_heading_treatment boolean NOT NULL DEFAULT false,
  supports_label_style boolean NOT NULL DEFAULT false,
  UNIQUE (section_type, variant_key)
);

-- Enable RLS
ALTER TABLE public.design_theme_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_presentation_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_family_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_preset_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_control_capabilities ENABLE ROW LEVEL SECURITY;

-- Public read for all preset tables (needed by frontend resolver)
CREATE POLICY "Public read design_theme_presets"
  ON public.design_theme_presets FOR SELECT USING (true);
CREATE POLICY "Public read section_presentation_presets"
  ON public.section_presentation_presets FOR SELECT USING (true);
CREATE POLICY "Public read component_family_presets"
  ON public.component_family_presets FOR SELECT USING (true);
CREATE POLICY "Public read section_preset_registry"
  ON public.section_preset_registry FOR SELECT USING (true);
CREATE POLICY "Public read section_control_capabilities"
  ON public.section_control_capabilities FOR SELECT USING (true);

-- Seed: Design theme presets
INSERT INTO public.design_theme_presets (key, name, description, tokens) VALUES
  ('obsidian_operator', 'Obsidian Operator', 'Premium dark operator aesthetic with Space Grotesk display, IBM Plex body', '{
    "displayFontFamily": "var(--font-space-grotesk), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
    "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "displayTracking": "-0.035em",
    "accentColor": "hsl(220 70% 55%)",
    "signatureStyle": "obsidian_signal",
    "signatureGridOpacity": 0.06,
    "signatureGlowOpacity": 0.08
  }'::jsonb),
  ('executive_slate', 'Executive Slate', 'Professional dark theme with DM Sans typography', '{
    "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "accentColor": "hsl(210 40% 50%)",
    "signatureStyle": "off"
  }'::jsonb),
  ('signal_grid', 'Signal Grid', 'Data-forward aesthetic with IBM Plex Mono heavy', '{
    "displayFontFamily": "var(--font-ibm-plex-mono), monospace",
    "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
    "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
    "displayWeight": 600,
    "headingWeight": 500,
    "displayTracking": "-0.02em",
    "accentColor": "hsl(160 60% 45%)",
    "signatureStyle": "grid_rays",
    "signatureGridOpacity": 0.08,
    "signatureGlowOpacity": 0.05
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Seed: Section presentation presets
INSERT INTO public.section_presentation_presets (key, name, description, tokens) VALUES
  ('hero_stage', 'Hero Stage', 'Primary hero section with full impact', '{
    "rhythm": "hero", "surface": "spotlight_stage", "density": "standard",
    "gridGap": "standard", "headingTreatment": "display",
    "labelStyle": "default", "dividerMode": "none"
  }'::jsonb),
  ('services_snapshot', 'Services Snapshot', 'Premium service offering cards', '{
    "rhythm": "standard", "surface": "spotlight_stage", "density": "airy",
    "gridGap": "wide", "headingTreatment": "default",
    "labelStyle": "pill", "dividerMode": "strong"
  }'::jsonb),
  ('proof_grid', 'Proof Grid', 'Evidence and metrics display', '{
    "rhythm": "proof", "surface": "soft_band", "density": "standard",
    "gridGap": "standard", "headingTreatment": "default",
    "labelStyle": "default", "dividerMode": "subtle"
  }'::jsonb),
  ('trust_strip', 'Trust Strip', 'Compact trust indicators', '{
    "rhythm": "compact", "surface": "soft_band", "density": "tight",
    "gridGap": "tight", "headingTreatment": "default",
    "labelStyle": "mono", "dividerMode": "none"
  }'::jsonb),
  ('process_flow', 'Process Flow', 'Step-by-step engagement', '{
    "rhythm": "standard", "surface": "none", "density": "standard",
    "gridGap": "standard", "headingTreatment": "default",
    "labelStyle": "mono", "dividerMode": "none"
  }'::jsonb),
  ('cta_close', 'CTA Close', 'Final call-to-action', '{
    "rhythm": "cta", "surface": "contrast_band", "density": "standard",
    "gridGap": "standard", "headingTreatment": "display",
    "labelStyle": "default", "dividerMode": "none"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Seed: Component family presets
INSERT INTO public.component_family_presets (key, name, description, tokens) VALUES
  ('service', 'Service', 'Premium service card with gradient depth', '{
    "chrome": "elevated", "accentRule": "left"
  }'::jsonb),
  ('proof', 'Proof', 'Evidence/testimonial card', '{
    "chrome": "outlined", "accentRule": "none"
  }'::jsonb),
  ('metric', 'Metric', 'Data-focused centered tile', '{
    "chrome": "flat", "accentRule": "none"
  }'::jsonb),
  ('process', 'Process', 'Step-indicator card with left accent', '{
    "chrome": "outlined", "accentRule": "left"
  }'::jsonb),
  ('logo_tile', 'Logo Tile', 'Minimal logo/badge container', '{
    "chrome": "flat", "accentRule": "none"
  }'::jsonb),
  ('cta', 'CTA', 'Action-oriented card', '{
    "chrome": "outlined", "accentRule": "none"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();

-- Seed: Section preset registry
INSERT INTO public.section_preset_registry (key, section_type, presentation_preset_key, component_family_key) VALUES
  ('services_snapshot', 'card_grid', 'services_snapshot', 'service'),
  ('proof_grid', 'card_grid', 'proof_grid', 'proof'),
  ('hero_stage', 'hero_cta', 'hero_stage', NULL),
  ('process_flow', 'steps_list', 'process_flow', 'process'),
  ('trust_strip', 'label_value_list', 'trust_strip', 'logo_tile'),
  ('cta_close', 'cta_block', 'cta_close', NULL)
ON CONFLICT (key) DO UPDATE SET
  section_type = EXCLUDED.section_type,
  presentation_preset_key = EXCLUDED.presentation_preset_key,
  component_family_key = EXCLUDED.component_family_key,
  updated_at = now();

-- Seed: Section control capabilities
INSERT INTO public.section_control_capabilities
  (section_type, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta',        false,false,false, false, false, false, false, false, false, false),
  ('card_grid',       true, true, true,  true,  true,  true,  true,  true,  false, true),
  ('steps_list',      true, true, true,  false, true,  true,  true,  true,  true,  true),
  ('title_body_list', true, true, true,  false, false, false, false, true,  true,  false),
  ('rich_text_block', true, true, true,  false, false, false, false, false, true,  false),
  ('label_value_list',true, true, true,  false, false, false, false, false, true,  true),
  ('faq_list',        true, true, true,  false, false, false, false, true,  true,  false),
  ('cta_block',       true, true, true,  false, false, false, false, false, true,  false),
  ('footer_grid',     false,false,false, false, false, false, false, false, false, false),
  ('nav_links',       false,false,false, false, false, false, false, false, false, false)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;


-- =============================================================================
-- MIGRATION: elite_ui_templates (2026-03-07)
-- =============================================================================

-- Elite UI System: Premium formatting templates and section defaults
-- Part of enhancements_v4 (Obsidian Operator design system)

-- 1. Insert three premium formatting templates

INSERT INTO public.formatting_templates (name, description, settings, is_system)
VALUES
  (
    'Obsidian Operator',
    'Premium dark AI/automation consultancy. Space Grotesk display, IBM Plex Sans body, IBM Plex Mono data. Obsidian signal brand signature.',
    '{
      "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
      "fontScale": 1,
      "tokens": {
        "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "fontScale": 1,
        "displayFontFamily": "var(--font-space-grotesk), system-ui, sans-serif",
        "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
        "displayWeight": 700,
        "headingWeight": 600,
        "bodyWeight": 400,
        "displayTracking": "-0.035em",
        "eyebrowTracking": "0.12em",
        "metricTracking": "-0.02em",
        "displayScale": 1.1,
        "headingScale": 1,
        "bodyScale": 1,
        "eyebrowScale": 0.8,
        "metricScale": 1.1,
        "spaceScale": 1,
        "radiusScale": 0.9,
        "shadowScale": 0.8,
        "innerShadowScale": 0.4,
        "shadowColor": "#1a1a3e",
        "textColor": "#e8eaf0",
        "mutedTextColor": "#8b90a0",
        "accentColor": "#7b8aff",
        "backgroundColor": "#0a0d14",
        "cardBackgroundColor": "#10141e",
        "signatureStyle": "obsidian_signal",
        "signatureIntensity": 0.5,
        "signatureColor": "rgba(120,140,255,0.06)",
        "signatureGridOpacity": 0.05,
        "signatureGlowOpacity": 0.06
      }
    }'::jsonb,
    true
  ),
  (
    'Executive Slate',
    'Clean corporate dark with DM Sans typography. Understated and professional.',
    '{
      "fontFamily": "var(--font-dm-sans), system-ui, sans-serif",
      "fontScale": 1,
      "tokens": {
        "fontFamily": "var(--font-dm-sans), system-ui, sans-serif",
        "fontScale": 1,
        "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
        "bodyFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
        "monoFontFamily": "var(--font-jetbrains-mono), monospace",
        "displayWeight": 700,
        "headingWeight": 600,
        "bodyWeight": 400,
        "displayTracking": "-0.025em",
        "eyebrowTracking": "0.1em",
        "metricTracking": "-0.015em",
        "displayScale": 1,
        "headingScale": 1,
        "bodyScale": 1,
        "eyebrowScale": 0.8,
        "metricScale": 1,
        "spaceScale": 1,
        "radiusScale": 1,
        "shadowScale": 0.6,
        "innerShadowScale": 0.3,
        "shadowColor": "#1a1a2a",
        "textColor": "#dfe2ea",
        "mutedTextColor": "#8890a4",
        "accentColor": "#6b7eb8",
        "backgroundColor": "#0e1118",
        "cardBackgroundColor": "#141820"
      }
    }'::jsonb,
    true
  ),
  (
    'Signal Grid',
    'Technical data-forward dark theme. IBM Plex Mono heavy, grid rays signature.',
    '{
      "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
      "fontScale": 0.95,
      "tokens": {
        "fontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "fontScale": 0.95,
        "displayFontFamily": "var(--font-ibm-plex-mono), monospace",
        "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
        "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
        "displayWeight": 600,
        "headingWeight": 600,
        "bodyWeight": 400,
        "displayTracking": "-0.02em",
        "eyebrowTracking": "0.15em",
        "metricTracking": "-0.025em",
        "displayScale": 1,
        "headingScale": 0.95,
        "bodyScale": 0.95,
        "eyebrowScale": 0.75,
        "metricScale": 1.1,
        "spaceScale": 0.95,
        "radiusScale": 0.7,
        "shadowScale": 0.5,
        "innerShadowScale": 0.2,
        "shadowColor": "#0a0f18",
        "textColor": "#c8d0e0",
        "mutedTextColor": "#707890",
        "accentColor": "#50e0a0",
        "backgroundColor": "#080c12",
        "cardBackgroundColor": "#0e1218",
        "signatureStyle": "grid_rays",
        "signatureIntensity": 0.6,
        "signatureColor": "rgba(80,224,160,0.04)",
        "signatureGridOpacity": 0.08,
        "signatureGlowOpacity": 0.04
      }
    }'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;

-- 2. Update section_type_defaults with semantic rhythm/surface defaults
-- These set the default formatting so sections have distinct visual personalities

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "hero", "sectionSurface": "spotlight_stage", "headingTreatment": "display"}'::jsonb
WHERE section_type = 'hero_cta';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard", "contentDensity": "standard", "cardFamily": "service", "cardChrome": "outlined"}'::jsonb
WHERE section_type = 'card_grid';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard", "contentDensity": "standard", "cardFamily": "process", "labelStyle": "mono"}'::jsonb
WHERE section_type = 'steps_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard", "contentDensity": "standard"}'::jsonb
WHERE section_type = 'title_body_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "compact", "contentDensity": "tight", "labelStyle": "mono"}'::jsonb
WHERE section_type = 'label_value_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "standard"}'::jsonb
WHERE section_type = 'faq_list';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "cta", "sectionSurface": "contrast_band", "headingTreatment": "display"}'::jsonb
WHERE section_type = 'cta_block';

UPDATE public.section_type_defaults
SET default_formatting = default_formatting || '{"sectionRhythm": "footer"}'::jsonb
WHERE section_type = 'footer_grid';


-- =============================================================================
-- MIGRATION: obsidian_theme (2026-03-07)
-- =============================================================================

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


-- =============================================================================
-- MIGRATION: capability_cleanup_v11 (2026-03-08)
-- =============================================================================

-- v11 Phase 5: Capability cleanup — align DB with actual renderer support
-- hero_cta and footer_grid have no design-system integration (no ui prop)
-- steps_list now supports density, chrome, headingTreatment
-- rich_text_block, cta_block, faq_list now support density
-- faq_list and label_value_list now support headingTreatment

INSERT INTO public.section_control_capabilities
  (section_type, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta',        false,false,false, false, false, false, false, false, false, false),
  ('card_grid',       true, true, true,  true,  true,  true,  true,  true,  false, true),
  ('steps_list',      true, true, true,  false, true,  true,  true,  true,  true,  true),
  ('title_body_list', true, true, true,  false, false, false, false, true,  true,  false),
  ('rich_text_block', true, true, true,  false, false, false, false, false, true,  false),
  ('label_value_list',true, true, true,  false, false, false, false, false, true,  true),
  ('faq_list',        true, true, true,  false, false, false, false, true,  true,  false),
  ('cta_block',       true, true, true,  false, false, false, false, false, true,  false),
  ('footer_grid',     false,false,false, false, false, false, false, false, false, false),
  ('nav_links',       false,false,false, false, false, false, false, false, false, false)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;


-- =============================================================================
-- MIGRATION: theme_palettes (2026-03-08)
-- =============================================================================

-- Migration: Enrich existing dark themes with full color palettes and add 2 light themes.
-- Each theme now specifies colorMode, textColor, mutedTextColor, backgroundColor,
-- cardBackgroundColor, accentColor, shadowColor, and signatureColor so that switching
-- themes produces a fully distinct visual identity.

-- Update existing dark themes with complete palettes
UPDATE public.design_theme_presets
SET tokens = '{
  "colorMode": "dark",
  "textColor": "oklch(0.95 0.01 264)",
  "mutedTextColor": "oklch(0.65 0.02 264)",
  "backgroundColor": "oklch(0.145 0.015 264)",
  "cardBackgroundColor": "oklch(0.19 0.018 264)",
  "accentColor": "oklch(0.55 0.20 264)",
  "shadowColor": "oklch(0.10 0.03 264)",
  "signatureColor": "rgba(100,130,255,0.08)",
  "displayFontFamily": "var(--font-space-grotesk), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.035em",
  "signatureStyle": "obsidian_signal",
  "signatureGridOpacity": 0.06,
  "signatureGlowOpacity": 0.08,
  "signatureNoiseOpacity": 0.02
}'::jsonb,
updated_at = now()
WHERE key = 'obsidian_operator';

UPDATE public.design_theme_presets
SET tokens = '{
  "colorMode": "dark",
  "textColor": "oklch(0.92 0.005 240)",
  "mutedTextColor": "oklch(0.62 0.01 240)",
  "backgroundColor": "oklch(0.16 0.008 240)",
  "cardBackgroundColor": "oklch(0.20 0.010 240)",
  "accentColor": "oklch(0.55 0.10 240)",
  "shadowColor": "oklch(0.08 0.02 240)",
  "signatureColor": "rgba(100,130,180,0.06)",
  "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
  "bodyFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
  "displayWeight": 700,
  "headingWeight": 600,
  "bodyWeight": 400,
  "displayTracking": "-0.025em",
  "signatureStyle": "off",
  "signatureNoiseOpacity": 0
}'::jsonb,
updated_at = now()
WHERE key = 'executive_slate';

UPDATE public.design_theme_presets
SET tokens = '{
  "colorMode": "dark",
  "textColor": "oklch(0.93 0.01 170)",
  "mutedTextColor": "oklch(0.60 0.02 170)",
  "backgroundColor": "oklch(0.13 0.02 200)",
  "cardBackgroundColor": "oklch(0.17 0.025 200)",
  "accentColor": "oklch(0.65 0.18 165)",
  "shadowColor": "oklch(0.08 0.03 200)",
  "signatureColor": "rgba(50,200,160,0.06)",
  "displayFontFamily": "var(--font-ibm-plex-mono), monospace",
  "bodyFontFamily": "var(--font-ibm-plex-sans), system-ui, sans-serif",
  "monoFontFamily": "var(--font-ibm-plex-mono), monospace",
  "displayWeight": 600,
  "headingWeight": 500,
  "bodyWeight": 400,
  "displayTracking": "-0.02em",
  "signatureStyle": "grid_rays",
  "signatureGridOpacity": 0.08,
  "signatureGlowOpacity": 0.05,
  "signatureNoiseOpacity": 0
}'::jsonb,
updated_at = now()
WHERE key = 'signal_grid';

-- Insert 2 new light themes
INSERT INTO public.design_theme_presets (key, name, description, tokens) VALUES
  ('paper_craft', 'Paper & Craft', 'Warm light theme with earthy tones — approachable, editorial, trustworthy', '{
    "colorMode": "light",
    "textColor": "oklch(0.22 0.02 65)",
    "mutedTextColor": "oklch(0.48 0.02 65)",
    "backgroundColor": "oklch(0.97 0.008 85)",
    "cardBackgroundColor": "oklch(1.0 0 0)",
    "accentColor": "oklch(0.55 0.16 45)",
    "shadowColor": "oklch(0.40 0.04 65)",
    "signatureColor": "rgba(180,140,80,0.04)",
    "displayFontFamily": "var(--font-dm-sans), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-source-sans-3), system-ui, sans-serif",
    "monoFontFamily": "var(--font-jetbrains-mono), monospace",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "displayTracking": "-0.02em",
    "radiusScale": 1.2,
    "shadowScale": 0.6,
    "signatureStyle": "off",
    "signatureNoiseOpacity": 0.01
  }'::jsonb),
  ('arctic_blue', 'Arctic Blue', 'Clean light theme with cool blue accents — clinical, modern, professional', '{
    "colorMode": "light",
    "textColor": "oklch(0.20 0.015 250)",
    "mutedTextColor": "oklch(0.45 0.02 250)",
    "backgroundColor": "oklch(0.98 0.005 250)",
    "cardBackgroundColor": "oklch(1.0 0 0)",
    "accentColor": "oklch(0.52 0.20 255)",
    "shadowColor": "oklch(0.35 0.04 250)",
    "signatureColor": "rgba(80,100,220,0.03)",
    "displayFontFamily": "var(--font-inter), system-ui, sans-serif",
    "bodyFontFamily": "var(--font-inter), system-ui, sans-serif",
    "monoFontFamily": "var(--font-jetbrains-mono), monospace",
    "displayWeight": 700,
    "headingWeight": 600,
    "bodyWeight": 400,
    "displayTracking": "-0.025em",
    "radiusScale": 0.8,
    "shadowScale": 0.5,
    "signatureStyle": "off",
    "signatureNoiseOpacity": 0
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tokens = EXCLUDED.tokens,
  updated_at = now();


-- =============================================================================
-- MIGRATION: v12_card_contract_capabilities (2026-03-08)
-- =============================================================================

-- v12: Card contract rollout — add cardFamily/cardChrome/accentRule to sections
-- that now resolve through the shared card contract

INSERT INTO public.section_control_capabilities
  (section_type, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta',        false,false,false, false, false, false, false, false, false, false),
  ('card_grid',       true, true, true,  true,  true,  true,  true,  true,  false, true),
  ('steps_list',      true, true, true,  false, true,  true,  true,  true,  true,  true),
  ('title_body_list', true, true, true,  false, true,  true,  true,  true,  true,  false),
  ('rich_text_block', true, true, true,  false, true,  true,  true,  false, true,  false),
  ('label_value_list',true, true, true,  false, true,  true,  true,  false, true,  true),
  ('faq_list',        true, true, true,  false, true,  true,  true,  true,  true,  false),
  ('cta_block',       true, true, true,  false, true,  true,  true,  false, true,  false),
  ('footer_grid',     false,false,false, false, false, false, false, false, false, false),
  ('nav_links',       false,false,false, false, false, false, false, false, false, false),
  ('composed',        true, true, true,  true,  true,  true,  true,  true,  true,  true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;


-- =============================================================================
-- MIGRATION: v13_elite_ui_capabilities (2026-03-08)
-- NOTE: Original UPDATE statements referenced columns (supported_controls, notes)
-- that do not exist on section_control_capabilities. The intended changes
-- (hero_cta headingTreatment support) are applied correctly by v16 below.
-- =============================================================================

-- (no executable statements — see v16_capability_truth below)


-- =============================================================================
-- MIGRATION: v14_promote_sections (2026-03-08)
-- =============================================================================

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


-- =============================================================================
-- MIGRATION: v15_semantic_alignment (2026-03-08)
-- =============================================================================

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


-- =============================================================================
-- MIGRATION: v16_capability_truth (2026-03-08)
-- =============================================================================

-- v16: Capability Truth Backfill
-- Ensures section_control_capabilities rows exist and are truthful
-- for all homepage-relevant permanent section types.
-- Uses ON CONFLICT to upsert — safe to run multiple times.

-- hero_cta: headingTreatment + labelStyle only (bespoke layout, no rhythm/surface)
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('hero_cta', NULL, false, false, false, false, false, false, false, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- social_proof_strip: rhythm, surface, density, gridGap, headingTreatment, labelStyle
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('social_proof_strip', NULL, true, true, true, true, false, false, false, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- proof_cluster: full semantic support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('proof_cluster', NULL, true, true, true, true, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- case_study_split: full semantic support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('case_study_split', NULL, true, true, true, true, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- steps_list: ensure gridGap is included
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('steps_list', NULL, true, true, true, true, true, true, true, true, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- card_grid: full card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('card_grid', NULL, true, true, true, true, true, true, true, true, false, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- title_body_list: gridGap, dividerMode, headingTreatment, labelStyle, card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('title_body_list', NULL, true, true, true, true, true, true, true, true, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- label_value_list: gridGap, headingTreatment, labelStyle, card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('label_value_list', NULL, true, true, true, true, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- cta_block: headingTreatment, labelStyle, card support
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('cta_block', NULL, true, true, true, false, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- rich_text_block
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('rich_text_block', NULL, true, true, true, false, true, true, true, false, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;

-- faq_list
INSERT INTO public.section_control_capabilities
  (section_type, variant_key, supports_rhythm, supports_surface, supports_density, supports_grid_gap,
   supports_card_family, supports_card_chrome, supports_accent_rule, supports_divider_mode,
   supports_heading_treatment, supports_label_style)
VALUES
  ('faq_list', NULL, true, true, true, false, true, true, true, true, true, true)
ON CONFLICT (section_type, variant_key) DO UPDATE SET
  supports_rhythm = EXCLUDED.supports_rhythm,
  supports_surface = EXCLUDED.supports_surface,
  supports_density = EXCLUDED.supports_density,
  supports_grid_gap = EXCLUDED.supports_grid_gap,
  supports_card_family = EXCLUDED.supports_card_family,
  supports_card_chrome = EXCLUDED.supports_card_chrome,
  supports_accent_rule = EXCLUDED.supports_accent_rule,
  supports_divider_mode = EXCLUDED.supports_divider_mode,
  supports_heading_treatment = EXCLUDED.supports_heading_treatment,
  supports_label_style = EXCLUDED.supports_label_style;
