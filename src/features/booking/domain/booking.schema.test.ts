import { describe, expect, it } from "vitest";
import { bookingInputSchema, cancelByTokenSchema } from "./booking.schema";

const valid = {
  serviceId: "00000000-0000-4000-8000-000000000001",
  customerName: "Jan Test",
  customerEmail: "Jan@Example.NL",
  customerPhone: "06 12 34 56 78",
  date: "2026-09-08",
  time: "10:00",
};

describe("bookingInputSchema", () => {
  it("normalizes the email address", () => {
    expect(bookingInputSchema.parse(valid).customerEmail).toBe("jan@example.nl");
  });

  it.each([
    ["a phone number with too few digits", { customerPhone: "123" }],
    ["not an email address", { customerEmail: "nietgeldig" }],
    ["an absurdly long email address", { customerEmail: `${"a".repeat(300)}@example.nl` }],
    ["a name that is too long", { customerName: "x".repeat(121) }],
    ["a date in the wrong format", { date: "08-09-2026" }],
    ["a service id that is not a uuid", { serviceId: "1; drop table bookings" }],
  ])("weigert %s", (_name, deviation) => {
    expect(bookingInputSchema.safeParse({ ...valid, ...deviation }).success).toBe(false);
  });
});

describe("cancelByTokenSchema", () => {
  it("bounds the token on both sides", () => {
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
