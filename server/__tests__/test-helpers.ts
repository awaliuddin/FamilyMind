import { vi } from "vitest";
import express from "express";
import type { IStorage } from "../storage";
import type { User, Family } from "@shared/schema";

export const TEST_USER_ID = "test-user-1";
export const TEST_FAMILY_ID = "test-family-1";

export const testUser: User = {
  id: TEST_USER_ID,
  email: "test@familymind.test",
  firstName: "Test",
  lastName: "User",
  profileImageUrl: null,
  familyId: TEST_FAMILY_ID,
  role: "owner",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const testUserNoFamily: User = {
  ...testUser,
  id: "test-user-no-family",
  familyId: null,
};

export const testFamily: Family = {
  id: TEST_FAMILY_ID,
  name: "Test Family",
  ownerId: TEST_USER_ID,
  inviteCode: "ABC123",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export function createMockStorage(): IStorage & {
  updateGroceryList: ReturnType<typeof vi.fn>;
  deleteGroceryList: ReturnType<typeof vi.fn>;
} {
  return {
    getUser: vi.fn(),
    upsertUser: vi.fn(),
    createFamily: vi.fn(),
    getFamily: vi.fn(),
    getFamilyByInviteCode: vi.fn(),
    joinFamily: vi.fn(),
    generateInviteCode: vi.fn().mockReturnValue("XYZ789"),
    createFamilyInvitation: vi.fn(),
    getFamilyInvitations: vi.fn(),
    getFamilyMembers: vi.fn(),
    createFamilyMember: vi.fn(),
    getGroceryLists: vi.fn(),
    createGroceryList: vi.fn(),
    addGroceryItem: vi.fn(),
    updateGroceryItem: vi.fn(),
    deleteGroceryItem: vi.fn(),
    updateGroceryList: vi.fn(),
    deleteGroceryList: vi.fn(),
    getCalendarEvents: vi.fn(),
    createCalendarEvent: vi.fn(),
    updateCalendarEvent: vi.fn(),
    deleteCalendarEvent: vi.fn(),
    getFamilyIdeas: vi.fn(),
    createFamilyIdea: vi.fn(),
    likeIdea: vi.fn(),
    unlikeIdea: vi.fn(),
    getVisionItems: vi.fn(),
    createVisionItem: vi.fn(),
    updateVisionItem: vi.fn(),
    deleteVisionItem: vi.fn(),
    getWishListItems: vi.fn(),
    createWishListItem: vi.fn(),
    updateWishListItem: vi.fn(),
    deleteWishListItem: vi.fn(),
    getRecipes: vi.fn(),
    createRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
    getChatMessages: vi.fn(),
    createChatMessage: vi.fn(),
  };
}

export async function createTestApp() {
  const mockStorage = createMockStorage();

  // Mock modules before importing routes
  vi.doMock("../storage", () => ({
    storage: mockStorage,
  }));

  vi.doMock("../replitAuth", () => ({
    setupAuth: vi.fn(async (app: express.Express) => {
      // Auth passthrough: attach test user to every request
      app.use((req: any, _res: any, next: any) => {
        req.user = { claims: { sub: TEST_USER_ID } };
        req.isAuthenticated = () => true;
        next();
      });
    }),
    isAuthenticated: (_req: any, _res: any, next: any) => next(),
  }));

  vi.doMock("../openai", () => ({
    getFamilyAssistantResponse: vi.fn(),
    generateGroceryPredictions: vi.fn(),
    detectScheduleConflicts: vi.fn(),
  }));

  const { registerRoutes } = await import("../routes");

  const app = express();
  app.use(express.json());
  await registerRoutes(app);

  return { app, mockStorage };
}
