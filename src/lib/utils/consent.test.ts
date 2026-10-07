import { describe, expect, it } from "vitest";
import { CONSENT_MAX_AGE_DAYS, CONSENT_VERSION, parseConsent, serializeConsent } from "./consent";

const NOW = new Date("2026-10-06T10:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * DAY_MS);
}

describe("parseConsent", () => {
  it("is unknown without a stored value", () => {
    expect(parseConsent(null, NOW)).toBe("unknown");
    expect(parseConsent("", NOW)).toBe("unknown");
  });

  it("reads back a fresh accepted and declined choice", () => {
    expect(parseConsent(serializeConsent("accepted", NOW), NOW)).toBe("accepted");
    expect(parseConsent(serializeConsent("declined", NOW), NOW)).toBe("declined");
  });

  it("keeps a choice until the maximum age", () => {
    const raw = serializeConsent("accepted", daysAgo(CONSENT_MAX_AGE_DAYS - 1));
    expect(parseConsent(raw, NOW)).toBe("accepted");
  });

  it("asks again after the maximum age", () => {
    const raw = serializeConsent("accepted", daysAgo(CONSENT_MAX_AGE_DAYS + 1));
    expect(parseConsent(raw, NOW)).toBe("unknown");
  });

  it("asks again when the stored version is older", () => {
    const raw = JSON.stringify({
      status: "accepted",
      version: CONSENT_VERSION - 1,
      savedAt: NOW.getTime(),
    });
    expect(parseConsent(raw, NOW)).toBe("unknown");
  });

  it("does not trust a choice dated in the future", () => {
    const raw = serializeConsent("accepted", new Date(NOW.getTime() + DAY_MS));
    expect(parseConsent(raw, NOW)).toBe("unknown");
  });

  it("treats the legacy unversioned value as unknown", () => {
    expect(parseConsent("accepted", NOW)).toBe("unknown");
    expect(parseConsent("declined", NOW)).toBe("unknown");
  });

  it("treats malformed or incomplete values as unknown", () => {
    expect(parseConsent("{not json", NOW)).toBe("unknown");
    expect(parseConsent("null", NOW)).toBe("unknown");
    expect(parseConsent(JSON.stringify({ status: "maybe", version: 1, savedAt: 1 }), NOW)).toBe(
      "unknown",
    );
    expect(parseConsent(JSON.stringify({ status: "accepted" }), NOW)).toBe("unknown");
  });
});
