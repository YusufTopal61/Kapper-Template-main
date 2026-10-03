import { describe, expect, it } from "vitest";
import { DEFAULT_OPENING_HOURS } from "@/features/settings/domain/opening-hours.rules";
import {
  getBookableDays,
  getMailIntent,
  getTimeSlots,
  checkSchedule,
  canCustomerCancel,
  buildMailData,
  toBusyRanges,
  overlaps,
  summarizeBookings,
  withoutToken,
} from "./booking.rules";
import type { BookingRecord, BookingWithService } from "./booking.entity";

const NOW = new Date(2026, 8, 1, 8, 0); // di 1 sept 2026
const TUESDAY = "2026-09-08";

describe("overlapt", () => {
  const busy = [{ start: 600, end: 645 }]; // 10:00–10:45

  it("botst op een gedeeltelijke overlap, aan beide kanten", () => {
    expect(overlaps(570, 45, busy)).toBe(true); // 09:30–10:15
    expect(overlaps(630, 30, busy)).toBe(true); // 10:30–11:00
  });

  it("botst niet wanneer de ene afspraak precies begint waar de andere eindigt", () => {
    expect(overlaps(645, 30, busy)).toBe(false); // 10:45–11:15
    expect(overlaps(570, 30, busy)).toBe(false); // 09:30–10:00
  });
});

describe("naarBusyRanges", () => {
  it("rekent met de duur van de dienst, en met een standaardduur als die ontbreekt", () => {
    const ranges = toBusyRanges([
      { id: "a", time: "10:00:00", durationMinutes: 45 },
      { id: "b", time: "12:00", durationMinutes: null },
    ]);
    expect(ranges).toEqual([
      { start: 600, end: 645 },
      { start: 720, end: 750 },
    ]);
  });

  it("sluit de afspraak uit die je zelf verplaatst", () => {
    expect(toBusyRanges([{ id: "a", time: "10:00", durationMinutes: 30 }], "a")).toEqual([]);
  });
});

describe("bepaalTijdsloten", () => {
  it("markeert slots die overlappen met een bestaande afspraak als niet beschikbaar", () => {
    const { slots, closed } = getTimeSlots({
      openingHours: DEFAULT_OPENING_HOURS,
      date: TUESDAY,
      durationMinutes: 45,
      busy: [{ start: 600, end: 645 }],
      now: NOW,
    });
    const status = Object.fromEntries(slots.map((s) => [s.time, s.available]));

    expect(closed).toBe(false);
    expect(status["09:00"]).toBe(true);
    expect(status["09:30"]).toBe(false);
    expect(status["10:00"]).toBe(false);
    expect(status["10:30"]).toBe(false);
    expect(status["11:00"]).toBe(true);
  });

  it("meldt een gesloten dag", () => {
    const outcome = getTimeSlots({
      openingHours: DEFAULT_OPENING_HOURS,
      date: "2026-09-13",
      durationMinutes: 30,
      busy: [],
      now: NOW,
    });
    expect(outcome).toEqual({ slots: [], closed: true });
  });

  it("markeert slots in het verleden als niet beschikbaar", () => {
    const { slots } = getTimeSlots({
      openingHours: DEFAULT_OPENING_HOURS,
      date: TUESDAY,
      durationMinutes: 30,
      busy: [],
      now: new Date(2026, 8, 8, 12, 0),
    });
    expect(slots.find((s) => s.time === "11:30")?.available).toBe(false);
    expect(slots.find((s) => s.time === "12:30")?.available).toBe(true);
  });
});

describe("controleerRooster", () => {
  const base = {
    openingHours: DEFAULT_OPENING_HOURS,
    date: TUESDAY,
    durationMinutes: 30,
    busy: [],
    now: NOW,
  };

  it("laat een vrij moment binnen de openingstijden toe", () => {
    expect(checkSchedule({ ...base, time: "10:00" })).toEqual({ ok: true });
  });

  it("controleert eerst het verleden, dan de openingstijden, dan de bezetting", () => {
    expect(checkSchedule({ ...base, date: "2026-08-25", time: "10:00" })).toMatchObject({
      reason: "past",
    });
    expect(checkSchedule({ ...base, date: "2026-09-13", time: "10:00" })).toMatchObject({
      reason: "outside-opening-hours",
    });
    expect(
      checkSchedule({ ...base, time: "10:00", busy: [{ start: 600, end: 630 }] }),
    ).toMatchObject({ reason: "busy" });
  });

  it("laat de beheerder het verleden bewerken, maar niet buiten de openingstijden", () => {
    const admin = { ...base, date: "2026-08-25", ignorePast: true };
    expect(checkSchedule({ ...admin, time: "10:00" })).toEqual({ ok: true });
    expect(checkSchedule({ ...admin, time: "07:00" })).toMatchObject({
      reason: "outside-opening-hours",
    });
  });
});

