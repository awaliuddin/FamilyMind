import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Families table - represents a family unit
export const families = pgTable("families", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  ownerId: varchar("owner_id").notNull(), // The user who created the family
  inviteCode: varchar("invite_code").unique().notNull(), // 6-character code for joining
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family invitations table
export const familyInvitations = pgTable("family_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  inviterUserId: varchar("inviter_user_id").references(() => users.id).notNull(),
  inviteeEmail: varchar("invitee_email").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'accepted', 'declined'
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  familyId: varchar("family_id").references(() => families.id), // User's family
  role: varchar("role").default("member"), // 'owner', 'admin', 'member'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family members table (represents people in the family, not necessarily users)
export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // null if family member hasn't joined yet
  name: varchar("name").notNull(),
  role: varchar("role").notNull(), // 'parent', 'child'
  color: varchar("color").notNull(), // for calendar and UI theming
  avatar: varchar("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Grocery lists table
export const groceryLists = pgTable("grocery_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  store: varchar("store").notNull(),
  storeTip: text("store_tip"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Grocery items table
export const groceryItems = pgTable("grocery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listId: varchar("list_id").references(() => groceryLists.id).notNull(),
  name: varchar("name").notNull(),
  completed: boolean("completed").default(false),
  autoAdded: boolean("auto_added").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar events table
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location"),
  attendees: text("attendees").array(),
  eventType: varchar("event_type").notNull(), // 'work', 'school', 'family', 'sports', etc.
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family ideas table
export const familyIdeas = pgTable("family_ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  author: varchar("author").notNull(),
  likes: integer("likes").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family idea likes table
export const ideaLikes = pgTable("idea_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => familyIdeas.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vision board items table
export const visionItems = pgTable("vision_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  author: varchar("author").notNull(),
  color: varchar("color").notNull(),
  icon: varchar("icon"),
  targetDate: varchar("target_date"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wish list items table
export const wishListItems = pgTable("wish_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  item: varchar("item").notNull(),
  description: text("description"),
  price: varchar("price"),
  store: varchar("store"),
  url: varchar("url"),
  person: varchar("person").notNull(),
  occasion: varchar("occasion").notNull(),
  imageUrl: varchar("image_url"),
  priority: integer("priority").default(1),
  purchased: boolean("purchased").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recipes table
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").notNull().default([]),
  instructions: text("instructions"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  category: varchar("category").default("dinner"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  response: text("response"),
  messageType: varchar("message_type").notNull(), // 'user', 'ai'
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type definitions
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Family types
export type Family = typeof families.$inferSelect;
export type InsertFamily = typeof families.$inferInsert;

export type FamilyInvitation = typeof familyInvitations.$inferSelect;
export type InsertFamilyInvitation = typeof familyInvitations.$inferInsert;

export type InsertFamilyMember = typeof familyMembers.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;

export type InsertGroceryList = typeof groceryLists.$inferInsert;
export type GroceryList = typeof groceryLists.$inferSelect;

export type InsertGroceryItem = typeof groceryItems.$inferInsert;
export type GroceryItem = typeof groceryItems.$inferSelect;

export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export type InsertFamilyIdea = typeof familyIdeas.$inferInsert;
export type FamilyIdea = typeof familyIdeas.$inferSelect;

export type InsertIdeaLike = typeof ideaLikes.$inferInsert;
export type IdeaLike = typeof ideaLikes.$inferSelect;

export type InsertVisionItem = typeof visionItems.$inferInsert;
export type VisionItem = typeof visionItems.$inferSelect;

export type InsertWishListItem = typeof wishListItems.$inferInsert;
export type WishListItem = typeof wishListItems.$inferSelect;

export type InsertRecipe = typeof recipes.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Zod schemas for validation
export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  createdAt: true,
});

export const insertGroceryListSchema = createInsertSchema(groceryLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroceryItemSchema = createInsertSchema(groceryItems).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilyIdeaSchema = createInsertSchema(familyIdeas).omit({
  id: true,
  createdAt: true,
});

export const insertVisionItemSchema = createInsertSchema(visionItems).omit({
  id: true,
  createdAt: true,
});

export const insertWishListItemSchema = createInsertSchema(wishListItems).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
