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
  it("normaliseert het e-mailadres", () => {
    expect(bookingInputSchema.parse(valid).customerEmail).toBe("jan@example.nl");
  });

  it.each([
    ["telefoon met te weinig cijfers", { customerPhone: "123" }],
    ["geen e-mailadres", { customerEmail: "nietgeldig" }],
    ["een absurd lang e-mailadres", { customerEmail: `${"a".repeat(300)}@example.nl` }],
    ["een te lange naam", { customerName: "x".repeat(121) }],
    ["een datum in het verkeerde formaat", { date: "08-09-2026" }],
    ["een dienst-id dat geen uuid is", { serviceId: "1; drop table bookings" }],
  ])("weigert %s", (_name, deviation) => {
    expect(bookingInputSchema.safeParse({ ...valid, ...deviation }).success).toBe(false);
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
