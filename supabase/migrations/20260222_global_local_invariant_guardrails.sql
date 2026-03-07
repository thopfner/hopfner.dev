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
