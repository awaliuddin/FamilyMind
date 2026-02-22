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

describe("GET /api/budgets", () => {
  it("returns budgets for user with family", async () => {
    const budgets = [
      { id: "b1", familyId: TEST_FAMILY_ID, name: "Groceries", amount: "500", expenses: [] },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getBudgets.mockResolvedValue(budgets);

    const res = await request(app).get("/api/budgets");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(budgets);
    expect(mockStorage.getBudgets).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/budgets");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/budgets", () => {
  it("creates a budget", async () => {
    const newBudget = { id: "b2", familyId: TEST_FAMILY_ID, name: "Dining", amount: "200" };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createBudget.mockResolvedValue(newBudget);

    const res = await request(app)
      .post("/api/budgets")
      .send({ name: "Dining", amount: "200", category: "dining" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newBudget);
    expect(mockStorage.createBudget).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Dining", amount: "200", familyId: TEST_FAMILY_ID }),
    );
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/budgets")
      .send({ name: "Dining", amount: "200" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/budgets/:id", () => {
  it("updates a budget and strips auto-generated fields", async () => {
    const updated = { id: "b1", name: "Updated Groceries", amount: "600" };
    mockStorage.updateBudget.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/budgets/b1")
      .send({ name: "Updated Groceries", amount: "600", id: "ignored", familyId: "ignored", createdAt: "ignored", updatedAt: "ignored" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateBudget).toHaveBeenCalledWith("b1", { name: "Updated Groceries", amount: "600" });
  });
});

describe("DELETE /api/budgets/:id", () => {
  it("deletes a budget", async () => {
    mockStorage.deleteBudget.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/budgets/b1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe("POST /api/expenses", () => {
  it("creates an expense", async () => {
    const newExpense = { id: "e1", budgetId: "b1", amount: "45.50", description: "Costco trip", date: "2026-02-20" };
    mockStorage.createExpense.mockResolvedValue(newExpense);

    const res = await request(app)
      .post("/api/expenses")
      .send({ budgetId: "b1", amount: "45.50", description: "Costco trip", date: "2026-02-20" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newExpense);
  });
});

describe("DELETE /api/expenses/:id", () => {
  it("deletes an expense", async () => {
    mockStorage.deleteExpense.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/expenses/e1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe("GET /api/budgets/summary/:month", () => {
  it("returns monthly summary with spending totals", async () => {
    const budgets = [
      {
        id: "b1", familyId: TEST_FAMILY_ID, name: "Groceries", amount: "500",
        category: "groceries", period: "monthly",
        expenses: [
          { id: "e1", budgetId: "b1", amount: "120", description: "Costco", date: "2026-03-05", category: "groceries" },
          { id: "e2", budgetId: "b1", amount: "80", description: "Trader Joes", date: "2026-03-12", category: "groceries" },
          { id: "e3", budgetId: "b1", amount: "50", description: "Feb leftover", date: "2026-02-28", category: "groceries" },
        ],
      },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getBudgets.mockResolvedValue(budgets);

    const res = await request(app).get("/api/budgets/summary/2026-03");

    expect(res.status).toBe(200);
    // Only March expenses should count
    expect(res.body.budgets[0].spent).toBe(200); // 120 + 80
    expect(res.body.budgets[0].remaining).toBe(300); // 500 - 200
    expect(res.body.totalBudgeted).toBe(500);
    expect(res.body.totalSpent).toBe(200);
  });

  it("returns empty summary for user with no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/budgets/summary/2026-03");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ budgets: [], totalBudgeted: 0, totalSpent: 0 });
  });
});
