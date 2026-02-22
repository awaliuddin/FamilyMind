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

describe("GET /api/vision-items", () => {
  it("returns vision items for user with family", async () => {
    const items = [
      { id: "v1", familyId: TEST_FAMILY_ID, title: "Family Vacation", author: "Dad", color: "blue" },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getVisionItems.mockResolvedValue(items);

    const res = await request(app).get("/api/vision-items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(items);
    expect(mockStorage.getVisionItems).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/vision-items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/vision-items", () => {
  it("creates a vision item", async () => {
    const newItem = {
      id: "v2", familyId: TEST_FAMILY_ID, title: "New House",
      author: "Mom", color: "green",
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createVisionItem.mockResolvedValue(newItem);

    const res = await request(app)
      .post("/api/vision-items")
      .send({ title: "New House", author: "Mom", color: "green" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newItem);
    expect(mockStorage.createVisionItem).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New House", author: "Mom", color: "green", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/vision-items")
      .send({ title: "New House", author: "Mom", color: "green" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/vision-items/:id", () => {
  it("updates a vision item", async () => {
    const updated = { id: "v1", title: "Family Vacation", progress: 75 };
    mockStorage.updateVisionItem.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/vision-items/v1")
      .send({ progress: 75 });

    expect(res.status).toBe(200);
    expect(mockStorage.updateVisionItem).toHaveBeenCalledWith("v1", { progress: 75 });
  });
});

describe("DELETE /api/vision-items/:id", () => {
  it("deletes a vision item", async () => {
    mockStorage.deleteVisionItem.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/vision-items/v1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
