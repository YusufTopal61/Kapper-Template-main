import { describe, expect, it } from "vitest";
import { DEFAULT_OPENINGSTIJDEN } from "@/modules/settings/domain/opening-hours.rules";
import {
  bepaalBoekbareDagen,
  bepaalMailIntentie,
  bepaalTijdsloten,
  controleerRooster,
  kanKlantAnnuleren,
  maakMailData,
  naarBusyRanges,
  overlapt,
  samenvattingVanBoekingen,
  zonderToken,
} from "./booking.rules";
import type { BookingRecord, BookingWithService } from "./booking.entity";

const NU = new Date(2026, 8, 1, 8, 0); // di 1 sept 2026
const DINSDAG = "2026-09-08";

describe("overlapt", () => {
  const bezet = [{ start: 600, eind: 645 }]; // 10:00–10:45

  it("botst op een gedeeltelijke overlap, aan beide kanten", () => {
    expect(overlapt(570, 45, bezet)).toBe(true); // 09:30–10:15
    expect(overlapt(630, 30, bezet)).toBe(true); // 10:30–11:00
  });

  it("botst niet wanneer de ene afspraak precies begint waar de andere eindigt", () => {
    expect(overlapt(645, 30, bezet)).toBe(false); // 10:45–11:15
    expect(overlapt(570, 30, bezet)).toBe(false); // 09:30–10:00
  });
});

describe("naarBusyRanges", () => {
  it("rekent met de duur van de dienst, en met een standaardduur als die ontbreekt", () => {
    const ranges = naarBusyRanges([
      { id: "a", tijd: "10:00:00", duurMinuten: 45 },
      { id: "b", tijd: "12:00", duurMinuten: null },
    ]);
    expect(ranges).toEqual([
      { start: 600, eind: 645 },
      { start: 720, eind: 750 },
    ]);
  });

  it("sluit de afspraak uit die je zelf verplaatst", () => {
    expect(naarBusyRanges([{ id: "a", tijd: "10:00", duurMinuten: 30 }], "a")).toEqual([]);
  });
});

describe("bepaalTijdsloten", () => {
  it("markeert slots die overlappen met een bestaande afspraak als niet beschikbaar", () => {
    const { sloten, gesloten } = bepaalTijdsloten({
      openingstijden: DEFAULT_OPENINGSTIJDEN,
      datum: DINSDAG,
      duurMinuten: 45,
      bezet: [{ start: 600, eind: 645 }],
      nu: NU,
    });
    const status = Object.fromEntries(sloten.map((s) => [s.tijd, s.beschikbaar]));

    expect(gesloten).toBe(false);
    expect(status["09:00"]).toBe(true);
    expect(status["09:30"]).toBe(false);
    expect(status["10:00"]).toBe(false);
    expect(status["10:30"]).toBe(false);
    expect(status["11:00"]).toBe(true);
  });

  it("meldt een gesloten dag", () => {
    const uitkomst = bepaalTijdsloten({
      openingstijden: DEFAULT_OPENINGSTIJDEN,
      datum: "2026-09-13",
      duurMinuten: 30,
      bezet: [],
      nu: NU,
    });
    expect(uitkomst).toEqual({ sloten: [], gesloten: true });
  });

  it("markeert slots in het verleden als niet beschikbaar", () => {
    const { sloten } = bepaalTijdsloten({
      openingstijden: DEFAULT_OPENINGSTIJDEN,
      datum: DINSDAG,
      duurMinuten: 30,
      bezet: [],
      nu: new Date(2026, 8, 8, 12, 0),
    });
    expect(sloten.find((s) => s.tijd === "11:30")?.beschikbaar).toBe(false);
    expect(sloten.find((s) => s.tijd === "12:30")?.beschikbaar).toBe(true);
  });
});

describe("controleerRooster", () => {
  const basis = {
    openingstijden: DEFAULT_OPENINGSTIJDEN,
    datum: DINSDAG,
    duurMinuten: 30,
    bezet: [],
    nu: NU,
  };

  it("laat een vrij moment binnen de openingstijden toe", () => {
    expect(controleerRooster({ ...basis, tijd: "10:00" })).toEqual({ ok: true });
  });

  it("controleert eerst het verleden, dan de openingstijden, dan de bezetting", () => {
    expect(controleerRooster({ ...basis, datum: "2026-08-25", tijd: "10:00" })).toMatchObject({
      reden: "verleden",
    });
    expect(controleerRooster({ ...basis, datum: "2026-09-13", tijd: "10:00" })).toMatchObject({
      reden: "buiten-openingstijden",
    });
    expect(
      controleerRooster({ ...basis, tijd: "10:00", bezet: [{ start: 600, eind: 630 }] }),
    ).toMatchObject({ reden: "bezet" });
  });

  it("laat de beheerder het verleden bewerken, maar niet buiten de openingstijden", () => {
    const admin = { ...basis, datum: "2026-08-25", negeerVerleden: true };
    expect(controleerRooster({ ...admin, tijd: "10:00" })).toEqual({ ok: true });
    expect(controleerRooster({ ...admin, tijd: "07:00" })).toMatchObject({
      reden: "buiten-openingstijden",
    });
  });
});

