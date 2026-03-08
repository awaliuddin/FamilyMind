import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertFamilyIdeaSchema } from "@shared/schema";

export function registerIdeasRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/family-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
      await storage.unlikeIdea(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking idea:", error);
      res.status(500).json({ message: "Failed to unlike idea" });
    }
  });
}
