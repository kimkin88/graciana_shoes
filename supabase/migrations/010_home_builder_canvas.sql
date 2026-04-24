alter table public.site_settings
  add column if not exists home_builder jsonb not null default '{}'::jsonb;
