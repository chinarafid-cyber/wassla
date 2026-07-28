import "server-only";
import type { Session, User } from "@prisma/client";
import { signAccessToken } from "@/lib/jwt";
import { generateRefreshToken, hashRefreshToken } from "@/lib/tokens";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies";
import { logAuditEvent } from "@/lib/audit-log";
import type { RequestDevice } from "@/lib/device";
import { REFRESH_TOKEN_TTL_SECONDS } from "@/config/constants";
import {
  createSession,
  findSessionByRefreshHash,
  rotateSession as rotateSessionRecord,
  revokeSession,
} from "../repositories/session.repository";
import { findUserById } from "../repositories/user.repository";

export async function createUserSession(user: User, device: RequestDevice): Promise<Session> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  const session = await createSession({
    userId: user.id,
    refreshTokenHash,
    expiresAt,
    userAgent: device.userAgent,
    deviceName: device.deviceName,
    ipAddress: device.ipAddress,
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    sessionId: session.id,
  });

  await setAuthCookies(accessToken, refreshToken);

  return session;
}

export async function endUserSession(refreshToken: string): Promise<Session | null> {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await findSessionByRefreshHash(refreshTokenHash);

  if (session && !session.revokedAt) {
    await revokeSession(session.id);
  }

  await clearAuthCookies();
  return session;
}

export type RotateSessionResult =
  | { status: "rotated"; accessToken: string; refreshToken: string }
  | { status: "invalid" };

/**
 * Pure rotation: verifies the refresh token, rolls it over, and returns the
 * new tokens — it never touches cookies itself. `next/headers`'s `cookies()`
 * only works from Route Handlers/Server Actions, while `proxy.ts` must set
 * cookies on its own `NextResponse`. Keeping this cookie-agnostic lets both
 * callers apply the result their own way.
 */
export async function rotateUserSession(
  refreshToken: string,
  device: RequestDevice,
): Promise<RotateSessionResult> {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await findSessionByRefreshHash(refreshTokenHash);

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return { status: "invalid" };
  }

  const user = await findUserById(session.userId);
  if (!user || user.status !== "ACTIVE") {
    return { status: "invalid" };
  }

  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await rotateSessionRecord(session.id, {
    refreshTokenHash: newRefreshTokenHash,
    expiresAt: newExpiresAt,
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    sessionId: session.id,
  });

  await logAuditEvent({
    action: "SESSION_REFRESHED",
    userId: user.id,
    ipAddress: device.ipAddress,
    userAgent: device.userAgent,
  });

  return { status: "rotated", accessToken, refreshToken: newRefreshToken };
}
