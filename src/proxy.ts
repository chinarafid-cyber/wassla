import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/jwt";
import { rotateUserSession } from "@/features/auth/services/session.service";
import { getRequestDevice } from "@/lib/device";
import { roleSatisfiesRoute } from "@/config/roles";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "@/config/constants";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin", "/merchant"];
const AUTH_FLOW_ROUTES = ["/login", "/verify", "/complete-profile"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function applyAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

/**
 * Optimistic checks only, per Next.js's own guidance: verify the access
 * token's signature and redirect, but never treat this as the sole
 * authorization boundary — every protected page and route handler re-checks
 * via `getCurrentUser()` / `verifySession()` against the database.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = matchesRoute(pathname, PROTECTED_PREFIXES);
  const isAuthFlowRoute = matchesRoute(pathname, AUTH_FLOW_ROUTES);

  const accessTokenCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let claims: AccessTokenPayload | null = accessTokenCookie
    ? await verifyAccessToken(accessTokenCookie)
    : null;

  let response = NextResponse.next();

  // Access token missing/expired: attempt one silent refresh before deciding.
  // Scoped to protected routes only, so anonymous visitors and public pages
  // never trigger this database round trip.
  if (!claims && isProtectedRoute) {
    const refreshTokenCookie = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshTokenCookie) {
      const device = getRequestDevice(request);
      const result = await rotateUserSession(refreshTokenCookie, device);

      if (result.status === "rotated") {
        claims = await verifyAccessToken(result.accessToken);
        response = NextResponse.next();
        applyAuthCookies(response, result.accessToken, result.refreshToken);
      }
    }
  }

  if (isProtectedRoute) {
    if (!claims) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!roleSatisfiesRoute(claims.role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isAuthFlowRoute && claims) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/merchant/:path*",
    "/login",
    "/verify",
    "/complete-profile",
  ],
};
