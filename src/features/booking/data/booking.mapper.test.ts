import { describe, expect, it } from "vitest";
import {
  fromDbStatus,
  toBookingInsert,
  toBookingRecord,
  toBookingUpdate,
  toBusyBooking,
  toDbStatus,
  type BookingRowWithService,
} from "./booking.mapper";

const row: BookingRowWithService = {
  id: "b1",
  service_id: "s1",
  klant_naam: "Jan Test",
  klant_email: "jan@example.nl",
  klant_telefoon: "0612345678",
  datum: "2026-09-08",
  tijd: "10:00:00",
  status: "bevestigd",
  notities: "korte zijkant",
  annuleer_token: "secret",
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  services: { id: "s1", naam: "Knippen", prijs: 25, duur_minuten: 30 },
};

describe("booking mapper (Dutch columns <-> English entities)", () => {
  it("maps a row to an English camelCase record", () => {
    expect(toBookingRecord(row)).toEqual({
      id: "b1",
      serviceId: "s1",
      customerName: "Jan Test",
      customerEmail: "jan@example.nl",
      customerPhone: "0612345678",
      date: "2026-09-08",
      time: "10:00:00",
      status: "confirmed",
      notes: "korte zijkant",
      cancelToken: "secret",
      services: { id: "s1", name: "Knippen", price: 25, durationMinutes: 30 },
    });
  });

  it("keeps a booking whose service is missing", () => {
    expect(toBookingRecord({ ...row, services: null }).services).toBeNull();
  });

  it("translates every status in both directions", () => {
    const pairs = [
      ["confirmed", "bevestigd"],
      ["cancelled", "geannuleerd"],
      ["completed", "voltooid"],
      ["no_show", "no_show"],
    ] as const;

    for (const [english, dutch] of pairs) {
      expect(toDbStatus(english)).toBe(dutch);
      expect(fromDbStatus(dutch)).toBe(english);
    }
  });

  it("maps a busy booking row", () => {
    expect(toBusyBooking({ id: "b1", tijd: "10:00:00", services: { duur_minuten: 45 } })).toEqual({
      id: "b1",
      time: "10:00:00",
      durationMinutes: 45,
    });
  });

  it("maps a new booking to Dutch insert columns", () => {
    expect(
      toBookingInsert({
        id: "b1",
        serviceId: "s1",
        customerName: "Jan",
        customerEmail: "jan@example.nl",
        customerPhone: "0612345678",
        date: "2026-09-08",
        time: "10:00",
        cancelToken: "secret",
      }),
    ).toEqual({
      id: "b1",
      service_id: "s1",
      klant_naam: "Jan",
      klant_email: "jan@example.nl",
      klant_telefoon: "0612345678",
      datum: "2026-09-08",
      tijd: "10:00",
      annuleer_token: "secret",
    });
  });

  it("only includes the fields that were provided in an update, with the status translated", () => {
    expect(toBookingUpdate({ status: "cancelled", notes: null })).toEqual({
      status: "geannuleerd",
      notities: null,
    });
    expect(toBookingUpdate({})).toEqual({});
  });
});
