import { describe, it, expect, vi, beforeEach } from "vitest";
import { OtpPurpose } from "@prisma/client";

const otpRepo = vi.hoisted(() => ({
  createOtp: vi.fn(),
  findLatestActiveOtp: vi.fn(),
  incrementOtpAttempts: vi.fn(),
  consumeOtp: vi.fn(),
}));

const userRepo = vi.hoisted(() => ({
  findUserByPhone: vi.fn(),
}));

const rateLimitMod = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  checkCooldown: vi.fn(),
  setCooldown: vi.fn(),
}));

const smsMod = vi.hoisted(() => ({
  smsProvider: { send: vi.fn() },
}));

const auditMod = vi.hoisted(() => ({
  logAuditEvent: vi.fn(),
}));

const e2eStoreMod = vi.hoisted(() => ({
  storeOtpCodeForE2E: vi.fn(),
}));

vi.mock("@/features/auth/repositories/otp.repository", () => otpRepo);
vi.mock("@/features/auth/repositories/user.repository", () => userRepo);
vi.mock("@/lib/rate-limit", () => rateLimitMod);
vi.mock("@/lib/sms", () => smsMod);
vi.mock("@/lib/audit-log", () => auditMod);
vi.mock("@/lib/e2e-test-store", () => e2eStoreMod);

const { requestOtp, verifyOtp } = await import("@/features/auth/services/otp.service");

const ALLOWED = { allowed: true, remaining: 4, resetAt: new Date() };
const PHONE = "+966501234567";

beforeEach(() => {
  vi.clearAllMocks();
  rateLimitMod.checkCooldown.mockResolvedValue({ onCooldown: false, retryAfterSeconds: 0 });
  rateLimitMod.rateLimit.mockResolvedValue(ALLOWED);
  userRepo.findUserByPhone.mockResolvedValue(null);
});

describe("requestOtp", () => {
  it("sends a code and applies a cooldown for a new phone", async () => {
    const result = await requestOtp(PHONE, "127.0.0.1");

    expect(result.status).toBe("sent");
    expect(smsMod.smsProvider.send).toHaveBeenCalledTimes(1);
    expect(smsMod.smsProvider.send.mock.calls[0][0]).toBe(PHONE);
    expect(rateLimitMod.setCooldown).toHaveBeenCalledWith(`otp:${PHONE}`, 30);

    const createCall = otpRepo.createOtp.mock.calls[0][0];
    expect(createCall.purpose).toBe(OtpPurpose.REGISTER);
    expect(createCall.codeHash).not.toContain(createCall.phone);
  });

  it("uses purpose=LOGIN when the phone already belongs to a user", async () => {
    userRepo.findUserByPhone.mockResolvedValue({ id: "user_1" });

    await requestOtp(PHONE, "127.0.0.1");

    expect(otpRepo.createOtp.mock.calls[0][0].purpose).toBe(OtpPurpose.LOGIN);
    expect(otpRepo.createOtp.mock.calls[0][0].userId).toBe("user_1");
  });

  it("refuses to send while on cooldown", async () => {
    rateLimitMod.checkCooldown.mockResolvedValue({ onCooldown: true, retryAfterSeconds: 17 });

    const result = await requestOtp(PHONE, "127.0.0.1");

    expect(result).toEqual({ status: "cooldown", retryAfterSeconds: 17 });
    expect(smsMod.smsProvider.send).not.toHaveBeenCalled();
    expect(otpRepo.createOtp).not.toHaveBeenCalled();
  });

  it("refuses to send once the per-phone rate limit is exceeded", async () => {
    rateLimitMod.rateLimit.mockResolvedValueOnce({ allowed: false, remaining: 0, resetAt: new Date() });

    const result = await requestOtp(PHONE, "127.0.0.1");

    expect(result).toEqual({ status: "rate_limited" });
    expect(smsMod.smsProvider.send).not.toHaveBeenCalled();
  });

  it("reports send_failed (not an unhandled exception) when the SMS provider throws", async () => {
    smsMod.smsProvider.send.mockRejectedValueOnce(new Error("provider unreachable"));

    const result = await requestOtp(PHONE, "127.0.0.1");

    expect(result).toEqual({ status: "send_failed" });
    // The cooldown must not be applied for a code the user never received.
    expect(rateLimitMod.setCooldown).not.toHaveBeenCalled();
  });
});

describe("verifyOtp", () => {
  it("returns not_found when there is no active code", async () => {
    otpRepo.findLatestActiveOtp.mockResolvedValue(null);

    const result = await verifyOtp(PHONE, "123456", "127.0.0.1");

    expect(result).toEqual({ status: "not_found" });
  });

  it("returns too_many_attempts once maxAttempts is reached", async () => {
    otpRepo.findLatestActiveOtp.mockResolvedValue({
      id: "otp_1",
      attempts: 5,
      maxAttempts: 5,
      codeHash: "irrelevant",
      purpose: OtpPurpose.LOGIN,
      userId: null,
    });

    const result = await verifyOtp(PHONE, "123456", "127.0.0.1");

    expect(result).toEqual({ status: "too_many_attempts" });
    expect(otpRepo.incrementOtpAttempts).not.toHaveBeenCalled();
  });

  it("decrements remaining attempts on a wrong code", async () => {
    const { hashSecret } = await import("@/lib/hash");
    otpRepo.findLatestActiveOtp.mockResolvedValue({
      id: "otp_1",
      attempts: 1,
      maxAttempts: 5,
      codeHash: await hashSecret("654321"),
      purpose: OtpPurpose.LOGIN,
      userId: null,
    });
    otpRepo.incrementOtpAttempts.mockResolvedValue({ maxAttempts: 5, attempts: 2 });

    const result = await verifyOtp(PHONE, "000000", "127.0.0.1");

    expect(result).toEqual({ status: "invalid_code", attemptsRemaining: 3 });
    expect(otpRepo.consumeOtp).not.toHaveBeenCalled();
  });

  it("verifies the correct code, consumes it, and returns a ticket", async () => {
    const { hashSecret } = await import("@/lib/hash");
    otpRepo.findLatestActiveOtp.mockResolvedValue({
      id: "otp_1",
      attempts: 0,
      maxAttempts: 5,
      codeHash: await hashSecret("123456"),
      purpose: OtpPurpose.REGISTER,
      userId: null,
    });

    const result = await verifyOtp(PHONE, "123456", "127.0.0.1");

    expect(result.status).toBe("verified");
    expect(otpRepo.consumeOtp).toHaveBeenCalledWith("otp_1");
    if (result.status === "verified") {
      expect(result.isNewUser).toBe(true);
      expect(typeof result.ticket).toBe("string");
    }
  });
});
