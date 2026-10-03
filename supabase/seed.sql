-- Seed data for local development: runs after the migrations on `supabase db reset`.
-- Idempotent, so running it twice never creates duplicates.
-- The column names are the (Dutch) ones of the live schema; the mappers in
-- src/features/*/data translate them to the English entities.
-- The service names and descriptions are Dutch on purpose: they are customer-facing content.
-- Prices start at 0 ("not set yet"); the owner fills them in under /admin/diensten.

insert into public.admin_settings (singleton)
values (true)
on conflict (singleton) do nothing;

insert into public.services (naam, beschrijving, prijs, duur_minuten, sorteer_volgorde)
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
) as nieuw(naam, beschrijving, prijs, duur_minuten, sorteer_volgorde)
where not exists (select 1 from public.services);