describe("bepaalMailIntentie", () => {
  const confirmed = {
    status: "confirmed" as const,
    date: TUESDAY,
    time: "10:00:00",
    serviceId: "s1",
  };
  const cancelled = { ...confirmed, status: "cancelled" as const };

  it.each([
    { name: "annuleren", from: confirmed, to: cancelled, expected: "cancelled" },
    {
      name: "andere datum",
      from: confirmed,
      to: { ...confirmed, date: "2026-09-09" },
      expected: "rescheduled",
    },
    {
      name: "andere tijd",
      from: confirmed,
      to: { ...confirmed, time: "11:00" },
      expected: "rescheduled",
    },
    {
      name: "andere dienst",
      from: confirmed,
      to: { ...confirmed, serviceId: "s2" },
      expected: "rescheduled",
    },
    {
      name: "zelfde tijd, ander formaat",
      from: confirmed,
      to: { ...confirmed, time: "10:00" },
      expected: null,
    },
    {
      name: "voltooid markeren",
      from: confirmed,
      to: { ...confirmed, status: "completed" as const },
      expected: null,
    },
    {
      name: "een al geannuleerde afspraak nogmaals annuleren",
      from: cancelled,
      to: cancelled,
      expected: null,
    },
    {
      name: "een geannuleerde afspraak die van tijd verschuift",
      from: cancelled,
      to: { ...cancelled, time: "15:00" },
      expected: null,
    },
  ])("$naam -> $verwacht", ({ from, to, expected }) => {
    expect(getMailIntent(from, to)).toBe(expected);
  });
});

describe("kanKlantAnnuleren", () => {
  it("staat alleen open afspraken toe", () => {
    expect(canCustomerCancel("confirmed")).toEqual({ ok: true });
    expect(canCustomerCancel("cancelled").ok).toBe(false);
    expect(canCustomerCancel("completed").ok).toBe(false);
  });
});

describe("zonderToken / maakMailData", () => {
  const record: BookingRecord = {
    id: "b1",
    serviceId: "s1",
    customerName: "Test",
    customerEmail: "t@example.nl",
    customerPhone: "0612345678",
    date: TUESDAY,
    time: "10:00",
    status: "confirmed",
    notes: null,
    cancelToken: "geheim",
    services: { id: "s1", name: "Knippen", price: 25, durationMinutes: 30 },
  };

  it("laat het geheime token nooit naar het beheerpaneel lekken", () => {
    expect(withoutToken(record)).not.toHaveProperty("cancelToken");
  });

  it("valt terug op neutrale waarden als de dienst ontbreekt", () => {
    const mail = buildMailData(record, null);
    expect(mail).toMatchObject({ serviceName: "Behandeling", price: null, durationMinutes: null });
    expect(mail.cancelToken).toBe("geheim");
  });
});

describe("bepaalBoekbareDagen", () => {
  it("slaat gesloten dagen over en begint vandaag", () => {
    // dinsdag 1 sept 2026; maandag en zondag zijn standaard gesloten
    const days = getBookableDays(DEFAULT_OPENING_HOURS, NOW);

    expect(days[0]).toBe("2026-09-01");
    expect(days).not.toContain("2026-09-06"); // zondag
    expect(days).not.toContain("2026-09-07"); // maandag
    expect(days).toContain("2026-09-08");
  });

  it("toont nooit meer dan twaalf dagen en kijkt niet verder dan drie weken vooruit", () => {
    const allOpen = Object.fromEntries(
      Object.keys(DEFAULT_OPENING_HOURS).map((day) => [
        day,
        { open: true, from: "09:00", to: "18:00" },
      ]),
    ) as typeof DEFAULT_OPENING_HOURS;

    expect(getBookableDays(allOpen, NOW)).toHaveLength(12);
    expect(getBookableDays(DEFAULT_OPENING_HOURS, NOW).at(-1)! <= "2026-09-21").toBe(true);
  });

  it("geeft niets terug als de zaak helemaal gesloten is", () => {
    const allClosed = Object.fromEntries(
      Object.keys(DEFAULT_OPENING_HOURS).map((day) => [
        day,
        { open: false, from: "09:00", to: "18:00" },
      ]),
    ) as typeof DEFAULT_OPENING_HOURS;

    expect(getBookableDays(allClosed, NOW)).toEqual([]);
  });
});

describe("samenvattingVanBoekingen", () => {
  const make = (
    id: string,
    date: string,
    status: BookingWithService["status"],
  ): BookingWithService => ({
    id,
    serviceId: "s",
    customerName: id,
    customerEmail: "a@b.nl",
    customerPhone: "0612345678",
    date,
    time: "10:00",
    status,
    notes: null,
    services: null,
  });

  const list = [
    make("past", "2026-08-30", "confirmed"),
    make("vandaag", "2026-09-01", "confirmed"),
    make("morgen", "2026-09-02", "confirmed"),
    make("klaar", "2026-08-20", "completed"),
    make("weg", "2026-09-03", "cancelled"),
  ];

  it("telt per status", () => {
    expect(summarizeBookings(list, "2026-09-01")).toMatchObject({
      confirmed: 3,
      completed: 1,
      cancelled: 1,
    });
  });

  it("toont alleen bevestigde afspraken vanaf vandaag als aankomend", () => {
    const ids = summarizeBookings(list, "2026-09-01").upcoming.map((b) => b.id);
    expect(ids).toEqual(["vandaag", "morgen"]);
  });

  it("kapt het aantal aankomende afspraken af", () => {
    const many = Array.from({ length: 9 }, (_, i) => make(`b${i}`, "2026-09-10", "confirmed"));
    expect(summarizeBookings(many, "2026-09-01", 5).upcoming).toHaveLength(5);
  });
});
