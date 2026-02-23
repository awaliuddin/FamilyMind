import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
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

describe("Budget tracking flow: create → expenses → summary", () => {
  it("creates budget, adds expenses, then checks monthly summary", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Step 1: Create a budget
    const budget = { id: "b1", familyId: TEST_FAMILY_ID, name: "Groceries", amount: "500", category: "groceries", period: "monthly" };
    mockStorage.createBudget.mockResolvedValue(budget);

    const budgetRes = await request(app)
      .post("/api/budgets")
      .send({ name: "Groceries", amount: "500", category: "groceries" });

    expect(budgetRes.status).toBe(200);
    expect(budgetRes.body.name).toBe("Groceries");

    // Step 2: Add expenses to the budget
    const expense1 = { id: "e1", budgetId: "b1", amount: "120", description: "Costco run", date: "2026-03-05", category: "groceries" };
    const expense2 = { id: "e2", budgetId: "b1", amount: "85.50", description: "Trader Joes", date: "2026-03-12", category: "groceries" };
    mockStorage.createExpense
      .mockResolvedValueOnce(expense1)
      .mockResolvedValueOnce(expense2);

    const exp1Res = await request(app)
      .post("/api/expenses")
      .send({ budgetId: "b1", amount: "120", description: "Costco run", date: "2026-03-05" });
    expect(exp1Res.status).toBe(200);

    const exp2Res = await request(app)
      .post("/api/expenses")
      .send({ budgetId: "b1", amount: "85.50", description: "Trader Joes", date: "2026-03-12" });
    expect(exp2Res.status).toBe(200);

    // Step 3: Check monthly summary — should aggregate both March expenses
    mockStorage.getBudgets.mockResolvedValue([
      { ...budget, expenses: [expense1, expense2] },
    ]);

    const summaryRes = await request(app).get("/api/budgets/summary/2026-03");

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.totalBudgeted).toBe(500);
    expect(summaryRes.body.totalSpent).toBe(205.5); // 120 + 85.50
    expect(summaryRes.body.budgets[0].remaining).toBe(294.5); // 500 - 205.5
  });

  it("monthly summary filters expenses by month correctly", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Budget with expenses spanning multiple months
    mockStorage.getBudgets.mockResolvedValue([
      {
        id: "b1", familyId: TEST_FAMILY_ID, name: "Dining", amount: "300",
        category: "dining", period: "monthly",
        expenses: [
          { id: "e1", budgetId: "b1", amount: "50", description: "Pizza", date: "2026-02-28", category: "dining" },
          { id: "e2", budgetId: "b1", amount: "75", description: "Sushi", date: "2026-03-01", category: "dining" },
          { id: "e3", budgetId: "b1", amount: "40", description: "Tacos", date: "2026-03-15", category: "dining" },
          { id: "e4", budgetId: "b1", amount: "60", description: "Italian", date: "2026-04-01", category: "dining" },
        ],
      },
    ]);

    // March summary should only include March expenses
    const marchRes = await request(app).get("/api/budgets/summary/2026-03");
    expect(marchRes.body.totalSpent).toBe(115); // 75 + 40
    expect(marchRes.body.budgets[0].remaining).toBe(185); // 300 - 115

    // February summary should only include February expenses
    const febRes = await request(app).get("/api/budgets/summary/2026-02");
    expect(febRes.body.totalSpent).toBe(50);
    expect(febRes.body.budgets[0].remaining).toBe(250); // 300 - 50
  });

  it("handles multiple budgets in summary aggregation", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    mockStorage.getBudgets.mockResolvedValue([
      {
        id: "b1", familyId: TEST_FAMILY_ID, name: "Groceries", amount: "500",
        category: "groceries", period: "monthly",
        expenses: [
          { id: "e1", budgetId: "b1", amount: "200", description: "Costco", date: "2026-03-05", category: "groceries" },
        ],
      },
      {
        id: "b2", familyId: TEST_FAMILY_ID, name: "Dining", amount: "300",
        category: "dining", period: "monthly",
        expenses: [
          { id: "e2", budgetId: "b2", amount: "80", description: "Sushi", date: "2026-03-10", category: "dining" },
        ],
      },
    ]);

    const res = await request(app).get("/api/budgets/summary/2026-03");

    expect(res.body.totalBudgeted).toBe(800); // 500 + 300
    expect(res.body.totalSpent).toBe(280); // 200 + 80
    expect(res.body.budgets).toHaveLength(2);
    expect(res.body.budgets[0].remaining).toBe(300); // 500 - 200
    expect(res.body.budgets[1].remaining).toBe(220); // 300 - 80
  });

  it("budget CRUD lifecycle: create → update → delete", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Create
    const budget = { id: "b-life", familyId: TEST_FAMILY_ID, name: "Transport", amount: "200" };
    mockStorage.createBudget.mockResolvedValue(budget);

    const createRes = await request(app)
      .post("/api/budgets")
      .send({ name: "Transport", amount: "200" });
    expect(createRes.status).toBe(200);
    expect(createRes.body.name).toBe("Transport");

    // Update
    mockStorage.updateBudget.mockResolvedValue({ ...budget, name: "Transportation", amount: "250" });

    const updateRes = await request(app)
      .patch("/api/budgets/b-life")
      .send({ name: "Transportation", amount: "250" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("Transportation");
    expect(updateRes.body.amount).toBe("250");

    // Delete
    mockStorage.deleteBudget.mockResolvedValue(undefined);

    const deleteRes = await request(app).delete("/api/budgets/b-life");
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({ success: true });
  });

  it("expense CRUD lifecycle: create → update → delete", async () => {
    // Create
    const expense = { id: "e-life", budgetId: "b1", amount: "45", description: "Gas", date: "2026-03-05" };
    mockStorage.createExpense.mockResolvedValue(expense);

    const createRes = await request(app)
      .post("/api/expenses")
      .send({ budgetId: "b1", amount: "45", description: "Gas", date: "2026-03-05" });
    expect(createRes.status).toBe(200);

    // Update
    mockStorage.updateExpense.mockResolvedValue({ ...expense, amount: "50", description: "Gas + car wash" });

    const updateRes = await request(app)
      .patch("/api/expenses/e-life")
      .send({ amount: "50", description: "Gas + car wash" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.description).toBe("Gas + car wash");

    // Delete
    mockStorage.deleteExpense.mockResolvedValue(undefined);

    const deleteRes = await request(app).delete("/api/expenses/e-life");
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({ success: true });
  });
});
