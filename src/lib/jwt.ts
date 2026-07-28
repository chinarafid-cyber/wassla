import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";
import { ACCESS_TOKEN_TTL_SECONDS, VERIFICATION_TICKET_TTL_SECONDS } from "@/config/constants";
import type { UserRole } from "@prisma/client";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export interface AccessTokenPayload extends JWTPayload {
  typ: "access";
  sub: string;
  role: UserRole;
  sessionId: string;
}

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp" | "typ">,
): Promise<string> {
  return new SignJWT({ ...payload, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessSecret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<AccessTokenPayload>(token, accessSecret);
    if (payload.typ !== "access") return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Proves phone ownership after a successful OTP check, without yet minting a
 * session. Kept as its own short-lived token (rather than logging the user
 * in immediately) so `/register` and `/login` are the only places sessions
 * are created — and so a verified-but-abandoned signup never becomes a
 * logged-in session.
 */
export interface VerificationTicketPayload extends JWTPayload {
  typ: "phone_verification";
  phone: string;
  isNewUser: boolean;
}

export async function signVerificationTicket(
  input: Omit<VerificationTicketPayload, "iat" | "exp" | "typ">,
): Promise<string> {
  return new SignJWT({ ...input, typ: "phone_verification" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${VERIFICATION_TICKET_TTL_SECONDS}s`)
    .sign(accessSecret);
}

export async function verifyVerificationTicket(
  token: string,
): Promise<VerificationTicketPayload | null> {
  try {
    const { payload } = await jwtVerify<VerificationTicketPayload>(token, accessSecret);
    if (payload.typ !== "phone_verification") return null;
    return payload;
  } catch {
    return null;
  }
}
