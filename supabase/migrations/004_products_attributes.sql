alter table public.products
  add column if not exists colors text[] not null default '{}',
  add column if not exists sizes text[] not null default '{}';

create index if not exists products_colors_idx on public.products using gin (colors);
create index if not exists products_sizes_idx on public.products using gin (sizes);
