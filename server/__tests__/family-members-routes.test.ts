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

describe("GET /api/family-members", () => {
  it("returns members for user with family", async () => {
    const members = [
      { id: "m-1", familyId: TEST_FAMILY_ID, name: "Mom", role: "parent", color: "#ff6b6b" },
      { id: "m-2", familyId: TEST_FAMILY_ID, name: "Emma", role: "child", color: "#4ecdc4" },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue(members);

    const res = await request(app).get("/api/family-members");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(members);
    expect(mockStorage.getFamilyMembers).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/family-members");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/family-members", () => {
  it("creates a family member", async () => {
    const newMember = { id: "m-3", familyId: TEST_FAMILY_ID, name: "Dad", role: "parent", color: "#45b7d1" };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([]); // under free cap
    mockStorage.createFamilyMember.mockResolvedValue(newMember);

    const res = await request(app)
      .post("/api/family-members")
      .send({ name: "Dad", role: "parent", color: "#45b7d1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newMember);
    expect(mockStorage.createFamilyMember).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Dad", role: "parent", color: "#45b7d1", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/family-members")
      .send({ name: "Dad", role: "parent", color: "#45b7d1" });

    expect(res.status).toBe(400);
  });
});
