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

describe("GET /api/recipes", () => {
  it("returns recipes for user with family", async () => {
    const recipes = [
      { id: "r1", familyId: TEST_FAMILY_ID, title: "Pasta", ingredients: [] },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getRecipes.mockResolvedValue(recipes);

    const res = await request(app).get("/api/recipes");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(recipes);
    expect(mockStorage.getRecipes).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/recipes");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/recipes", () => {
  it("creates a recipe", async () => {
    const newRecipe = { id: "r2", familyId: TEST_FAMILY_ID, title: "Tacos" };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createRecipe.mockResolvedValue(newRecipe);

    const res = await request(app)
      .post("/api/recipes")
      .send({ title: "Tacos" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newRecipe);
    expect(mockStorage.createRecipe).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Tacos", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/recipes")
      .send({ title: "Tacos" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/recipes/:id", () => {
  it("updates a recipe and strips auto-generated fields", async () => {
    const updated = { id: "r1", title: "Updated Pasta" };
    mockStorage.updateRecipe.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/recipes/r1")
      .send({ title: "Updated Pasta", id: "ignored", familyId: "ignored", createdAt: "ignored", updatedAt: "ignored" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateRecipe).toHaveBeenCalledWith("r1", { title: "Updated Pasta" });
  });
});

describe("DELETE /api/recipes/:id", () => {
  it("deletes a recipe", async () => {
    mockStorage.deleteRecipe.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/recipes/r1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe("POST /api/recipes/:id/to-grocery-list", () => {
  it("adds recipe ingredients to grocery list", async () => {
    const recipe = {
      id: "r1",
      familyId: TEST_FAMILY_ID,
      title: "Pasta",
      ingredients: [
        { name: "spaghetti", quantity: "500", unit: "g" },
        { name: "tomato sauce", quantity: "1", unit: "jar" },
      ],
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getRecipes.mockResolvedValue([recipe]);
    mockStorage.addGroceryItem.mockResolvedValue({ id: "item-1" });

    const res = await request(app)
      .post("/api/recipes/r1/to-grocery-list")
      .send({ listId: "list-1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ added: 2 });
    expect(mockStorage.addGroceryItem).toHaveBeenCalledTimes(2);
    expect(mockStorage.addGroceryItem).toHaveBeenCalledWith({
      listId: "list-1",
      name: "500 g spaghetti",
      autoAdded: true,
    });
  });

  it("returns 404 if recipe not found", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getRecipes.mockResolvedValue([]);

    const res = await request(app)
      .post("/api/recipes/nonexistent/to-grocery-list")
      .send({ listId: "list-1" });

    expect(res.status).toBe(404);
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/recipes/r1/to-grocery-list")
      .send({ listId: "list-1" });

    expect(res.status).toBe(400);
  });
});
