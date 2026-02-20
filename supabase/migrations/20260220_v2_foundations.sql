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
