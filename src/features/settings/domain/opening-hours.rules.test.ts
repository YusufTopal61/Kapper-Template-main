import { describe, expect, it } from "vitest";
import {
  weekdayOfDate,
  DEFAULT_OPENING_HOURS,
  isInPast,
  timeSlotsForDay,
  isWithinOpeningHours,
} from "./opening-hours.rules";

// 2026-09-08 is een dinsdag (09:00–18:00), 09-12 een zaterdag (09:00–17:00),
// 09-07 een maandag en 09-13 een zondag (beide gesloten).
describe("dagVanDatum", () => {
  it("zet een kalenderdatum om naar de Nederlandse dagnaam, ook rond UTC-grenzen", () => {
    expect(weekdayOfDate("2026-09-07")).toBe("monday");
    expect(weekdayOfDate("2026-09-08")).toBe("tuesday");
    expect(weekdayOfDate("2026-09-13")).toBe("sunday");
  });
});

describe("valtBinnenOpeningstijden", () => {
  const o = DEFAULT_OPENING_HOURS;

  it("laat een afspraak binnen de openingstijden toe", () => {
    expect(isWithinOpeningHours(o, "2026-09-08", "10:00", 30).ok).toBe(true);
  });

  it("weigert een gesloten dag", () => {
    const outcome = isWithinOpeningHours(o, "2026-09-07", "10:00", 30);
    expect(outcome.ok).toBe(false);
  });

  it("rekent de duur mee: de behandeling moet vóór sluitingstijd klaar zijn", () => {
    expect(isWithinOpeningHours(o, "2026-09-08", "17:30", 30).ok).toBe(true);
    expect(isWithinOpeningHours(o, "2026-09-08", "17:30", 45).ok).toBe(false);
  });

  it("weigert een tijd vóór opening", () => {
    expect(isWithinOpeningHours(o, "2026-09-08", "08:30", 30).ok).toBe(false);
  });

  it("respecteert de kortere zaterdag", () => {
    expect(isWithinOpeningHours(o, "2026-09-12", "16:30", 30).ok).toBe(true);
    expect(isWithinOpeningHours(o, "2026-09-12", "16:45", 30).ok).toBe(false);
  });
});

describe("tijdslotenVoorDag", () => {
  it("geeft niets op een gesloten dag", () => {
    expect(timeSlotsForDay(DEFAULT_OPENING_HOURS, "2026-09-13", 30)).toEqual([]);
  });

  it("stopt bij het laatste slot waar de behandeling nog in past", () => {
    const slots = timeSlotsForDay(DEFAULT_OPENING_HOURS, "2026-09-08", 45);
    expect(slots[0]).toBe("09:00");
    expect(slots.at(-1)).toBe("17:00"); // 17:00 + 45 min = 17:45 ≤ 18:00; 17:30 niet
  });
});

describe("ligtInVerleden", () => {
  const now = new Date(2026, 8, 8, 12, 0);

  it("herkent het verleden en de toekomst t.o.v. een gegeven klok", () => {
    expect(isInPast("2026-09-08", "11:30", now)).toBe(true);
    expect(isInPast("2026-09-08", "12:30", now)).toBe(false);
    expect(isInPast("2026-09-09", "09:00", now)).toBe(false);
  });
});
