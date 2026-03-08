import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertWishListItemSchema } from "@shared/schema";

export function registerWishlistRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/wishlist-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
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
}
