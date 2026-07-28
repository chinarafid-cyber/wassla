import { describe, it, expect } from "vitest";
import { otpRequestSchema, otpVerifySchema } from "@/features/auth/schemas/otp.schema";

describe("otpRequestSchema", () => {
  it("accepts a valid phone", () => {
    expect(otpRequestSchema.safeParse({ phone: "+966501234567" }).success).toBe(true);
  });

  it("rejects a missing phone", () => {
    expect(otpRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("otpVerifySchema", () => {
  it("accepts a valid phone and 6-digit code", () => {
    const result = otpVerifySchema.safeParse({ phone: "+966501234567", code: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects a code shorter than 6 digits", () => {
    expect(
      otpVerifySchema.safeParse({ phone: "+966501234567", code: "123" }).success,
    ).toBe(false);
  });

  it("rejects a code longer than 6 digits", () => {
    expect(
      otpVerifySchema.safeParse({ phone: "+966501234567", code: "1234567" }).success,
    ).toBe(false);
  });

  it("rejects a non-numeric code", () => {
    expect(
      otpVerifySchema.safeParse({ phone: "+966501234567", code: "abcdef" }).success,
    ).toBe(false);
  });
});
