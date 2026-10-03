import { describe, expect, it } from "vitest";
import {
  dagVanDatum,
  DEFAULT_OPENINGSTIJDEN,
  ligtInVerleden,
  tijdslotenVoorDag,
  valtBinnenOpeningstijden,
} from "./opening-hours.rules";

// 2026-09-08 is een dinsdag (09:00–18:00), 09-12 een zaterdag (09:00–17:00),
// 09-07 een maandag en 09-13 een zondag (beide gesloten).
describe("dagVanDatum", () => {
  it("zet een kalenderdatum om naar de Nederlandse dagnaam, ook rond UTC-grenzen", () => {
    expect(dagVanDatum("2026-09-07")).toBe("maandag");
    expect(dagVanDatum("2026-09-08")).toBe("dinsdag");
    expect(dagVanDatum("2026-09-13")).toBe("zondag");
  });
});

describe("valtBinnenOpeningstijden", () => {
  const o = DEFAULT_OPENINGSTIJDEN;

  it("laat een afspraak binnen de openingstijden toe", () => {
    expect(valtBinnenOpeningstijden(o, "2026-09-08", "10:00", 30).ok).toBe(true);
  });

  it("weigert een gesloten dag", () => {
    const uitkomst = valtBinnenOpeningstijden(o, "2026-09-07", "10:00", 30);
    expect(uitkomst.ok).toBe(false);
  });

  it("rekent de duur mee: de behandeling moet vóór sluitingstijd klaar zijn", () => {
    expect(valtBinnenOpeningstijden(o, "2026-09-08", "17:30", 30).ok).toBe(true);
    expect(valtBinnenOpeningstijden(o, "2026-09-08", "17:30", 45).ok).toBe(false);
  });

  it("weigert een tijd vóór opening", () => {
    expect(valtBinnenOpeningstijden(o, "2026-09-08", "08:30", 30).ok).toBe(false);
  });

  it("respecteert de kortere zaterdag", () => {
    expect(valtBinnenOpeningstijden(o, "2026-09-12", "16:30", 30).ok).toBe(true);
    expect(valtBinnenOpeningstijden(o, "2026-09-12", "16:45", 30).ok).toBe(false);
  });
});

describe("tijdslotenVoorDag", () => {
  it("geeft niets op een gesloten dag", () => {
    expect(tijdslotenVoorDag(DEFAULT_OPENINGSTIJDEN, "2026-09-13", 30)).toEqual([]);
  });

  it("stopt bij het laatste slot waar de behandeling nog in past", () => {
    const sloten = tijdslotenVoorDag(DEFAULT_OPENINGSTIJDEN, "2026-09-08", 45);
    expect(sloten[0]).toBe("09:00");
    expect(sloten.at(-1)).toBe("17:00"); // 17:00 + 45 min = 17:45 ≤ 18:00; 17:30 niet
  });
});

describe("ligtInVerleden", () => {
  const nu = new Date(2026, 8, 8, 12, 0);

  it("herkent het verleden en de toekomst t.o.v. een gegeven klok", () => {
    expect(ligtInVerleden("2026-09-08", "11:30", nu)).toBe(true);
    expect(ligtInVerleden("2026-09-08", "12:30", nu)).toBe(false);
    expect(ligtInVerleden("2026-09-09", "09:00", nu)).toBe(false);
  });
});
