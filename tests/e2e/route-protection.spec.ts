import { test, expect } from "@playwright/test";
import { randomTestPhone, fetchOtpCode, fillOtpCode } from "./helpers";

test.describe("Route protection", () => {
  test("redirects an unauthenticated visitor away from a protected route", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects an authenticated user away from /login back to /dashboard", async ({ page }) => {
    const phone = randomTestPhone();

    await page.goto("/login");
    await page.getByPlaceholder("+9665XXXXXXXX").fill(phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();
    await expect(page).toHaveURL(/\/verify/);

    const code = await fetchOtpCode(page, phone);
    await fillOtpCode(page, code);

    await expect(page).toHaveURL(/\/complete-profile/);
    await page.getByPlaceholder("اسمك الكامل").fill("مستخدم الحماية");
    await page.getByRole("button", { name: "إنشاء الحساب" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("a CUSTOMER is redirected away from /admin to /dashboard", async ({ page }) => {
    const phone = randomTestPhone();

    await page.goto("/login");
    await page.getByPlaceholder("+9665XXXXXXXX").fill(phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();
    await expect(page).toHaveURL(/\/verify/);

    const code = await fetchOtpCode(page, phone);
    await fillOtpCode(page, code);

    await expect(page).toHaveURL(/\/complete-profile/);
    await page.getByPlaceholder("اسمك الكامل").fill("عميل عادي");
    await page.getByRole("button", { name: "إنشاء الحساب" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
