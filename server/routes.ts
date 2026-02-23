import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getFamilyAssistantResponse, generateGroceryPredictions, detectScheduleConflicts } from "./openai";
import { stripe, isStripeConfigured, STRIPE_WEBHOOK_SECRET } from "./stripe";
import {
  insertFamilyMemberSchema,
  insertGroceryListSchema,
  insertGroceryItemSchema,
  insertCalendarEventSchema,
  insertFamilyIdeaSchema,
  insertVisionItemSchema,
  insertWishListItemSchema,
  insertRecipeSchema,
  insertBudgetSchema,
  insertExpenseSchema,
  insertChatMessageSchema,
} from "@shared/schema";

export const requirePremium: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user?.familyId) {
      return res.status(403).json({ message: "Premium subscription required" });
    }

    const subscription = await storage.getSubscription(user.familyId);
    if (
      !subscription ||
      subscription.status !== "active" ||
      new Date(subscription.currentPeriodEnd) <= new Date()
    ) {
      return res.status(403).json({ message: "Premium subscription required" });
    }

    next();
  } catch (error) {
    console.error("Error checking premium status:", error);
    res.status(500).json({ message: "Failed to verify subscription" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Family management routes
  app.post('/api/family/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.familyId) {
        return res.status(400).json({ message: "Already part of a family" });
      }

      const inviteCode = storage.generateInviteCode();
      const family = await storage.createFamily({
        name: req.body.name || "My Family",
        inviteCode,
        ownerId: userId
      });

      // Join the family
      await storage.joinFamily(userId, family.id);
      res.json({ family, inviteCode });
    } catch (error) {
      console.error("Error creating family:", error);
      res.status(500).json({ message: "Failed to create family" });
    }
  });

  app.post('/api/family/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { inviteCode } = req.body;
      
      const family = await storage.getFamilyByInviteCode(inviteCode);
      if (!family) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      const user = await storage.joinFamily(userId, family.id);
      res.json({ user, family });
    } catch (error) {
      console.error("Error joining family:", error);
      res.status(500).json({ message: "Failed to join family" });
    }
  });

  // Get family details including invite code
  app.get('/api/family', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(404).json({ message: "Not part of a family" });
      }
      
      const family = await storage.getFamily(user.familyId);
      res.json(family);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Failed to fetch family" });
    }
  });

  // Family members routes
  app.get('/api/family-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const members = await storage.getFamilyMembers(user.familyId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  app.post('/api/family-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to add members" });
      }
      
      const memberData = insertFamilyMemberSchema.parse({ ...req.body, familyId: user.familyId });
      const member = await storage.createFamilyMember(memberData);
      res.json(member);
    } catch (error) {
      console.error("Error creating family member:", error);
      res.status(500).json({ message: "Failed to create family member" });
    }
  });

  // Grocery routes
  app.get('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const lists = await storage.getGroceryLists(user.familyId);
      res.json(lists);
    } catch (error) {
      console.error("Error fetching grocery lists:", error);
      res.status(500).json({ message: "Failed to fetch grocery lists" });
    }
  });

  app.post('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create grocery lists" });
      }
      
      const listData = insertGroceryListSchema.parse({ ...req.body, familyId: user.familyId });
      const list = await storage.createGroceryList(listData);
      res.json(list);
    } catch (error) {
      console.error("Error creating grocery list:", error);
      res.status(500).json({ message: "Failed to create grocery list" });
    }
  });

  app.post('/api/grocery-items', isAuthenticated, async (req: any, res) => {
    try {
      const itemData = insertGroceryItemSchema.parse(req.body);
      const item = await storage.addGroceryItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding grocery item:", error);
      res.status(500).json({ message: "Failed to add grocery item" });
    }
  });

  app.patch('/api/grocery-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // Filter out auto-generated fields that shouldn't be manually updated
      const { id: _id, listId: _listId, createdAt, updatedAt, ...cleanData } = req.body;
      const item = await storage.updateGroceryItem(id, cleanData);
      res.json(item);
    } catch (error) {
      console.error("Error updating grocery item:", error);
      res.status(500).json({ message: "Failed to update grocery item" });
    }
  });

  app.delete('/api/grocery-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGroceryItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting grocery item:", error);
      res.status(500).json({ message: "Failed to delete grocery item" });
    }
  });

  app.patch('/api/grocery-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { id: _id, familyId: _familyId, createdAt, updatedAt, ...cleanData } = req.body;
      const list = await storage.updateGroceryList(id, cleanData);
      res.json(list);
    } catch (error) {
      console.error("Error updating grocery list:", error);
      res.status(500).json({ message: "Failed to update grocery list" });
    }
  });

  app.delete('/api/grocery-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGroceryList(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting grocery list:", error);
      res.status(500).json({ message: "Failed to delete grocery list" });
    }
  });

  // Calendar routes
  app.get('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const events = await storage.getCalendarEvents(user.familyId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create calendar events" });
      }
      
      // Convert datetime strings to Date objects
      const eventData = {
        ...req.body,
        familyId: user.familyId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      };
      
      const validatedData = insertCalendarEventSchema.parse(eventData);
      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.patch('/api/calendar-events/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Remove auto-generated fields and prepare clean update data
      const { id: _id, userId: _userId, createdAt, updatedAt, ...cleanData } = req.body;
      
      // Convert date strings to Date objects for proper database storage
      if (cleanData.startTime && typeof cleanData.startTime === 'string') {
        cleanData.startTime = new Date(cleanData.startTime);
      }
      if (cleanData.endTime && typeof cleanData.endTime === 'string') {
        cleanData.endTime = new Date(cleanData.endTime);
      }
      

      
      const event = await storage.updateCalendarEvent(id, cleanData);
      res.json(event);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete('/api/calendar-events/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCalendarEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Ideas routes
  app.get('/api/family-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const ideas = await storage.getFamilyIdeas(user.familyId, userId);
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching family ideas:", error);
      res.status(500).json({ message: "Failed to fetch family ideas" });
    }
  });

  app.post('/api/family-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create family ideas" });
      }
      
      const ideaData = insertFamilyIdeaSchema.parse({ ...req.body, familyId: user.familyId });
      const idea = await storage.createFamilyIdea(ideaData);
      res.json(idea);
    } catch (error) {
      console.error("Error creating family idea:", error);
      res.status(500).json({ message: "Failed to create family idea" });
    }
  });

  app.post('/api/family-ideas/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      await storage.likeIdea(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking idea:", error);
      res.status(500).json({ message: "Failed to like idea" });
    }
  });

  app.delete('/api/family-ideas/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      await storage.unlikeIdea(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking idea:", error);
      res.status(500).json({ message: "Failed to unlike idea" });
    }
  });

  // Vision board routes
  app.get('/api/vision-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const items = await storage.getVisionItems(user.familyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching vision items:", error);
      res.status(500).json({ message: "Failed to fetch vision items" });
    }
  });

  app.post('/api/vision-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create vision items" });
      }
      
      const itemData = insertVisionItemSchema.parse({ ...req.body, familyId: user.familyId });
      const item = await storage.createVisionItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating vision item:", error);
      res.status(500).json({ message: "Failed to create vision item" });
    }
  });

  app.patch('/api/vision-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateVisionItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating vision item:", error);
      res.status(500).json({ message: "Failed to update vision item" });
    }
  });

  app.delete('/api/vision-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVisionItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vision item:", error);
      res.status(500).json({ message: "Failed to delete vision item" });
    }
  });

  // Wish list routes
  app.get('/api/wishlist-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const items = await storage.getWishListItems(user.familyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  app.post('/api/wishlist-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create wishlist items" });
      }
      
      const itemData = insertWishListItemSchema.parse({ ...req.body, familyId: user.familyId });
      const item = await storage.createWishListItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating wishlist item:", error);
      res.status(500).json({ message: "Failed to create wishlist item" });
    }
  });

  app.patch('/api/wishlist-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateWishListItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      res.status(500).json({ message: "Failed to update wishlist item" });
    }
  });

  app.delete('/api/wishlist-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWishListItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      res.status(500).json({ message: "Failed to delete wishlist item" });
    }
  });

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) return res.json([]);
      const items = await storage.getRecipes(user.familyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create recipes" });
      }
      const recipeData = insertRecipeSchema.parse({ ...req.body, familyId: user.familyId });
      const recipe = await storage.createRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.patch('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { id: _id, familyId: _familyId, createdAt, updatedAt, ...cleanData } = req.body;
      const recipe = await storage.updateRecipe(id, cleanData);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRecipe(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  app.post('/api/recipes/:id/to-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { listId } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family" });
      }

      const recipesList = await storage.getRecipes(user.familyId);
      const recipe = recipesList.find(r => r.id === id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const ingredients = (recipe.ingredients as Array<{ name: string; quantity?: string; unit?: string }>) || [];
      const created = await Promise.all(
        ingredients.map(ing => {
          const label = [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ');
          return storage.addGroceryItem({ listId, name: label, autoAdded: true });
        })
      );

      res.json({ added: created.length });
    } catch (error) {
      console.error("Error adding recipe to grocery list:", error);
      res.status(500).json({ message: "Failed to add ingredients to grocery list" });
    }
  });

  // Budget routes
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
      const { id: _id, familyId: _familyId, createdAt, updatedAt, ...cleanData } = req.body;
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
      const { id: _id, budgetId: _budgetId, createdAt, ...cleanData } = req.body;
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

      const { month } = req.params; // e.g. "2026-03"
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

  // Billing routes (Stripe)
  app.post('/api/billing/create-checkout', isAuthenticated, async (req: any, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(503).json({ message: "Billing is not configured" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to subscribe" });
      }

      const { priceId } = req.body;
      if (!priceId) {
        return res.status(400).json({ message: "priceId is required" });
      }

      const session = await stripe!.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.protocol}://${req.hostname}/?billing=success`,
        cancel_url: `${req.protocol}://${req.hostname}/?billing=canceled`,
        metadata: { familyId: user.familyId },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post('/api/billing/webhook', async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(503).json({ message: "Billing is not configured" });
      }

      const sig = req.headers['stripe-signature'] as string;
      if (!sig || !STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ message: "Missing signature or webhook secret" });
      }

      let event;
      try {
        event = stripe!.webhooks.constructEvent(
          req.body,
          sig,
          STRIPE_WEBHOOK_SECRET,
        );
      } catch {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const familyId = session.metadata?.familyId;
          if (familyId && session.subscription) {
            const subscription = await stripe!.subscriptions.retrieve(
              session.subscription as string,
            );
            const item = subscription.items.data[0];
            await storage.upsertSubscription({
              familyId,
              stripeCustomerId: session.customer as string,
              stripePriceId: item.price.id,
              stripeSubscriptionId: subscription.id,
              status: "active",
              currentPeriodEnd: new Date(item.current_period_end * 1000),
            });
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object as any;
          const familyId = sub.metadata?.familyId;
          if (familyId) {
            const periodEnd = sub.items?.data?.[0]?.current_period_end
              ?? sub.current_period_end;
            const updates: any = {
              status: sub.status === 'active' ? 'active'
                : sub.status === 'past_due' ? 'past_due'
                : 'canceled',
            };
            if (periodEnd) {
              updates.currentPeriodEnd = new Date(periodEnd * 1000);
            }
            await storage.updateSubscription(familyId, updates);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as any;
          const familyId = sub.metadata?.familyId;
          if (familyId) {
            await storage.updateSubscription(familyId, {
              status: "canceled",
            });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.get('/api/billing/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.json({ isPremium: false, subscription: null });
      }

      const subscription = await storage.getSubscription(user.familyId);
      if (!subscription) {
        return res.json({ isPremium: false, subscription: null });
      }

      const isPremium =
        subscription.status === "active" &&
        new Date(subscription.currentPeriodEnd) > new Date();

      res.json({
        isPremium,
        subscription: {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    } catch (error) {
      console.error("Error fetching billing status:", error);
      res.status(500).json({ message: "Failed to fetch billing status" });
    }
  });

  // AI Chat routes
  app.get('/api/chat-messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message,
        messageType: 'user',
        context: null
      });

      // Get user and family context for AI
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        const response = "I'd be happy to help you manage your family! To get started with all the family features, you'll need to either create a new family or join an existing one. Would you like me to help you set that up?";
        
        const aiMessage = await storage.createChatMessage({
          userId,
          message: response,
          messageType: 'assistant',
          context: { needsFamily: true }
        });
        
        return res.json({ message: response });
      }

      const [familyMembers, upcomingEvents, groceryLists, recentIdeas] = await Promise.all([
        storage.getFamilyMembers(user.familyId),
        storage.getCalendarEvents(user.familyId),
        storage.getGroceryLists(user.familyId),
        storage.getFamilyIdeas(user.familyId, userId)
      ]);

      // Get AI response
      const aiResponse = await getFamilyAssistantResponse(message, {
        familyMembers,
        upcomingEvents: upcomingEvents.slice(0, 5),
        groceryLists,
        recentIdeas: recentIdeas.slice(0, 5)
      });

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        message: aiResponse.message,
        messageType: 'ai',
        context: {
          suggestions: aiResponse.suggestions,
          actions: aiResponse.actions
        }
      });

      res.json({
        userMessage,
        aiMessage,
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // AI Analytics routes
  app.get('/api/ai/grocery-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const groceryLists = await storage.getGroceryLists(user.familyId);
      const familyMembers = await storage.getFamilyMembers(user.familyId);
      
      const predictions = await generateGroceryPredictions(
        groceryLists,
        familyMembers.length
      );
      
      res.json(predictions);
    } catch (error) {
      console.error("Error generating grocery predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  app.get('/api/ai/schedule-conflicts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.json([]);
      }
      
      const events = await storage.getCalendarEvents(user.familyId);
      
      const conflicts = await detectScheduleConflicts(events);
      
      res.json(conflicts);
    } catch (error) {
      console.error("Error detecting schedule conflicts:", error);
      res.status(500).json({ message: "Failed to detect conflicts" });
    }
  });

  // Family management routes
  app.post('/api/family/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name } = req.body;
      
      // Check if user already has a family
      const existingUser = await storage.getUser(userId);
      if (existingUser?.familyId) {
        return res.status(400).json({ message: "You're already part of a family" });
      }
      
      const inviteCode = storage.generateInviteCode();
      const family = await storage.createFamily({
        name: name || "My Family",
        inviteCode,
        ownerId: userId
      });
      
      await storage.joinFamily(userId, family.id);
      
      res.json({ family, inviteCode });
    } catch (error) {
      console.error("Error creating family:", error);
      res.status(500).json({ message: "Failed to create family" });
    }
  });

  app.post('/api/family/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { inviteCode } = req.body;
      
      // Check if user already has a family
      const existingUser = await storage.getUser(userId);
      if (existingUser?.familyId) {
        return res.status(400).json({ message: "You're already part of a family" });
      }
      
      const family = await storage.getFamilyByInviteCode(inviteCode);
      if (!family) {
        return res.status(404).json({ message: "Invalid invite code" });
      }
      
      await storage.joinFamily(userId, family.id);
      
      res.json({ family });
    } catch (error) {
      console.error("Error joining family:", error);
      res.status(500).json({ message: "Failed to join family" });
    }
  });

  app.get('/api/family', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.familyId) {
        return res.status(404).json({ message: "No family found" });
      }
      
      const family = await storage.getFamily(user.familyId);
      const familyMembers = await storage.getFamilyMembers(user.familyId);
      
      res.json({ family, members: familyMembers });
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Failed to fetch family" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
