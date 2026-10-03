import { describe, expect, it } from "vitest";
import { nuInAmsterdam } from "./clock";

describe("nuInAmsterdam", () => {
  it("toont zomertijd (UTC+2) in de lokale velden, ook over middernacht heen", () => {
    const nu = nuInAmsterdam(new Date("2026-07-01T22:30:00Z"));

    expect([nu.getFullYear(), nu.getMonth() + 1, nu.getDate()]).toEqual([2026, 7, 2]);
    expect([nu.getHours(), nu.getMinutes()]).toEqual([0, 30]);
  });

  it("toont wintertijd (UTC+1)", () => {
    const nu = nuInAmsterdam(new Date("2026-01-15T09:00:00Z"));

    expect([nu.getDate(), nu.getHours()]).toEqual([15, 10]);
  });

  it("zet de klok correct om op de dag dat de zomertijd ingaat", () => {
    // 29 maart 2026: om 01:00 UTC springt Amsterdam van 02:00 naar 03:00.
    const voor = nuInAmsterdam(new Date("2026-03-29T00:59:00Z"));
    const na = nuInAmsterdam(new Date("2026-03-29T01:00:00Z"));

    expect(voor.getHours()).toBe(1);
    expect(na.getHours()).toBe(3);
  });
});
