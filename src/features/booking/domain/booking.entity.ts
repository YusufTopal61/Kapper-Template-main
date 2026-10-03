export type BookingStatus = "bevestigd" | "geannuleerd" | "voltooid" | "no_show";

export type BookedService = {
  id: string;
  naam: string;
  prijs: number;
  duur_minuten: number;
};

export type Booking = {
  id: string;
  service_id: string;
  klant_naam: string;
  klant_email: string;
  klant_telefoon: string;
  datum: string; // "YYYY-MM-DD"
  tijd: string; // "HH:MM" (of "HH:MM:SS" uit de database)
  status: BookingStatus;
  /** Interne notities van de kapper; nooit zichtbaar voor de klant. */
  notities: string | null;
};

/**
 * Een boeking zoals de server haar kent, inclusief het geheime annuleertoken.
 * Dit type verlaat de server nooit.
 */
export type BookingRecord = Booking & {
  annuleer_token: string;
  services: BookedService | null;
};

/** Wat het beheerpaneel te zien krijgt: het token zit er bewust niet bij. */
export type BookingWithService = Omit<BookingRecord, "annuleer_token">;

/** Wat nodig is om een nieuwe boeking op te slaan. */
export type NewBooking = {
  id: string;
  service_id: string;
  klant_naam: string;
  klant_email: string;
  klant_telefoon: string;
  datum: string;
  tijd: string;
  annuleer_token: string;
};

/** Een bestaande afspraak die tijd in beslag neemt. */
export type BusyBooking = {
  id: string;
  tijd: string;
  /** null wanneer de gekoppelde dienst ontbreekt. */
  duurMinuten: number | null;
};

/** Bezet tijdvak in minuten sinds middernacht. */
export type BusyRange = { start: number; eind: number };

export type Tijdslot = { tijd: string; beschikbaar: boolean };

/** Gegevens voor de e-mails rond een boeking. */
export type BookingMailData = {
  id: string;
  annuleer_token: string;
  klant_naam: string;
  klant_email: string;
  klant_telefoon: string;
  datum: string;
  tijd: string;
  dienstNaam: string;
  prijs: number | null;
  duurMinuten: number | null;
};

export type BoekingResultaat =
  | {
      ok: true;
      boeking: {
        id: string;
        datum: string;
        tijd: string;
        dienstNaam: string;
        klant_naam: string;
        klant_email: string;
      };
      emailVerzonden: boolean;
    }
  | { ok: false; error: string; veld?: "datum" | "tijd" | "service_id" };

/** Wat de klant ziet op de annuleerpagina. */
export type BoekingViaToken = {
  id: string;
  klant_naam: string;
  datum: string;
  tijd: string;
  status: BookingStatus;
  dienstNaam: string;
  prijs: number | null;
  duurMinuten: number | null;
  bedrijfsnaam: string;
  adres: string | null;
};
