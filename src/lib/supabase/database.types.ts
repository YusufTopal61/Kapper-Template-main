/**
 * Database schema types, in the shape `supabase gen types typescript` produces.
 *
 * This file mirrors supabase/migrations up to and including
 * 20261003000001_english_naming.sql. Regenerate it from the real database with
 * `pnpm db:types` (see README) so it can never drift from the schema.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          address: string | null;
          admin_email: string | null;
          business_name: string;
          id: string;
          opening_hours: Json;
          phone_number: string | null;
          singleton: boolean;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          admin_email?: string | null;
          business_name?: string;
          id?: string;
          opening_hours?: Json;
          phone_number?: string | null;
          singleton?: boolean;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          admin_email?: string | null;
          business_name?: string;
          id?: string;
          opening_hours?: Json;
          phone_number?: string | null;
          singleton?: boolean;
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
          booking_date: string;
          cancel_token: string;
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          id: string;
          notes: string | null;
          service_id: string;
          start_time: string;
          status: Database["public"]["Enums"]["booking_status"];
          updated_at: string;
        };
        Insert: {
          booking_date: string;
          cancel_token?: string;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          id?: string;
          notes?: string | null;
          service_id: string;
          start_time: string;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
        };
        Update: {
          booking_date?: string;
          cancel_token?: string;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string;
          id?: string;
          notes?: string | null;
          service_id?: string;
          start_time?: string;
          status?: Database["public"]["Enums"]["booking_status"];
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
          created_at: string;
          description: string;
          duration_minutes: number;
          id: string;
          is_active: boolean;
          name: string;
          price: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          price?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          price?: number;
          sort_order?: number;
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
      booking_status: "confirmed" | "cancelled" | "completed" | "no_show";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
