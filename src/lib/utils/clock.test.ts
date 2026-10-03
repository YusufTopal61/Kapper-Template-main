import { describe, expect, it } from "vitest";
import { nowInAmsterdam } from "./clock";

describe("nuInAmsterdam", () => {
  it("shows summer time (UTC+2) in the local fields, also across midnight", () => {
    const now = nowInAmsterdam(new Date("2026-07-01T22:30:00Z"));

    expect([now.getFullYear(), now.getMonth() + 1, now.getDate()]).toEqual([2026, 7, 2]);
    expect([now.getHours(), now.getMinutes()]).toEqual([0, 30]);
  });

  it("toont wintertijd (UTC+1)", () => {
    const now = nowInAmsterdam(new Date("2026-01-15T09:00:00Z"));

    expect([now.getDate(), now.getHours()]).toEqual([15, 10]);
  });

  it("converts the clock correctly on the day summer time starts", () => {
    // 29 March 2026: at 01:00 UTC Amsterdam jumps from 02:00 to 03:00.
    const before = nowInAmsterdam(new Date("2026-03-29T00:59:00Z"));
    const after = nowInAmsterdam(new Date("2026-03-29T01:00:00Z"));

    expect(before.getHours()).toBe(1);
    expect(after.getHours()).toBe(3);
  });
});
