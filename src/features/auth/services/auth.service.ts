import "server-only";
import type { User } from "@prisma/client";
import { verifyVerificationTicket } from "@/lib/jwt";
import { logAuditEvent } from "@/lib/audit-log";
import type { RequestDevice } from "@/lib/device";
import { findUserByPhone, createUser } from "../repositories/user.repository";
import { createUserSession } from "./session.service";
import type { RegisterInput, LoginInput } from "../schemas/profile.schema";

export type RegisterResult =
  | { status: "registered"; user: User }
  | { status: "invalid_ticket" }
  | { status: "already_registered" };

export async function registerUser(
  input: RegisterInput,
  device: RequestDevice,
): Promise<RegisterResult> {
  const ticket = await verifyVerificationTicket(input.verificationTicket);
  if (!ticket) {
    return { status: "invalid_ticket" };
  }

  const existing = await findUserByPhone(ticket.phone);
  if (existing) {
    return { status: "already_registered" };
  }

  const user = await createUser({
    phone: ticket.phone,
    fullName: input.fullName,
    email: input.email,
  });

  await createUserSession(user, device);
  await logAuditEvent({
    action: "USER_REGISTERED",
    userId: user.id,
    ipAddress: device.ipAddress,
    userAgent: device.userAgent,
  });
  await logAuditEvent({ action: "PROFILE_COMPLETED", userId: user.id, ipAddress: device.ipAddress });

  return { status: "registered", user };
}

export type LoginResult =
  | { status: "logged_in"; user: User }
  | { status: "invalid_ticket" }
  | { status: "not_registered" }
  | { status: "account_suspended" };

export async function loginUser(
  input: LoginInput,
  device: RequestDevice,
): Promise<LoginResult> {
  const ticket = await verifyVerificationTicket(input.verificationTicket);
  if (!ticket) {
    return { status: "invalid_ticket" };
  }

  const user = await findUserByPhone(ticket.phone);
  if (!user) {
    return { status: "not_registered" };
  }

  if (user.status !== "ACTIVE") {
    return { status: "account_suspended" };
  }

  await createUserSession(user, device);
  await logAuditEvent({
    action: "USER_LOGIN",
    userId: user.id,
    ipAddress: device.ipAddress,
    userAgent: device.userAgent,
  });

  return { status: "logged_in", user };
}
