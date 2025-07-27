import {
  users,
  families,
  familyInvitations,
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
  type Family,
  type InsertFamily,
  type FamilyInvitation,
  type InsertFamilyInvitation,
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

  // Family operations
  createFamily(family: InsertFamily): Promise<Family>;
  getFamily(familyId: string): Promise<Family | undefined>;
  getFamilyByInviteCode(inviteCode: string): Promise<Family | undefined>;
  joinFamily(userId: string, familyId: string): Promise<User>;
  generateInviteCode(): string;
  createFamilyInvitation(invitation: InsertFamilyInvitation): Promise<FamilyInvitation>;
  getFamilyInvitations(familyId: string): Promise<FamilyInvitation[]>;
  
  // Family members
  getFamilyMembers(familyId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;

  // Grocery lists
  getGroceryLists(familyId: string): Promise<(GroceryList & { items: GroceryItem[] })[]>;
  createGroceryList(list: InsertGroceryList): Promise<GroceryList>;
  addGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem>;
  deleteGroceryItem(id: string): Promise<void>;

  // Calendar events
  getCalendarEvents(familyId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;

  // Family ideas
  getFamilyIdeas(familyId: string, userId?: string): Promise<(FamilyIdea & { userLiked: boolean })[]>;
  createFamilyIdea(idea: InsertFamilyIdea): Promise<FamilyIdea>;
  likeIdea(ideaId: string, userId: string): Promise<void>;
  unlikeIdea(ideaId: string, userId: string): Promise<void>;

  // Vision board
  getVisionItems(familyId: string): Promise<VisionItem[]>;
  createVisionItem(item: InsertVisionItem): Promise<VisionItem>;
  updateVisionItem(id: string, updates: Partial<VisionItem>): Promise<VisionItem>;
  deleteVisionItem(id: string): Promise<void>;

  // Wish lists
  getWishListItems(familyId: string): Promise<WishListItem[]>;
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

  // Family management
  generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createFamily(familyData: InsertFamily): Promise<Family> {
    const [family] = await db.insert(families).values(familyData).returning();
    return family;
  }

  async getFamily(familyId: string): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, familyId));
    return family;
  }

  async getFamilyByInviteCode(inviteCode: string): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.inviteCode, inviteCode));
    return family;
  }

  async joinFamily(userId: string, familyId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ familyId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createFamilyInvitation(invitationData: InsertFamilyInvitation): Promise<FamilyInvitation> {
    const [invitation] = await db.insert(familyInvitations).values(invitationData).returning();
    return invitation;
  }

  async getFamilyInvitations(familyId: string): Promise<FamilyInvitation[]> {
    return await db.select().from(familyInvitations).where(eq(familyInvitations.familyId, familyId));
  }

  // Family members
  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers).where(eq(familyMembers.familyId, familyId));
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db.insert(familyMembers).values(member).returning();
    return newMember;
  }

  // Grocery lists
  async getGroceryLists(familyId: string): Promise<(GroceryList & { items: GroceryItem[] })[]> {
    const lists = await db.select().from(groceryLists).where(eq(groceryLists.familyId, familyId));
    
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
  async getCalendarEvents(familyId: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.familyId, familyId))
      .orderBy(desc(calendarEvents.startTime));
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Family ideas
  async getFamilyIdeas(familyId: string, userId?: string): Promise<(FamilyIdea & { userLiked: boolean })[]> {
    const ideas = await db
      .select()
      .from(familyIdeas)
      .where(eq(familyIdeas.familyId, familyId))
      .orderBy(desc(familyIdeas.likes));

    const ideasWithLikes = await Promise.all(
      ideas.map(async (idea) => {
        if (!userId) {
          return { ...idea, userLiked: false };
        }
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
  async getVisionItems(familyId: string): Promise<VisionItem[]> {
    return await db
      .select()
      .from(visionItems)
      .where(eq(visionItems.familyId, familyId))
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
  async getWishListItems(familyId: string): Promise<WishListItem[]> {
    return await db
      .select()
      .from(wishListItems)
      .where(eq(wishListItems.familyId, familyId))
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
