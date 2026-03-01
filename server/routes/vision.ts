import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertVisionItemSchema } from "@shared/schema";

export function registerVisionRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
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
}
