import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  completeProfileFormSchema,
} from "@/features/auth/schemas/profile.schema";

describe("registerSchema", () => {
  it("accepts a full valid payload", () => {
    const result = registerSchema.safeParse({
      verificationTicket: "ticket",
      fullName: "Ahmed Ali",
      email: "ahmed@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an omitted email", () => {
    expect(
      registerSchema.safeParse({ verificationTicket: "t", fullName: "Ahmed Ali" }).success,
    ).toBe(true);
  });

  it("rejects a missing verification ticket", () => {
    expect(
      registerSchema.safeParse({ verificationTicket: "", fullName: "Ahmed Ali" }).success,
    ).toBe(false);
  });

  it("rejects a full name under 2 characters", () => {
    expect(registerSchema.safeParse({ verificationTicket: "t", fullName: "A" }).success).toBe(
      false,
    );
  });

  it("rejects an invalid email", () => {
    expect(
      registerSchema.safeParse({
        verificationTicket: "t",
        fullName: "Ahmed Ali",
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty verification ticket", () => {
    expect(loginSchema.safeParse({ verificationTicket: "t" }).success).toBe(true);
    expect(loginSchema.safeParse({ verificationTicket: "" }).success).toBe(false);
  });
});

describe("completeProfileFormSchema", () => {
  it("does not require (or accept beyond) fullName/email — no verificationTicket field", () => {
    const result = completeProfileFormSchema.safeParse({
      fullName: "Ahmed Ali",
      email: "",
    });
    expect(result.success).toBe(true);
    expect("verificationTicket" in (result.success ? result.data : {})).toBe(false);
  });
});
