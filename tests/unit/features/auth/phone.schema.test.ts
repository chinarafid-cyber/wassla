import { describe, it, expect } from "vitest";
import { phoneSchema } from "@/features/auth/schemas/phone.schema";

describe("phoneSchema", () => {
  it("accepts a valid international phone number", () => {
    const result = phoneSchema.safeParse("+966501234567");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("+966501234567");
    }
  });

  it("normalizes formatting differences to the same E.164 value", () => {
    const result = phoneSchema.safeParse("+966 50 123 4567");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("+966501234567");
    }
  });

  it("rejects a number missing the country code", () => {
    const result = phoneSchema.safeParse("0501234567");
    expect(result.success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(phoneSchema.safeParse("").success).toBe(false);
  });

  it("rejects non-phone garbage", () => {
    expect(phoneSchema.safeParse("not-a-phone").success).toBe(false);
  });
});
