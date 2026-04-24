create table if not exists public.site_settings (
  id integer primary key,
  hero_image_url text
);

insert into public.site_settings (id, hero_image_url)
values (1, null)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

alter table public.products
  add column if not exists group_key text;

create index if not exists products_group_key_idx on public.products (group_key);
