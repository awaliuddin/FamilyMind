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

describe("GET /api/family-ideas", () => {
  it("returns ideas for user with family", async () => {
    const ideas = [
      { id: "idea-1", familyId: TEST_FAMILY_ID, title: "Disney trip", author: "Mom", likes: 2 },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyIdeas.mockResolvedValue(ideas);

    const res = await request(app).get("/api/family-ideas");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(ideas);
    expect(mockStorage.getFamilyIdeas).toHaveBeenCalledWith(TEST_FAMILY_ID, TEST_USER_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/family-ideas");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/family-ideas", () => {
  it("creates an idea", async () => {
    const newIdea = { id: "idea-2", familyId: TEST_FAMILY_ID, title: "Game night", author: "Dad" };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createFamilyIdea.mockResolvedValue(newIdea);

    const res = await request(app)
      .post("/api/family-ideas")
      .send({ title: "Game night", author: "Dad" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newIdea);
    expect(mockStorage.createFamilyIdea).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Game night", author: "Dad", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/family-ideas")
      .send({ title: "Game night", author: "Dad" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/family-ideas/:id/like", () => {
  it("likes an idea", async () => {
    mockStorage.likeIdea.mockResolvedValue(undefined);

    const res = await request(app).post("/api/family-ideas/idea-1/like").send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(mockStorage.likeIdea).toHaveBeenCalledWith("idea-1", TEST_USER_ID);
  });
});

describe("DELETE /api/family-ideas/:id/like", () => {
  it("unlikes an idea", async () => {
    mockStorage.unlikeIdea.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/family-ideas/idea-1/like");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(mockStorage.unlikeIdea).toHaveBeenCalledWith("idea-1", TEST_USER_ID);
  });
});
