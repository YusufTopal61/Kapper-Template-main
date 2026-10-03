-- Manual rollback for 20261003000001_english_naming.sql.
-- Not run by the Supabase CLI. Run it in the SQL editor only if you must go back
-- to the Dutch names, and then delete the migration's version from
-- supabase_migrations.schema_migrations.

alter policy "admin sees admins" on public.admin_users rename to "beheerder ziet beheerders";
alter policy "admin manages settings" on public.admin_settings rename to "beheerder beheert instellingen";
alter policy "admin manages bookings" on public.bookings rename to "beheerder beheert boekingen";
alter policy "public creates a booking" on public.bookings rename to "publiek maakt een boeking aan";
alter policy "admin manages services" on public.services rename to "beheerder beheert diensten";
alter policy "public reads active services" on public.services rename to "publiek leest actieve diensten";

update public.admin_settings
set opening_hours = (
  select jsonb_object_agg(
    case day.key
      when 'monday' then 'maandag'
      when 'tuesday' then 'dinsdag'
      when 'wednesday' then 'woensdag'
      when 'thursday' then 'donderdag'
      when 'friday' then 'vrijdag'
      when 'saturday' then 'zaterdag'
      when 'sunday' then 'zondag'
      else day.key
    end,
    jsonb_build_object('open', day.value -> 'open', 'van', day.value -> 'from', 'tot', day.value -> 'to')
  )
  from jsonb_each(opening_hours) as day
)
where opening_hours ? 'monday';

alter table public.admin_settings
  alter column opening_hours set default jsonb_build_object(
    'maandag',   jsonb_build_object('open', false, 'van', '09:00', 'tot', '18:00'),
    'dinsdag',   jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'woensdag',  jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'donderdag', jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'vrijdag',   jsonb_build_object('open', true,  'van', '09:00', 'tot', '18:00'),
    'zaterdag',  jsonb_build_object('open', true,  'van', '09:00', 'tot', '17:00'),
    'zondag',    jsonb_build_object('open', false, 'van', '09:00', 'tot', '18:00')
  );

alter table public.admin_settings rename column opening_hours to openingstijden;
alter table public.admin_settings rename column address to adres;
alter table public.admin_settings rename column phone_number to telefoonnummer;
alter table public.admin_settings rename column business_name to bedrijfsnaam;

alter index public.bookings_cancel_token_idx rename to bookings_annuleer_token_idx;
alter index public.bookings_date_idx rename to bookings_datum_idx;
alter index public.bookings_unique_time_slot rename to bookings_uniek_tijdslot;
alter table public.bookings rename constraint bookings_customer_phone_check to bookings_klant_telefoon_check;
alter table public.bookings rename constraint bookings_customer_email_check to bookings_klant_email_check;
alter table public.bookings rename constraint bookings_customer_name_check to bookings_klant_naam_check;
alter table public.bookings rename column cancel_token to annuleer_token;
alter table public.bookings rename column notes to notities;
alter table public.bookings rename column start_time to tijd;
alter table public.bookings rename column booking_date to datum;
alter table public.bookings rename column customer_phone to klant_telefoon;
alter table public.bookings rename column customer_email to klant_email;
alter table public.bookings rename column customer_name to klant_naam;

alter index public.services_is_active_idx rename to services_actief_idx;
alter table public.services rename constraint services_duration_minutes_check to services_duur_minuten_check;
alter table public.services rename constraint services_price_check to services_prijs_check;
alter table public.services rename constraint services_name_check to services_naam_check;
alter table public.services rename column sort_order to sorteer_volgorde;
alter table public.services rename column is_active to actief;
alter table public.services rename column duration_minutes to duur_minuten;
alter table public.services rename column price to prijs;
alter table public.services rename column description to beschrijving;
alter table public.services rename column name to naam;

alter type public.booking_status rename value 'completed' to 'voltooid';
alter type public.booking_status rename value 'cancelled' to 'geannuleerd';
alter type public.booking_status rename value 'confirmed' to 'bevestigd';
