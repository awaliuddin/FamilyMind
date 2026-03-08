import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { getFamilyAssistantResponse, generateGroceryPredictions, detectScheduleConflicts } from "../openai";
import { requirePremium } from "./billing";

export function registerAiRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  // AI Chat routes — premium only
  app.get('/api/chat-messages', isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat', isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const { message } = req.body;

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message,
        messageType: 'user',
        context: null
      });

      // Get user and family context for AI
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        const response = "I'd be happy to help you manage your family! To get started with all the family features, you'll need to either create a new family or join an existing one. Would you like me to help you set that up?";

        await storage.createChatMessage({
          userId,
          message: response,
          messageType: 'assistant',
          context: { needsFamily: true }
        });

        return res.json({ message: response });
      }

      const [familyMembers, upcomingEvents, groceryLists, recentIdeas] = await Promise.all([
        storage.getFamilyMembers(user.familyId),
        storage.getCalendarEvents(user.familyId),
        storage.getGroceryLists(user.familyId),
        storage.getFamilyIdeas(user.familyId, userId)
      ]);

      // Get AI response
      const aiResponse = await getFamilyAssistantResponse(message, {
        familyMembers,
        upcomingEvents: upcomingEvents.slice(0, 5),
        groceryLists,
        recentIdeas: recentIdeas.slice(0, 5)
      });

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        message: aiResponse.message,
        messageType: 'ai',
        context: {
          suggestions: aiResponse.suggestions,
          actions: aiResponse.actions
        }
      });

      res.json({
        userMessage,
        aiMessage,
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // AI Analytics routes — premium only
  app.get('/api/ai/grocery-predictions', isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.json([]);
      }

      const groceryLists = await storage.getGroceryLists(user.familyId);
      const familyMembers = await storage.getFamilyMembers(user.familyId);

      const predictions = await generateGroceryPredictions(
        groceryLists,
        familyMembers.length
      );

      res.json(predictions);
    } catch (error) {
      console.error("Error generating grocery predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  app.get('/api/ai/schedule-conflicts', isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.json([]);
      }

      const events = await storage.getCalendarEvents(user.familyId);

      const conflicts = await detectScheduleConflicts(events);

      res.json(conflicts);
    } catch (error) {
      console.error("Error detecting schedule conflicts:", error);
      res.status(500).json({ message: "Failed to detect conflicts" });
    }
  });
}
