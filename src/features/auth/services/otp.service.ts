import "server-only";
import { randomInt } from "crypto";
import { OtpPurpose } from "@prisma/client";
import { hashSecret, verifySecretHash } from "@/lib/hash";
import { smsProvider } from "@/lib/sms";
import { signVerificationTicket } from "@/lib/jwt";
import { rateLimit, checkCooldown, setCooldown } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { storeOtpCodeForE2E } from "@/lib/e2e-test-store";
import {
  OTP_LENGTH,
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_REQUEST_LIMIT_PER_PHONE,
  OTP_REQUEST_WINDOW_SECONDS,
  OTP_REQUEST_LIMIT_PER_IP,
  OTP_REQUEST_IP_WINDOW_SECONDS,
} from "@/config/constants";
import {
  createOtp,
  findLatestActiveOtp,
  incrementOtpAttempts,
  consumeOtp,
} from "../repositories/otp.repository";
import { findUserByPhone } from "../repositories/user.repository";

function generateOtpCode(): string {
  // crypto.randomInt, not Math.random — this is a security credential.
  const code = randomInt(0, 10 ** OTP_LENGTH);
  return code.toString().padStart(OTP_LENGTH, "0");
}

export type RequestOtpResult =
  | { status: "sent"; expiresInSeconds: number }
  | { status: "cooldown"; retryAfterSeconds: number }
  | { status: "rate_limited" }
  | { status: "send_failed" };

export async function requestOtp(
  phone: string,
  ipAddress: string | null,
): Promise<RequestOtpResult> {
  const cooldown = await checkCooldown(`otp:${phone}`);
  if (cooldown.onCooldown) {
    return { status: "cooldown", retryAfterSeconds: cooldown.retryAfterSeconds };
  }

  const phoneLimit = await rateLimit(
    `otp-phone:${phone}`,
    OTP_REQUEST_LIMIT_PER_PHONE,
    OTP_REQUEST_WINDOW_SECONDS,
  );
  if (!phoneLimit.allowed) {
    await logAuditEvent({
      action: "OTP_RATE_LIMITED",
      ipAddress,
      metadata: { phone, scope: "phone" },
    });
    return { status: "rate_limited" };
  }

  if (ipAddress) {
    const ipLimit = await rateLimit(
      `otp-ip:${ipAddress}`,
      OTP_REQUEST_LIMIT_PER_IP,
      OTP_REQUEST_IP_WINDOW_SECONDS,
    );
    if (!ipLimit.allowed) {
      await logAuditEvent({
        action: "OTP_RATE_LIMITED",
        ipAddress,
        metadata: { phone, scope: "ip" },
      });
      return { status: "rate_limited" };
    }
  }

  const existingUser = await findUserByPhone(phone);
  const purpose = existingUser ? OtpPurpose.LOGIN : OtpPurpose.REGISTER;

  const code = generateOtpCode();
  const codeHash = await hashSecret(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

  await createOtp({
    phone,
    codeHash,
    purpose,
    expiresAt,
    requestIp: ipAddress,
    userId: existingUser?.id ?? null,
  });

  try {
    await smsProvider.send(
      phone,
      `Your Wassla verification code is ${code}. It expires in ${Math.floor(OTP_EXPIRY_SECONDS / 60)} minutes.`,
    );
  } catch (error) {
    // The OTP row above is harmless to leave behind — it just expires
    // unused in OTP_EXPIRY_SECONDS. Surfacing a clean failure here matters
    // more than the DB write already having happened.
    console.error("Failed to send OTP", { phone, error });
    return { status: "send_failed" };
  }

  await storeOtpCodeForE2E(phone, code);

  await setCooldown(`otp:${phone}`, OTP_RESEND_COOLDOWN_SECONDS);
  await logAuditEvent({
    action: "OTP_REQUESTED",
    userId: existingUser?.id,
    ipAddress,
    metadata: { phone, purpose },
  });

  return { status: "sent", expiresInSeconds: OTP_EXPIRY_SECONDS };
}

export type VerifyOtpResult =
  | { status: "verified"; ticket: string; isNewUser: boolean }
  | { status: "invalid_code"; attemptsRemaining: number }
  | { status: "too_many_attempts" }
  | { status: "not_found" };

export async function verifyOtp(
  phone: string,
  code: string,
  ipAddress: string | null,
): Promise<VerifyOtpResult> {
  const otp = await findLatestActiveOtp(phone);

  if (!otp) {
    return { status: "not_found" };
  }

  if (otp.attempts >= otp.maxAttempts) {
    return { status: "too_many_attempts" };
  }

  const isMatch = await verifySecretHash(code, otp.codeHash);

  if (!isMatch) {
    const updated = await incrementOtpAttempts(otp.id);
    await logAuditEvent({ action: "OTP_FAILED", ipAddress, metadata: { phone } });

    const attemptsRemaining = Math.max(updated.maxAttempts - updated.attempts, 0);
    return attemptsRemaining <= 0
      ? { status: "too_many_attempts" }
      : { status: "invalid_code", attemptsRemaining };
  }

  await consumeOtp(otp.id);

  const isNewUser = otp.purpose === OtpPurpose.REGISTER;
  await logAuditEvent({
    action: "OTP_VERIFIED",
    userId: otp.userId,
    ipAddress,
    metadata: { phone },
  });

  const ticket = await signVerificationTicket({ phone, isNewUser });

  return { status: "verified", ticket, isNewUser };
}
