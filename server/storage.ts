import {
  users,
  familyMembers,
  groceryLists,
  groceryItems,
  calendarEvents,
  familyIdeas,
  ideaLikes,
  visionItems,
  wishListItems,
  chatMessages,
  type User,
  type UpsertUser,
  type FamilyMember,
  type InsertFamilyMember,
  type GroceryList,
  type InsertGroceryList,
  type GroceryItem,
  type InsertGroceryItem,
  type CalendarEvent,
  type InsertCalendarEvent,
  type FamilyIdea,
  type InsertFamilyIdea,
  type IdeaLike,
  type InsertIdeaLike,
  type VisionItem,
  type InsertVisionItem,
  type WishListItem,
  type InsertWishListItem,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Family members
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;

  // Grocery lists
  getGroceryLists(userId: string): Promise<(GroceryList & { items: GroceryItem[] })[]>;
  createGroceryList(list: InsertGroceryList): Promise<GroceryList>;
  addGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem>;
  deleteGroceryItem(id: string): Promise<void>;

  // Calendar events
  getCalendarEvents(userId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;

  // Family ideas
  getFamilyIdeas(userId: string): Promise<(FamilyIdea & { userLiked: boolean })[]>;
  createFamilyIdea(idea: InsertFamilyIdea): Promise<FamilyIdea>;
  likeIdea(ideaId: string, userId: string): Promise<void>;
  unlikeIdea(ideaId: string, userId: string): Promise<void>;

  // Vision board
  getVisionItems(userId: string): Promise<VisionItem[]>;
  createVisionItem(item: InsertVisionItem): Promise<VisionItem>;
  updateVisionItem(id: string, updates: Partial<VisionItem>): Promise<VisionItem>;
  deleteVisionItem(id: string): Promise<void>;

  // Wish lists
  getWishListItems(userId: string): Promise<WishListItem[]>;
  createWishListItem(item: InsertWishListItem): Promise<WishListItem>;
  updateWishListItem(id: string, updates: Partial<WishListItem>): Promise<WishListItem>;
  deleteWishListItem(id: string): Promise<void>;

  // AI Chat
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Family members
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers).where(eq(familyMembers.userId, userId));
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db.insert(familyMembers).values(member).returning();
    return newMember;
  }

  // Grocery lists
  async getGroceryLists(userId: string): Promise<(GroceryList & { items: GroceryItem[] })[]> {
    const lists = await db.select().from(groceryLists).where(eq(groceryLists.userId, userId));
    
    const listsWithItems = await Promise.all(
      lists.map(async (list) => {
        const items = await db.select().from(groceryItems).where(eq(groceryItems.listId, list.id));
        return { ...list, items };
      })
    );

    return listsWithItems;
  }

  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> {
    const [newList] = await db.insert(groceryLists).values(list).returning();
    return newList;
  }

  async addGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const [newItem] = await db.insert(groceryItems).values(item).returning();
    return newItem;
  }

  async updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    const [updatedItem] = await db
      .update(groceryItems)
      .set(updates)
      .where(eq(groceryItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteGroceryItem(id: string): Promise<void> {
    await db.delete(groceryItems).where(eq(groceryItems.id, id));
  }

  // Calendar events
  async getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(desc(calendarEvents.startTime));
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    console.log("Storage: Updating calendar event with ID:", id);
    console.log("Storage: Updates to apply:", updates);
    
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    
    console.log("Storage: Updated event result:", updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Family ideas
  async getFamilyIdeas(userId: string): Promise<(FamilyIdea & { userLiked: boolean })[]> {
    const ideas = await db
      .select()
      .from(familyIdeas)
      .where(eq(familyIdeas.userId, userId))
      .orderBy(desc(familyIdeas.likes));

    const ideasWithLikes = await Promise.all(
      ideas.map(async (idea) => {
        const [userLike] = await db
          .select()
          .from(ideaLikes)
          .where(and(eq(ideaLikes.ideaId, idea.id), eq(ideaLikes.userId, userId)));
        return { ...idea, userLiked: !!userLike };
      })
    );

    return ideasWithLikes;
  }

  async createFamilyIdea(idea: InsertFamilyIdea): Promise<FamilyIdea> {
    const [newIdea] = await db.insert(familyIdeas).values(idea).returning();
    return newIdea;
  }

  async likeIdea(ideaId: string, userId: string): Promise<void> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(ideaLikes)
      .where(and(eq(ideaLikes.ideaId, ideaId), eq(ideaLikes.userId, userId)));

    if (!existingLike) {
      // Add like
      await db.insert(ideaLikes).values({ ideaId, userId });
      // Increment likes count
      await db
        .update(familyIdeas)
        .set({ likes: sql`${familyIdeas.likes} + 1` })
        .where(eq(familyIdeas.id, ideaId));
    }
  }

  async unlikeIdea(ideaId: string, userId: string): Promise<void> {
    // Remove like
    await db
      .delete(ideaLikes)
      .where(and(eq(ideaLikes.ideaId, ideaId), eq(ideaLikes.userId, userId)));
    // Decrement likes count
    await db
      .update(familyIdeas)
      .set({ likes: sql`${familyIdeas.likes} - 1` })
      .where(eq(familyIdeas.id, ideaId));
  }

  // Vision board
  async getVisionItems(userId: string): Promise<VisionItem[]> {
    return await db
      .select()
      .from(visionItems)
      .where(eq(visionItems.userId, userId))
      .orderBy(desc(visionItems.createdAt));
  }

  async createVisionItem(item: InsertVisionItem): Promise<VisionItem> {
    const [newItem] = await db.insert(visionItems).values(item).returning();
    return newItem;
  }

  async updateVisionItem(id: string, updates: Partial<VisionItem>): Promise<VisionItem> {
    const [updatedItem] = await db
      .update(visionItems)
      .set(updates)
      .where(eq(visionItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteVisionItem(id: string): Promise<void> {
    await db.delete(visionItems).where(eq(visionItems.id, id));
  }

  // Wish lists
  async getWishListItems(userId: string): Promise<WishListItem[]> {
    return await db
      .select()
      .from(wishListItems)
      .where(eq(wishListItems.userId, userId))
      .orderBy(desc(wishListItems.createdAt));
  }

  async createWishListItem(item: InsertWishListItem): Promise<WishListItem> {
    const [newItem] = await db.insert(wishListItems).values(item).returning();
    return newItem;
  }

  async updateWishListItem(id: string, updates: Partial<WishListItem>): Promise<WishListItem> {
    const [updatedItem] = await db
      .update(wishListItems)
      .set(updates)
      .where(eq(wishListItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteWishListItem(id: string): Promise<void> {
    await db.delete(wishListItems).where(eq(wishListItems.id, id));
  }

  // AI Chat
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
