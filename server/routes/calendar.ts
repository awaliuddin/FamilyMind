import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertCalendarEventSchema } from "@shared/schema";

export function registerCalendarRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.json([]);
      }

      const events = await storage.getCalendarEvents(user.familyId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create calendar events" });
      }

      const eventData = {
        ...req.body,
        familyId: user.familyId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      };

      const validatedData = insertCalendarEventSchema.parse(eventData);
      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.patch('/api/calendar-events/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      const { id: _id, userId: _userId, createdAt, updatedAt, ...cleanData } = req.body;

      if (cleanData.startTime && typeof cleanData.startTime === 'string') {
        cleanData.startTime = new Date(cleanData.startTime);
      }
      if (cleanData.endTime && typeof cleanData.endTime === 'string') {
        cleanData.endTime = new Date(cleanData.endTime);
      }

      const event = await storage.updateCalendarEvent(id, cleanData);
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
}
