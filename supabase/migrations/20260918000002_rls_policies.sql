-- Row Level Security.
--
-- Principle: the public may only read active services and create a booking.
-- Everything that happens to that booking afterwards — reading, changing,
-- cancelling — can only be done by a signed-in admin.
--
-- The service_role key bypasses RLS entirely and is used exclusively
-- server-side (cancelling via token, reading settings for emails).

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

-- The public may only create a new, confirmed appointment in the future on an
-- active service. Internal notes cannot be sent along and the status cannot
-- be chosen.
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

-- Deliberately no public read access: admin_email does not belong in the browser.
-- Public pages fetch the safe fields through server-side code.
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
