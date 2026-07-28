import "server-only";
import { cache } from "react";
import { getAccessTokenCookie } from "@/lib/cookies";
import { verifyAccessToken } from "@/lib/jwt";
import { findUserById } from "../repositories/user.repository";
import { toUserDTO, type UserDTO } from "../types/auth.types";
import type { UserRole } from "@prisma/client";

export interface SessionClaims {
  userId: string;
  role: UserRole;
  sessionId: string;
}

/**
 * Optimistic check only — reads the access token cookie and verifies its
 * signature, no database round trip. Safe to call from `proxy.ts` on every
 * request. `getCurrentUser` below does the real (database-backed) check.
 */
export const verifySession = cache(async (): Promise<SessionClaims | null> => {
  const token = await getAccessTokenCookie();
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return { userId: payload.sub, role: payload.role, sessionId: payload.sessionId };
});

/** The secure check — confirms the user still exists and is active in the database. */
export const getCurrentUser = cache(async (): Promise<UserDTO | null> => {
  const session = await verifySession();
  if (!session) return null;

  const user = await findUserById(session.userId);
  if (!user || user.status !== "ACTIVE") return null;

  return toUserDTO(user);
});
