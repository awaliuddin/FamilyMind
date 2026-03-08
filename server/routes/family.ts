import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertFamilyMemberSchema } from "@shared/schema";
import { FREE_MEMBER_LIMIT } from "./billing";

export function registerFamilyRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.post('/api/family/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
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

  app.get('/api/family', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
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
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to add members" });
      }

      // Check member cap for free tier
      const members = await storage.getFamilyMembers(user.familyId);
      if (members.length >= FREE_MEMBER_LIMIT) {
        const subscription = await storage.getSubscription(user.familyId);
        const isPremium =
          subscription &&
          subscription.status === "active" &&
          new Date(subscription.currentPeriodEnd) > new Date();

        if (!isPremium) {
          return res.status(403).json({
            message: `Free plan supports up to ${FREE_MEMBER_LIMIT} family members. Upgrade to Premium for unlimited members.`,
            upgradeUrl: "/premium",
            code: "MEMBER_LIMIT_REACHED",
          });
        }
      }

      const memberData = insertFamilyMemberSchema.parse({ ...req.body, familyId: user.familyId });
      const member = await storage.createFamilyMember(memberData);
      res.json(member);
    } catch (error) {
      console.error("Error creating family member:", error);
      res.status(500).json({ message: "Failed to create family member" });
    }
  });
}
