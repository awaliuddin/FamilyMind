import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  TEST_USER_ID,
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

describe("GET /api/auth/user", () => {
  it("returns user data on success", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    const res = await request(app).get("/api/auth/user");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TEST_USER_ID);
    expect(res.body.email).toBe("test@familymind.test");
  });

  it("returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/auth/user");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to fetch user");
  });

  it("returns expected user data shape", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    const res = await request(app).get("/api/auth/user");

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email");
    expect(res.body).toHaveProperty("firstName");
    expect(res.body).toHaveProperty("lastName");
    expect(res.body).toHaveProperty("familyId");
  });
});
