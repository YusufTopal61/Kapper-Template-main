/**
 * Databasetypes, handmatig gelijkgehouden met supabase/migrations.
 * Na het koppelen van een project te vervangen door:
 *   supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 */

export type BookingStatus = "bevestigd" | "geannuleerd" | "voltooid" | "no_show";

export type Dag =
  "maandag" | "dinsdag" | "woensdag" | "donderdag" | "vrijdag" | "zaterdag" | "zondag";

export type DagOpeningstijd = {
  open: boolean;
  van: string;
  tot: string;
};

export type Openingstijden = Record<Dag, DagOpeningstijd>;

type ServiceRow = {
  id: string;
  naam: string;
  beschrijving: string;
  prijs: number;
  duur_minuten: number;
  actief: boolean;
  sorteer_volgorde: number;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  id: string;
  service_id: string;
  klant_naam: string;
  klant_email: string;
  klant_telefoon: string;
  datum: string;
  tijd: string;
  status: BookingStatus;
  notities: string | null;
  annuleer_token: string;
  created_at: string;
  updated_at: string;
};

type AdminSettingsRow = {
  id: string;
  singleton: boolean;
  bedrijfsnaam: string;
  admin_email: string | null;
  telefoonnummer: string | null;
  adres: string | null;
  openingstijden: Openingstijden;
  updated_at: string;
};

type AdminUserRow = {
  user_id: string;
  email: string;
  created_at: string;
};

/**
 * Als Partial, maar met een expliciete `| undefined`. Het project draait met
 * exactOptionalPropertyTypes; zonder dit mag je een veld niet op undefined
 * zetten om "niet wijzigen" te bedoelen. JSON.stringify laat undefined
 * vervolgens gewoon weg, dus het komt nooit bij de database aan.
 */
type Optioneel<T> = { [K in keyof T]?: T[K] | undefined };

export type Database = {
  public: {
    Tables: {
      services: {
        Row: ServiceRow;
        Insert: Optioneel<Omit<ServiceRow, "id" | "created_at" | "updated_at">> & { naam: string };
        Update: Optioneel<Omit<ServiceRow, "id" | "created_at">>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: Omit<
          BookingRow,
          "id" | "status" | "notities" | "annuleer_token" | "created_at" | "updated_at"
        > &
          Optioneel<Pick<BookingRow, "id" | "status" | "notities" | "annuleer_token">>;
        Update: Optioneel<Omit<BookingRow, "id" | "created_at">>;
        Relationships: [];
      };
      admin_settings: {
        Row: AdminSettingsRow;
        Insert: Optioneel<AdminSettingsRow>;
        Update: Optioneel<Omit<AdminSettingsRow, "id">>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: AdminUserRow;
        Update: Optioneel<AdminUserRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      booking_status: BookingStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};

/** Boeking inclusief de gekoppelde dienst, zoals de admin-queries hem teruggeven. */
export type BookingWithService = BookingRow & {
  services: Pick<ServiceRow, "id" | "naam" | "prijs" | "duur_minuten"> | null;
};

export type Service = ServiceRow;
export type Booking = BookingRow;
export type AdminSettings = AdminSettingsRow;
