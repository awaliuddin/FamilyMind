import { describe, it, expect } from "vitest";
import {
  insertGroceryListSchema,
  insertGroceryItemSchema,
  insertCalendarEventSchema,
  insertFamilyMemberSchema,
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
