import { clerkMiddleware, clerkClient, requireAuth } from "@clerk/express";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { seedSampleData } from "./seed-data";

const hasClerkEnv = Boolean(process.env.CLERK_SECRET_KEY);

const devUserConfig = {
  id: process.env.DEV_USER_ID ?? "dev-user",
  email: process.env.DEV_USER_EMAIL ?? "dev@familymind.test",
  firstName: process.env.DEV_USER_FIRST_NAME ?? "Dev",
  lastName: process.env.DEV_USER_LAST_NAME ?? "User",
  profileImageUrl:
    process.env.DEV_USER_AVATAR_URL ??
    "https://avatars.githubusercontent.com/u/0?v=4",
};

let devUserSeeded = false;

async function ensureDevUserSeeded() {
  if (devUserSeeded) return;
  await storage.upsertUser(devUserConfig);
  try {
    await seedSampleData(devUserConfig.id);
  } catch (error) {
    console.warn("Failed to seed sample data for local auth:", error);
  }
  devUserSeeded = true;
}

export async function setupAuth(app: Express) {
  if (!hasClerkEnv) {
    console.info("CLERK_SECRET_KEY not set. Falling back to local development auth.");
    await ensureDevUserSeeded();

    // Auto-authenticate all requests with dev user
    app.use((req: any, _res, next) => {
      req.auth = { userId: devUserConfig.id };
      next();
    });

    // Stub login/logout routes for dev
    app.get("/api/login", (_req, res) => res.redirect("/"));
    app.get("/api/logout", (_req, res) => res.redirect("/"));
    return;
  }

  // Production: use Clerk middleware
  app.use(clerkMiddleware());
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!hasClerkEnv) {
    return next();
  }
  return requireAuth()(req, res, next);
};

/**
 * Sync a Clerk user to our database on first access.
 * Returns the user from our DB (creating if needed).
 */
export async function syncUser(userId: string) {
  const existingUser = await storage.getUser(userId);
  if (existingUser) return existingUser;

  // Fetch profile from Clerk and create in our DB
  const clerkUser = await clerkClient.users.getUser(userId);
  const user = await storage.upsertUser({
    id: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.imageUrl,
  });

  try {
    await seedSampleData(userId);
  } catch (error) {
    console.error("Failed to seed sample data:", error);
  }

  return user;
}