describe("bepaalMailIntentie", () => {
  const bevestigd = {
    status: "bevestigd" as const,
    datum: DINSDAG,
    tijd: "10:00:00",
    service_id: "s1",
  };
  const geannuleerd = { ...bevestigd, status: "geannuleerd" as const };

  it.each([
    { naam: "annuleren", van: bevestigd, naar: geannuleerd, verwacht: "geannuleerd" },
    {
      naam: "andere datum",
      van: bevestigd,
      naar: { ...bevestigd, datum: "2026-09-09" },
      verwacht: "verzet",
    },
    {
      naam: "andere tijd",
      van: bevestigd,
      naar: { ...bevestigd, tijd: "11:00" },
      verwacht: "verzet",
    },
    {
      naam: "andere dienst",
      van: bevestigd,
      naar: { ...bevestigd, service_id: "s2" },
      verwacht: "verzet",
    },
    {
      naam: "zelfde tijd, ander formaat",
      van: bevestigd,
      naar: { ...bevestigd, tijd: "10:00" },
      verwacht: null,
    },
    {
      naam: "voltooid markeren",
      van: bevestigd,
      naar: { ...bevestigd, status: "voltooid" as const },
      verwacht: null,
    },
    {
      naam: "een al geannuleerde afspraak nogmaals annuleren",
      van: geannuleerd,
      naar: geannuleerd,
      verwacht: null,
    },
    {
      naam: "een geannuleerde afspraak die van tijd verschuift",
      van: geannuleerd,
      naar: { ...geannuleerd, tijd: "15:00" },
      verwacht: null,
    },
  ])("$naam -> $verwacht", ({ van, naar, verwacht }) => {
    expect(bepaalMailIntentie(van, naar)).toBe(verwacht);
  });
});

describe("kanKlantAnnuleren", () => {
  it("staat alleen open afspraken toe", () => {
    expect(kanKlantAnnuleren("bevestigd")).toEqual({ ok: true });
    expect(kanKlantAnnuleren("geannuleerd").ok).toBe(false);
    expect(kanKlantAnnuleren("voltooid").ok).toBe(false);
  });
});

describe("zonderToken / maakMailData", () => {
  const record: BookingRecord = {
    id: "b1",
    service_id: "s1",
    klant_naam: "Test",
    klant_email: "t@example.nl",
    klant_telefoon: "0612345678",
    datum: DINSDAG,
    tijd: "10:00",
    status: "bevestigd",
    notities: null,
    annuleer_token: "geheim",
    services: { id: "s1", naam: "Knippen", prijs: 25, duur_minuten: 30 },
  };

  it("laat het geheime token nooit naar het beheerpaneel lekken", () => {
    expect(zonderToken(record)).not.toHaveProperty("annuleer_token");
  });

  it("valt terug op neutrale waarden als de dienst ontbreekt", () => {
    const mail = maakMailData(record, null);
    expect(mail).toMatchObject({ dienstNaam: "Behandeling", prijs: null, duurMinuten: null });
    expect(mail.annuleer_token).toBe("geheim");
  });
});

describe("bepaalBoekbareDagen", () => {
  it("slaat gesloten dagen over en begint vandaag", () => {
    // dinsdag 1 sept 2026; maandag en zondag zijn standaard gesloten
    const dagen = bepaalBoekbareDagen(DEFAULT_OPENINGSTIJDEN, NU);

    expect(dagen[0]).toBe("2026-09-01");
    expect(dagen).not.toContain("2026-09-06"); // zondag
    expect(dagen).not.toContain("2026-09-07"); // maandag
    expect(dagen).toContain("2026-09-08");
  });

  it("toont nooit meer dan twaalf dagen en kijkt niet verder dan drie weken vooruit", () => {
    const alleOpen = Object.fromEntries(
      Object.keys(DEFAULT_OPENINGSTIJDEN).map((dag) => [
        dag,
        { open: true, van: "09:00", tot: "18:00" },
      ]),
    ) as typeof DEFAULT_OPENINGSTIJDEN;

    expect(bepaalBoekbareDagen(alleOpen, NU)).toHaveLength(12);
    expect(bepaalBoekbareDagen(DEFAULT_OPENINGSTIJDEN, NU).at(-1)! <= "2026-09-21").toBe(true);
  });

  it("geeft niets terug als de zaak helemaal gesloten is", () => {
    const dicht = Object.fromEntries(
      Object.keys(DEFAULT_OPENINGSTIJDEN).map((dag) => [
        dag,
        { open: false, van: "09:00", tot: "18:00" },
      ]),
    ) as typeof DEFAULT_OPENINGSTIJDEN;

    expect(bepaalBoekbareDagen(dicht, NU)).toEqual([]);
  });
});

describe("samenvattingVanBoekingen", () => {
  const maak = (
    id: string,
    datum: string,
    status: BookingWithService["status"],
  ): BookingWithService => ({
    id,
    service_id: "s",
    klant_naam: id,
    klant_email: "a@b.nl",
    klant_telefoon: "0612345678",
    datum,
    tijd: "10:00",
    status,
    notities: null,
    services: null,
  });

  const lijst = [
    maak("verleden", "2026-08-30", "bevestigd"),
    maak("vandaag", "2026-09-01", "bevestigd"),
    maak("morgen", "2026-09-02", "bevestigd"),
    maak("klaar", "2026-08-20", "voltooid"),
    maak("weg", "2026-09-03", "geannuleerd"),
  ];

  it("telt per status", () => {
    expect(samenvattingVanBoekingen(lijst, "2026-09-01")).toMatchObject({
      bevestigd: 3,
      voltooid: 1,
      geannuleerd: 1,
    });
  });

  it("toont alleen bevestigde afspraken vanaf vandaag als aankomend", () => {
    const ids = samenvattingVanBoekingen(lijst, "2026-09-01").aankomend.map((b) => b.id);
    expect(ids).toEqual(["vandaag", "morgen"]);
  });

  it("kapt het aantal aankomende afspraken af", () => {
    const veel = Array.from({ length: 9 }, (_, i) => maak(`b${i}`, "2026-09-10", "bevestigd"));
    expect(samenvattingVanBoekingen(veel, "2026-09-01", 5).aankomend).toHaveLength(5);
  });
});
