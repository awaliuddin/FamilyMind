import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";

const TEST_USER_ID = "test-user-1";
const TEST_FAMILY_ID = "test-family-1";

const testUser = {
  id: TEST_USER_ID,
  email: "test@familymind.test",
  firstName: "Test",
  lastName: "User",
  familyId: TEST_FAMILY_ID,
  role: "owner",
};

const testUserNoFamily = { ...testUser, id: "no-fam", familyId: null };

const mockStorage = {
  getUser: vi.fn(),
  upsertUser: vi.fn(),
  createFamily: vi.fn(),
  getFamily: vi.fn(),
  getFamilyByInviteCode: vi.fn(),
  joinFamily: vi.fn(),
  generateInviteCode: vi.fn().mockReturnValue("XYZ789"),
  createFamilyInvitation: vi.fn(),
  getFamilyInvitations: vi.fn(),
  getFamilyMembers: vi.fn(),
  createFamilyMember: vi.fn(),
  getGroceryLists: vi.fn(),
  createGroceryList: vi.fn(),
  addGroceryItem: vi.fn(),
  updateGroceryItem: vi.fn(),
  deleteGroceryItem: vi.fn(),
  updateGroceryList: vi.fn(),
  deleteGroceryList: vi.fn(),
  getCalendarEvents: vi.fn(),
  createCalendarEvent: vi.fn(),
  updateCalendarEvent: vi.fn(),
  deleteCalendarEvent: vi.fn(),
  getFamilyIdeas: vi.fn(),
  createFamilyIdea: vi.fn(),
  likeIdea: vi.fn(),
  unlikeIdea: vi.fn(),
  getVisionItems: vi.fn(),
  createVisionItem: vi.fn(),
  updateVisionItem: vi.fn(),
  deleteVisionItem: vi.fn(),
  getWishListItems: vi.fn(),
  createWishListItem: vi.fn(),
  updateWishListItem: vi.fn(),
  deleteWishListItem: vi.fn(),
  getRecipes: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
  getBudgets: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  getSubscription: vi.fn(),
  upsertSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  getChatMessages: vi.fn(),
  createChatMessage: vi.fn(),
};

const mockStripeCheckoutCreate = vi.fn();
const mockStripeSubscriptionsRetrieve = vi.fn();
const mockStripeWebhooksConstructEvent = vi.fn();

vi.doMock("../storage", () => ({ storage: mockStorage }));

vi.doMock("../replitAuth", () => ({
  setupAuth: vi.fn(async (app: express.Express) => {
    app.use((req: any, _res: any, next: any) => {
      req.user = { claims: { sub: TEST_USER_ID } };
      req.isAuthenticated = () => true;
      next();
    });
  }),
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
}));

vi.doMock("../openai", () => ({
  getFamilyAssistantResponse: vi.fn(),
  generateGroceryPredictions: vi.fn(),
  detectScheduleConflicts: vi.fn(),
}));

vi.doMock("../stripe", () => ({
  stripe: {
    checkout: { sessions: { create: mockStripeCheckoutCreate } },
    subscriptions: { retrieve: mockStripeSubscriptionsRetrieve },
    webhooks: { constructEvent: mockStripeWebhooksConstructEvent },
  },
  isStripeConfigured: vi.fn().mockReturnValue(true),
  STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
}));

let app: express.Express;

beforeAll(async () => {
  const { registerRoutes } = await import("../routes");
  app = express();
  app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());
  await registerRoutes(app);
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/billing/create-checkout (Stripe configured)", () => {
  it("creates a checkout session and returns url", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStripeCheckoutCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const res = await request(app)
      .post("/api/billing/create-checkout")
      .send({ priceId: "price_premium_monthly" });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://checkout.stripe.com/session_123");
    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: "price_premium_monthly", quantity: 1 }],
        metadata: { familyId: TEST_FAMILY_ID },
      }),
    );
  });

  it("returns 400 when priceId is missing", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    const res = await request(app)
      .post("/api/billing/create-checkout")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("priceId is required");
  });

  it("returns 400 when user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/billing/create-checkout")
      .send({ priceId: "price_123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Must be part of a family to subscribe");
  });
});

describe("POST /api/billing/webhook (Stripe configured)", () => {
  it("handles checkout.session.completed and upserts subscription", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_abc",
          subscription: "sub_xyz",
          metadata: { familyId: TEST_FAMILY_ID },
        },
      },
    };

    mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
    mockStripeSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_xyz",
      items: {
        data: [{ price: { id: "price_premium_monthly" }, current_period_end: 1735689600 }],
      },
    });
    mockStorage.upsertSubscription.mockResolvedValue({});

    const res = await request(app)
      .post("/api/billing/webhook")
      .set("stripe-signature", "sig_valid")
      .set("content-type", "application/json")
      .send(JSON.stringify(mockEvent));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(mockStorage.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: TEST_FAMILY_ID,
        stripeCustomerId: "cus_abc",
        stripePriceId: "price_premium_monthly",
        stripeSubscriptionId: "sub_xyz",
        status: "active",
      }),
    );
  });

  it("handles customer.subscription.updated event", async () => {
    const mockEvent = {
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_xyz",
          status: "past_due",
          metadata: { familyId: TEST_FAMILY_ID },
          items: { data: [{ current_period_end: 1735689600 }] },
        },
      },
    };

    mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
    mockStorage.updateSubscription.mockResolvedValue({});

    const res = await request(app)
      .post("/api/billing/webhook")
      .set("stripe-signature", "sig_valid")
      .set("content-type", "application/json")
      .send(JSON.stringify(mockEvent));

    expect(res.status).toBe(200);
    expect(mockStorage.updateSubscription).toHaveBeenCalledWith(
      TEST_FAMILY_ID,
      expect.objectContaining({ status: "past_due" }),
    );
  });

  it("handles customer.subscription.deleted event", async () => {
    const mockEvent = {
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_xyz",
          metadata: { familyId: TEST_FAMILY_ID },
        },
      },
    };

    mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
    mockStorage.updateSubscription.mockResolvedValue({});

    const res = await request(app)
      .post("/api/billing/webhook")
      .set("stripe-signature", "sig_valid")
      .set("content-type", "application/json")
      .send(JSON.stringify(mockEvent));

    expect(res.status).toBe(200);
    expect(mockStorage.updateSubscription).toHaveBeenCalledWith(
      TEST_FAMILY_ID,
      { status: "canceled" },
    );
  });

  it("returns 400 when webhook signature is missing", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .set("content-type", "application/json")
      .send(JSON.stringify({ type: "test" }));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing signature or webhook secret");
  });

  it("returns 400 when webhook signature is invalid", async () => {
    mockStripeWebhooksConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await request(app)
      .post("/api/billing/webhook")
      .set("stripe-signature", "sig_invalid")
      .set("content-type", "application/json")
      .send(JSON.stringify({ type: "test" }));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid webhook signature");
  });
});
