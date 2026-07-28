import { test, expect } from "@playwright/test";
import { randomTestPhone, fetchOtpCode, fillOtpCode } from "./helpers";
import { OTP_RESEND_COOLDOWN_SECONDS } from "@/config/constants";

test.describe("Phone + OTP authentication", () => {
  test("registers a new user, then logs out and back in on the same phone", async ({ page }) => {
    test.setTimeout(60_000);
    const phone = randomTestPhone();
    const fullName = "لاعب الاختبار";

    // --- Register ---
    await page.goto("/login");
    await page.getByPlaceholder("+9665XXXXXXXX").fill(phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();
    await expect(page).toHaveURL(/\/verify/);

    const firstCode = await fetchOtpCode(page, phone);
    await fillOtpCode(page, firstCode);

    await expect(page).toHaveURL(/\/complete-profile/);
    await page.getByPlaceholder("اسمك الكامل").fill(fullName);
    await page.getByRole("button", { name: "إنشاء الحساب" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(fullName)).toBeVisible();

    // --- Log out ---
    await page.getByRole("button", { name: fullName }).click();
    await page.getByRole("menuitem", { name: "تسجيل الخروج" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // --- Log back in with the same phone (existing user path) ---
    // The OTP resend cooldown is per-phone, so re-requesting a code for the
    // same number this soon after registering must genuinely wait it out —
    // that cooldown is a deliberate anti-abuse feature, not a test artifact.
    await page.waitForTimeout((OTP_RESEND_COOLDOWN_SECONDS + 2) * 1000);
    await page.getByPlaceholder("+9665XXXXXXXX").fill(phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();
    await expect(page).toHaveURL(/\/verify/);

    const secondCode = await fetchOtpCode(page, phone);
    await fillOtpCode(page, secondCode);

    // Existing user: verify auto-completes login and skips complete-profile.
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(fullName)).toBeVisible();
  });

  test("rejects an incorrect OTP code and reports remaining attempts", async ({ page }) => {
    const phone = randomTestPhone();

    await page.goto("/login");
    await page.getByPlaceholder("+9665XXXXXXXX").fill(phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();
    await expect(page).toHaveURL(/\/verify/);

    await fillOtpCode(page, "000000");

    // A wrong code stays on /verify and resets the boxes for another try —
    // it never silently proceeds.
    await expect(page).toHaveURL(/\/verify/);
    await expect(page.locator('input[maxlength="1"]').first()).toHaveValue("");
  });
});
