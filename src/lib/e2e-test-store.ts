import "server-only";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

const TEST_CODE_TTL_SECONDS = 300;

/**
 * Lets Playwright read a just-sent OTP code without a real SMS provider.
 * A no-op unless E2E_TEST_MODE is explicitly enabled (see `@/lib/env`,
 * which also refuses to boot with this on in production).
 */
export async function storeOtpCodeForE2E(phone: string, code: string): Promise<void> {
  if (!env.E2E_TEST_MODE) return;
  await redis.set(`e2e-otp:${phone}`, code, "EX", TEST_CODE_TTL_SECONDS);
}

export async function readOtpCodeForE2E(phone: string): Promise<string | null> {
  if (!env.E2E_TEST_MODE) return null;
  return redis.get(`e2e-otp:${phone}`);
}
