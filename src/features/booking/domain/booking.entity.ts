export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";

export type BookedService = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

export type Booking = {
  id: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" (of "HH:MM:SS" uit de database)
  status: BookingStatus;
  /** Interne notities van de kapper; nooit zichtbaar voor de klant. */
  notes: string | null;
};

/**
 * Een boeking zoals de server haar kent, inclusief het geheime annuleertoken.
 * Dit type verlaat de server nooit.
 */
export type BookingRecord = Booking & {
  cancelToken: string;
  services: BookedService | null;
};

/** Wat het beheerpaneel te zien krijgt: het token zit er bewust niet bij. */
export type BookingWithService = Omit<BookingRecord, "cancelToken">;

/** Wat nodig is om een nieuwe boeking op te slaan. */
export type NewBooking = {
  id: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  cancelToken: string;
};

/** Een bestaande afspraak die tijd in beslag neemt. */
export type BusyBooking = {
  id: string;
  time: string;
  /** null wanneer de gekoppelde dienst ontbreekt. */
  durationMinutes: number | null;
};

/** Bezet tijdvak in minuten sinds middernacht. */
export type BusyRange = { start: number; end: number };

export type TimeSlot = { time: string; available: boolean };

/** Gegevens voor de e-mails rond een boeking. */
export type BookingMailData = {
  id: string;
  cancelToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  serviceName: string;
  price: number | null;
  durationMinutes: number | null;
};

export type BookingResult =
  | {
      ok: true;
      booking: {
        id: string;
        date: string;
        time: string;
        serviceName: string;
        customerName: string;
        customerEmail: string;
      };
      emailSent: boolean;
    }
  | { ok: false; error: string; field?: "date" | "time" | "serviceId" };

/** Wat de klant ziet op de annuleerpagina. */
export type BookingByToken = {
  id: string;
  customerName: string;
  date: string;
  time: string;
  status: BookingStatus;
  serviceName: string;
  price: number | null;
  durationMinutes: number | null;
  businessName: string;
  address: string | null;
};
