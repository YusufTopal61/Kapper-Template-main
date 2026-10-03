-- Standardise all database naming on English snake_case.
--
-- Renames only: no data is dropped or rewritten, except the opening_hours JSON,
-- whose keys are translated in place. Policies, indexes and triggers keep
-- working because PostgreSQL tracks columns and enum values by identity, not
-- by name. A manual rollback script lives in supabase/rollback/.

-- ---------------------------------------------------------------- enum values

alter type public.booking_status rename value 'bevestigd' to 'confirmed';
alter type public.booking_status rename value 'geannuleerd' to 'cancelled';
alter type public.booking_status rename value 'voltooid' to 'completed';

-- ---------------------------------------------------------------- services

alter table public.services rename column naam to name;
alter table public.services rename column beschrijving to description;
alter table public.services rename column prijs to price;
alter table public.services rename column duur_minuten to duration_minutes;
alter table public.services rename column actief to is_active;
alter table public.services rename column sorteer_volgorde to sort_order;

alter table public.services rename constraint services_naam_check to services_name_check;
alter table public.services rename constraint services_prijs_check to services_price_check;
alter table public.services rename constraint services_duur_minuten_check to services_duration_minutes_check;
alter index public.services_actief_idx rename to services_is_active_idx;

-- ---------------------------------------------------------------- bookings

alter table public.bookings rename column klant_naam to customer_name;
alter table public.bookings rename column klant_email to customer_email;
alter table public.bookings rename column klant_telefoon to customer_phone;
alter table public.bookings rename column datum to booking_date;
alter table public.bookings rename column tijd to start_time;
alter table public.bookings rename column notities to notes;
alter table public.bookings rename column annuleer_token to cancel_token;

alter table public.bookings rename constraint bookings_klant_naam_check to bookings_customer_name_check;
alter table public.bookings rename constraint bookings_klant_email_check to bookings_customer_email_check;
alter table public.bookings rename constraint bookings_klant_telefoon_check to bookings_customer_phone_check;
alter index public.bookings_uniek_tijdslot rename to bookings_unique_time_slot;
alter index public.bookings_datum_idx rename to bookings_date_idx;
alter index public.bookings_annuleer_token_idx rename to bookings_cancel_token_idx;

-- ---------------------------------------------------------------- admin_settings

alter table public.admin_settings rename column bedrijfsnaam to business_name;
alter table public.admin_settings rename column telefoonnummer to phone_number;
alter table public.admin_settings rename column adres to address;
alter table public.admin_settings rename column openingstijden to opening_hours;

-- Translate the weekday keys and the van/tot keys of the existing row(s).
update public.admin_settings
set opening_hours = (
  select jsonb_object_agg(
    case day.key
      when 'maandag' then 'monday'
      when 'dinsdag' then 'tuesday'
      when 'woensdag' then 'wednesday'
      when 'donderdag' then 'thursday'
      when 'vrijdag' then 'friday'
      when 'zaterdag' then 'saturday'
      when 'zondag' then 'sunday'
      else day.key
    end,
    jsonb_build_object(
      'open', day.value -> 'open',
      'from', day.value -> 'van',
      'to', day.value -> 'tot'
    )
  )
  from jsonb_each(opening_hours) as day
)
where opening_hours ? 'maandag';

alter table public.admin_settings
  alter column opening_hours set default jsonb_build_object(
    'monday',    jsonb_build_object('open', false, 'from', '09:00', 'to', '18:00'),
    'tuesday',   jsonb_build_object('open', true,  'from', '09:00', 'to', '18:00'),
    'wednesday', jsonb_build_object('open', true,  'from', '09:00', 'to', '18:00'),
    'thursday',  jsonb_build_object('open', true,  'from', '09:00', 'to', '18:00'),
    'friday',    jsonb_build_object('open', true,  'from', '09:00', 'to', '18:00'),
    'saturday',  jsonb_build_object('open', true,  'from', '09:00', 'to', '17:00'),
    'sunday',    jsonb_build_object('open', false, 'from', '09:00', 'to', '18:00')
  );

-- ---------------------------------------------------------------- policies

alter policy "publiek leest actieve diensten" on public.services rename to "public reads active services";
alter policy "beheerder beheert diensten" on public.services rename to "admin manages services";
alter policy "publiek maakt een boeking aan" on public.bookings rename to "public creates a booking";
alter policy "beheerder beheert boekingen" on public.bookings rename to "admin manages bookings";
alter policy "beheerder beheert instellingen" on public.admin_settings rename to "admin manages settings";
alter policy "beheerder ziet beheerders" on public.admin_users rename to "admin sees admins";
