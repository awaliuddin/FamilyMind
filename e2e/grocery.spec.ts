import { test, expect } from "@playwright/test";

test.describe("Grocery list CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Grocery" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("tab", { name: "Grocery" }).click();
    await expect(page.getByText("Smart Grocery Lists")).toBeVisible();
  });

  test("displays seeded grocery lists", async ({ page }) => {
    await expect(page.getByText("Walmart")).toBeVisible();
  });

  test("creates a new grocery list and adds an item", async ({ page }) => {
    const storeName = `TestStore-${Date.now()}`;

    // Create a new list
    await page.getByPlaceholder("Store name").fill(storeName);
    await page.getByRole("button", { name: "Create List" }).click();

    // Wait for the new list card to appear
    await expect(page.getByText(storeName)).toBeVisible({ timeout: 10_000 });

    // The newly created list is rendered last in the grid.
    // Each list card has exactly one "Add item..." input.
    // Use the last one on the page (belongs to our new list).
    const addItemInput = page.getByPlaceholder("Add item...").last();
    await addItemInput.fill("Organic Milk");
    // The add button is the sibling of the input in a flex row
    await addItemInput.locator("..").locator("button").click();

    // Verify the item appears on the page
    await expect(page.getByText("Organic Milk")).toBeVisible({
      timeout: 10_000,
    });
  });
});
