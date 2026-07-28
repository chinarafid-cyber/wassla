import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { readOtpCodeForE2E } from "@/lib/e2e-test-store";
import { phoneSchema } from "@/features/auth/schemas/phone.schema";

/**
 * Test-only: lets Playwright fetch a just-sent OTP code instead of scraping
 * server logs. Disabled unless E2E_TEST_MODE=true — and `env.ts` itself
 * refuses to boot with that flag on when NODE_ENV=production, so this can
 * never become reachable in a real deployment.
 */
export async function GET(request: Request) {
  if (env.NODE_ENV === "production" || !env.E2E_TEST_MODE) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = phoneSchema.safeParse(searchParams.get("phone"));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const code = await readOtpCodeForE2E(parsed.data);
  if (!code) {
    return NextResponse.json({ error: "No code found for this phone" }, { status: 404 });
  }

  return NextResponse.json({ code });
}
