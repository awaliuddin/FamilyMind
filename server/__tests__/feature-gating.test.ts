import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
  testFamily,
  TEST_USER_ID,
  TEST_FAMILY_ID,
} from "./test-helpers";

let app: express.Express;
let mockStorage: ReturnType<typeof createMockStorage>;

beforeAll(async () => {
  const testApp = await createTestApp();
  app = testApp.app;
  mockStorage = testApp.mockStorage;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const activeSub = {
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

const expiredSub = {
  status: "active",
  currentPeriodEnd: new Date(Date.now() - 1000),
};

const canceledSub = {
  status: "canceled",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

// ============================================================
// AI Route Gating (4 tests)
// ============================================================
describe("AI route gating — premium only", () => {
  it("blocks free user from GET /api/chat-messages", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("blocks free user from POST /api/chat", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Hello" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("blocks free user from GET /api/ai/grocery-predictions", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/ai/grocery-predictions");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("blocks free user from GET /api/ai/schedule-conflicts", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/ai/schedule-conflicts");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium subscription required");
  });

  it("allows premium user to access GET /api/chat-messages", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(activeSub);
    mockStorage.getChatMessages.mockResolvedValue([]);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("blocks user with expired subscription from AI routes", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(expiredSub);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(403);
  });

  it("blocks user with canceled subscription from AI routes", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(canceledSub);

    const res = await request(app).get("/api/ai/grocery-predictions");

    expect(res.status).toBe(403);
  });
});

// ============================================================
// Member Cap Enforcement (6 tests)
// ============================================================
describe("family member cap — free tier max 2", () => {
  const newMember = { name: "New Member", role: "child", color: "#FF0000" };

  it("allows adding a member when under the cap (0 existing)", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([]);
    mockStorage.createFamilyMember.mockResolvedValue({ id: "m1", ...newMember, familyId: TEST_FAMILY_ID });

    const res = await request(app)
      .post("/api/family-members")
      .send(newMember);

    expect(res.status).toBe(200);
    expect(mockStorage.createFamilyMember).toHaveBeenCalled();
  });

  it("allows adding a member when under the cap (1 existing)", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([{ id: "m0", name: "Existing", familyId: TEST_FAMILY_ID }]);
    mockStorage.getSubscription.mockResolvedValue(undefined);
    mockStorage.createFamilyMember.mockResolvedValue({ id: "m1", ...newMember, familyId: TEST_FAMILY_ID });

    const res = await request(app)
      .post("/api/family-members")
      .send(newMember);

    expect(res.status).toBe(200);
  });

  it("blocks adding a 3rd member on free tier (2 existing)", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([
      { id: "m1", name: "Member 1", familyId: TEST_FAMILY_ID },
      { id: "m2", name: "Member 2", familyId: TEST_FAMILY_ID },
    ]);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/family-members")
      .send(newMember);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("MEMBER_LIMIT_REACHED");
    expect(res.body.upgradeUrl).toBe("/premium");
  });

  it("blocks adding a 3rd member with expired subscription", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([
      { id: "m1", name: "Member 1", familyId: TEST_FAMILY_ID },
      { id: "m2", name: "Member 2", familyId: TEST_FAMILY_ID },
    ]);
    mockStorage.getSubscription.mockResolvedValue(expiredSub);

    const res = await request(app)
      .post("/api/family-members")
      .send(newMember);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("MEMBER_LIMIT_REACHED");
  });

  it("allows premium user to add unlimited members (3rd+)", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([
      { id: "m1", name: "Member 1", familyId: TEST_FAMILY_ID },
      { id: "m2", name: "Member 2", familyId: TEST_FAMILY_ID },
    ]);
    mockStorage.getSubscription.mockResolvedValue(activeSub);
    mockStorage.createFamilyMember.mockResolvedValue({ id: "m3", ...newMember, familyId: TEST_FAMILY_ID });

    const res = await request(app)
      .post("/api/family-members")
      .send(newMember);

    expect(res.status).toBe(200);
    expect(mockStorage.createFamilyMember).toHaveBeenCalled();
  });

  it("allows premium user to add many members (10 existing)", async () => {
    const existingMembers = Array.from({ length: 10 }, (_, i) => ({
      id: `m${i}`,
      name: `Member ${i}`,
      familyId: TEST_FAMILY_ID,
    }));

    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue(existingMembers);
    mockStorage.getSubscription.mockResolvedValue(activeSub);
    mockStorage.createFamilyMember.mockResolvedValue({ id: "m11", ...newMember, familyId: TEST_FAMILY_ID });

    const res = await request(app)
      .post("/api/family-members")
      .send(newMember);

    expect(res.status).toBe(200);
  });
});

// ============================================================
// Billing Status — memberLimit & aiEnabled (5 tests)
// ============================================================
describe("GET /api/billing/status — includes memberLimit and aiEnabled", () => {
  it("returns memberLimit=2 and aiEnabled=false for user with no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
    expect(res.body.memberLimit).toBe(2);
    expect(res.body.aiEnabled).toBe(false);
  });

  it("returns memberLimit=2 and aiEnabled=false for free user with family", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
    expect(res.body.memberLimit).toBe(2);
    expect(res.body.aiEnabled).toBe(false);
  });

  it("returns memberLimit=null and aiEnabled=true for premium user", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(activeSub);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(true);
    expect(res.body.memberLimit).toBeNull();
    expect(res.body.aiEnabled).toBe(true);
  });

  it("returns free-tier limits when subscription is expired", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(expiredSub);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
    expect(res.body.memberLimit).toBe(2);
    expect(res.body.aiEnabled).toBe(false);
  });

  it("returns free-tier limits when subscription is canceled", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(canceledSub);

    const res = await request(app).get("/api/billing/status");

    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
    expect(res.body.memberLimit).toBe(2);
    expect(res.body.aiEnabled).toBe(false);
  });
});

// ============================================================
// Upgrade URL in 403 responses (2 tests)
// ============================================================
describe("upgrade URL in gating responses", () => {
  it("includes upgradeUrl in AI 403 response", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(403);
    expect(res.body.upgradeUrl).toBe("/premium");
  });

  it("includes upgradeUrl in member cap 403 response", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getFamilyMembers.mockResolvedValue([
      { id: "m1", name: "A", familyId: TEST_FAMILY_ID },
      { id: "m2", name: "B", familyId: TEST_FAMILY_ID },
    ]);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/family-members")
      .send({ name: "C", role: "child", color: "#000" });

    expect(res.status).toBe(403);
    expect(res.body.upgradeUrl).toBe("/premium");
  });
});
