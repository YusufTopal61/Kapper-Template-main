import { describe, expect, it, vi } from "vitest";
import { NietIngelogdError } from "@/modules/auth/domain/auth.gateway";
import type { Service } from "@/modules/services/domain/service.entity";
import { DEFAULT_INSTELLINGEN } from "@/modules/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BookingRecord } from "../booking.entity";
import type { BookingNotifier } from "../booking.ports";
import type { BookingRepository } from "../booking.repository";
import { cancelBookingAsAdmin } from "./cancelBookingAsAdmin";
import { cancelBookingByToken } from "./cancelBookingByToken";
import { createBooking } from "./createBooking";
import { getAvailableSlots } from "./getAvailableSlots";
import { getBookingByToken } from "./getBookingByToken";
import { listAdminBookings } from "./listAdminBookings";
import { updateBookingAsAdmin } from "./updateBookingAsAdmin";

const NU = new Date(2026, 8, 1, 8, 0); // di 1 sept 2026
const DINSDAG = "2026-09-08";
const ZONDAG = "2026-09-13";
const UUID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const KNIPPEN: Service = {
  id: UUID(1),
  naam: "Knippen",
  beschrijving: "",
  prijs: 25,
  duur_minuten: 30,
  actief: true,
  sorteer_volgorde: 1,
};

/** In-memory vervanging van Supabase en Resend — de use cases weten het verschil niet. */
function maakOmgeving(
  opties: { insertConflict?: boolean; isAdmin?: boolean; diensten?: Service[] } = {},
) {
  const opgeslagen: BookingRecord[] = [];
  const diensten = opties.diensten ?? [KNIPPEN];
  const updateCalls: unknown[] = [];
  let teller = 0;

  const bookings: BookingRepository = {
    listBusy: async (datum) =>
      opgeslagen
        .filter((b) => b.datum === datum && b.status !== "geannuleerd")
        .map((b) => ({ id: b.id, tijd: b.tijd, duurMinuten: b.services?.duur_minuten ?? null })),

    insert: async (nieuw) => {
      if (opties.insertConflict) return { ok: false, reden: "tijdslot-bezet" };
      opgeslagen.push({
        ...nieuw,
        status: "bevestigd",
        notities: null,
        services: (() => {
          const dienst = diensten.find((d) => d.id === nieuw.service_id) ?? KNIPPEN;
          return {
            id: dienst.id,
            naam: dienst.naam,
            prijs: dienst.prijs,
            duur_minuten: dienst.duur_minuten,
          };
        })(),
      });
      return { ok: true };
    },

    listAll: async () => opgeslagen.map(({ annuleer_token: _t, ...rest }) => rest),
    findForAdmin: async (id) => opgeslagen.find((b) => b.id === id) ?? null,

    updateAsAdmin: async (id, patch) => {
      updateCalls.push(patch);
      const index = opgeslagen.findIndex((b) => b.id === id);
      const huidig = opgeslagen[index]!;
      const bijgewerkt = {
        ...huidig,
        ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
      } as BookingRecord;
      opgeslagen[index] = bijgewerkt;
      return { ok: true, boeking: bijgewerkt };
    },

    findByToken: async (id, token) =>
      opgeslagen.find((b) => b.id === id && b.annuleer_token === token) ?? null,

    cancelByToken: async (id) => {
      const b = opgeslagen.find((x) => x.id === id);
      if (b) b.status = "geannuleerd";
    },
  };

  const notifier: BookingNotifier = {
    bookingCreated: vi.fn(async () => ({ klantMailVerzonden: true })),
    bookingCancelled: vi.fn(async () => undefined),
    bookingRescheduled: vi.fn(async () => undefined),
  };

  const deps: BookingDeps = {
    bookings,
    services: { findById: async (id) => diensten.find((d) => d.id === id) ?? null },
    settings: { read: async () => DEFAULT_INSTELLINGEN },
    notifier,
    ids: { newId: () => UUID(100 + ++teller), newToken: () => `token-${teller}`.padEnd(32, "x") },
    assertAdmin: async () => {
      if (opties.isAdmin === false) throw new NietIngelogdError();
    },
    now: () => NU,
  };

  return { deps, opgeslagen, notifier, updateCalls };
}

const geldigeBoeking = {
  service_id: KNIPPEN.id,
  klant_naam: "Jan Test",
  klant_email: "jan@example.nl",
  klant_telefoon: "0612345678",
  datum: DINSDAG,
  tijd: "10:00",
};

