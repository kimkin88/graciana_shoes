-- Commerce fields on products + lightweight taxonomy tables.

alter table public.products
  add column if not exists sku text,
  add column if not exists compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= 0),
  add column if not exists short_description_ru text,
  add column if not exists short_description_en text,
  add column if not exists manufacturer text,
  add column if not exists model text,
  add column if not exists source_url text,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists specs jsonb not null default '{}'::jsonb,
  add column if not exists seo_title_ru text,
  add column if not exists seo_title_en text,
  add column if not exists seo_description_ru text,
  add column if not exists seo_description_en text;

create index if not exists products_sku_idx on public.products (sku);
create index if not exists products_tags_idx on public.products using gin (tags);

create table if not exists public.catalog_categories (
  slug text primary key,
  name_ru text not null,
  name_en text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_groups (
  key text primary key,
  name_ru text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_tags (
  slug text primary key,
  created_at timestamptz not null default now()
);

alter table public.catalog_categories enable row level security;
alter table public.catalog_groups enable row level security;
alter table public.catalog_tags enable row level security;

drop policy if exists "catalog_categories_read" on public.catalog_categories;
create policy "catalog_categories_read" on public.catalog_categories for select using (true);
drop policy if exists "catalog_categories_admin" on public.catalog_categories;
create policy "catalog_categories_admin" on public.catalog_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "catalog_groups_read" on public.catalog_groups;
create policy "catalog_groups_read" on public.catalog_groups for select using (true);
drop policy if exists "catalog_groups_admin" on public.catalog_groups;
create policy "catalog_groups_admin" on public.catalog_groups for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "catalog_tags_read" on public.catalog_tags;
create policy "catalog_tags_read" on public.catalog_tags for select using (true);
drop policy if exists "catalog_tags_admin" on public.catalog_tags;
create policy "catalog_tags_admin" on public.catalog_tags for all using (public.is_admin()) with check (public.is_admin());

insert into public.catalog_categories (slug, name_ru, name_en, sort) values
  ('sapogi', 'Сапоги', 'Boots', 10),
  ('botinki', 'Ботинки', 'Ankle boots', 20),
  ('botilony', 'Ботильоны', 'Booties', 30),
  ('loafers', 'Лоферы', 'Loafers', 40),
  ('tufii', 'Туфли', 'Pumps', 50),
  ('krossovki', 'Кроссовки', 'Sneakers', 60),
  ('kedy', 'Кеды', 'Keds', 70),
  ('balletki', 'Балетки', 'Ballet flats', 80),
  ('sabo', 'Сабо', 'Clogs', 90),
  ('bosonozhki', 'Босоножки', 'Heeled sandals', 100),
  ('sandali', 'Сандалии', 'Sandals', 110)
on conflict (slug) do nothing;
