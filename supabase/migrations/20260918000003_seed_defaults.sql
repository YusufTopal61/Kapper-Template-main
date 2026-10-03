-- Starter data, so a fresh install works right away.
-- admin_email is deliberately left empty: the admin fills it in at /admin/instellingen.

insert into public.admin_settings (singleton)
values (true)
on conflict (singleton) do nothing;

-- Only fill when nothing exists yet, so running again does not create duplicates.
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
