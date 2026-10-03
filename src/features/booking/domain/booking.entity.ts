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
  time: string; // "HH:MM" (or "HH:MM:SS" from the database)
  status: BookingStatus;
  /** Internal notes from the barber; never visible to the customer. */
  notes: string | null;
};

/**
 * A booking as the server knows it, including the secret cancel token.
 * This type never leaves the server.
 */
export type BookingRecord = Booking & {
  cancelToken: string;
  services: BookedService | null;
};

/** What the admin panel gets to see: the token is deliberately not included. */
export type BookingWithService = Omit<BookingRecord, "cancelToken">;

/** What is needed to store a new booking. */
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

/** An existing appointment that occupies time. */
export type BusyBooking = {
  id: string;
  time: string;
  /** null when the linked service is missing. */
  durationMinutes: number | null;
};

/** Busy time range in minutes since midnight. */
export type BusyRange = { start: number; end: number };

export type TimeSlot = { time: string; available: boolean };

/** Data for the emails around a booking. */
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

/** What the customer sees on the cancel page. */
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
