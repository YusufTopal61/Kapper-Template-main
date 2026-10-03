import { describe, expect, it } from "vitest";
import { bookingInputSchema, cancelByTokenSchema } from "./booking.schema";

const geldig = {
  service_id: "00000000-0000-4000-8000-000000000001",
  klant_naam: "Jan Test",
  klant_email: "Jan@Example.NL",
  klant_telefoon: "06 12 34 56 78",
  datum: "2026-09-08",
  tijd: "10:00",
};

describe("bookingInputSchema", () => {
  it("normaliseert het e-mailadres", () => {
    expect(bookingInputSchema.parse(geldig).klant_email).toBe("jan@example.nl");
  });

  it.each([
    ["telefoon met te weinig cijfers", { klant_telefoon: "123" }],
    ["geen e-mailadres", { klant_email: "nietgeldig" }],
    ["een absurd lang e-mailadres", { klant_email: `${"a".repeat(300)}@example.nl` }],
    ["een te lange naam", { klant_naam: "x".repeat(121) }],
    ["een datum in het verkeerde formaat", { datum: "08-09-2026" }],
    ["een dienst-id dat geen uuid is", { service_id: "1; drop table bookings" }],
  ])("weigert %s", (_naam, afwijking) => {
    expect(bookingInputSchema.safeParse({ ...geldig, ...afwijking }).success).toBe(false);
  });
});

describe("cancelByTokenSchema", () => {
  it("begrenst het token aan beide kanten", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect(cancelByTokenSchema.safeParse({ bookingId: id, token: "kort" }).success).toBe(false);
    expect(cancelByTokenSchema.safeParse({ bookingId: id, token: "x".repeat(500) }).success).toBe(
      false,
    );
    expect(cancelByTokenSchema.safeParse({ bookingId: id, token: "a".repeat(64) }).success).toBe(
      true,
    );
  });
});
