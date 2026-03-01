import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
} from "./test-helpers";

let app: Express;
let mockStorage: ReturnType<typeof createMockStorage>;
let mockGetFamilyAssistantResponse: ReturnType<typeof vi.fn>;
let mockGenerateGroceryPredictions: ReturnType<typeof vi.fn>;
let mockDetectScheduleConflicts: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  const testApp = await createTestApp();
  app = testApp.app;
  mockStorage = testApp.mockStorage;
  const openaiMod = await import("../openai");
  mockGetFamilyAssistantResponse = vi.mocked(openaiMod.getFamilyAssistantResponse);
  mockGenerateGroceryPredictions = vi.mocked(openaiMod.generateGroceryPredictions);
  mockDetectScheduleConflicts = vi.mocked(openaiMod.detectScheduleConflicts);
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/ai/grocery-predictions", () => {
  it("returns predictions for user with family", async () => {
    const predictions = [
      { item: "Milk", confidence: 0.9, reason: "Weekly purchase" },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getGroceryLists.mockResolvedValue([]);
    mockStorage.getFamilyMembers.mockResolvedValue([{ id: "m1", name: "Mom" }]);
    mockGenerateGroceryPredictions.mockResolvedValue(predictions);

    const res = await request(app).get("/api/ai/grocery-predictions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(predictions);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/ai/grocery-predictions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/ai/grocery-predictions");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/ai/schedule-conflicts", () => {
  it("returns conflicts for user with family", async () => {
    const conflicts = {
      conflicts: [{ events: ["e1", "e2"], type: "overlap" }],
      suggestions: ["Move meeting to 3pm"],
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getCalendarEvents.mockResolvedValue([]);
    mockDetectScheduleConflicts.mockResolvedValue(conflicts);

    const res = await request(app).get("/api/ai/schedule-conflicts");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(conflicts);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/ai/schedule-conflicts");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/ai/schedule-conflicts");

    expect(res.status).toBe(500);
  });
});

describe("POST /api/chat (with family)", () => {
  it("returns AI response with suggestions and actions", async () => {
    const aiResponse = {
      message: "Here are some dinner ideas!",
      suggestions: ["Tacos", "Pasta"],
      actions: [],
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createChatMessage.mockResolvedValue({ id: "msg1", message: "test" });
    mockStorage.getFamilyMembers.mockResolvedValue([]);
    mockStorage.getCalendarEvents.mockResolvedValue([]);
    mockStorage.getGroceryLists.mockResolvedValue([]);
    mockStorage.getFamilyIdeas.mockResolvedValue([]);
    mockGetFamilyAssistantResponse.mockResolvedValue(aiResponse);

    const res = await request(app)
      .post("/api/chat")
      .send({ message: "What should we have for dinner?" });

    expect(res.status).toBe(200);
    expect(res.body.suggestions).toEqual(["Tacos", "Pasta"]);
  });
});
