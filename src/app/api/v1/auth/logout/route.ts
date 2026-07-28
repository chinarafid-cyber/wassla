import { NextResponse } from "next/server";
import { getRefreshTokenCookie } from "@/lib/cookies";
import { endUserSession } from "@/features/auth/services/session.service";
import { logAuditEvent } from "@/lib/audit-log";
import { getRequestDevice } from "@/lib/device";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const refreshToken = await getRefreshTokenCookie();
  const device = getRequestDevice(request);

  if (refreshToken) {
    const session = await endUserSession(refreshToken);
    await logAuditEvent({
      action: "USER_LOGOUT",
      userId: session?.userId,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
    });
  }

  return NextResponse.json({ status: "logged_out" });
}
