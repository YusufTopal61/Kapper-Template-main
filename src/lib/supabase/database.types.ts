/**
 * Database schema types, in the shape `supabase gen types typescript` produces.
 *
 * This file mirrors supabase/migrations. The live schema uses Dutch column names
 * and enum values; the mappers in each feature's data/ folder translate them to
 * the English entities of the domain. Regenerate this file with `pnpm db:types`
 * so it can never drift from the schema.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          adres: string | null;
          admin_email: string | null;
          bedrijfsnaam: string;
          id: string;
          openingstijden: Json;
          singleton: boolean;
          telefoonnummer: string | null;
          updated_at: string;
        };
        Insert: {
          adres?: string | null;
          admin_email?: string | null;
          bedrijfsnaam?: string;
          id?: string;
          openingstijden?: Json;
          singleton?: boolean;
          telefoonnummer?: string | null;
          updated_at?: string;
        };
        Update: {
          adres?: string | null;
          admin_email?: string | null;
          bedrijfsnaam?: string;
          id?: string;
          openingstijden?: Json;
          singleton?: boolean;
          telefoonnummer?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: { created_at: string; email: string; user_id: string };
        Insert: { created_at?: string; email: string; user_id: string };
        Update: { created_at?: string; email?: string; user_id?: string };
        Relationships: [];
      };
      bookings: {
        Row: {
          annuleer_token: string;
          created_at: string;
          datum: string;
          id: string;
          klant_email: string;
          klant_naam: string;
          klant_telefoon: string;
          notities: string | null;
          service_id: string;
          status: Database["public"]["Enums"]["booking_status"];
          tijd: string;
          updated_at: string;
        };
        Insert: {
          annuleer_token?: string;
          created_at?: string;
          datum: string;
          id?: string;
          klant_email: string;
          klant_naam: string;
          klant_telefoon: string;
          notities?: string | null;
          service_id: string;
          status?: Database["public"]["Enums"]["booking_status"];
          tijd: string;
          updated_at?: string;
        };
        Update: {
          annuleer_token?: string;
          created_at?: string;
          datum?: string;
          id?: string;
          klant_email?: string;
          klant_naam?: string;
          klant_telefoon?: string;
          notities?: string | null;
          service_id?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          tijd?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          actief: boolean;
          beschrijving: string;
          created_at: string;
          duur_minuten: number;
          id: string;
          naam: string;
          prijs: number;
          sorteer_volgorde: number;
          updated_at: string;
        };
        Insert: {
          actief?: boolean;
          beschrijving?: string;
          created_at?: string;
          duur_minuten?: number;
          id?: string;
          naam: string;
          prijs?: number;
          sorteer_volgorde?: number;
          updated_at?: string;
        };
        Update: {
          actief?: boolean;
          beschrijving?: string;
          created_at?: string;
          duur_minuten?: number;
          id?: string;
          naam?: string;
          prijs?: number;
          sorteer_volgorde?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      booking_status: "bevestigd" | "geannuleerd" | "voltooid" | "no_show";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
