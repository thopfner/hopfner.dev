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
