import { describe, expect, it } from "vitest";
import { nowInAmsterdam } from "./clock";

describe("nuInAmsterdam", () => {
  it("toont zomertijd (UTC+2) in de lokale velden, ook over middernacht heen", () => {
    const now = nowInAmsterdam(new Date("2026-07-01T22:30:00Z"));

    expect([now.getFullYear(), now.getMonth() + 1, now.getDate()]).toEqual([2026, 7, 2]);
    expect([now.getHours(), now.getMinutes()]).toEqual([0, 30]);
  });

  it("toont wintertijd (UTC+1)", () => {
    const now = nowInAmsterdam(new Date("2026-01-15T09:00:00Z"));

    expect([now.getDate(), now.getHours()]).toEqual([15, 10]);
  });

  it("zet de klok correct om op de dag dat de zomertijd ingaat", () => {
    // 29 maart 2026: om 01:00 UTC springt Amsterdam van 02:00 naar 03:00.
    const before = nowInAmsterdam(new Date("2026-03-29T00:59:00Z"));
    const after = nowInAmsterdam(new Date("2026-03-29T01:00:00Z"));

    expect(before.getHours()).toBe(1);
    expect(after.getHours()).toBe(3);
  });
});