describe("createBooking", () => {
  it("slaat de boeking op, mailt en geeft een samenvatting terug", async () => {
    const { deps, opgeslagen, notifier } = maakOmgeving();
    const uitkomst = await createBooking(deps, geldigeBoeking);

    expect(uitkomst).toMatchObject({ ok: true, emailVerzonden: true });
    expect(opgeslagen).toHaveLength(1);
    expect(notifier.bookingCreated).toHaveBeenCalledOnce();
    expect(notifier.bookingCreated).toHaveBeenCalledWith(
      expect.objectContaining({ klant_email: "jan@example.nl", dienstNaam: "Knippen" }),
    );
  });

  it("laat de boeking slagen ook als de bevestigingsmail niet verstuurd kon worden", async () => {
    const { deps, notifier } = maakOmgeving();
    vi.mocked(notifier.bookingCreated).mockResolvedValueOnce({ klantMailVerzonden: false });

    expect(await createBooking(deps, geldigeBoeking)).toMatchObject({
      ok: true,
      emailVerzonden: false,
    });
  });

  it("weigert een dubbele boeking op hetzelfde moment, zonder iets op te slaan of te mailen", async () => {
    const { deps, opgeslagen, notifier } = maakOmgeving();
    await createBooking(deps, geldigeBoeking);

    const tweede = await createBooking(deps, { ...geldigeBoeking, klant_naam: "Piet" });

    expect(tweede).toMatchObject({ ok: false, veld: "tijd" });
    expect(opgeslagen).toHaveLength(1);
    expect(notifier.bookingCreated).toHaveBeenCalledOnce();
  });

  it("weigert een overlappende boeking, niet alleen een identieke tijd", async () => {
    const { deps } = maakOmgeving({ diensten: [{ ...KNIPPEN, duur_minuten: 45 }] });
    await createBooking(deps, geldigeBoeking); // 10:00–10:45

    const overlap = await createBooking(deps, { ...geldigeBoeking, tijd: "10:30" });
    expect(overlap).toMatchObject({ ok: false });
  });

  it("vangt een race af: de database zegt dat het tijdslot net bezet raakte", async () => {
    const { deps, notifier } = maakOmgeving({ insertConflict: true });
    const uitkomst = await createBooking(deps, geldigeBoeking);

    expect(uitkomst).toMatchObject({ ok: false, veld: "tijd" });
    expect(notifier.bookingCreated).not.toHaveBeenCalled();
  });

  it("weigert een inactieve of onbekende dienst", async () => {
    const { deps, opgeslagen } = maakOmgeving({ diensten: [{ ...KNIPPEN, actief: false }] });
    const uitkomst = await createBooking(deps, geldigeBoeking);

    expect(uitkomst).toMatchObject({ ok: false, veld: "service_id" });
    expect(opgeslagen).toHaveLength(0);
  });

  it("weigert het verleden en gesloten dagen", async () => {
    const { deps } = maakOmgeving();
    expect(await createBooking(deps, { ...geldigeBoeking, datum: "2026-08-25" })).toMatchObject({
      ok: false,
      error: "Dit moment ligt in het verleden.",
    });
    expect(await createBooking(deps, { ...geldigeBoeking, datum: ZONDAG })).toMatchObject({
      ok: false,
      veld: "tijd",
    });
  });
});

describe("getAvailableSlots", () => {
  it("toont een bezet tijdslot als niet beschikbaar", async () => {
    const { deps } = maakOmgeving();
    await createBooking(deps, geldigeBoeking);

    const { sloten } = await getAvailableSlots(deps, { datum: DINSDAG, service_id: KNIPPEN.id });
    expect(sloten.find((s) => s.tijd === "10:00")?.beschikbaar).toBe(false);
    expect(sloten.find((s) => s.tijd === "10:30")?.beschikbaar).toBe(true);
  });

  it("meldt gesloten voor een onbekende dienst", async () => {
    const { deps } = maakOmgeving();
    expect(await getAvailableSlots(deps, { datum: DINSDAG, service_id: UUID(99) })).toEqual({
      sloten: [],
      gesloten: true,
    });
  });
});

describe("beheer: autorisatie", () => {
  it("raakt de opslag niet aan zonder beheerder", async () => {
    const { deps, updateCalls } = maakOmgeving({ isAdmin: false });
    const listAll = vi.spyOn(deps.bookings, "listAll");

    await expect(listAdminBookings(deps)).rejects.toBeInstanceOf(NietIngelogdError);
    await expect(
      updateBookingAsAdmin(deps, { id: UUID(1), status: "voltooid" }),
    ).rejects.toBeInstanceOf(NietIngelogdError);
    await expect(cancelBookingAsAdmin(deps, UUID(1))).rejects.toBeInstanceOf(NietIngelogdError);

    expect(listAll).not.toHaveBeenCalled();
    expect(updateCalls).toHaveLength(0);
  });
});

