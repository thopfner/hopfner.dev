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
