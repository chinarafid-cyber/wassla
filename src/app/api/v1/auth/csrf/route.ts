import { NextResponse } from "next/server";
import { issueCsrfToken } from "@/lib/csrf";

/**
 * The double-submit CSRF pattern needs a token issued on an earlier
 * response before it can be echoed back on a mutating request — the auth
 * pages call this once on mount so the very first `otp/request` call
 * already has a cookie + header pair to submit.
 */
export async function GET() {
  const token = await issueCsrfToken();
  return NextResponse.json({ csrfToken: token });
}