describe("updateBookingAsAdmin", () => {
  async function metBestaandeBoeking() {
    const omgeving = maakOmgeving();
    const uitkomst = await createBooking(omgeving.deps, geldigeBoeking);
    if (!uitkomst.ok) throw new Error("setup mislukt");
    vi.mocked(omgeving.notifier.bookingCreated).mockClear();
    return { ...omgeving, id: uitkomst.boeking.id };
  }

  it("mailt de klant bij een verzette afspraak en lekt het token niet", async () => {
    const { deps, notifier, id } = await metBestaandeBoeking();
    const uitkomst = await updateBookingAsAdmin(deps, { id, tijd: "14:00" });

    expect(uitkomst.ok).toBe(true);
    if (uitkomst.ok) expect(uitkomst.boeking).not.toHaveProperty("annuleer_token");
    expect(notifier.bookingRescheduled).toHaveBeenCalledOnce();
    expect(notifier.bookingCancelled).not.toHaveBeenCalled();
  });

  it("mailt klant én beheerder bij annuleren door de beheerder", async () => {
    const { deps, notifier, id } = await metBestaandeBoeking();
    await cancelBookingAsAdmin(deps, id);

    expect(notifier.bookingCancelled).toHaveBeenCalledWith(expect.anything(), "beheerder");
    expect(notifier.bookingRescheduled).not.toHaveBeenCalled();
  });

  it("stuurt geen mail bij alleen een interne notitie of status voltooid", async () => {
    const { deps, notifier, id } = await metBestaandeBoeking();
    await updateBookingAsAdmin(deps, { id, notities: "Wil graag korter aan de zijkant" });
    await updateBookingAsAdmin(deps, { id, status: "voltooid" });

    expect(notifier.bookingRescheduled).not.toHaveBeenCalled();
    expect(notifier.bookingCancelled).not.toHaveBeenCalled();
  });

  it("weigert verplaatsen naar een bezet moment of een gesloten dag, zonder te wijzigen", async () => {
    const { deps, updateCalls, id } = await metBestaandeBoeking();
    await createBooking(deps, { ...geldigeBoeking, klant_naam: "Piet", tijd: "15:00" });

    expect(await updateBookingAsAdmin(deps, { id, tijd: "15:00" })).toMatchObject({ ok: false });
    expect(await updateBookingAsAdmin(deps, { id, datum: ZONDAG })).toMatchObject({ ok: false });
    expect(updateCalls).toHaveLength(0);
  });

  it("botst niet met zichzelf bij een kleine verschuiving", async () => {
    const { deps, id } = await metBestaandeBoeking();
    expect(await updateBookingAsAdmin(deps, { id, tijd: "10:15" })).toMatchObject({ ok: true });
  });

  it("meldt een boeking die niet meer bestaat", async () => {
    const { deps } = maakOmgeving();
    expect(await updateBookingAsAdmin(deps, { id: UUID(42), status: "voltooid" })).toEqual({
      ok: false,
      error: "Deze boeking bestaat niet meer.",
    });
  });
});

describe("annuleren via de link in de mail", () => {
  async function metBoeking() {
    const omgeving = maakOmgeving();
    const uitkomst = await createBooking(omgeving.deps, geldigeBoeking);
    if (!uitkomst.ok) throw new Error("setup mislukt");
    const record = omgeving.opgeslagen[0]!;
    return { ...omgeving, id: uitkomst.boeking.id, token: record.annuleer_token };
  }

  it("geeft niets prijs bij een verkeerd token", async () => {
    const { deps, id } = await metBoeking();
    const verkeerd = { bookingId: id, token: "x".repeat(40) };

    expect(await getBookingByToken(deps, verkeerd)).toMatchObject({ ok: false });
    expect(await cancelBookingByToken(deps, verkeerd)).toMatchObject({ ok: false });
  });

  it("annuleert met het juiste token en mailt klant en beheerder", async () => {
    const { deps, notifier, id, token, opgeslagen } = await metBoeking();
    const uitkomst = await cancelBookingByToken(deps, { bookingId: id, token });

    expect(uitkomst).toEqual({ ok: true });
    expect(opgeslagen[0]?.status).toBe("geannuleerd");
    expect(notifier.bookingCancelled).toHaveBeenCalledWith(expect.anything(), "klant");
  });

  it("annuleert niet twee keer en mailt dan ook niet opnieuw", async () => {
    const { deps, notifier, id, token } = await metBoeking();
    await cancelBookingByToken(deps, { bookingId: id, token });
    vi.mocked(notifier.bookingCancelled).mockClear();

    const opnieuw = await cancelBookingByToken(deps, { bookingId: id, token });
    expect(opnieuw).toMatchObject({ ok: false });
    expect(notifier.bookingCancelled).not.toHaveBeenCalled();
  });

  it("toont bedrijfsgegevens maar niet het token op de annuleerpagina", async () => {
    const { deps, id, token } = await metBoeking();
    const uitkomst = await getBookingByToken(deps, { bookingId: id, token });

    expect(uitkomst.ok).toBe(true);
    if (uitkomst.ok) {
      expect(uitkomst.boeking.bedrijfsnaam).toBe("Barber");
      expect(JSON.stringify(uitkomst.boeking)).not.toContain(token);
    }
  });
});
