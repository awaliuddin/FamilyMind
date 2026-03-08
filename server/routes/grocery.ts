import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertGroceryListSchema, insertGroceryItemSchema } from "@shared/schema";

export function registerGroceryRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
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
      const { id: _id, listId: _listId, createdAt: _createdAt, updatedAt: _updatedAt, ...cleanData } = req.body;
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
      const { id: _id, familyId: _familyId, createdAt: _createdAt, updatedAt: _updatedAt, ...cleanData } = req.body;
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
}
