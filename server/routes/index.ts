import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import { setupAuth, isAuthenticated } from "../replitAuth";
import { registerAuthRoutes } from "./auth";
import { registerFamilyRoutes } from "./family";
import { registerGroceryRoutes } from "./grocery";
import { registerCalendarRoutes } from "./calendar";
import { registerIdeasRoutes } from "./ideas";
import { registerVisionRoutes } from "./vision";
import { registerWishlistRoutes } from "./wishlist";
import { registerRecipeRoutes } from "./recipes";
import { registerBudgetRoutes } from "./budget";
import { registerBillingRoutes } from "./billing";
import { registerAiRoutes } from "./ai";

export { requirePremium } from "./billing";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  registerAuthRoutes(app, isAuthenticated, storage);
  registerFamilyRoutes(app, isAuthenticated, storage);
  registerGroceryRoutes(app, isAuthenticated, storage);
  registerCalendarRoutes(app, isAuthenticated, storage);
  registerIdeasRoutes(app, isAuthenticated, storage);
  registerVisionRoutes(app, isAuthenticated, storage);
  registerWishlistRoutes(app, isAuthenticated, storage);
  registerRecipeRoutes(app, isAuthenticated, storage);
  registerBudgetRoutes(app, isAuthenticated, storage);
  registerBillingRoutes(app, isAuthenticated, storage);
  registerAiRoutes(app, isAuthenticated, storage);

  const httpServer = createServer(app);
  return httpServer;
}
