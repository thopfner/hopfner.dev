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
