import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
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

describe("GET /api/grocery-lists", () => {
  it("returns grocery lists for user with family", async () => {
    const lists = [
      { id: "list-1", familyId: TEST_FAMILY_ID, store: "Costco", items: [] },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getGroceryLists.mockResolvedValue(lists);

    const res = await request(app).get("/api/grocery-lists");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(lists);
    expect(mockStorage.getGroceryLists).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/grocery-lists");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/grocery-lists", () => {
  it("creates a grocery list", async () => {
    const newList = { id: "list-2", familyId: TEST_FAMILY_ID, store: "Aldi" };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createGroceryList.mockResolvedValue(newList);

    const res = await request(app)
      .post("/api/grocery-lists")
      .send({ store: "Aldi" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newList);
    expect(mockStorage.createGroceryList).toHaveBeenCalledWith(
      expect.objectContaining({ store: "Aldi", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/grocery-lists")
      .send({ store: "Aldi" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/grocery-items", () => {
  it("adds an item to a grocery list", async () => {
    const newItem = { id: "item-1", listId: "list-1", name: "Milk" };
    mockStorage.addGroceryItem.mockResolvedValue(newItem);

    const res = await request(app)
      .post("/api/grocery-items")
      .send({ listId: "list-1", name: "Milk" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newItem);
  });
});

describe("PATCH /api/grocery-items/:id", () => {
  it("updates a grocery item and strips auto-generated fields", async () => {
    const updated = { id: "item-1", listId: "list-1", name: "Milk", completed: true };
    mockStorage.updateGroceryItem.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/grocery-items/item-1")
      .send({ completed: true, id: "ignored", listId: "ignored", createdAt: "ignored" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateGroceryItem).toHaveBeenCalledWith("item-1", { completed: true });
  });
});

describe("DELETE /api/grocery-items/:id", () => {
  it("deletes a grocery item", async () => {
    mockStorage.deleteGroceryItem.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/grocery-items/item-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe("PATCH /api/grocery-lists/:id", () => {
  it("updates a grocery list and strips auto-generated fields", async () => {
    const updated = { id: "list-1", familyId: TEST_FAMILY_ID, store: "Target" };
    mockStorage.updateGroceryList.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/grocery-lists/list-1")
      .send({ store: "Target", id: "ignored", familyId: "ignored", createdAt: "ignored", updatedAt: "ignored" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateGroceryList).toHaveBeenCalledWith("list-1", { store: "Target" });
  });
});

describe("DELETE /api/grocery-lists/:id", () => {
  it("deletes a grocery list", async () => {
    mockStorage.deleteGroceryList.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/grocery-lists/list-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
