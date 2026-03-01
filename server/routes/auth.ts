import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";

export function registerAuthRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
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
}
