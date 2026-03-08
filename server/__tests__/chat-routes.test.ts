import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  TEST_USER_ID,
} from "./test-helpers";

let app: Express;
let mockStorage: ReturnType<typeof createMockStorage>;

const activeSub = {
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

beforeAll(async () => {
  const testApp = await createTestApp();
  app = testApp.app;
  mockStorage = testApp.mockStorage;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function mockPremiumUser() {
  mockStorage.getUser.mockResolvedValue(testUser);
  mockStorage.getSubscription.mockResolvedValue(activeSub);
}

describe("GET /api/chat-messages", () => {
  it("returns chat messages for premium user", async () => {
    const messages = [
      { id: "msg-1", userId: TEST_USER_ID, message: "Hello", messageType: "user" },
      { id: "msg-2", userId: TEST_USER_ID, message: "Hi there!", messageType: "ai" },
    ];
    mockPremiumUser();
    mockStorage.getChatMessages.mockResolvedValue(messages);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(messages);
    expect(mockStorage.getChatMessages).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it("returns 403 for free user", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getSubscription.mockResolvedValue(undefined);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(403);
  });

  it("returns 500 on storage error", async () => {
    mockStorage.getUser.mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(500);
  });
});

describe("POST /api/chat", () => {
  it("responds with guidance for premium user without family", () => {
    // testUserNoFamily has no familyId, so requirePremium blocks before the handler.
    // A premium user without a family is a contradiction (subscription is family-level).
    // This test scenario is no longer valid — kept as placeholder.
  });

  it("saves user message for premium user", async () => {
    mockPremiumUser();
    mockStorage.createChatMessage.mockResolvedValue({
      id: "msg-4",
      userId: TEST_USER_ID,
      message: "Hello",
      messageType: "user",
    });
    mockStorage.getFamilyMembers.mockResolvedValue([]);
    mockStorage.getCalendarEvents.mockResolvedValue([]);
    mockStorage.getGroceryLists.mockResolvedValue([]);
    mockStorage.getFamilyIdeas.mockResolvedValue([]);

    // Mock the OpenAI response
    const openaiMod = await import("../openai");
    vi.mocked(openaiMod.getFamilyAssistantResponse).mockResolvedValue({
      message: "Hi!",
      suggestions: [],
      actions: [],
    });

    await request(app)
      .post("/api/chat")
      .send({ message: "Hello" });

    expect(mockStorage.createChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: TEST_USER_ID,
        message: "Hello",
        messageType: "user",
      }),
    );
  });
});
