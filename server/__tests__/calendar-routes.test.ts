import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
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

describe("GET /api/calendar-events", () => {
  it("returns events for user with family", async () => {
    const events = [
      {
        id: "evt-1",
        familyId: TEST_FAMILY_ID,
        title: "Soccer",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        eventType: "sports",
      },
    ];
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.getCalendarEvents.mockResolvedValue(events as any);

    const res = await request(app).get("/api/calendar-events");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockStorage.getCalendarEvents).toHaveBeenCalledWith(TEST_FAMILY_ID);
  });

  it("returns empty array if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app).get("/api/calendar-events");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/calendar-events", () => {
  it("creates an event with date string→Date conversion", async () => {
    const created = {
      id: "evt-2",
      familyId: TEST_FAMILY_ID,
      title: "Doctor",
      startTime: new Date("2026-03-01T10:00:00Z"),
      endTime: new Date("2026-03-01T11:00:00Z"),
      eventType: "family",
    };
    mockStorage.getUser.mockResolvedValue(testUser);
    mockStorage.createCalendarEvent.mockResolvedValue(created as any);

    const res = await request(app)
      .post("/api/calendar-events")
      .send({
        title: "Doctor",
        startTime: "2026-03-01T10:00:00Z",
        endTime: "2026-03-01T11:00:00Z",
        eventType: "family",
      });

    expect(res.status).toBe(200);
    expect(mockStorage.createCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Doctor",
        familyId: TEST_FAMILY_ID,
      }),
    );
    // Verify dates were converted from strings
    const callArg = mockStorage.createCalendarEvent.mock.calls[0][0] as any;
    expect(callArg.startTime).toBeInstanceOf(Date);
    expect(callArg.endTime).toBeInstanceOf(Date);
  });

  it("rejects if user has no family", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    const res = await request(app)
      .post("/api/calendar-events")
      .send({ title: "Test", startTime: new Date().toISOString(), endTime: new Date().toISOString(), eventType: "family" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/calendar-events/:id", () => {
  it("updates event and strips auto-generated fields", async () => {
    const updated = { id: "evt-1", title: "Updated Soccer" };
    mockStorage.updateCalendarEvent.mockResolvedValue(updated as any);

    const res = await request(app)
      .patch("/api/calendar-events/evt-1")
      .send({ title: "Updated Soccer", id: "ignored", userId: "ignored", createdAt: "ignored" });

    expect(res.status).toBe(200);
    expect(mockStorage.updateCalendarEvent).toHaveBeenCalledWith(
      "evt-1",
      expect.objectContaining({ title: "Updated Soccer" }),
    );
    const callArg = mockStorage.updateCalendarEvent.mock.calls[0][1] as any;
    expect(callArg.id).toBeUndefined();
    expect(callArg.userId).toBeUndefined();
    expect(callArg.createdAt).toBeUndefined();
  });
});

describe("DELETE /api/calendar-events/:id", () => {
  it("deletes a calendar event", async () => {
    mockStorage.deleteCalendarEvent.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/calendar-events/evt-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
