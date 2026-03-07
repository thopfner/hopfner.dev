begin;

alter table public.pages
  add column if not exists bg_image_url text;

commit;
