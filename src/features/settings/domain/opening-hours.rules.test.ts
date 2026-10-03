import { describe, expect, it } from "vitest";
import {
  weekdayOfDate,
  DEFAULT_OPENING_HOURS,
  isInPast,
  timeSlotsForDay,
  isWithinOpeningHours,
} from "./opening-hours.rules";

// 2026-09-08 is a Tuesday (09:00–18:00), 09-12 a Saturday (09:00–17:00),
// 09-07 a Monday and 09-13 a Sunday (both closed).
describe("dagVanDatum", () => {
  it("maps a calendar date to its weekday, also around UTC boundaries", () => {
    expect(weekdayOfDate("2026-09-07")).toBe("monday");
    expect(weekdayOfDate("2026-09-08")).toBe("tuesday");
    expect(weekdayOfDate("2026-09-13")).toBe("sunday");
  });
});

describe("valtBinnenOpeningstijden", () => {
  const o = DEFAULT_OPENING_HOURS;

  it("allows an appointment within the opening hours", () => {
    expect(isWithinOpeningHours(o, "2026-09-08", "10:00", 30).ok).toBe(true);
  });

  it("rejects a closed day", () => {
    const outcome = isWithinOpeningHours(o, "2026-09-07", "10:00", 30);
    expect(outcome.ok).toBe(false);
  });

  it("counts the duration: the treatment must finish before closing time", () => {
    expect(isWithinOpeningHours(o, "2026-09-08", "17:30", 30).ok).toBe(true);
    expect(isWithinOpeningHours(o, "2026-09-08", "17:30", 45).ok).toBe(false);
  });

  it("rejects a time before opening", () => {
    expect(isWithinOpeningHours(o, "2026-09-08", "08:30", 30).ok).toBe(false);
  });

  it("respects the shorter Saturday", () => {
    expect(isWithinOpeningHours(o, "2026-09-12", "16:30", 30).ok).toBe(true);
    expect(isWithinOpeningHours(o, "2026-09-12", "16:45", 30).ok).toBe(false);
  });
});

describe("tijdslotenVoorDag", () => {
  it("returns nothing on a closed day", () => {
    expect(timeSlotsForDay(DEFAULT_OPENING_HOURS, "2026-09-13", 30)).toEqual([]);
  });

  it("stops at the last slot where the treatment still fits", () => {
    const slots = timeSlotsForDay(DEFAULT_OPENING_HOURS, "2026-09-08", 45);
    expect(slots[0]).toBe("09:00");
    expect(slots.at(-1)).toBe("17:00"); // 17:00 + 45 min = 17:45 ≤ 18:00; 17:30 is not
  });
});

describe("ligtInVerleden", () => {
  const now = new Date(2026, 8, 8, 12, 0);

  it("recognizes past and future relative to a given clock", () => {
    expect(isInPast("2026-09-08", "11:30", now)).toBe(true);
    expect(isInPast("2026-09-08", "12:30", now)).toBe(false);
    expect(isInPast("2026-09-09", "09:00", now)).toBe(false);
  });
});
