import { NextResponse } from "next/server";
import { getRefreshTokenCookie, clearAuthCookies, setAuthCookies } from "@/lib/cookies";
import { rotateUserSession } from "@/features/auth/services/session.service";
import { getRequestDevice } from "@/lib/device";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const device = getRequestDevice(request);
  const result = await rotateUserSession(refreshToken, device);

  if (result.status === "invalid") {
    await clearAuthCookies();
    return NextResponse.json({ error: "Session expired — please log in again" }, { status: 401 });
  }

  await setAuthCookies(result.accessToken, result.refreshToken);
  return NextResponse.json({ status: "refreshed" });
}
