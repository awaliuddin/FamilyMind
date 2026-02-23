import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import {
  createTestApp,
  createMockStorage,
  testUser,
  testUserNoFamily,
  testFamily,
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

describe("Family lifecycle: create → join → add members → collaborate", () => {
  it("new user creates family, adds member, then creates an idea", async () => {
    // Step 1: User has no family yet
    mockStorage.getUser.mockResolvedValueOnce(testUserNoFamily);
    mockStorage.createFamily.mockResolvedValue(testFamily);
    mockStorage.joinFamily.mockResolvedValue({ ...testUserNoFamily, familyId: TEST_FAMILY_ID });

    const createRes = await request(app)
      .post("/api/family/create")
      .send({ name: "Test Family" });

    expect(createRes.status).toBe(200);
    expect(createRes.body.family.id).toBe(TEST_FAMILY_ID);
    expect(mockStorage.joinFamily).toHaveBeenCalledWith(TEST_USER_ID, TEST_FAMILY_ID);

    // Step 2: Now user has a family — add a family member
    mockStorage.getUser.mockResolvedValue(testUser);
    const newMember = { id: "m-1", familyId: TEST_FAMILY_ID, name: "Emma", role: "child", color: "#4ecdc4" };
    mockStorage.createFamilyMember.mockResolvedValue(newMember);

    const memberRes = await request(app)
      .post("/api/family-members")
      .send({ name: "Emma", role: "child", color: "#4ecdc4" });

    expect(memberRes.status).toBe(200);
    expect(memberRes.body.name).toBe("Emma");

    // Step 3: Create a family idea
    const newIdea = { id: "idea-1", familyId: TEST_FAMILY_ID, title: "Movie night", author: "Mom", likes: 0 };
    mockStorage.createFamilyIdea.mockResolvedValue(newIdea);

    const ideaRes = await request(app)
      .post("/api/family-ideas")
      .send({ title: "Movie night", author: "Mom" });

    expect(ideaRes.status).toBe(200);
    expect(ideaRes.body.title).toBe("Movie night");
  });

  it("second user joins family via invite code, then views shared data", async () => {
    // Step 1: User without family joins via invite code
    // The first /join handler (line 62) does NOT call getUser — only getFamilyByInviteCode + joinFamily
    mockStorage.getUser.mockResolvedValue(testUser); // for subsequent GET calls
    mockStorage.getFamilyByInviteCode.mockResolvedValue(testFamily);
    mockStorage.joinFamily.mockResolvedValue({ ...testUserNoFamily, familyId: TEST_FAMILY_ID });

    const joinRes = await request(app)
      .post("/api/family/join")
      .send({ inviteCode: "ABC123" });

    expect(joinRes.status).toBe(200);

    // Step 2: Now can view family data — grocery lists, ideas, members
    const lists = [{ id: "list-1", familyId: TEST_FAMILY_ID, store: "Costco", items: [] }];
    mockStorage.getGroceryLists.mockResolvedValue(lists);

    const groceryRes = await request(app).get("/api/grocery-lists");
    expect(groceryRes.status).toBe(200);
    expect(groceryRes.body).toHaveLength(1);

    // Step 3: View family members
    const members = [
      { id: "m-1", familyId: TEST_FAMILY_ID, name: "Mom", role: "parent", color: "#ff6b6b" },
    ];
    mockStorage.getFamilyMembers.mockResolvedValue(members);

    const membersRes = await request(app).get("/api/family-members");
    expect(membersRes.status).toBe(200);
    expect(membersRes.body).toHaveLength(1);
  });

  it("idea voting: create idea → like → unlike", async () => {
    mockStorage.getUser.mockResolvedValue(testUser);

    // Step 1: Create an idea
    const idea = { id: "idea-v1", familyId: TEST_FAMILY_ID, title: "Beach trip", author: "Dad", likes: 0 };
    mockStorage.createFamilyIdea.mockResolvedValue(idea);

    const createRes = await request(app)
      .post("/api/family-ideas")
      .send({ title: "Beach trip", author: "Dad" });
    expect(createRes.status).toBe(200);

    // Step 2: Like the idea
    mockStorage.likeIdea.mockResolvedValue(undefined);
    const likeRes = await request(app).post("/api/family-ideas/idea-v1/like").send({});
    expect(likeRes.status).toBe(200);
    expect(mockStorage.likeIdea).toHaveBeenCalledWith("idea-v1", TEST_USER_ID);

    // Step 3: Unlike it
    mockStorage.unlikeIdea.mockResolvedValue(undefined);
    const unlikeRes = await request(app).delete("/api/family-ideas/idea-v1/like");
    expect(unlikeRes.status).toBe(200);
    expect(mockStorage.unlikeIdea).toHaveBeenCalledWith("idea-v1", TEST_USER_ID);
  });

  it("user without family is blocked from creating resources", async () => {
    mockStorage.getUser.mockResolvedValue(testUserNoFamily);

    // All creation endpoints should reject
    const groceryRes = await request(app).post("/api/grocery-lists").send({ store: "Target" });
    expect(groceryRes.status).toBe(400);

    const calendarRes = await request(app).post("/api/calendar-events").send({
      title: "Meeting", startTime: new Date().toISOString(), endTime: new Date().toISOString(), eventType: "work",
    });
    expect(calendarRes.status).toBe(400);

    const ideaRes = await request(app).post("/api/family-ideas").send({ title: "Test", author: "Me" });
    expect(ideaRes.status).toBe(400);

    const budgetRes = await request(app).post("/api/budgets").send({ name: "Food", amount: "500" });
    expect(budgetRes.status).toBe(400);

    const recipeRes = await request(app).post("/api/recipes").send({ title: "Pasta" });
    expect(recipeRes.status).toBe(400);
  });

  it("rejects family creation when user already belongs to a family", async () => {
    mockStorage.getUser.mockResolvedValue(testUser); // testUser already has familyId

    const res = await request(app)
      .post("/api/family/create")
      .send({ name: "Another Family" });

    expect(res.status).toBe(400);
    expect(mockStorage.createFamily).not.toHaveBeenCalled();
  });
});
