import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertBudgetSchema, insertExpenseSchema } from "@shared/schema";

export function registerBudgetRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) return res.json([]);
      const items = await storage.getBudgets(user.familyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create budgets" });
      }
      const budgetData = insertBudgetSchema.parse({ ...req.body, familyId: user.familyId });
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.patch('/api/budgets/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { id: _id, familyId: _familyId, createdAt: _createdAt, updatedAt: _updatedAt, ...cleanData } = req.body;
      const budget = await storage.updateBudget(id, cleanData);
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete('/api/budgets/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBudget(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Expense routes
  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { id: _id, budgetId: _budgetId, createdAt: _createdAt, ...cleanData } = req.body;
      const expense = await storage.updateExpense(id, cleanData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Monthly summary endpoint
  app.get('/api/budgets/summary/:month', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) return res.json({ budgets: [], totalBudgeted: 0, totalSpent: 0 });

      const { month } = req.params;
      const budgetsWithExpenses = await storage.getBudgets(user.familyId);

      const summary = budgetsWithExpenses.map(budget => {
        const monthExpenses = budget.expenses.filter(e => e.date.startsWith(month));
        const spent = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        return {
          id: budget.id,
          name: budget.name,
          category: budget.category,
          budgeted: parseFloat(budget.amount),
          spent,
          remaining: parseFloat(budget.amount) - spent,
        };
      });

      const totalBudgeted = summary.reduce((sum, b) => sum + b.budgeted, 0);
      const totalSpent = summary.reduce((sum, b) => sum + b.spent, 0);

      res.json({ budgets: summary, totalBudgeted, totalSpent });
    } catch (error) {
      console.error("Error fetching budget summary:", error);
      res.status(500).json({ message: "Failed to fetch budget summary" });
    }
  });
}
