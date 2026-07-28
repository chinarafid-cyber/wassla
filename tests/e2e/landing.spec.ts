import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows the brand, hero copy, and a login link", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /نوصل علامتك التجارية/ })).toBeVisible();
  });

  test("login link navigates to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "تسجيل الدخول" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
