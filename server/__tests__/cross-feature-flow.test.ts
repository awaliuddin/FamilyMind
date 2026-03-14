import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  TEST_USER_ID,
  TEST_FAMILY_ID,
} from "./test-helpers";

let app: Express;
let mockStorage: ReturnType<typeof createMockStorage>;

beforeAll(async () => {
  const testApp = await createTestApp();
  app = testApp.app;
  mockStorage = testApp.mockStorage;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Cross-feature interactions", () => {
  it("grocery list lifecycle: create list → add items → check/uncheck → delete item → delete list", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Step 1: Create a grocery list
    const list = { id: "list-flow", familyId: TEST_FAMILY_ID, store: "Costco" };
    mockStorage.createGroceryList.mockResolvedValue(list);

    const listRes = await request(app)
      .post("/api/grocery-lists")
      .send({ store: "Costco" });
    expect(listRes.status).toBe(200);
    expect(listRes.body.store).toBe("Costco");

    // Step 2: Add items to the list
    mockStorage.addGroceryItem
      .mockResolvedValueOnce({ id: "item-1", listId: "list-flow", name: "Milk", completed: false })
      .mockResolvedValueOnce({ id: "item-2", listId: "list-flow", name: "Bread", completed: false });

    const item1Res = await request(app).post("/api/grocery-items").send({ listId: "list-flow", name: "Milk" });
    const item2Res = await request(app).post("/api/grocery-items").send({ listId: "list-flow", name: "Bread" });
    expect(item1Res.status).toBe(200);
    expect(item2Res.status).toBe(200);

    // Step 3: Check off an item
    mockStorage.updateGroceryItem.mockResolvedValue({ id: "item-1", listId: "list-flow", name: "Milk", completed: true });

    const checkRes = await request(app)
      .patch("/api/grocery-items/item-1")
      .send({ completed: true });
    expect(checkRes.status).toBe(200);
    expect(checkRes.body.completed).toBe(true);

    // Step 4: Delete an item
    mockStorage.deleteGroceryItem.mockResolvedValue(undefined);
    const deleteItemRes = await request(app).delete("/api/grocery-items/item-2");
    expect(deleteItemRes.status).toBe(200);

    // Step 5: Delete the list
    mockStorage.deleteGroceryList.mockResolvedValue(undefined);
    const deleteListRes = await request(app).delete("/api/grocery-lists/list-flow");
    expect(deleteListRes.status).toBe(200);
  });

  it("calendar event lifecycle: create → update time → delete", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Create event
    const event = {
      id: "evt-flow", familyId: TEST_FAMILY_ID, title: "Doctor Visit",
      startTime: new Date("2026-03-10T09:00:00Z"), endTime: new Date("2026-03-10T10:00:00Z"),
      eventType: "medical",
    };
    mockStorage.createCalendarEvent.mockResolvedValue(event);

    const createRes = await request(app)
      .post("/api/calendar-events")
      .send({ title: "Doctor Visit", startTime: "2026-03-10T09:00:00Z", endTime: "2026-03-10T10:00:00Z", eventType: "medical" });
    expect(createRes.status).toBe(200);

    // Update — reschedule to afternoon
    mockStorage.updateCalendarEvent.mockResolvedValue({
      ...event,
      startTime: new Date("2026-03-10T14:00:00Z"),
      endTime: new Date("2026-03-10T15:00:00Z"),
    });

    const updateRes = await request(app)
      .patch("/api/calendar-events/evt-flow")
      .send({ startTime: "2026-03-10T14:00:00Z", endTime: "2026-03-10T15:00:00Z" });
    expect(updateRes.status).toBe(200);

    // Verify date strings were converted to Date objects
    const callArg = mockStorage.updateCalendarEvent.mock.calls[0][1] as any;
    expect(callArg.startTime).toBeInstanceOf(Date);
    expect(callArg.endTime).toBeInstanceOf(Date);

    // Delete
    mockStorage.deleteCalendarEvent.mockResolvedValue(undefined);
    const deleteRes = await request(app).delete("/api/calendar-events/evt-flow");
    expect(deleteRes.status).toBe(200);
  });

  it("vision board lifecycle: create → update progress → delete", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Create vision item
    const vision = { id: "v-flow", familyId: TEST_FAMILY_ID, title: "Save $10k", author: "Mom", color: "#4ecdc4", progress: 0 };
    mockStorage.createVisionItem.mockResolvedValue(vision);

    const createRes = await request(app)
      .post("/api/vision-items")
      .send({ title: "Save $10k", author: "Mom", color: "#4ecdc4" });
    expect(createRes.status).toBe(200);
    expect(createRes.body.title).toBe("Save $10k");

    // Update progress to 50%
    mockStorage.updateVisionItem.mockResolvedValue({ ...vision, progress: 50 });

    const updateRes = await request(app)
      .patch("/api/vision-items/v-flow")
      .send({ progress: 50 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.progress).toBe(50);

    // Delete
    mockStorage.deleteVisionItem.mockResolvedValue(undefined);
    const deleteRes = await request(app).delete("/api/vision-items/v-flow");
    expect(deleteRes.status).toBe(200);
  });

  it("wishlist lifecycle: create → mark purchased → delete", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Create wishlist item
    const item = {
      id: "w-flow", familyId: TEST_FAMILY_ID, item: "LEGO Star Wars",
      person: "Emma", occasion: "birthday", purchased: false,
    };
    mockStorage.createWishListItem.mockResolvedValue(item);

    const createRes = await request(app)
      .post("/api/wishlist-items")
      .send({ item: "LEGO Star Wars", person: "Emma", occasion: "birthday" });
    expect(createRes.status).toBe(200);

    // Mark as purchased
    mockStorage.updateWishListItem.mockResolvedValue({ ...item, purchased: true });

    const updateRes = await request(app)
      .patch("/api/wishlist-items/w-flow")
      .send({ purchased: true });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.purchased).toBe(true);

    // Delete
    mockStorage.deleteWishListItem.mockResolvedValue(undefined);
    const deleteRes = await request(app).delete("/api/wishlist-items/w-flow");
    expect(deleteRes.status).toBe(200);
  });

  it("recipe → grocery list cross-feature: create recipe, then add ingredients to a grocery list", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Step 1: Create a recipe
    const recipe = {
      id: "r-flow", familyId: TEST_FAMILY_ID, title: "Tacos",
      ingredients: [
        { name: "tortillas", quantity: "8", unit: "pcs" },
        { name: "ground beef", quantity: "1", unit: "lb" },
        { name: "salsa" },
      ],
    };
    mockStorage.createRecipe.mockResolvedValue(recipe);

    const recipeRes = await request(app)
      .post("/api/recipes")
      .send({ title: "Tacos", ingredients: recipe.ingredients });
    expect(recipeRes.status).toBe(200);

    // Step 2: Create a grocery list
    const list = { id: "list-taco", familyId: TEST_FAMILY_ID, store: "HEB" };
    mockStorage.createGroceryList.mockResolvedValue(list);

    const listRes = await request(app)
      .post("/api/grocery-lists")
      .send({ store: "HEB" });
    expect(listRes.status).toBe(200);

    // Step 3: Add recipe ingredients to the grocery list
    mockStorage.getRecipes.mockResolvedValue([recipe]);
    mockStorage.addGroceryItem.mockResolvedValue({ id: "gi-new" });

    const toGroceryRes = await request(app)
      .post("/api/recipes/r-flow/to-grocery-list")
      .send({ listId: "list-taco" });

    expect(toGroceryRes.status).toBe(200);
    expect(toGroceryRes.body.added).toBe(3);

    // Verify ingredient labels
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith(
      expect.objectContaining({ listId: "list-taco", name: "8 pcs tortillas", autoAdded: true }),
    );
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith(
      expect.objectContaining({ name: "salsa", autoAdded: true }),
    );
  });

  it("chat AI is blocked for free users (premium-only)", async () => {
    // Chat routes require premium — free users get 403
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/chat")
      .send({ message: "What should we have for dinner?" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });
});
