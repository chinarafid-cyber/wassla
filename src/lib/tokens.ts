import "server-only";
import { randomBytes, createHash } from "crypto";

/**
 * Refresh tokens are opaque, high-entropy random strings — not JWTs. The
 * Session table is the source of truth for validity/revocation, so a
 * self-contained signed token would be redundant and only complicate
 * instant revocation (logout, "sign out of all devices").
 */
export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Refresh tokens already have 256 bits of entropy, so a fast hash (SHA-256)
 * is appropriate here — unlike OTP codes or passwords, there is no low-
 * entropy secret to protect against offline brute force.
 */
export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
