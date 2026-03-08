import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { syncUser } from "../auth";

export function registerAuthRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      // syncUser creates the DB record on first Clerk login
      const user = await syncUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
