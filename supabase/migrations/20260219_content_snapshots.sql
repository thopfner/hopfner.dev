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
