-- Seed data for local development: runs after the migrations on `supabase db reset`.
-- Idempotent, so running it twice never creates duplicates.
-- The column names are the English ones from 20261003000001_english_naming.sql.
-- The service names and descriptions are Dutch on purpose: they are customer-facing content.
-- Prices start at 0 ("not set yet"); the owner fills them in under /admin/diensten.

insert into public.admin_settings (singleton)
values (true)
on conflict (singleton) do nothing;

insert into public.services (name, description, price, duration_minutes, sort_order)
select * from (values
  (
    'Knippen',
    'Een strak, persoonlijk kapsel. Advies vooraf, precisie tijdens, styling na afloop.',
    0,
    30,
    1
  ),
  (
    'Knippen + Baard',
    'De volledige behandeling. Kapsel en baardlijn perfect op elkaar afgestemd.',
    0,
    45,
    2
  ),
  (
    'Baard',
    'Trimmen, modelleren en scheren met warme doek. Scherpe lijnen, verzorgde finish.',
    0,
    20,
    3
  )
) as new_services(name, description, price, duration_minutes, sort_order)
where not exists (select 1 from public.services);
