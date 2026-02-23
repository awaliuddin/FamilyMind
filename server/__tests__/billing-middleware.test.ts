import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
  TEST_USER_ID,
  TEST_FAMILY_ID,
} from "./test-helpers";

let requirePremium: any;
let mockStorage: ReturnType<typeof createMockStorage>;

beforeAll(async () => {
  const testApp = await createTestApp();
  mockStorage = testApp.mockStorage;
  const mod = await import("../routes");
  requirePremium = mod.requirePremium;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function buildPremiumApp() {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { claims: { sub: TEST_USER_ID } };
    req.isAuthenticated = () => true;
    next();
  });
  app.get("/test-premium", requirePremium, (_req: any, res: any) => {
    res.json({ access: "granted" });
  });
  return app;
}

describe("requirePremium middleware", () => {
  it("grants access when subscription is active and period is in the future", async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      status: "active",
      currentPeriodEnd: futureDate,
    });

    const app = buildPremiumApp();
    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(200);
    expect(res.body.access).toBe("granted");
  });

  it("denies access when no subscription exists", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const app = buildPremiumApp();
    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("denies access when subscription is canceled", async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      status: "canceled",
      currentPeriodEnd: futureDate,
    });

    const app = buildPremiumApp();
    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("denies access when subscription is past_due", async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      status: "past_due",
      currentPeriodEnd: futureDate,
    });

    const app = buildPremiumApp();
    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("denies access when period has expired even if status is active", async () => {
    const pastDate = new Date(Date.now() - 1000);
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      status: "active",
      currentPeriodEnd: pastDate,
    });

    const app = buildPremiumApp();
    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("denies access when user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const app = buildPremiumApp();
    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("returns 401 when no user claims present", async () => {
    const app = express();
    app.use(express.json());
    app.get("/test-premium", requirePremium, (_req: any, res: any) => {
      res.json({ access: "granted" });
    });

    const res = await request(app).get("/test-premium");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
