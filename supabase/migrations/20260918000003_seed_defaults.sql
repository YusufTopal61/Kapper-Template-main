-- Startdata, zodat een verse installatie meteen werkt.
-- admin_email blijft bewust leeg: de beheerder vult die in bij /admin/instellingen.

insert into public.admin_settings (singleton)
values (true)
on conflict (singleton) do nothing;

-- Alleen vullen als er nog niets staat, zodat opnieuw draaien geen duplicaten geeft.
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
