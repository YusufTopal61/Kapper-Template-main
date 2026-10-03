import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/features/auth/domain/auth.gateway";
import type { Service } from "@/features/services/domain/service.entity";
import { DEFAULT_SETTINGS } from "@/features/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BookingRecord } from "../booking.entity";
import type { BookingNotifier } from "../booking.ports";
import type { BookingRepository } from "../booking.repository";
import { cancelBookingAsAdmin } from "./cancel-booking-as-admin";
import { cancelBookingByToken } from "./cancel-booking-by-token";
import { createBooking } from "./create-booking";
import { getAvailableSlots } from "./get-available-slots";
import { getBookingByToken } from "./get-booking-by-token";
import { listAdminBookings } from "./list-admin-bookings";
import { updateBookingAsAdmin } from "./update-booking-as-admin";

const NOW = new Date(2026, 8, 1, 8, 0); // di 1 sept 2026
const TUESDAY = "2026-09-08";
const SUNDAY = "2026-09-13";
const UUID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const HAIRCUT: Service = {
  id: UUID(1),
  name: "Knippen",
  description: "",
  price: 25,
  durationMinutes: 30,
  isActive: true,
  sortOrder: 1,
};

/** In-memory vervanging van Supabase en Resend — de use cases weten het verschil niet. */
function makeEnvironment(
  options: { insertConflict?: boolean; isAdmin?: boolean; services?: Service[] } = {},
) {
  const saved: BookingRecord[] = [];
  const services = options.services ?? [HAIRCUT];
  const updateCalls: unknown[] = [];
  let counter = 0;

  const bookings: BookingRepository = {
    listBusy: async (date) =>
      saved
        .filter((b) => b.date === date && b.status !== "cancelled")
        .map((b) => ({
          id: b.id,
          time: b.time,
          durationMinutes: b.services?.durationMinutes ?? null,
        })),

    insert: async (newBooking) => {
      if (options.insertConflict) return { ok: false, reason: "slot-taken" };
      saved.push({
        ...newBooking,
        status: "confirmed",
        notes: null,
        services: (() => {
          const service = services.find((d) => d.id === newBooking.serviceId) ?? HAIRCUT;
          return {
            id: service.id,
            name: service.name,
            price: service.price,
            durationMinutes: service.durationMinutes,
          };
        })(),
      });
      return { ok: true };
    },

    listAll: async () => saved.map(({ cancelToken: _t, ...rest }) => rest),
    findForAdmin: async (id) => saved.find((b) => b.id === id) ?? null,

    updateAsAdmin: async (id, patch) => {
      updateCalls.push(patch);
      const index = saved.findIndex((b) => b.id === id);
      const current = saved[index]!;
      const updated = {
        ...current,
        ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
      } as BookingRecord;
      saved[index] = updated;
      return { ok: true, booking: updated };
    },

    findByToken: async (id, token) =>
      saved.find((b) => b.id === id && b.cancelToken === token) ?? null,

    cancelByToken: async (id) => {
      const b = saved.find((x) => x.id === id);
      if (b) b.status = "cancelled";
    },
  };

  const notifier: BookingNotifier = {
    bookingCreated: vi.fn(async () => ({ customerMailSent: true })),
    bookingCancelled: vi.fn(async () => undefined),
    bookingRescheduled: vi.fn(async () => undefined),
  };

  const deps: BookingDeps = {
    bookings,
    services: { findById: async (id) => services.find((d) => d.id === id) ?? null },
    settings: { read: async () => DEFAULT_SETTINGS },
    notifier,
    ids: { newId: () => UUID(100 + ++counter), newToken: () => `token-${counter}`.padEnd(32, "x") },
    assertAdmin: async () => {
      if (options.isAdmin === false) throw new UnauthorizedError();
    },
    now: () => NOW,
  };

  return { deps, saved, notifier, updateCalls };
}

const validBooking = {
  serviceId: HAIRCUT.id,
  customerName: "Jan Test",
  customerEmail: "jan@example.nl",
  customerPhone: "0612345678",
  date: TUESDAY,
  time: "10:00",
};

