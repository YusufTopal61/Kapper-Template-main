-- Kapper-platform: basisschema.
-- Tabellen: services, bookings, admin_settings, admin_users.

create extension if not exists "pgcrypto";

create type public.booking_status as enum ('bevestigd', 'geannuleerd', 'voltooid', 'no_show');

-- Houdt updated_at automatisch bij.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- services

create table public.services (
  id uuid primary key default gen_random_uuid(),
  naam text not null check (char_length(trim(naam)) > 0),
  beschrijving text not null default '',
  prijs numeric(10, 2) not null default 0 check (prijs >= 0),
  duur_minuten integer not null default 30 check (duur_minuten > 0 and duur_minuten <= 480),
  actief boolean not null default true,
  sorteer_volgorde integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_actief_idx on public.services (actief, sorteer_volgorde);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- bookings

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete restrict,
  klant_naam text not null check (char_length(trim(klant_naam)) > 0),
  klant_email text not null check (position('@' in klant_email) > 1),
  klant_telefoon text not null check (char_length(trim(klant_telefoon)) > 0),
  datum date not null,
  tijd time not null,
  status public.booking_status not null default 'bevestigd',
  -- Interne notities van de kapper; nooit zichtbaar voor de klant.
  notities text,
  -- Geheime sleutel in de annuleerlink uit de bevestigingsmail.
  annuleer_token text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Database-garantie tegen dubbele boekingen: één actieve afspraak per tijdslot.
create unique index bookings_uniek_tijdslot
  on public.bookings (datum, tijd)
  where status <> 'geannuleerd';

create index bookings_datum_idx on public.bookings (datum, tijd);
create index bookings_status_idx on public.bookings (status);
create index bookings_annuleer_token_idx on public.bookings (annuleer_token);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- admin_users

-- Allowlist: alleen auth-gebruikers die hier staan tellen als beheerder.
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- security definer, zodat het controleren van admin-rechten zelf geen RLS
-- op admin_users triggert (dat zou oneindig recursief zijn).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------- admin_settings

create table public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  -- Dwingt precies één rij af: de kolom mag alleen true zijn en is uniek.
  singleton boolean not null default true unique check (singleton),
  bedrijfsnaam text not null default 'Barber',
  -- Hier komen de boekingsnotificaties binnen. Leeg = nog niet ingesteld.
  admin_email text,
  telefoonnummer text,
  adres text,
  openingstijden jsonb not null default jsonb_build_object(
    'maandag',   jsonb_build_object('open', false, 'van', '09:00', 'tot', '18:00'),
    'dinsdag',   jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'woensdag',  jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'donderdag', jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'vrijdag',   jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'zaterdag',  jsonb_build_object('open', true,  'van', '09:00', 'tot', '17:00'),
    'zondag',    jsonb_build_object('open', false, 'van', '09:00', 'tot', '18:00')
  ),
  updated_at timestamptz not null default now()
);

create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at();
