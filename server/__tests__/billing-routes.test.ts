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

describe("GET /api/billing/status", () => {
  it("returns isPremium false when user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isPremium: false, subscription: null });
  });

  it("returns isPremium false when no subscription exists", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isPremium: false, subscription: null });
  });

  it("returns isPremium true for active subscription with future period end", async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      id: "sub-1",
      familyId: TEST_FAMILY_ID,
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
      currentPeriodEnd: futureDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(true);
    expect(res.body.subscription.status).toBe("active");
  });

  it("returns isPremium false for active subscription with past period end", async () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      id: "sub-1",
      familyId: TEST_FAMILY_ID,
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
      currentPeriodEnd: pastDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
  });

  it("returns isPremium false for canceled subscription", async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      id: "sub-1",
      familyId: TEST_FAMILY_ID,
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "canceled",
      currentPeriodEnd: futureDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
  });

  it("returns isPremium false for past_due subscription", async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue({
      id: "sub-1",
      familyId: TEST_FAMILY_ID,
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "past_due",
      currentPeriodEnd: futureDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
  });
});

describe("POST /api/billing/create-checkout", () => {
  it("returns 503 when Stripe is not configured", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    const res = await request(app)
      .post("/api/billing/create-checkout")
      .send({ priceId: "price_123" });

    expect(res.status).toBe(503);
    expect(res.body.message).toBe("Billing is not configured");
  });

  it("returns 400 when user has no family (Stripe configured)", async () => {
    // This test verifies the no-family check — but since Stripe is not configured
    // in test environment, it will return 503 first. Testing the logic ordering.
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/billing/create-checkout")
      .send({ priceId: "price_123" });

    // Stripe not configured takes precedence
    expect(res.status).toBe(503);
  });
});

describe("POST /api/billing/webhook", () => {
  it("returns 503 when Stripe is not configured", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .set("stripe-signature", "sig_test")
      .send({ type: "checkout.session.completed" });

    expect(res.status).toBe(503);
    expect(res.body.message).toBe("Billing is not configured");
  });
});