describe("createBooking", () => {
  it("slaat de boeking op, mailt en geeft een samenvatting terug", async () => {
    const { deps, saved, notifier } = makeEnvironment();
    const outcome = await createBooking(deps, validBooking);

    expect(outcome).toMatchObject({ ok: true, emailSent: true });
    expect(saved).toHaveLength(1);
    expect(notifier.bookingCreated).toHaveBeenCalledOnce();
    expect(notifier.bookingCreated).toHaveBeenCalledWith(
      expect.objectContaining({ customerEmail: "jan@example.nl", serviceName: "Knippen" }),
    );
  });

  it("laat de boeking slagen ook als de bevestigingsmail niet verstuurd kon worden", async () => {
    const { deps, notifier } = makeEnvironment();
    vi.mocked(notifier.bookingCreated).mockResolvedValueOnce({ customerMailSent: false });

    expect(await createBooking(deps, validBooking)).toMatchObject({
      ok: true,
      emailSent: false,
    });
  });

  it("weigert een dubbele boeking op hetzelfde moment, zonder iets op te slaan of te mailen", async () => {
    const { deps, saved, notifier } = makeEnvironment();
    await createBooking(deps, validBooking);

    const secondAttempt = await createBooking(deps, { ...validBooking, customerName: "Piet" });

    expect(secondAttempt).toMatchObject({ ok: false, field: "time" });
    expect(saved).toHaveLength(1);
    expect(notifier.bookingCreated).toHaveBeenCalledOnce();
  });

  it("weigert een overlappende boeking, niet alleen een identieke tijd", async () => {
    const { deps } = makeEnvironment({ services: [{ ...HAIRCUT, durationMinutes: 45 }] });
    await createBooking(deps, validBooking); // 10:00–10:45

    const overlap = await createBooking(deps, { ...validBooking, time: "10:30" });
    expect(overlap).toMatchObject({ ok: false });
  });

  it("vangt een race af: de database zegt dat het tijdslot net bezet raakte", async () => {
    const { deps, notifier } = makeEnvironment({ insertConflict: true });
    const outcome = await createBooking(deps, validBooking);

    expect(outcome).toMatchObject({ ok: false, field: "time" });
    expect(notifier.bookingCreated).not.toHaveBeenCalled();
  });

  it("weigert een inactieve of onbekende dienst", async () => {
    const { deps, saved } = makeEnvironment({ services: [{ ...HAIRCUT, isActive: false }] });
    const outcome = await createBooking(deps, validBooking);

    expect(outcome).toMatchObject({ ok: false, field: "serviceId" });
    expect(saved).toHaveLength(0);
  });

  it("weigert het verleden en gesloten dagen", async () => {
    const { deps } = makeEnvironment();
    expect(await createBooking(deps, { ...validBooking, date: "2026-08-25" })).toMatchObject({
      ok: false,
      error: "Dit moment ligt in het verleden.",
    });
    expect(await createBooking(deps, { ...validBooking, date: SUNDAY })).toMatchObject({
      ok: false,
      field: "time",
    });
  });
});

describe("getAvailableSlots", () => {
  it("toont een bezet tijdslot als niet beschikbaar", async () => {
    const { deps } = makeEnvironment();
    await createBooking(deps, validBooking);

    const { slots } = await getAvailableSlots(deps, { date: TUESDAY, serviceId: HAIRCUT.id });
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:30")?.available).toBe(true);
  });

  it("meldt gesloten voor een onbekende dienst", async () => {
    const { deps } = makeEnvironment();
    expect(await getAvailableSlots(deps, { date: TUESDAY, serviceId: UUID(99) })).toEqual({
      slots: [],
      closed: true,
    });
  });
});

