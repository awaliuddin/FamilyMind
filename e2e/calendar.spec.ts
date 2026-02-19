import { test, expect } from "@playwright/test";

test.describe("Calendar event creation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Calendar" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("tab", { name: "Calendar" }).click();
    await expect(page.getByText("Family Calendar")).toBeVisible();
  });

  test("displays the calendar view with event form", async ({ page }) => {
    await expect(page.getByText("Schedule New Event")).toBeVisible();
    await expect(page.getByPlaceholder("Event title")).toBeVisible();
  });

  test("creates a calendar event", async ({ page }) => {
    const title = `Team Meeting ${Date.now()}`;
    const now = new Date();
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    await page.getByPlaceholder("Event title").fill(title);
    await page.getByPlaceholder("Location").fill("Conference Room A");
    await page.locator('input[type="datetime-local"]').first().fill(fmt(start));
    await page.locator('input[type="datetime-local"]').nth(1).fill(fmt(end));
    await page.locator("select").selectOption("work");

    await page.getByRole("button", { name: "Add Event" }).click();

    // Verify the event appears — use the unique title (timestamp ensures uniqueness)
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });
  });
});
