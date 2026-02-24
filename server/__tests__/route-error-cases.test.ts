import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
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

// --- Grocery error cases ---
describe("Grocery routes — error cases", () => {
  it("GET /api/grocery-lists returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/grocery-lists");
    expect(res.status).toBe(500);
  });

  it("POST /api/grocery-items returns 500 on storage error", async () => {
    mockStorage.addGroceryItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/grocery-items")
      .send({ listId: "l1", name: "Milk" });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/grocery-items/:id returns 500 on storage error", async () => {
    mockStorage.deleteGroceryItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/grocery-items/bad-id");
    expect(res.status).toBe(500);
  });

  it("DELETE /api/grocery-lists/:id returns 500 on storage error", async () => {
    mockStorage.deleteGroceryList.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/grocery-lists/bad-id");
    expect(res.status).toBe(500);
  });
});

// --- Calendar error cases ---
describe("Calendar routes — error cases", () => {
  it("POST /api/calendar-events returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createCalendarEvent.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/calendar-events")
      .send({
        title: "Meeting",
        startTime: "2026-03-01T10:00:00Z",
        endTime: "2026-03-01T11:00:00Z",
        eventType: "work",
      });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/calendar-events/:id returns 500 on storage error", async () => {
    mockStorage.deleteCalendarEvent.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/calendar-events/bad-id");
    expect(res.status).toBe(500);
  });
});

// --- Ideas error cases ---
describe("Ideas routes — error cases", () => {
  it("POST /api/family-ideas returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createFamilyIdea.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/family-ideas")
      .send({ title: "Game night", author: "Mom" });
    expect(res.status).toBe(500);
  });

  it("POST /api/family-ideas/:id/like returns 500 on storage error", async () => {
    mockStorage.likeIdea.mockRejectedValue(new Error("DB down"));
    const res = await request(app).post("/api/family-ideas/idea-1/like");
    expect(res.status).toBe(500);
  });

  it("DELETE /api/family-ideas/:id/like returns 500 on storage error", async () => {
    mockStorage.unlikeIdea.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/family-ideas/idea-1/like");
    expect(res.status).toBe(500);
  });
});

// --- Vision error cases ---
describe("Vision routes — error cases", () => {
  it("POST /api/vision-items returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createVisionItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/vision-items")
      .send({ title: "Save for trip", author: "Dad", color: "#4ecdc4" });
    expect(res.status).toBe(500);
  });

  it("PATCH /api/vision-items/:id returns 500 on storage error", async () => {
    mockStorage.updateVisionItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .patch("/api/vision-items/v1")
      .send({ progress: 50 });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/vision-items/:id returns 500 on storage error", async () => {
    mockStorage.deleteVisionItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/vision-items/v1");
    expect(res.status).toBe(500);
  });
});

// --- Wishlist error cases ---
describe("Wishlist routes — error cases", () => {
  it("POST /api/wishlist-items returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createWishListItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/wishlist-items")
      .send({ item: "LEGO", person: "Emma", occasion: "birthday" });
    expect(res.status).toBe(500);
  });

  it("PATCH /api/wishlist-items/:id returns 500 on storage error", async () => {
    mockStorage.updateWishListItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .patch("/api/wishlist-items/w1")
      .send({ purchased: true });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/wishlist-items/:id returns 500 on storage error", async () => {
    mockStorage.deleteWishListItem.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/wishlist-items/w1");
    expect(res.status).toBe(500);
  });
});

// --- Recipe error cases ---
describe("Recipe routes — error cases", () => {
  it("POST /api/recipes returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createRecipe.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/recipes")
      .send({ title: "Pancakes" });
    expect(res.status).toBe(500);
  });

  it("PATCH /api/recipes/:id returns 500 on storage error", async () => {
    mockStorage.updateRecipe.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .patch("/api/recipes/r1")
      .send({ title: "Updated" });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/recipes/:id returns 500 on storage error", async () => {
    mockStorage.deleteRecipe.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/recipes/r1");
    expect(res.status).toBe(500);
  });
});

// --- Budget error cases ---
describe("Budget routes — error cases", () => {
  it("POST /api/budgets returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createBudget.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/budgets")
      .send({ name: "Food", amount: "500" });
    expect(res.status).toBe(500);
  });

  it("PATCH /api/budgets/:id returns 500 on storage error", async () => {
    mockStorage.updateBudget.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .patch("/api/budgets/b1")
      .send({ name: "Updated" });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/budgets/:id returns 500 on storage error", async () => {
    mockStorage.deleteBudget.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/budgets/b1");
    expect(res.status).toBe(500);
  });

  it("POST /api/expenses returns 500 on storage error", async () => {
    mockStorage.createExpense.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/expenses")
      .send({ budgetId: "b1", amount: "25", description: "Lunch", date: "2026-03-01" });
    expect(res.status).toBe(500);
  });

  it("PATCH /api/expenses/:id returns 500 on storage error", async () => {
    mockStorage.updateExpense.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .patch("/api/expenses/e1")
      .send({ amount: "30" });
    expect(res.status).toBe(500);
  });

  it("DELETE /api/expenses/:id returns 500 on storage error", async () => {
    mockStorage.deleteExpense.mockRejectedValue(new Error("DB down"));
    const res = await request(app).delete("/api/expenses/e1");
    expect(res.status).toBe(500);
  });

  it("GET /api/budgets/summary/:month returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getBudgets.mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/budgets/summary/2026-03");
    expect(res.status).toBe(500);
  });
});

// --- Family error cases ---
describe("Family routes — error cases", () => {
  it("POST /api/family/create returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/family/create")
      .send({ name: "Test Family" });
    expect(res.status).toBe(500);
  });

  it("POST /api/family/join returns 500 on storage error", async () => {
    mockStorage.getFamilyByInviteCode.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/family/join")
      .send({ inviteCode: "ABC123" });
    expect(res.status).toBe(500);
  });

  it("GET /api/family returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/family");
    expect(res.status).toBe(500);
  });
});

// --- Family members error cases ---
describe("Family members routes — error cases", () => {
  it("GET /api/family-members returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/family-members");
    expect(res.status).toBe(500);
  });

  it("POST /api/family-members returns 500 on storage error", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createFamilyMember.mockRejectedValue(new Error("DB down"));
    const res = await request(app)
      .post("/api/family-members")
      .send({ name: "Kiddo", role: "child", color: "#ff0000" });
    expect(res.status).toBe(500);
  });
});
