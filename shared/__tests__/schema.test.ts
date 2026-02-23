import { describe, it, expect } from "vitest";
import {
  insertGroceryListSchema,
  insertGroceryItemSchema,
  insertCalendarEventSchema,
  insertFamilyMemberSchema,
  insertFamilyIdeaSchema,
  insertVisionItemSchema,
  insertWishListItemSchema,
  insertRecipeSchema,
  insertMealPlanSchema,
  insertBudgetSchema,
  insertExpenseSchema,
  insertSubscriptionSchema,
  insertChatMessageSchema,
} from "../schema";

describe("insertGroceryListSchema", () => {
  it("accepts valid grocery list data", () => {
    const result = insertGroceryListSchema.safeParse({
      familyId: "fam-1",
      store: "Costco",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required store field", () => {
    const result = insertGroceryListSchema.safeParse({
      familyId: "fam-1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional storeTip", () => {
    const result = insertGroceryListSchema.safeParse({
      familyId: "fam-1",
      store: "Trader Joe's",
      storeTip: "Park in the back lot",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storeTip).toBe("Park in the back lot");
    }
  });
});

describe("insertGroceryItemSchema", () => {
  it("accepts valid grocery item data", () => {
    const result = insertGroceryItemSchema.safeParse({
      listId: "list-1",
      name: "Milk",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required name field", () => {
    const result = insertGroceryItemSchema.safeParse({
      listId: "list-1",
    });
    expect(result.success).toBe(false);
  });

  it("handles optional completed and autoAdded", () => {
    const result = insertGroceryItemSchema.safeParse({
      listId: "list-1",
      name: "Eggs",
      completed: true,
      autoAdded: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
      expect(result.data.autoAdded).toBe(true);
    }
  });
});

describe("insertCalendarEventSchema", () => {
  it("accepts valid calendar event data", () => {
    const result = insertCalendarEventSchema.safeParse({
      familyId: "fam-1",
      title: "Soccer practice",
      startTime: new Date("2026-03-01T10:00:00Z"),
      endTime: new Date("2026-03-01T11:00:00Z"),
      eventType: "sports",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required title", () => {
    const result = insertCalendarEventSchema.safeParse({
      familyId: "fam-1",
      startTime: new Date(),
      endTime: new Date(),
      eventType: "sports",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional description and location", () => {
    const result = insertCalendarEventSchema.safeParse({
      familyId: "fam-1",
      title: "Doctor visit",
      startTime: new Date("2026-03-05T14:00:00Z"),
      endTime: new Date("2026-03-05T15:00:00Z"),
      eventType: "family",
      description: "Annual checkup",
      location: "Main St Clinic",
    });
    expect(result.success).toBe(true);
  });
});

describe("insertFamilyMemberSchema", () => {
  it("accepts valid family member data", () => {
    const result = insertFamilyMemberSchema.safeParse({
      familyId: "fam-1",
      name: "Emma",
      role: "child",
      color: "#ff6b6b",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required role field", () => {
    const result = insertFamilyMemberSchema.safeParse({
      familyId: "fam-1",
      name: "Emma",
      color: "#ff6b6b",
    });
    expect(result.success).toBe(false);
  });
});

describe("insertRecipeSchema", () => {
  it("accepts valid recipe data", () => {
    const result = insertRecipeSchema.safeParse({
      familyId: "fam-1",
      title: "Spaghetti Bolognese",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required title", () => {
    const result = insertRecipeSchema.safeParse({
      familyId: "fam-1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = insertRecipeSchema.safeParse({
      familyId: "fam-1",
      title: "Tacos",
      description: "Family favorite",
      ingredients: [{ name: "tortillas", quantity: "8", unit: "pcs" }],
      instructions: "Fill and fold",
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      category: "dinner",
    });
    expect(result.success).toBe(true);
  });
});

describe("insertMealPlanSchema", () => {
  it("accepts valid meal plan data", () => {
    const result = insertMealPlanSchema.safeParse({
      familyId: "fam-1",
      recipeId: "r-1",
      date: "2026-03-01",
      mealType: "dinner",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = insertMealPlanSchema.safeParse({
      familyId: "fam-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = insertMealPlanSchema.safeParse({
      familyId: "fam-1",
      recipeId: "r-1",
      mealType: "lunch",
    });
    expect(result.success).toBe(false);
  });
});

describe("insertBudgetSchema", () => {
  it("accepts valid budget data", () => {
    const result = insertBudgetSchema.safeParse({
      familyId: "fam-1",
      name: "Groceries",
      amount: "500",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required name", () => {
    const result = insertBudgetSchema.safeParse({
      familyId: "fam-1",
      amount: "500",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional period and category", () => {
    const result = insertBudgetSchema.safeParse({
      familyId: "fam-1",
      name: "Dining",
      amount: "200",
      period: "weekly",
      category: "dining",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe("weekly");
      expect(result.data.category).toBe("dining");
    }
  });
});

describe("insertExpenseSchema", () => {
  it("accepts valid expense data", () => {
    const result = insertExpenseSchema.safeParse({
      budgetId: "b-1",
      amount: "45.50",
      description: "Costco trip",
      date: "2026-03-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required description", () => {
    const result = insertExpenseSchema.safeParse({
      budgetId: "b-1",
      amount: "45.50",
      date: "2026-03-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("insertFamilyIdeaSchema", () => {
  it("accepts valid idea data", () => {
    const result = insertFamilyIdeaSchema.safeParse({
      familyId: "fam-1",
      title: "Disney trip",
      author: "Mom",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required title", () => {
    const result = insertFamilyIdeaSchema.safeParse({
      familyId: "fam-1",
      author: "Mom",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional description and tags", () => {
    const result = insertFamilyIdeaSchema.safeParse({
      familyId: "fam-1",
      title: "Game night",
      author: "Dad",
      description: "Every Friday",
      tags: ["fun", "weekly"],
    });
    expect(result.success).toBe(true);
  });
});

describe("insertVisionItemSchema", () => {
  it("accepts valid vision item data", () => {
    const result = insertVisionItemSchema.safeParse({
      familyId: "fam-1",
      title: "Save for vacation",
      author: "Mom",
      color: "#4ecdc4",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required color", () => {
    const result = insertVisionItemSchema.safeParse({
      familyId: "fam-1",
      title: "Save for vacation",
      author: "Mom",
    });
    expect(result.success).toBe(false);
  });
});

describe("insertWishListItemSchema", () => {
  it("accepts valid wishlist item data", () => {
    const result = insertWishListItemSchema.safeParse({
      familyId: "fam-1",
      item: "LEGO Star Wars",
      person: "Emma",
      occasion: "birthday",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required person", () => {
    const result = insertWishListItemSchema.safeParse({
      familyId: "fam-1",
      item: "LEGO Star Wars",
      occasion: "birthday",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional price, store, and url", () => {
    const result = insertWishListItemSchema.safeParse({
      familyId: "fam-1",
      item: "Headphones",
      person: "Dad",
      occasion: "christmas",
      price: "79.99",
      store: "Amazon",
      url: "https://amazon.com/headphones",
    });
    expect(result.success).toBe(true);
  });
});

describe("insertSubscriptionSchema", () => {
  it("accepts valid subscription data", () => {
    const result = insertSubscriptionSchema.safeParse({
      familyId: "fam-1",
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
      currentPeriodEnd: new Date("2026-04-01"),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required stripeCustomerId", () => {
    const result = insertSubscriptionSchema.safeParse({
      familyId: "fam-1",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
      currentPeriodEnd: new Date("2026-04-01"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required familyId", () => {
    const result = insertSubscriptionSchema.safeParse({
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
      currentPeriodEnd: new Date("2026-04-01"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required currentPeriodEnd", () => {
    const result = insertSubscriptionSchema.safeParse({
      familyId: "fam-1",
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required stripeSubscriptionId", () => {
    const result = insertSubscriptionSchema.safeParse({
      familyId: "fam-1",
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      status: "active",
      currentPeriodEnd: new Date("2026-04-01"),
    });
    expect(result.success).toBe(false);
  });
});

describe("insertChatMessageSchema", () => {
  it("accepts valid chat message data", () => {
    const result = insertChatMessageSchema.safeParse({
      userId: "u-1",
      message: "What's for dinner?",
      messageType: "user",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required message", () => {
    const result = insertChatMessageSchema.safeParse({
      userId: "u-1",
      messageType: "user",
    });
    expect(result.success).toBe(false);
  });
});
