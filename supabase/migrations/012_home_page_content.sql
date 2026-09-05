alter table public.site_settings
  add column if not exists home_page jsonb not null default '{}'::jsonb;
