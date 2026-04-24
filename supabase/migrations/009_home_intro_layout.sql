alter table public.site_settings
  add column if not exists home_intro_layout jsonb not null default '{}'::jsonb;
