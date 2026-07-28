import "server-only";
import { prisma } from "@/lib/prisma";
import type { Otp, OtpPurpose } from "@prisma/client";

export interface CreateOtpInput {
  phone: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  requestIp?: string | null;
  userId?: string | null;
}

export function createOtp(input: CreateOtpInput): Promise<Otp> {
  return prisma.otp.create({ data: input });
}

/** The most recent still-usable (unconsumed, unexpired) OTP for a phone, regardless of purpose. */
export function findLatestActiveOtp(phone: string): Promise<Otp | null> {
  return prisma.otp.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}

export function incrementOtpAttempts(id: string): Promise<Otp> {
  return prisma.otp.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
}

export function consumeOtp(id: string): Promise<Otp> {
  return prisma.otp.update({
    where: { id },
    data: { consumedAt: new Date() },
  });
}
