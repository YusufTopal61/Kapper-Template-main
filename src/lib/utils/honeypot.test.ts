import { describe, expect, it } from "vitest";
import { HONEYPOT_FIELD, isHoneypotTripped } from "./honeypot";

describe("isHoneypotTripped", () => {
  it("is false when the decoy field is missing or empty", () => {
    expect(isHoneypotTripped({ customerName: "Jan" })).toBe(false);
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: "" })).toBe(false);
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: "   " })).toBe(false);
  });

  it("is true when the decoy field has content", () => {
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: "https://spam.example" })).toBe(true);
  });

  it("is false for input that is not an object", () => {
    expect(isHoneypotTripped(null)).toBe(false);
    expect(isHoneypotTripped("website")).toBe(false);
    expect(isHoneypotTripped(undefined)).toBe(false);
  });

  it("ignores non-string values", () => {
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: 1 })).toBe(false);
  });
});
