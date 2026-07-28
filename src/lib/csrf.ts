import "server-only";
import { randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Double-submit cookie CSRF protection. No dedicated npm package is used —
 * the only maintained option (`edge-csrf`) has never left release-candidate
 * status, so this hand-rolls the standard pattern instead: a random token
 * is readable by client JS (not httpOnly) and must be echoed back in a
 * request header. A cross-site attacker can trigger the request but cannot
 * read the cookie to copy its value into the header.
 */
export const CSRF_COOKIE = "wassla_csrf_token";
export const CSRF_HEADER = "x-csrf-token";

export async function issueCsrfToken(): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return token;
}

export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
}
