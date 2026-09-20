-- Row Level Security.
--
-- Uitgangspunt: het publiek mag alleen actieve diensten lezen en een boeking
-- aanmaken. Alles wat daarna met die boeking gebeurt — lezen, wijzigen,
-- annuleren — kan alleen een ingelogde beheerder.
--
-- De service_role sleutel omzeilt RLS volledig en wordt uitsluitend server-side
-- gebruikt (annuleren via token, instellingen uitlezen voor e-mails).

alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------- services

create policy "publiek leest actieve diensten"
  on public.services
  for select
  to anon, authenticated
  using (actief = true);

create policy "beheerder beheert diensten"
  on public.services
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------- bookings

-- Het publiek mag uitsluitend een nieuwe, bevestigde afspraak in de toekomst
-- aanmaken op een actieve dienst. Interne notities kunnen niet meegestuurd
-- worden en de status kan niet zelf gekozen worden.
create policy "publiek maakt een boeking aan"
  on public.bookings
  for insert
  to anon, authenticated
  with check (
    status = 'bevestigd'
    and notities is null
    and datum >= current_date
    and exists (
      select 1 from public.services s
      where s.id = service_id and s.actief = true
    )
  );

create policy "beheerder beheert boekingen"
  on public.bookings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------- admin_settings

-- Bewust géén publieke leesrechten: admin_email hoort niet in de browser.
-- Publieke pagina's halen de veilige velden op via een server function.
create policy "beheerder beheert instellingen"
  on public.admin_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------- admin_users

create policy "beheerder ziet beheerders"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());
