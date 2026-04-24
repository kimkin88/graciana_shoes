alter table public.site_settings
  add column if not exists home_intro_title text,
  add column if not exists home_intro_body text,
  add column if not exists home_sections jsonb not null default '[]'::jsonb;
