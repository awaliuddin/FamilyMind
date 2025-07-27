import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getFamilyAssistantResponse, generateGroceryPredictions, detectScheduleConflicts } from "./openai";
import {
  insertFamilyMemberSchema,
  insertGroceryListSchema,
  insertGroceryItemSchema,
  insertCalendarEventSchema,
  insertFamilyIdeaSchema,
  insertVisionItemSchema,
  insertWishListItemSchema,
  insertChatMessageSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
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

  // Family members routes
  app.get('/api/family-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const members = await storage.getFamilyMembers(userId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  app.post('/api/family-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memberData = insertFamilyMemberSchema.parse({ ...req.body, userId });
      const member = await storage.createFamilyMember(memberData);
      res.json(member);
    } catch (error) {
      console.error("Error creating family member:", error);
      res.status(500).json({ message: "Failed to create family member" });
    }
  });

  // Grocery routes
  app.get('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lists = await storage.getGroceryLists(userId);
      res.json(lists);
    } catch (error) {
      console.error("Error fetching grocery lists:", error);
      res.status(500).json({ message: "Failed to fetch grocery lists" });
    }
  });

  app.post('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listData = insertGroceryListSchema.parse({ ...req.body, userId });
      const list = await storage.createGroceryList(listData);
      res.json(list);
    } catch (error) {
      console.error("Error creating grocery list:", error);
      res.status(500).json({ message: "Failed to create grocery list" });
    }
  });

  app.post('/api/grocery-items', isAuthenticated, async (req: any, res) => {
    try {
      const itemData = insertGroceryItemSchema.parse(req.body);
      const item = await storage.addGroceryItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding grocery item:", error);
      res.status(500).json({ message: "Failed to add grocery item" });
    }
  });

  app.patch('/api/grocery-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateGroceryItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating grocery item:", error);
      res.status(500).json({ message: "Failed to update grocery item" });
    }
  });

  app.delete('/api/grocery-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGroceryItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting grocery item:", error);
      res.status(500).json({ message: "Failed to delete grocery item" });
    }
  });

  // Calendar routes
  app.get('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getCalendarEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertCalendarEventSchema.parse({ ...req.body, userId });
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.patch('/api/calendar-events/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      console.log("Received update data:", updateData);
      
      // Convert date strings to Date objects for proper database storage
      if (updateData.startTime) {
        console.log("Original startTime:", updateData.startTime, "Type:", typeof updateData.startTime);
        if (typeof updateData.startTime === 'string') {
          updateData.startTime = new Date(updateData.startTime);
        }
        console.log("Converted startTime:", updateData.startTime);
      }
      if (updateData.endTime) {
        console.log("Original endTime:", updateData.endTime, "Type:", typeof updateData.endTime);
        if (typeof updateData.endTime === 'string') {
          updateData.endTime = new Date(updateData.endTime);
        }
        console.log("Converted endTime:", updateData.endTime);
      }
      
      console.log("Final update data:", updateData);
      
      const event = await storage.updateCalendarEvent(id, updateData);
      res.json(event);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete('/api/calendar-events/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCalendarEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Ideas routes
  app.get('/api/family-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ideas = await storage.getFamilyIdeas(userId);
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching family ideas:", error);
      res.status(500).json({ message: "Failed to fetch family ideas" });
    }
  });

  app.post('/api/family-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ideaData = insertFamilyIdeaSchema.parse({ ...req.body, userId });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      await storage.unlikeIdea(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking idea:", error);
      res.status(500).json({ message: "Failed to unlike idea" });
    }
  });

  // Vision board routes
  app.get('/api/vision-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getVisionItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching vision items:", error);
      res.status(500).json({ message: "Failed to fetch vision items" });
    }
  });

  app.post('/api/vision-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertVisionItemSchema.parse({ ...req.body, userId });
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

  // Wish list routes
  app.get('/api/wishlist-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getWishListItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  app.post('/api/wishlist-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertWishListItemSchema.parse({ ...req.body, userId });
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

  // AI Chat routes
  app.get('/api/chat-messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message,
        messageType: 'user',
        context: null
      });

      // Get context for AI
      const [familyMembers, upcomingEvents, groceryLists, recentIdeas] = await Promise.all([
        storage.getFamilyMembers(userId),
        storage.getCalendarEvents(userId),
        storage.getGroceryLists(userId),
        storage.getFamilyIdeas(userId)
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

  // AI Analytics routes
  app.get('/api/ai/grocery-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groceryLists = await storage.getGroceryLists(userId);
      const familyMembers = await storage.getFamilyMembers(userId);
      
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

  app.get('/api/ai/schedule-conflicts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getCalendarEvents(userId);
      
      const conflicts = await detectScheduleConflicts(events);
      
      res.json(conflicts);
    } catch (error) {
      console.error("Error detecting schedule conflicts:", error);
      res.status(500).json({ message: "Failed to detect conflicts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
