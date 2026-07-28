import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

export interface LogAuditEventInput {
  action: AuditAction;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Never throws — audit logging is a secondary concern and a transient
 * write failure here must not fail the auth request it's describing.
 */
export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        userId: input.userId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log", { action: input.action, error });
  }
}
