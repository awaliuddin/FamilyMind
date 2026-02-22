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

describe("GET /api/wishlist-items", () => {
  it("returns wishlist items for user with family", async () => {
    const items = [
      { id: "w1", familyId: TEST_FAMILY_ID, item: "Lego Set", person: "Kid", occasion: "Birthday" },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getWishListItems.mockResolvedValue(items);

    const res = await request(app).get("/api/wishlist-items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(items);
    expect(mockStorage.getWishListItems).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/wishlist-items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/wishlist-items", () => {
  it("creates a wishlist item", async () => {
    const newItem = { id: "w2", familyId: TEST_FAMILY_ID, item: "Book", person: "Mom", occasion: "Christmas" };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createWishListItem.mockResolvedValue(newItem);

    const res = await request(app)
      .post("/api/wishlist-items")
      .send({ item: "Book", person: "Mom", occasion: "Christmas" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newItem);
    expect(mockStorage.createWishListItem).toHaveBeenCalledWith(
      expect.objectContaining({ item: "Book", person: "Mom", occasion: "Christmas", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/wishlist-items")
      .send({ item: "Book", person: "Mom", occasion: "Christmas" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/wishlist-items/:id", () => {
  it("updates a wishlist item", async () => {
    const updated = { id: "w1", item: "Lego Set", purchased: true };
    mockStorage.updateWishListItem.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/wishlist-items/w1")
      .send({ purchased: true });

    expect(res.status).toBe(200);
    expect(mockStorage.updateWishListItem).toHaveBeenCalledWith("w1", { purchased: true });
  });
});

describe("DELETE /api/wishlist-items/:id", () => {
  it("deletes a wishlist item", async () => {
    mockStorage.deleteWishListItem.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/wishlist-items/w1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
