import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
  testFamily,
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

describe("POST /api/family/create", () => {
  it("creates a family and joins user to it", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);
    mockStorage.createFamily.mockResolvedValue(testFamily);
    mockStorage.joinFamily.mockResolvedValue({ ...testUserNoFamily, familyId: TEST_FAMILY_ID });

    const res = await request(app)
      .post("/api/family/create")
      .send({ name: "Test Family" });

    expect(res.status).toBe(200);
    expect(res.body.family).toBeDefined();
    expect(mockStorage.createFamily).toHaveBeenCalled();
    expect(mockStorage.joinFamily).toHaveBeenCalledWith(TEST_USER_ID, TEST_FAMILY_ID);
  });

  it("rejects if user already in a family", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    const res = await request(app)
      .post("/api/family/create")
      .send({ name: "Another Family" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/family/join", () => {
  it("joins user to family via invite code", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);
    mockStorage.getFamilyByInviteCode.mockResolvedValue(testFamily);
    mockStorage.joinFamily.mockResolvedValue({ ...testUserNoFamily, familyId: TEST_FAMILY_ID });

    const res = await request(app)
      .post("/api/family/join")
      .send({ inviteCode: "ABC123" });

    expect(res.status).toBe(200);
    expect(res.body.family).toBeDefined();
  });

  it("rejects invalid invite code", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);
    mockStorage.getFamilyByInviteCode.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/family/join")
      .send({ inviteCode: "INVALID" });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/family", () => {
  it("returns family data for user with family", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamily.mockResolvedValue(testFamily);

    const res = await request(app).get("/api/family");

    expect(res.status).toBe(200);
    // The first registered handler returns the family object directly
    expect(res.body.id).toBe(TEST_FAMILY_ID);
    expect(res.body.name).toBe("Test Family");
  });

  it("returns 404 if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/family");

    expect(res.status).toBe(404);
  });
});
