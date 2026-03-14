import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
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

describe("Recipe-to-Grocery integration", () => {
  it("creates grocery items from recipe ingredients with quantity+unit+name labels", async () => {
    const recipe = {
      id: "r1",
      familyId: TEST_FAMILY_ID,
      title: "Spaghetti Bolognese",
      ingredients: [
        { name: "spaghetti", quantity: "500", unit: "g" },
        { name: "ground beef", quantity: "400", unit: "g" },
        { name: "tomato sauce", quantity: "2", unit: "cans" },
      ],
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getRecipes.mockResolvedValue([recipe]);
    mockStorage.addGroceryItem.mockResolvedValue({ id: "item-new" });

    const res = await request(app)
      .post("/api/recipes/r1/to-grocery-list")
      .send({ listId: "list-1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ added: 3 });
    expect(mockStorage.addGroceryItem).toHaveBeenCalledTimes(3);

    // Verify label format: "quantity unit name"
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith({
      listId: "list-1",
      name: "500 g spaghetti",
      autoAdded: true,
    });
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith({
      listId: "list-1",
      name: "400 g ground beef",
      autoAdded: true,
    });
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith({
      listId: "list-1",
      name: "2 cans tomato sauce",
      autoAdded: true,
    });
  });

  it("handles ingredients with missing quantity/unit (name only)", async () => {
    const recipe = {
      id: "r2",
      familyId: TEST_FAMILY_ID,
      title: "Simple Salad",
      ingredients: [
        { name: "lettuce" },
        { name: "olive oil", quantity: "2", unit: "tbsp" },
      ],
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getRecipes.mockResolvedValue([recipe]);
    mockStorage.addGroceryItem.mockResolvedValue({ id: "item-new" });

    const res = await request(app)
      .post("/api/recipes/r2/to-grocery-list")
      .send({ listId: "list-2" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ added: 2 });

    // Name-only ingredient should just use the name
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith({
      listId: "list-2",
      name: "lettuce",
      autoAdded: true,
    });
  });

  it("handles recipe with empty ingredients array", async () => {
    const recipe = {
      id: "r3",
      familyId: TEST_FAMILY_ID,
      title: "Empty Recipe",
      ingredients: [],
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getRecipes.mockResolvedValue([recipe]);

    const res = await request(app)
      .post("/api/recipes/r3/to-grocery-list")
      .send({ listId: "list-1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ added: 0 });
    expect(mockStorage.addGroceryItem).not.toHaveBeenCalled();
  });

  it("returns 400 when user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/recipes/r1/to-grocery-list")
      .send({ listId: "list-1" });

    expect(res.status).toBe(400);
  });
});
