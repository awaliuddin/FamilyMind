import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("auto-authenticates in local dev and shows the command center", async ({
    page,
  }) => {
    await page.goto("/");

    // Local dev auto-auth should skip the landing page and show the app
    // The FamilyCommandCenter has a tab bar with "Dashboard", "Grocery", etc.
    await expect(page.getByRole("tab", { name: "Dashboard" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("GET /api/auth/user returns the authenticated dev user", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/user");
    expect(response.ok()).toBe(true);

    const user = await response.json();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
  });

  test("/api/login redirects to home in local dev", async ({ page }) => {
    await page.goto("/api/login");
    // In local dev mode, /api/login redirects to /
    await page.waitForURL("/");
    await expect(page.getByRole("tab", { name: "Dashboard" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
