import type { Page } from "@playwright/test";

export function randomTestPhone(): string {
  const suffix = Math.floor(100000000 + Math.random() * 899999999)
    .toString()
    .slice(0, 8);
  return `+9665${suffix}`;
}

/** Reads the just-sent OTP via the E2E-only test-code endpoint (see `@/lib/e2e-test-store`). */
export async function fetchOtpCode(page: Page, phone: string): Promise<string> {
  const response = await page.request.get(
    `/api/v1/auth/otp/test-code?phone=${encodeURIComponent(phone)}`,
  );
  if (!response.ok()) {
    throw new Error(`Failed to fetch OTP test code for ${phone}: ${response.status()}`);
  }
  const body = (await response.json()) as { code: string };
  return body.code;
}

export async function fillOtpCode(page: Page, code: string): Promise<void> {
  const digitInputs = page.locator('input[maxlength="1"]');
  for (let i = 0; i < code.length; i++) {
    await digitInputs.nth(i).fill(code[i]);
  }
}
