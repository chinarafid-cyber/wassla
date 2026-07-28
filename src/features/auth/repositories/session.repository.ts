import "server-only";
import { prisma } from "@/lib/prisma";
import type { Session } from "@prisma/client";

export interface CreateSessionInput {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  deviceName?: string | null;
  ipAddress?: string | null;
}

export function createSession(input: CreateSessionInput): Promise<Session> {
  return prisma.session.create({ data: input });
}

export function findSessionByRefreshHash(refreshTokenHash: string): Promise<Session | null> {
  return prisma.session.findUnique({ where: { refreshTokenHash } });
}

export function rotateSession(
  id: string,
  input: { refreshTokenHash: string; expiresAt: Date },
): Promise<Session> {
  return prisma.session.update({
    where: { id },
    data: { ...input, lastUsedAt: new Date() },
  });
}

export function revokeSession(id: string): Promise<Session> {
  return prisma.session.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}
