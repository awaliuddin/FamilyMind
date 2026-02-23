import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
  TEST_USER_ID,
  TEST_FAMILY_ID,
} from "./test-helpers";

let app: Express;
let mockStorage: ReturnType<typeof createMockStorage>;

beforeAll(async () => {
  const testApp = await createTestApp();
  app = testApp.app;
  mockStorage = testApp.mockStorage;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/chat-messages", () => {
  it("returns chat messages for user", async () => {
    const messages = [
      { id: "msg-1", userId: TEST_USER_ID, message: "Hello", messageType: "user" },
      { id: "msg-2", userId: TEST_USER_ID, message: "Hi there!", messageType: "ai" },
    ];
    mockStorage.getChatMessages.mockResolvedValue(messages);

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(messages);
    expect(mockStorage.getChatMessages).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it("returns 500 on storage error", async () => {
    mockStorage.getChatMessages.mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/chat-messages");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to fetch chat messages");
  });
});

describe("POST /api/chat", () => {
  it("responds with guidance for user without family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);
    mockStorage.createChatMessage.mockResolvedValue({
      id: "msg-3",
      userId: TEST_USER_ID,
      message: "test",
      messageType: "user",
    });

    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Help me plan dinner" });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("family");
    // Should save user message + assistant response
    expect(mockStorage.createChatMessage).toHaveBeenCalledTimes(2);
  });

  it("saves user message before processing", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);
    mockStorage.createChatMessage.mockResolvedValue({
      id: "msg-4",
      userId: TEST_USER_ID,
      message: "Hello",
      messageType: "user",
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