describe("beheer: autorisatie", () => {
  it("raakt de opslag niet aan zonder beheerder", async () => {
    const { deps, updateCalls } = makeEnvironment({ isAdmin: false });
    const listAll = vi.spyOn(deps.bookings, "listAll");

    await expect(listAdminBookings(deps)).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(
      updateBookingAsAdmin(deps, { id: UUID(1), status: "completed" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(cancelBookingAsAdmin(deps, UUID(1))).rejects.toBeInstanceOf(UnauthorizedError);

    expect(listAll).not.toHaveBeenCalled();
    expect(updateCalls).toHaveLength(0);
  });
});

describe("updateBookingAsAdmin", () => {
  async function withExistingBooking() {
    const environment = makeEnvironment();
    const outcome = await createBooking(environment.deps, validBooking);
    if (!outcome.ok) throw new Error("setup mislukt");
    vi.mocked(environment.notifier.bookingCreated).mockClear();
    return { ...environment, id: outcome.booking.id };
  }

  it("mailt de klant bij een verzette afspraak en lekt het token niet", async () => {
    const { deps, notifier, id } = await withExistingBooking();
    const outcome = await updateBookingAsAdmin(deps, { id, time: "14:00" });

    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.booking).not.toHaveProperty("cancelToken");
    expect(notifier.bookingRescheduled).toHaveBeenCalledOnce();
    expect(notifier.bookingCancelled).not.toHaveBeenCalled();
  });

  it("mailt klant én beheerder bij annuleren door de beheerder", async () => {
    const { deps, notifier, id } = await withExistingBooking();
    await cancelBookingAsAdmin(deps, id);

    expect(notifier.bookingCancelled).toHaveBeenCalledWith(expect.anything(), "admin");
    expect(notifier.bookingRescheduled).not.toHaveBeenCalled();
  });

  it("stuurt geen mail bij alleen een interne notitie of status voltooid", async () => {
    const { deps, notifier, id } = await withExistingBooking();
    await updateBookingAsAdmin(deps, { id, notes: "Wil graag korter aan de zijkant" });
    await updateBookingAsAdmin(deps, { id, status: "completed" });

    expect(notifier.bookingRescheduled).not.toHaveBeenCalled();
    expect(notifier.bookingCancelled).not.toHaveBeenCalled();
  });

  it("weigert verplaatsen naar een bezet moment of een gesloten dag, zonder te wijzigen", async () => {
    const { deps, updateCalls, id } = await withExistingBooking();
    await createBooking(deps, { ...validBooking, customerName: "Piet", time: "15:00" });

    expect(await updateBookingAsAdmin(deps, { id, time: "15:00" })).toMatchObject({ ok: false });
    expect(await updateBookingAsAdmin(deps, { id, date: SUNDAY })).toMatchObject({ ok: false });
    expect(updateCalls).toHaveLength(0);
  });

  it("botst niet met zichzelf bij een kleine verschuiving", async () => {
    const { deps, id } = await withExistingBooking();
    expect(await updateBookingAsAdmin(deps, { id, time: "10:15" })).toMatchObject({ ok: true });
  });

  it("meldt een boeking die niet meer bestaat", async () => {
    const { deps } = makeEnvironment();
    expect(await updateBookingAsAdmin(deps, { id: UUID(42), status: "completed" })).toEqual({
      ok: false,
      error: "Deze boeking bestaat niet meer.",
    });
  });
});

describe("annuleren via de link in de mail", () => {
  async function withBooking() {
    const environment = makeEnvironment();
    const outcome = await createBooking(environment.deps, validBooking);
    if (!outcome.ok) throw new Error("setup mislukt");
    const record = environment.saved[0]!;
    return { ...environment, id: outcome.booking.id, token: record.cancelToken };
  }

  it("geeft niets prijs bij een verkeerd token", async () => {
    const { deps, id } = await withBooking();
    const wrong = { bookingId: id, token: "x".repeat(40) };

    expect(await getBookingByToken(deps, wrong)).toMatchObject({ ok: false });
    expect(await cancelBookingByToken(deps, wrong)).toMatchObject({ ok: false });
  });

  it("annuleert met het juiste token en mailt klant en beheerder", async () => {
    const { deps, notifier, id, token, saved } = await withBooking();
    const outcome = await cancelBookingByToken(deps, { bookingId: id, token });

    expect(outcome).toEqual({ ok: true });
    expect(saved[0]?.status).toBe("cancelled");
    expect(notifier.bookingCancelled).toHaveBeenCalledWith(expect.anything(), "customer");
  });

  it("annuleert niet twee keer en mailt dan ook niet opnieuw", async () => {
    const { deps, notifier, id, token } = await withBooking();
    await cancelBookingByToken(deps, { bookingId: id, token });
    vi.mocked(notifier.bookingCancelled).mockClear();

    const again = await cancelBookingByToken(deps, { bookingId: id, token });
    expect(again).toMatchObject({ ok: false });
    expect(notifier.bookingCancelled).not.toHaveBeenCalled();
  });

  it("toont bedrijfsgegevens maar niet het token op de annuleerpagina", async () => {
    const { deps, id, token } = await withBooking();
    const outcome = await getBookingByToken(deps, { bookingId: id, token });

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.booking.businessName).toBe("Barber");
      expect(JSON.stringify(outcome.booking)).not.toContain(token);
    }
  });
});
